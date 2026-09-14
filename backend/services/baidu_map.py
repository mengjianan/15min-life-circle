"""
百度地图API封装服务
包含路径规划、POI检索、地理编码等功能
"""
import httpx
import asyncio
from typing import List, Dict, Any, Optional
from functools import lru_cache

from config import (
    BAIDU_MAP_AK,
    DIRECTION_API,
    PLACE_API,
    GEOCODER_API,
    DISTANCE_MATRIX_API,
    MAX_CONCURRENT_REQUESTS,
    REQUEST_TIMEOUT
)


class BaiduMapService:
    """百度地图API服务"""

    def __init__(self):
        self.ak = BAIDU_MAP_AK
        self.semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
        self.client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
        self._api_available = None  # 缓存API可用性

    async def _check_api_once(self) -> bool:
        """检查API是否可用（仅检查一次）"""
        if self._api_available is not None:
            return self._api_available

        try:
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
            self._api_available = data.get("status") == 0
        except Exception:
            self._api_available = False

        if not self._api_available:
            print("百度地图API不可用，将使用模拟数据")
        return self._api_available

    async def get_walking_time(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[float]:
        """获取步行时间"""
        if not await self._check_api_once():
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
                        return routes[0].get("duration", {}).get("value")

                return None
            except Exception as e:
                print(f"步行时间查询失败: {e}")
                return None

    async def get_walking_route(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[Dict[str, Any]]:
        """获取步行路线详情"""
        if not await self._check_api_once():
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

    def _generate_mock_poi(
        self,
        location: Dict[str, float],
        query: str,
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """生成模拟POI数据"""
        import random
        import math

        mock_data = {
            "诊所": [("社区卫生服务站", "基层医疗机构"), ("仁和诊所", "综合诊所"), ("健康门诊部", "门诊服务")],
            "药店": [("大参林药房", "连锁药店"), ("海王星辰健康药房", "药品零售"), ("益丰大药房", "连锁药店")],
            "医院": [("市第一人民医院", "三甲医院"), ("区中心医院", "二级医院"), ("中西医结合医院", "综合医院")],
            "小学": [("实验小学", "公办小学"), ("育才小学", "公办小学"), ("光明小学", "公办小学")],
            "幼儿园": [("阳光幼儿园", "公办幼儿园"), ("蓝天幼儿园", "民办幼儿园"), ("童心幼儿园", "民办幼儿园")],
            "培训机构": [("新东方教育", "语言培训"), ("学而思", "课外辅导"), ("少年宫", "综合培训")],
            "菜市场": [("中心菜市场", "综合菜场"), ("惠民菜场", "社区菜场"), ("新鲜蔬菜市场", "生鲜市场")],
            "超市": [("永辉超市", "大型超市"), ("苏果超市", "连锁超市"), ("大润发", "大型超市")],
            "便利店": [("全家便利店", "24小时便利店"), ("7-Eleven", "24小时便利店"), ("罗森便利店", "便利店")],
            "养老院": [("阳光养老院", "公立养老院"), ("康乐养老中心", "民营养老院"), ("幸福养老院", "社区养老")],
            "老年活动中心": [("社区老年活动中心", "社区服务"), ("夕阳红活动中心", "文化活动"), ("老年大学", "教育活动")],
            "公园": [("城市中央公园", "综合公园"), ("滨河公园", "带状公园"), ("社区花园", "街心公园")],
            "图书馆": [("市图书馆", "公共图书馆"), ("区图书馆", "公共图书馆"), ("社区图书室", "社区服务")],
            "体育场馆": [("奥体中心", "综合体育"), ("全民健身中心", "健身场所"), ("社区体育场", "社区体育")],
            "餐厅": [("海底捞火锅", "火锅"), ("外婆家", "江浙菜"), ("肯德基", "快餐")],
            "早餐店": [("永和豆浆", "早餐"), ("巴比馒头", "早餐"), ("老盛昌汤包", "早餐")],
        }

        templates = mock_data.get(query, [(f"{query}服务点", "服务设施")] * 3)
        results = []

        for i in range(min(count, len(templates))):
            name, category = templates[i]
            offset_lng = random.uniform(-0.005, 0.005)
            offset_lat = random.uniform(-0.005, 0.005)
            distance = int(math.sqrt(offset_lng**2 + offset_lat**2) * 111000)

            results.append({
                "name": name,
                "address": f"距中心约{distance}米",
                "location": {
                    "lng": location["lng"] + offset_lng,
                    "lat": location["lat"] + offset_lat
                },
                "type": category,
                "tag": query,
                "distance": distance,
            })

        return results

    async def search_poi(
        self,
        location: Dict[str, float],
        query: str,
        radius: int = 1500,
        page_num: int = 0,
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """搜索周边POI"""
        # 如果API不可用，直接返回模拟数据
        if not await self._check_api_once():
            return self._generate_mock_poi(location, query)

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
                        }
                        for poi in results
                    ]

                print(f"POI API返回状态 {data.get('status')}，使用模拟数据")
                return self._generate_mock_poi(location, query)
            except Exception as e:
                print(f"POI搜索失败: {e}，使用模拟数据")
                return self._generate_mock_poi(location, query)

    async def geocode(self, address: str, city: str = "南京") -> Optional[Dict[str, float]]:
        """地理编码：地址转坐标"""
        if not await self._check_api_once():
            return None

        async with self.semaphore:
            try:
                params = {
                    "address": address,
                    "city": city,
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(GEOCODER_API, params=params)
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    location = result.get("location", {})
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
        """逆地理编码：坐标转地址"""
        if not await self._check_api_once():
            return None

        async with self.semaphore:
            try:
                params = {
                    "location": f"{location['lat']},{location['lng']}",
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(GEOCODER_API, params=params)
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", {})
                    return result.get("formatted_address")

                return None
            except Exception as e:
                print(f"逆地理编码失败: {e}")
                return None

    async def batch_distance_matrix(
        self,
        origins: List[Dict[str, float]],
        destinations: List[Dict[str, float]],
        mode: str = "walking"
    ) -> Optional[List[List[int]]]:
        """批量距离矩阵计算"""
        if not await self._check_api_once():
            return None

        async with self.semaphore:
            try:
                origins_str = "|".join(
                    f"{p['lat']},{p['lng']}" for p in origins
                )
                destinations_str = "|".join(
                    f"{p['lat']},{p['lng']}" for p in destinations
                )

                params = {
                    "origins": origins_str,
                    "destinations": destinations_str,
                    "ak": self.ak,
                    "output": "json"
                }

                response = await self.client.get(DISTANCE_MATRIX_API, params=params)
                data = response.json()

                if data.get("status") == 0:
                    result = data.get("result", [])
                    return [
                        [item.get("distance", {}).get("value", 0) for item in row]
                        for row in result
                    ]

                return None
            except Exception as e:
                print(f"批量距离计算失败: {e}")
                return None

    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()
