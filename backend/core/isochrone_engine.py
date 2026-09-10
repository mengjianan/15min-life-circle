"""
等时圈计算引擎
基于扇形采样 + 二分搜索算法
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
    MAX_SEARCH_RADIUS
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
    """等时圈计算引擎"""
    
    def __init__(self):
        self.baidu_map = BaiduMapService()
    
    def _calculate_destination(
        self, 
        start: GeoPoint, 
        bearing: float, 
        distance: float
    ) -> GeoPoint:
        """
        计算从起点出发，给定方向和距离的终点坐标
        
        Args:
            start: 起点坐标
            bearing: 方向角（度，0=北，顺时针）
            distance: 距离（米）
        
        Returns:
            终点坐标
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
    
    async def _search_boundary_point(
        self,
        center: GeoPoint,
        direction: float
    ) -> GeoPoint:
        """
        二分搜索某方向上的15分钟边界点
        
        Args:
            center: 中心点
            direction: 方向角（度）
        
        Returns:
            边界点坐标
        """
        low = 0
        high = MAX_SEARCH_RADIUS
        best_point = center
        
        for _ in range(BINARY_SEARCH_ITERATIONS):
            mid = (low + high) / 2
            target = self._calculate_destination(center, direction, mid)
            
            # 调用百度地图API获取步行时间
            walk_time = await self.baidu_map.get_walking_time(center, target)
            
            if walk_time is None:
                # API失败时使用估算
                walk_time = mid / 1.2  # 假设步行速度1.2m/s
            
            if walk_time < ISOCHRONE_MAX_TIME:
                best_point = target
                low = mid
            else:
                high = mid
        
        return best_point
    
    async def calculate_isochrone(
        self,
        center: GeoPoint,
        max_time: int = ISOCHRONE_MAX_TIME,
        directions: int = ISOCHRONE_DIRECTIONS
    ) -> IsochroneResult:
        """
        计算等时圈
        
        Args:
            center: 中心点坐标
            max_time: 最大步行时间（秒）
            directions: 采样方向数
        
        Returns:
            等时圈计算结果
        """
        # 生成方向角度列表
        angles = [i * (360 / directions) for i in range(directions)]
        
        # 并行搜索各方向的边界点
        tasks = [
            self._search_boundary_point(center, angle)
            for angle in angles
        ]
        boundary_points = await asyncio.gather(*tasks)
        
        # 构建GeoJSON多边形
        polygon = self._build_polygon(boundary_points)
        
        return IsochroneResult(
            center=center,
            boundary_points=boundary_points,
            max_time=max_time,
            polygon=polygon
        )
    
    def _build_polygon(self, points: List[GeoPoint]) -> Dict[str, Any]:
        """构建GeoJSON格式的多边形"""
        coordinates = [[p.lng, p.lat] for p in points]
        coordinates.append(coordinates[0])  # 闭合多边形
        
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
        
        # 转换为平方米（近似）
        area = abs(area) / 2.0
        area *= 111319.9 * 111319.9  # 经纬度到米的转换
        area *= math.cos(math.radians(points[0].lat))
        
        return area
