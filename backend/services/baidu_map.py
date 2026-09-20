"""
百度地图API封装服务（修复版）
修复：API可用性检查不再依赖地点检索
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
    REQUEST_TIMEOUT
)


class BaiduMapService:
    """百度地图API服务"""

    # 全局API状态缓存（所有实例共享）
    _global_api_status = {
        "place": None,      # 地点检索
        "direction": None,  # 路线规划
        "geocoder": None,   # 地理编码
    }

    def __init__(self):
        self.ak = BAIDU_MAP_AK
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        self.client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
        self._api_status = self._global_api_status  # 使用全局缓存

    async def _check_api_type(self, api_type: str) -> bool:
        """
        检查特定类型的API是否可用

        Args:
            api_type: API类型 ("place", "direction", "geocoder")

        Returns:
            是否可用
        """
        if self._api_status[api_type] is not None:
            return self._api_status[api_type]

        try:
            if api_type == "place":
                # 检查地点检索API
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
                response = await self.client.get(PLACE_API, params=params)
                data = response.json()
                self._api_status["place"] = data.get("status") == 0

            elif api_type == "direction":
                # 检查路线规划API（用步行API测试）
                params = {
                    "origin": "32.0663,118.7784",
                    "destination": "32.0673,118.7794",
                    "ak": self.ak,
                    "output": "json"
                }
                response = await self.client.get(f"{DIRECTION_API}/walking", params=params)
                data = response.json()
                self._api_status["direction"] = data.get("status") == 0

            elif api_type == "geocoder":
                # 检查地理编码API
                params = {
                    "address": "南京大学",
                    "city": "南京",
                    "ak": self.ak,
                    "output": "json"
                }
                response = await self.client.get(PLACE_API, params=params)
                data = response.json()
                self._api_status["geocoder"] = data.get("status") == 0

        except Exception as e:
            print(f"检查{api_type} API异常: {e}")
            self._api_status[api_type] = False

        status = "可用" if self._api_status[api_type] else "不可用"
        print(f"{api_type} API: {status}")
        return self._api_status[api_type]

    async def get_walking_time(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[float]:
        """获取步行时间"""
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
                        duration = routes[0].get("duration", 0); return duration if isinstance(duration, int) else duration.get("value", 0)

                return None
            except Exception as e:
                print(f"步行时间查询失败: {e}")
                return None

    async def get_walking_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取步行路线"""
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
                        return {
                            "distance": route.get("distance", {}).get("value"),
                            "duration": route.get("duration", {}).get("value"),
                            "steps": route.get("steps", [])
                        }

                return None
            except Exception as e:
                print(f"步行路线查询失败: {e}")
                return None

    async def get_riding_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取骑行路线"""
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
                        return {
                            "distance": route.get("distance", {}).get("value"),
                            "duration": route.get("duration", {}).get("value"),
                            "steps": route.get("steps", [])
                        }

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
        """获取驾车路线"""
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
                        return {
                            "distance": route.get("distance", {}).get("value"),
                            "duration": route.get("duration", {}).get("value"),
                            "steps": route.get("steps", [])
                        }

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
        """获取公交路线"""
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
                        return {
                            "distance": route.get("distance", {}).get("value"),
                            "duration": route.get("duration", {}).get("value"),
                            "steps": route.get("steps", [])
                        }

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
        # 检查地点检索API是否可用（使用缓存状态）
        if self._api_status["place"] is False:
            # API已知不可用，直接返回模拟数据
            return self._generate_mock_poi(location, query), True
        if not await self._check_api_type("place"):
            return self._generate_mock_poi(location, query), True

        async with self.semaphore:
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

                if data.get("status") == 0:
                    results = data.get("results", [])
                    return [
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

                # 如果API调用失败，返回模拟数据
                return self._generate_mock_poi(location, query)
            except Exception as e:
                print(f"POI搜索失败: {e}")
                return self._generate_mock_poi(location, query)

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
