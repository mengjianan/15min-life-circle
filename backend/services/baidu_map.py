"""
百度地图API封装服务（修复版 v2）
修复：API可用性检查不再依赖地点检索
修复：添加全局信号量共享和请求速率控制
"""
import httpx
import asyncio
from typing import List, Dict, Any, Optional
from functools import lru_cache

from services.api_protection import api_protection

from config import (
    BAIDU_MAP_AK,
    DIRECTION_API,
    PLACE_API,
    PLACE_DETAIL_API,
    GEOCODER_API,
    DISTANCE_MATRIX_API,
    IP_LOCATION_API,
    WALKING_DIRECTION_API,
    RIDING_DIRECTION_API,
    DRIVING_DIRECTION_API,
    TRANSIT_DIRECTION_API,
    YINGYAN_ENTITY_API,
    YINGYAN_TRACK_API,
    YINGYAN_GEOFENCE_API,
    MAX_CONCURRENT_REQUESTS,
    MAX_CONCURRENT_PLACE_REQUESTS,
    PLACE_REQUEST_MIN_INTERVAL,
    REQUEST_TIMEOUT
)


class BaiduMapService:
    """百度地图API服务"""

    # 全局API状态缓存（所有实例共享）
    _global_api_status = {
        "place": None,      # 地点检索
        "direction": None,  # 路线规划
    }

    # API状态缓存时间（秒）
    _api_status_ttl = 3600  # 1小时（减少健康检查频率）

    # 全局路线缓存（所有实例共享，避免重复调用）
    _route_cache = {}
    _route_cache_ttl = 2592000  # 30天（永久存储）
    _api_status_last_check = {
        "place": 0,
        "direction": 0,
    }
    # 全局配额超限标记（所有实例共享，配额超了就不再调API）
    _quota_exceeded = False
    _quota_exceeded_time = 0
    _quota_reset_interval = 3600  # 1小时后重试

    # 全局信号量（所有实例共享，避免并发超限）
    _global_semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    # 地点检索专用信号量：百度约定并发上限3，这里取2留余量
    _global_place_semaphore = asyncio.Semaphore(MAX_CONCURRENT_PLACE_REQUESTS)

    # 健康检查单飞锁（并发首查时只允许一个真正发请求）
    _place_health_lock = asyncio.Lock()
    _direction_health_lock = asyncio.Lock()

    # 地点检索结果缓存（所有实例共享，避免网格点/关键词重复检索）
    _poi_cache = {}
    _poi_cache_ttl = 2592000  # 30天

    # 全局请求间隔控制（最小间隔秒数）
    _min_request_interval = PLACE_REQUEST_MIN_INTERVAL
    # 下一个可发起请求的时间点（秒，time.time() 基准），用于预留下一档
    _next_place_slot = 0.0

    def __init__(self):
        self.ak = BAIDU_MAP_AK
        self.semaphore = self._global_semaphore  # 路线规划等接口
        self.place_semaphore = self._global_place_semaphore  # 地点检索专用
        self.client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
        self._api_status = self._global_api_status  # 使用全局缓存

    @staticmethod
    async def _wait_place_slot():
        """
        地点检索全局速率控制。

        通过“预留下一档”的方式排队，调用返回时才真正占用一个发包时机。
        必须在获取并发额度【之前】调用，否则限速等待会白白占着信号量。
        """
        import time
        while True:
            now = time.time()
            slot = BaiduMapService._next_place_slot
            if now >= slot:
                # 占位：本协程拿到 now 这一档，下一档顺延
                BaiduMapService._next_place_slot = now + BaiduMapService._min_request_interval
                return
            await asyncio.sleep(slot - now)

    @staticmethod
    def _poi_cache_key(location: Dict[str, float], query: str, radius: int) -> str:
        """地点检索缓存键（坐标取3位小数，约100米粒度）"""
        return f"poi:{query}:{round(location['lat'], 3)},{round(location['lng'], 3)}:{radius}"

    @classmethod
    def _get_poi_cache(cls, key: str):
        import time
        entry = cls._poi_cache.get(key)
        if entry and time.time() - entry["ts"] < cls._poi_cache_ttl:
            return entry["data"]
        if entry:
            del cls._poi_cache[key]
        return None

    @classmethod
    def _set_poi_cache(cls, key: str, data):
        import time
        cls._poi_cache[key] = {"data": data, "ts": time.time()}

    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()

    def _get_route_cache_key(self, mode: str, origin: Dict, dest: Dict) -> str:
        """生成路线缓存键（精度到小数点后4位，约11米）"""
        o_key = f"{round(origin['lat'],4)},{round(origin['lng'],4)}"
        d_key = f"{round(dest['lat'],4)},{round(dest['lng'],4)}"
        return f"route:{mode}:{o_key}->{d_key}"

    def _get_cached_route(self, cache_key: str):
        """获取缓存的路线"""
        import time
        if cache_key in self._route_cache:
            entry = self._route_cache[cache_key]
            if time.time() - entry["ts"] < self._route_cache_ttl:
                return entry["data"]
            else:
                del self._route_cache[cache_key]
        return None

    def _set_cached_route(self, cache_key: str, data):
        """缓存路线结果"""
        import time
        self._route_cache[cache_key] = {"data": data, "ts": time.time()}

    async def _check_api_type(self, api_type: str) -> bool:
        """
        检查特定类型的API是否可用

        Args:
            api_type: API类型 ("place", "direction", "geocoder")

        Returns:
            是否可用
        """
        import time
        current_time = time.time()

        # 检查缓存是否有效
        if (self._api_status[api_type] is not None and
            current_time - self._api_status_last_check[api_type] < self._api_status_ttl):
            return self._api_status[api_type]

        health_lock = self._place_health_lock if api_type == "place" else self._direction_health_lock

        try:
            # 单飞：并发首查只允许一个真正发请求，其余拿到锁后直接读缓存
            async with health_lock:
                if (self._api_status[api_type] is not None and
                    time.time() - self._api_status_last_check[api_type] < self._api_status_ttl):
                    return self._api_status[api_type]

                if api_type == "place":
                    # 检查地点检索API（专用信号量 + 全局限速）
                    params = {
                        "query": "诊所",
                        "location": "32.0663,118.7784",
                        "radius": 1000,
                        "output": "json",
                        "ak": self.ak,
                        "page_num": 0,
                        "page_size": 1,
                        "scope": 2
                    }
                    await self._wait_place_slot()
                    async with self.place_semaphore:
                        response = await self.client.get(PLACE_API, params=params)
                    data = response.json()
                    status = data.get("status", -1)
                    # 401/402/302 是配额/限流问题，不标记为不可用
                    if status in (401, 402, 302):
                        print(f"place API: 配额/限流(status={status}, msg={data.get('message','')})，保持可用状态")
                        self._api_status["place"] = True
                    else:
                        self._api_status["place"] = status == 0
                    self._api_status_last_check["place"] = time.time()

                elif api_type == "direction":
                    # 检查路线规划API（用步行API测试），走通用信号量
                    params = {
                        "origin": "32.0663,118.7784",
                        "destination": "32.0673,118.7794",
                        "ak": self.ak,
                        "output": "json"
                    }
                    async with self.semaphore:
                        response = await self.client.get(f"{DIRECTION_API}/walking", params=params)
                    data = response.json()
                    status = data.get("status", -1)
                    if status in (401, 402, 302):
                        print(f"direction API: 配额/限流(status={status})，保持可用状态")
                        self._api_status["direction"] = True
                    else:
                        self._api_status["direction"] = status == 0
                    self._api_status_last_check["direction"] = time.time()

        except Exception as e:
            print(f"检查{api_type} API异常: {e}")
            self._api_status[api_type] = False
            self._api_status_last_check[api_type] = time.time()

        status = "可用" if self._api_status[api_type] else "不可用"
        print(f"{api_type} API: {status}")
        return self._api_status[api_type]

    async def get_walking_time(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[float]:
        """获取步行时间（带缓存）"""
        # 检查缓存
        cache_key = self._get_route_cache_key("walking_time", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        # 检查路线规划API是否可用
        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/walking",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        duration = routes[0].get("duration", 0)
                        duration = duration if isinstance(duration, (int, float)) else duration.get("value", 0)
                        self._set_cached_route(cache_key, duration)
                        return duration

                return None
            except Exception as e:
                print(f"步行时间查询失败: {e}")
                return None

    async def get_riding_time(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[float]:
        """获取骑行时间（带缓存）"""
        cache_key = self._get_route_cache_key("riding_time", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/riding",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        duration = routes[0].get("duration", 0)
                        duration = duration if isinstance(duration, (int, float)) else duration.get("value", 0)
                        self._set_cached_route(cache_key, duration)
                        return duration

                return None
            except Exception as e:
                print(f"骑行时间查询失败: {e}")
                return None

    async def get_driving_time(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[float]:
        """获取驾车时间（带缓存）"""
        cache_key = self._get_route_cache_key("driving_time", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/driving",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        duration = routes[0].get("duration", 0)
                        duration = duration if isinstance(duration, (int, float)) else duration.get("value", 0)
                        self._set_cached_route(cache_key, duration)
                        return duration

                return None
            except Exception as e:
                print(f"驾车时间查询失败: {e}")
                return None

    async def get_walking_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取步行路线（带缓存）"""
        # 检查缓存
        cache_key = self._get_route_cache_key("walking", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/walking",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        route = routes[0]
                        distance = route.get("distance", 0)
                        if isinstance(distance, dict):
                            distance = distance.get("value", 0)
                        duration = route.get("duration", 0)
                        if isinstance(duration, dict):
                            duration = duration.get("value", 0)
                        result = {
                            "distance": distance,
                            "duration": duration,
                            "steps": route.get("steps", [])
                        }
                        self._set_cached_route(cache_key, result)
                        return result

                return None
            except Exception as e:
                print(f"步行路线查询失败: {e}")
                return None

    async def get_riding_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取骑行路线（带缓存）"""
        cache_key = self._get_route_cache_key("riding", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/riding",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        route = routes[0]
                        distance = route.get("distance", 0)
                        if isinstance(distance, dict):
                            distance = distance.get("value", 0)
                        duration = route.get("duration", 0)
                        if isinstance(duration, dict):
                            duration = duration.get("value", 0)
                        result = {
                            "distance": distance,
                            "duration": duration,
                            "steps": route.get("steps", [])
                        }
                        self._set_cached_route(cache_key, result)
                        return result

                # 如果骑行API不可用，使用步行路线估算
                walking_route = await self.get_walking_route(origin, destination)
                if walking_route:
                    return {
                        "distance": walking_route["distance"],
                        "duration": walking_route["duration"] // 3,  # 骑行约为步行1/3时间
                        "steps": walking_route["steps"]
                    }

                return None
            except Exception as e:
                print(f"骑行路线查询失败: {e}")
                return None

    async def get_driving_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取驾车路线（带缓存）"""
        cache_key = self._get_route_cache_key("driving", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/driving",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        route = routes[0]
                        distance = route.get("distance", 0)
                        if isinstance(distance, dict):
                            distance = distance.get("value", 0)
                        duration = route.get("duration", 0)
                        if isinstance(duration, dict):
                            duration = duration.get("value", 0)
                        result = {
                            "distance": distance,
                            "duration": duration,
                            "steps": route.get("steps", [])
                        }
                        self._set_cached_route(cache_key, result)
                        return result

                # 如果驾车API不可用，使用步行路线估算
                walking_route = await self.get_walking_route(origin, destination)
                if walking_route:
                    return {
                        "distance": walking_route["distance"],
                        "duration": walking_route["duration"] // 4,  # 驾车约为步行1/4时间
                        "steps": walking_route["steps"]
                    }

                return None
            except Exception as e:
                print(f"驾车路线查询失败: {e}")
                return None

    async def get_transit_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取公交路线（带缓存）"""
        cache_key = self._get_route_cache_key("transit", origin, destination)
        cached = self._get_cached_route(cache_key)
        if cached is not None:
            return cached

        if not await self._check_api_type("direction"):
            return None

        async with self.semaphore:
            try:
                params = {
                    "origin": f"{origin['lat']},{origin['lng']}",
                    "destination": f"{destination['lat']},{destination['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(
                    f"{DIRECTION_API}/transit",
                    params=params
                )
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    routes = result.get("routes", [])
                    if routes:
                        route = routes[0]
                        distance = route.get("distance", 0)
                        if isinstance(distance, dict):
                            distance = distance.get("value", 0)
                        duration = route.get("duration", 0)
                        if isinstance(duration, dict):
                            duration = duration.get("value", 0)
                        result = {
                            "distance": distance,
                            "duration": duration,
                            "steps": route.get("steps", [])
                        }
                        self._set_cached_route(cache_key, result)
                        return result

                # 如果公交API不可用，使用步行路线估算
                walking_route = await self.get_walking_route(origin, destination)
                if walking_route:
                    return {
                        "distance": walking_route["distance"],
                        "duration": walking_route["duration"] // 2,  # 公交约为步行1/2时间
                        "steps": walking_route["steps"]
                    }

                return None
            except Exception as e:
                print(f"公交路线查询失败: {e}")
                return None

    async def search_poi(
        self,
        location: Dict[str, float],
        query: str,
        radius: int = 1000,
        page_num: int = 0,
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        搜索POI

        Args:
            location: 中心点坐标
            query: 搜索关键词
            radius: 搜索半径（米）
            page_num: 页码
            page_size: 每页数量

        Returns:
            POI列表
        """
        import time

        # 结果缓存：相同坐标(约100米粒度)+关键词+半径直接复用，零API调用
        cache_key = self._poi_cache_key(location, query, radius) if page_num == 0 else None
        if cache_key:
            cached = self._get_poi_cache(cache_key)
            if cached is not None:
                return cached, False

        # 检查全局配额超限标记（避免无意义的API调用）
        if BaiduMapService._quota_exceeded:
            elapsed = time.time() - BaiduMapService._quota_exceeded_time
            if elapsed < BaiduMapService._quota_reset_interval:
                return self._generate_mock_poi(location, query), True
            else:
                # 超过重试间隔，重置标记
                BaiduMapService._quota_exceeded = False
                print(f"[POI搜索] 配额重置间隔已过，重新尝试API调用")

        # 每日调用上限保护：超限直接用模拟数据，避免反复打API触发302和重试风暴
        if api_protection.should_use_mock_cached():
            return self._generate_mock_poi(location, query), True

        # 检查地点检索API是否可用（使用带TTL的缓存状态）
        if not await self._check_api_type("place"):
            return self._generate_mock_poi(location, query), True

        # 重试逻辑
        max_retries = 3
        for retry in range(max_retries):
            # 限速放在【获取并发额度之前】：等待期间不占用信号量
            await self._wait_place_slot()

            data = None
            err = None
            # 信号量只包住真正的HTTP请求
            async with self.place_semaphore:
                try:
                    params = {
                        "query": query,
                        "location": f"{location['lat']},{location['lng']}",
                        "radius": radius,
                        "output": "json",
                        "ak": self.ak,
                        "page_num": page_num,
                        "page_size": page_size,
                        "scope": 2
                    }

                    # 增加API调用计数
                    api_protection.increment_usage()
                    response = await self.client.get(PLACE_API, params=params)
                    data = response.json()
                except Exception as e:
                    err = e

            # —— 以下所有 sleep 都在信号量之外，退避时不会堵住其它请求 ——
            if err is not None:
                print(f"POI搜索失败: {err}")
                if retry < max_retries - 1:
                    await asyncio.sleep(0.5)
                    continue
                return self._generate_mock_poi(location, query), True

            status = data.get("status")

            if status == 0:
                results = data.get("results", [])
                pois = [
                    {
                        "name": poi.get("name"),
                        "address": poi.get("address"),
                        "location": poi.get("location"),
                        "type": poi.get("detail_info", {}).get("type"),
                        "tag": poi.get("detail_info", {}).get("tag"),
                        "distance": poi.get("detail_info", {}).get("distance"),
                        "uid": poi.get("uid")
                    }
                    for poi in results
                ]
                if cache_key:
                    self._set_poi_cache(cache_key, pois)
                return pois, False

            # 如果是配额超限(302)，设置全局标记并返回模拟数据
            if status == 302:
                BaiduMapService._quota_exceeded = True
                BaiduMapService._quota_exceeded_time = time.time()
                print(f"[POI搜索] 天配额超限，设置全局标记，后续调用将直接返回模拟数据: {query}")
                return self._generate_mock_poi(location, query), True

            # 如果是并发限制错误，等待后重试（退避在信号量之外）
            if status in (401, 402) and retry < max_retries - 1:
                wait_time = (retry + 1) * 1.5  # 递增等待时间(1.5s, 3s, 4.5s)
                print(f"[POI搜索] 并发限制(status={status})，等待{wait_time}秒后重试: {query}")
                await asyncio.sleep(wait_time)
                continue

            # 其他错误，返回模拟数据
            print(f"[POI搜索] API返回失败状态({status}): {data.get('message', '')}，返回模拟数据: {query}")
            return self._generate_mock_poi(location, query), True

        return self._generate_mock_poi(location, query), True

    def _generate_mock_poi(
        self,
        location: Dict[str, float],
        query: str
    ) -> List[Dict[str, Any]]:
        """
        生成模拟POI数据

        Args:
            location: 中心点坐标
            query: 搜索关键词

        Returns:
            模拟POI列表
        """
        import random

        # 根据查询类型生成不同的模拟数据
        mock_data = {
            "诊所": [
                {"name": "社区卫生服务站", "distance": 350},
                {"name": "和平诊所", "distance": 580},
                {"name": "仁爱诊所", "distance": 820},
            ],
            "药店": [
                {"name": "大参林药房", "distance": 150},
                {"name": "益丰大药房", "distance": 420},
                {"name": "老百姓大药房", "distance": 680},
            ],
            "医院": [
                {"name": "南京市第一医院", "distance": 1200},
                {"name": "鼓楼医院", "distance": 1800},
            ],
            "小学": [
                {"name": "琅琊路小学", "distance": 800},
                {"name": "力学小学", "distance": 1100},
            ],
            "幼儿园": [
                {"name": "实验幼儿园", "distance": 450},
                {"name": "第一幼儿园", "distance": 720},
            ],
            "超市": [
                {"name": "苏果超市", "distance": 280},
                {"name": "永辉超市", "distance": 550},
                {"name": "大润发", "distance": 900},
            ],
            "公园": [
                {"name": "玄武湖公园", "distance": 1500},
                {"name": "鼓楼公园", "distance": 800},
            ],
            "餐厅": [
                {"name": "南京大排档", "distance": 350},
                {"name": "海底捞", "distance": 600},
                {"name": "外婆家", "distance": 850},
            ],
        }

        # 获取对应类型的模拟数据
        pois = mock_data.get(query, [
            {"name": f"模拟{query}1", "distance": random.randint(200, 800)},
            {"name": f"模拟{query}2", "distance": random.randint(800, 1500)},
        ])

        # 添加坐标信息
        import math
        result = []
        for poi in pois:
            # 根据距离计算坐标
            angle = random.uniform(0, 360)
            distance = poi["distance"]
            dlat = distance * math.cos(math.radians(angle)) / 111000
            dlng = distance * math.sin(math.radians(angle)) / (111000 * math.cos(math.radians(location["lat"])))

            result.append({
                "name": poi["name"],
                "address": f"距中心约{distance}米",
                "location": {
                    "lng": location["lng"] + dlng,
                    "lat": location["lat"] + dlat
                },
                "type": query,
                "tag": query,
                "distance": distance,
                "uid": f"mock_{query}_{len(result)}"
            })

        return result

    async def geocode(
        self,
        address: str,
        city: str = "南京"
    ) -> Optional[Dict[str, float]]:
        """
        地理编码（使用Place API替代Geocoder API）

        Args:
            address: 地址
            city: 城市

        Returns:
            坐标 {"lng": x, "lat": y}
        """
        if not await self._check_api_type("place"):
            return None

        async with self.semaphore:
            try:
                # 使用Place API搜索地址
                params = {
                    "query": address,
                    "region": city,
                    "output": "json",
                    "ak": self.ak
                }

                api_protection.increment_usage()
                response = await self.client.get(PLACE_API, params=params)
                data = response.json()

                if data.get("status") == 0:
                    results = data.get("results", [])
                    if results:
                        location = results[0].get("location", {})
                        return {
                            "lng": location.get("lng"),
                            "lat": location.get("lat")
                        }

                return None
            except Exception as e:
                print(f"地理编码失败: {e}")
                return None

    async def reverse_geocode(
        self,
        location: Dict[str, float]
    ) -> Optional[str]:
        """
        逆地理编码（使用Place API）

        Args:
            location: 坐标

        Returns:
            地址字符串
        """
        if not await self._check_api_type("place"):
            return None

        async with self.semaphore:
            try:
                # 使用Place API搜索附近地点
                params = {
                    "query": "生活服务",
                    "location": f"{location['lat']},{location['lng']}",
                    "radius": 100,
                    "output": "json",
                    "ak": self.ak
                }

                api_protection.increment_usage()
                response = await self.client.get(PLACE_API, params=params)
                data = response.json()

                if data.get("status") == 0:
                    results = data.get("results", [])
                    if results:
                        return results[0].get("name", "未知地址")

                return None
            except Exception as e:
                print(f"逆地理编码失败: {e}")
                return None
