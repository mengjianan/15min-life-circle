"""
空间插值模块
用于对等时圈边界进行平滑处理
"""
import numpy as np
from typing import List, Tuple
from scipy.interpolate import CubicSpline
from dataclasses import dataclass


@dataclass
class GeoPoint:
    """地理坐标点"""
    lng: float
    lat: float


class SpatialInterpolator:
    """空间插值器"""

    @staticmethod
    def interpolate_boundary(
        boundary_points: List[GeoPoint],
        num_interpolated: int = 100
    ) -> List[GeoPoint]:
        """
        对边界点进行三次样条插值

        Args:
            boundary_points: 原始边界点列表
            num_interpolated: 插值后的点数

        Returns:
            插值后的边界点列表
        """
        if len(boundary_points) < 3:
            return boundary_points

        # 提取坐标
        lngs = [p.lng for p in boundary_points]
        lats = [p.lat for p in boundary_points]

        # 添加首尾相连（闭合曲线）
        lngs.append(lngs[0])
        lats.append(lats[0])

        # 参数化（使用累积距离作为参数）
        distances = [0]
        for i in range(1, len(lngs)):
            dx = lngs[i] - lngs[i-1]
            dy = lats[i] - lats[i-1]
            dist = np.sqrt(dx**2 + dy**2)
            distances.append(distances[-1] + dist)

        # 归一化到[0, 1]
        total_distance = distances[-1]
        t = [d / total_distance for d in distances]
        t_new = np.linspace(0, 1, num_interpolated)

        # 三次样条插值
        cs_lng = CubicSpline(t, lngs)
        cs_lat = CubicSpline(t, lats)

        lngs_interp = cs_lng(t_new)
        lats_interp = cs_lat(t_new)

        return [
            GeoPoint(lng=float(lng), lat=float(lat))
            for lng, lat in zip(lngs_interp, lats_interp)
        ]

    @staticmethod
    def smooth_polygon(
        points: List[Tuple[float, float]],
        smoothness: float = 0.5
    ) -> List[Tuple[float, float]]:
        """
        使用Chaikin算法平滑多边形

        Args:
            points: 原始多边形顶点
            smoothness: 平滑度（0-1）

        Returns:
            平滑后的顶点列表
        """
        if len(points) < 3:
            return points

        smoothed = []
        n = len(points)

        for i in range(n):
            p1 = points[i]
            p2 = points[(i + 1) % n]

            # 计算新点
            q = (
                p1[0] * (1 - smoothness) + p2[0] * smoothness,
                p1[1] * (1 - smoothness) + p2[1] * smoothness
            )
            r = (
                p1[0] * smoothness + p2[0] * (1 - smoothness),
                p1[1] * smoothness + p2[1] * (1 - smoothness)
            )

            smoothed.append(q)
            smoothed.append(r)

        return smoothed

    @staticmethod
    def bilinear_interpolate(
        grid: np.ndarray,
        x: float,
        y: float
    ) -> float:
        """
        双线性插值

        Args:
            grid: 二维网格数据
            x: x坐标（列索引）
            y: y坐标（行索引）

        Returns:
            插值结果
        """
        h, w = grid.shape

        # 获取四个最近的点
        x1 = int(np.floor(x))
        x2 = min(x1 + 1, w - 1)
        y1 = int(np.floor(y))
        y2 = min(y1 + 1, h - 1)

        # 计算权重
        wx = x - x1
        wy = y - y1

        # 双线性插值
        value = (
            grid[y1, x1] * (1 - wx) * (1 - wy) +
            grid[y1, x2] * wx * (1 - wy) +
            grid[y2, x1] * (1 - wx) * wy +
            grid[y2, x2] * wx * wy
        )

        return float(value)

    @staticmethod
    def idw_interpolate(
        points: List[Tuple[float, float, float]],
        query_point: Tuple[float, float],
        power: float = 2
    ) -> float:
        """
        反距离加权插值（IDW）

        Args:
            points: 已知点列表 [(x, y, value), ...]
            query_point: 查询点 (x, y)
            power: 距离幂次

        Returns:
            插值结果
        """
        if not points:
            return 0.0

        weights = []
        values = []

        for x, y, value in points:
            dx = x - query_point[0]
            dy = y - query_point[1]
            dist = np.sqrt(dx**2 + dy**2)

            if dist < 1e-10:
                return value

            weight = 1.0 / (dist ** power)
            weights.append(weight)
            values.append(value)

        total_weight = sum(weights)
        if total_weight < 1e-10:
            return 0.0

        result = sum(w * v for w, v in zip(weights, values)) / total_weight
        return result


# 全局插值器实例
interpolator = SpatialInterpolator()
