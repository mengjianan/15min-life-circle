"""
等时圈计算引擎（优化版）
基于扇形采样 + 二分搜索算法 + 并发优化
支持快速模式和标准模式
"""
import math
import asyncio
from typing import List, Tuple, Dict, Any
from dataclasses import dataclass

from services.baidu_map import BaiduMapService
from config import (
    ISOCHRONE_DIRECTIONS,
    ISOCHRONE_MAX_TIME,
    BINARY_SEARCH_ITERATIONS,
    MAX_SEARCH_RADIUS,
    FAST_MODE_DIRECTIONS,
    FAST_MODE_ITERATIONS,
    ISOCHRONE_WALKING_SPEED
)


@dataclass
class GeoPoint:
    """地理坐标点"""
    lng: float
    lat: float

    def to_dict(self) -> Dict[str, float]:
        return {"lng": self.lng, "lat": self.lat}


@dataclass
class IsochroneResult:
    """等时圈计算结果"""
    center: GeoPoint
    boundary_points: List[GeoPoint]
    max_time: int  # 秒
    polygon: Dict[str, Any]  # GeoJSON格式


class IsochroneEngine:
    """等时圈计算引擎（优化版）"""

    def __init__(self):
        self.baidu_map = BaiduMapService()
        self._api_available = None  # 缓存API可用性

    def _calculate_destination(
        self,
        start: GeoPoint,
        bearing: float,
        distance: float
    ) -> GeoPoint:
        """
        计算从起点出发，给定方向和距离的终点坐标
        """
        R = 6371000  # 地球半径（米）
        d = distance / R

        lat1 = math.radians(start.lat)
        lng1 = math.radians(start.lng)
        bearing_rad = math.radians(bearing)

        lat2 = math.asin(
            math.sin(lat1) * math.cos(d) +
            math.cos(lat1) * math.sin(d) * math.cos(bearing_rad)
        )

        lng2 = lng1 + math.atan2(
            math.sin(bearing_rad) * math.sin(d) * math.cos(lat1),
            math.cos(d) - math.sin(lat1) * math.sin(lat2)
        )

        return GeoPoint(
            lng=math.degrees(lng2),
            lat=math.degrees(lat2)
        )

    def _generate_mock_isochrone(
        self,
        center: GeoPoint,
        max_time: int,
        directions: int = 24,
        speed: float = ISOCHRONE_WALKING_SPEED
    ) -> IsochroneResult:
        """
        生成模拟等时圈（圆形，基于指定速度）
        当API不可用时使用
        """
        radius = speed * max_time
        
        # 生成圆形边界点
        boundary_points = []
        for i in range(directions):
            angle = i * (360 / directions)
            point = self._calculate_destination(center, angle, radius)
            boundary_points.append(point)
        
        # 构建GeoJSON多边形
        polygon = self._build_polygon(boundary_points)
        
        return IsochroneResult(
            center=center,
            boundary_points=boundary_points,
            max_time=max_time,
            polygon=polygon
        )

    async def _check_api_availability(self) -> bool:
        """
        检查百度地图API是否可用（复用API状态缓存，不额外调用）
        """
        if self._api_available is not None:
            return self._api_available

        # 复用 baidu_map 的 API 状态缓存，不额外消耗配额
        self._api_available = self.baidu_map._api_status.get("direction", True)

        if not self._api_available:
            print("百度地图API不可用，使用模拟等时圈数据")

        return self._api_available

    async def _search_boundary_point(
        self,
        center: GeoPoint,
        direction: float,
        max_time: int = ISOCHRONE_MAX_TIME,
        max_iterations: int = BINARY_SEARCH_ITERATIONS,
        max_radius: float = MAX_SEARCH_RADIUS,
        speed: float = ISOCHRONE_WALKING_SPEED
    ) -> GeoPoint:
        """
        二分搜索某方向上的边界点
        根据速度选择合适的出行方式API
        """
        low = 0
        high = max_radius
        best_point = center

        # 根据速度判断出行方式，选择对应的API
        if speed >= 7.0:  # 驾车 ~8m/s
            travel_mode = "driving"
        elif speed >= 4.0:  # 公交 ~5m/s
            travel_mode = "driving"  # 公交也用驾车API近似
        elif speed >= 3.0:  # 骑行 ~3.5m/s
            travel_mode = "riding"
        else:  # 步行 ~1.2m/s
            travel_mode = "walking"

        for _ in range(max_iterations):
            mid = (low + high) / 2
            target = self._calculate_destination(center, direction, mid)

            origin_dict = {"lng": center.lng, "lat": center.lat}
            target_dict = {"lng": target.lng, "lat": target.lat}

            # 根据出行方式获取时间
            if travel_mode == "walking":
                travel_time = await self.baidu_map.get_walking_time(origin_dict, target_dict)
            elif travel_mode == "riding":
                travel_time = await self.baidu_map.get_riding_time(origin_dict, target_dict)
            else:  # driving
                travel_time = await self.baidu_map.get_driving_time(origin_dict, target_dict)

            if travel_time is None:
                travel_time = mid / speed

            if travel_time < max_time:
                best_point = target
                low = mid
            else:
                high = mid

        return best_point

    async def calculate_isochrone(
        self,
        center: GeoPoint,
        max_time: int = ISOCHRONE_MAX_TIME,
        directions: int = ISOCHRONE_DIRECTIONS,
        fast_mode: bool = False,
        speed: float = None
    ) -> IsochroneResult:
        """
        计算等时圈（并发优化版）
        """
        # 首先检查API可用性
        api_available = await self._check_api_availability()
        
        # 如果API不可用，直接返回模拟数据
        if not api_available:
            actual_directions = FAST_MODE_DIRECTIONS if fast_mode else directions
            effective_speed = speed if speed else ISOCHRONE_WALKING_SPEED
            return self._generate_mock_isochrone(center, max_time, actual_directions, effective_speed)

        # 快速模式使用更少的采样点
        if fast_mode:
            actual_directions = FAST_MODE_DIRECTIONS
            max_iterations = FAST_MODE_ITERATIONS
        else:
            actual_directions = directions
            max_iterations = BINARY_SEARCH_ITERATIONS

        # 根据速度动态调整搜索半径
        effective_speed = speed if speed else ISOCHRONE_WALKING_SPEED
        dynamic_max_radius = effective_speed * max_time * 1.2  # 预留20%余量
        dynamic_max_radius = max(dynamic_max_radius, MAX_SEARCH_RADIUS)  # 至少2000m

        angles = [i * (360 / actual_directions) for i in range(actual_directions)]

        tasks = [
            self._search_boundary_point(center, angle, max_time, max_iterations, dynamic_max_radius, effective_speed)
            for angle in angles
        ]

        try:
            boundary_points = await asyncio.gather(*tasks, return_exceptions=True)

            valid_points = []
            for i, point in enumerate(boundary_points):
                if isinstance(point, Exception):
                    estimated = self._calculate_destination(
                        center, angles[i], MAX_SEARCH_RADIUS * 0.7
                    )
                    valid_points.append(estimated)
                else:
                    valid_points.append(point)
        except Exception as e:
            print(f"并发计算异常: {e}")
            return self._generate_mock_isochrone(center, max_time, actual_directions)

        polygon = self._build_polygon(valid_points)

        return IsochroneResult(
            center=center,
            boundary_points=valid_points,
            max_time=max_time,
            polygon=polygon
        )

    def _build_polygon(self, points: List[GeoPoint]) -> Dict[str, Any]:
        """构建GeoJSON格式的多边形"""
        coordinates = [[p.lng, p.lat] for p in points]
        coordinates.append(coordinates[0])

        return {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [coordinates]
            },
            "properties": {
                "max_time": ISOCHRONE_MAX_TIME,
                "unit": "seconds"
            }
        }

    def calculate_area(self, points: List[GeoPoint]) -> float:
        """
        计算等时圈面积（平方米）
        使用Shoelace公式近似计算
        """
        n = len(points)
        if n < 3:
            return 0.0

        area = 0.0
        for i in range(n):
            j = (i + 1) % n
            area += points[i].lng * points[j].lat
            area -= points[j].lng * points[i].lat

        area = abs(area) / 2.0
        area *= 111319.9 * 111319.9
        area *= math.cos(math.radians(points[0].lat))

        return area
