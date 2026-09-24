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
from services.cache import cache_service, generate_cache_key
from config import (
    ISOCHRONE_DIRECTIONS,
    ISOCHRONE_MAX_TIME,
    BINARY_SEARCH_ITERATIONS,
    MAX_SEARCH_RADIUS,
    FAST_MODE_DIRECTIONS,
    FAST_MODE_ITERATIONS,
    ISOCHRONE_WALKING_SPEED,
    ISOCHRONE_CACHE_TTL
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
        status = self.baidu_map._api_status.get("direction")

        if status is None:
            # 状态未知（刚启动）：真正检查一次。
            # 不能把初始值 None 当成"不可用"，否则首次分析必定退回模拟等时圈。
            status = await self.baidu_map._check_api_type("direction")

        self._api_available = bool(status)

        if not self._api_available:
            print("百度地图API不可用，使用模拟等时圈数据")

        return self._api_available

    @staticmethod
    def _travel_mode_for_speed(speed: float) -> str:
        """按速度选择路线规划方式（公交用驾车API近似）"""
        if speed >= 4.0:
            return "driving"
        if speed >= 3.0:
            return "riding"
        return "walking"

    def _isochrone_cache_key(
        self,
        center: GeoPoint,
        max_time: int,
        directions: int,
        max_iterations: int,
        speed: float,
        fast_mode: bool,
    ) -> str:
        return generate_cache_key(
            "isochrone",
            round(center.lng, 6), round(center.lat, 6),
            max_time, directions, max_iterations,
            round(speed, 3), int(fast_mode),
        )

    async def calculate_isochrone(
        self,
        center: GeoPoint,
        max_time: int = ISOCHRONE_MAX_TIME,
        directions: int = ISOCHRONE_DIRECTIONS,
        fast_mode: bool = False,
        speed: float = None
    ) -> IsochroneResult:
        """
        计算等时圈。

        相比旧实现的三处关键改动：
        1. 按轮次批量推进二分：一轮内所有方向（不论 mid 是否相同）
           合并成 1 次矩阵调用 —— 矩阵是“1起点×N终点”，天然支持。
           实测 每方式 6 次矩阵调用（旧：24方向 × 6次 = 144 次单发）
        2. API失败不再伪装成“理想直线可达”：跳过该轮沿用上一轮状态，
           全程都没成功的方向直接剔除顶点，并打印统计
        3. 引擎级缓存（30天）：full-analysis 直接调引擎，
           旧实现绕过了 /api/isochrone 的缓存，每次体检都重算
        """
        api_available = await self._check_api_availability()

        if not api_available:
            actual_directions = FAST_MODE_DIRECTIONS if fast_mode else directions
            effective_speed = speed if speed else ISOCHRONE_WALKING_SPEED
            return self._generate_mock_isochrone(center, max_time, actual_directions, effective_speed)

        if fast_mode:
            actual_directions = FAST_MODE_DIRECTIONS
            max_iterations = FAST_MODE_ITERATIONS
        else:
            actual_directions = directions
            max_iterations = BINARY_SEARCH_ITERATIONS

        effective_speed = speed if speed else ISOCHRONE_WALKING_SPEED
        dynamic_max_radius = effective_speed * max_time * 1.2  # 预留20%余量
        dynamic_max_radius = max(dynamic_max_radius, MAX_SEARCH_RADIUS)  # 至少2000m

        # 引擎级缓存：full-analysis 直接调引擎，绕过了 /api/isochrone 的缓存
        cache_key = self._isochrone_cache_key(
            center, max_time, actual_directions, max_iterations,
            effective_speed, fast_mode,
        )
        cached = cache_service.get(cache_key)
        if cached:
            return IsochroneResult(
                center=center,
                boundary_points=[
                    GeoPoint(lng=p["lng"], lat=p["lat"])
                    for p in cached["boundary_points"]
                ],
                max_time=cached["max_time"],
                polygon=cached["polygon"],
            )

        angles = [i * (360 / actual_directions) for i in range(actual_directions)]
        mode = self._travel_mode_for_speed(effective_speed)
        origin = {"lng": center.lng, "lat": center.lat}

        states = [
            {"angle": a, "low": 0.0, "high": float(dynamic_max_radius),
             "mid": 0.0, "best": center, "ok": False}
            for a in angles
        ]

        for round_idx in range(max_iterations):
            dests = []
            for st in states:
                mid = (st["low"] + st["high"]) / 2.0
                st["mid"] = mid
                dests.append(self._calculate_destination(center, st["angle"], mid))

            # 一轮所有方向合并为1次矩阵调用
            dest_dicts = [{"lng": d.lng, "lat": d.lat} for d in dests]
            times = await self.baidu_map.get_times_matrix(mode, origin, dest_dicts)

            if all(t is None for t in times):
                # 整轮被限流打空：这一轮的精度就全丢了，等限流窗口过去重跑一次。
                # 已成功的探测会被矩阵缓存直接命中，重跑代价很小。
                print(f"[等时圈] 第{round_idx + 1}/{max_iterations}轮整批失败，"
                      f"1.0s后重试")
                await asyncio.sleep(1.0)
                times = await self.baidu_map.get_times_matrix(mode, origin, dest_dicts)

            for i, (st, t) in enumerate(zip(states, times)):
                if t is None:
                    # 查询失败：跳过本轮，沿用上一轮状态（绝不伪造理想时长）
                    continue
                st["ok"] = True
                if t < max_time:
                    st["best"] = dests[i]
                    st["low"] = st["mid"]
                else:
                    st["high"] = st["mid"]

        valid_states = [st for st in states if st["ok"]]
        dropped = len(states) - len(valid_states)

        if len(valid_states) < 3:
            print(f"[等时圈] 有效方向仅{len(valid_states)}/{len(states)}"
                  f"（剔除{dropped}），改用模拟数据")
            return self._generate_mock_isochrone(
                center, max_time, actual_directions, effective_speed
            )

        if dropped:
            print(f"[等时圈] {mode} {max_time // 60}min 有效方向"
                  f"{len(valid_states)}/{len(states)}，剔除{dropped}个"
                  f"（API始终失败，不伪造数据）")

        boundary_points = [st["best"] for st in valid_states]
        polygon = self._build_polygon(boundary_points)

        try:
            cache_service.set(cache_key, {
                "boundary_points": [{"lng": p.lng, "lat": p.lat} for p in boundary_points],
                "polygon": polygon,
                "max_time": max_time,
            }, ttl=ISOCHRONE_CACHE_TTL)
        except Exception as e:
            print(f"[等时圈] 写缓存失败: {e}")

        return IsochroneResult(
            center=center,
            boundary_points=boundary_points,
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
