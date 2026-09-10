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

    async def get_walking_time(
        self,
        origin: Dict[str, float],
        destination: Dict[str, float]
    ) -> Optional[float]:
        """
        获取步行时间

        Args:
            origin: 起点坐标 {"lng": x, "lat": y}
            destination: 终点坐标

        Returns:
            步行时间（秒），失败返回None
        """
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
        """
        获取步行路线详情（包含路径点）

        Returns:
            路线详情，包含steps和距离信息
        """
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

    async def search_poi(
        self,
        location: Dict[str, float],
        query: str,
        radius: int = 1500,
        page_num: int = 0,
        page_size: int = 20
    ) -> List[Dict[str, Any]]:
        """
        搜索周边POI

        Args:
            location: 中心点坐标
            query: 搜索关键词
            radius: 搜索半径（米）
            page_num: 页码
            page_size: 每页数量

        Returns:
            POI列表
        """
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
                    "scope": 2  # 返回详细信息
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

                return []
            except Exception as e:
                print(f"POI搜索失败: {e}")
                return []

    async def geocode(self, address: str, city: str = "南京") -> Optional[Dict[str, float]]:
        """
        地理编码：地址转坐标

        Args:
            address: 地址
            city: 城市

        Returns:
            坐标 {"lng": x, "lat": y}
        """
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
        """
        逆地理编码：坐标转地址

        Args:
            location: 坐标

        Returns:
            地址字符串
        """
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
        """
        批量距离矩阵计算

        Args:
            origins: 起点列表
            destinations: 终点列表
            mode: 出行方式

        Returns:
            距离矩阵（米）
        """
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
