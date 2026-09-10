"""
盲区识别器
识别服务覆盖不足的区域
"""
import numpy as np
from typing import Dict, List, Any, Tuple
from shapely.geometry import Point, Polygon
from sklearn.cluster import DBSCAN

from services.baidu_map import BaiduMapService
from config import (
    POI_TYPES,
    BLIND_SPOT_GRID_SIZE,
    BLIND_SPOT_RADIUS,
    BLIND_SPOT_MIN_COUNT
)


class BlindSpotDetector:
    """盲区识别器"""

    def __init__(self):
        self.baidu_map = BaiduMapService()

    async def detect_blind_spots(
        self,
        center: Dict[str, float],
        polygon: Dict[str, Any],
        grid_size: int = BLIND_SPOT_GRID_SIZE,
        radius: int = BLIND_SPOT_RADIUS,
        min_count: int = BLIND_SPOT_MIN_COUNT
    ) -> List[Dict[str, Any]]:
        """
        检测等时圈内的服务盲区

        Args:
            center: 中心点坐标
            polygon: 等时圈GeoJSON多边形
            grid_size: 网格大小（米）
            radius: 检查半径（米）
            min_count: 最少设施数量

        Returns:
            盲区列表
        """
        # 解析多边形
        coordinates = polygon.get("geometry", {}).get("coordinates", [[]])[0]
        if len(coordinates) < 3:
            return []

        # 创建Shapely多边形
        poly = Polygon([(c[0], c[1]) for c in coordinates])

        # 生成网格点
        grid_points = self._generate_grid_points(poly, grid_size)

        # 检查每个网格点
        blind_points = []
        for point in grid_points:
            is_blind = await self._check_blind_spot(
                point, radius, min_count
            )
            if is_blind:
                blind_points.append(point)

        # 聚类相邻的盲区点
        blind_spots = self._cluster_blind_spots(blind_points)

        return blind_spots

    def _generate_grid_points(
        self,
        polygon: Polygon,
        grid_size: int
    ) -> List[Tuple[float, float]]:
        """
        在多边形内生成网格点

        Args:
            polygon: Shapely多边形
            grid_size: 网格大小（米）

        Returns:
            网格点列表
        """
        # 获取多边形边界
        minx, miny, maxx, maxy = polygon.bounds

        # 将米转换为经纬度（近似）
        # 1度纬度 ≈ 111km，1度经度 ≈ 111km * cos(lat)
        lat_center = (miny + maxy) / 2
        lat_factor = 111000
        lng_factor = 111000 * np.cos(np.radians(lat_center))

        grid_size_lat = grid_size / lat_factor
        grid_size_lng = grid_size / lng_factor

        # 生成网格
        grid_points = []
        x = minx
        while x <= maxx:
            y = miny
            while y <= maxy:
                point = Point(x, y)
                if polygon.contains(point):
                    grid_points.append((x, y))
                y += grid_size_lat
            x += grid_size_lng

        return grid_points

    async def _check_blind_spot(
        self,
        point: Tuple[float, float],
        radius: int,
        min_count: int
    ) -> bool:
        """
        检查某个点是否是盲区

        Args:
            point: 坐标点
            radius: 检查半径
            min_count: 最少设施数量

        Returns:
            是否是盲区
        """
        location = {"lng": point[0], "lat": point[1]}

        # 检查各类设施
        for category, queries in POI_TYPES.items():
            total_count = 0
            for query in queries:
                pois = await self.baidu_map.search_poi(
                    location=location,
                    query=query,
                    radius=radius
                )
                total_count += len(pois)

            # 如果某类设施数量不足，标记为盲区
            if total_count < min_count:
                return True

        return False

    def _cluster_blind_spots(
        self,
        blind_points: List[Tuple[float, float]],
        eps: float = 0.001,  # 约100米
        min_samples: int = 2
    ) -> List[Dict[str, Any]]:
        """
        聚类相邻的盲区点

        Args:
            blind_points: 盲区点列表
            eps: DBSCAN聚类参数
            min_samples: 最小样本数

        Returns:
            聚类后的盲区区域列表
        """
        if len(blind_points) < min_samples:
            return [
                {
                    "center": {"lng": p[0], "lat": p[1]},
                    "radius": 200,
                    "category": "综合",
                    "description": "该区域服务设施覆盖不足"
                }
                for p in blind_points
            ]

        # DBSCAN聚类
        coords = np.array(blind_points)
        clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(coords)
        labels = clustering.labels_

        # 按聚类分组
        clusters = {}
        for i, label in enumerate(labels):
            if label == -1:
                # 噪声点单独作为一个盲区
                continue
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(blind_points[i])

        # 计算每个聚类的中心和半径
        blind_spots = []
        for label, points in clusters.items():
            points_array = np.array(points)
            center_lng = np.mean(points_array[:, 0])
            center_lat = np.mean(points_array[:, 1])

            # 计算半径（最大距离）
            distances = np.sqrt(
                (points_array[:, 0] - center_lng) ** 2 +
                (points_array[:, 1] - center_lat) ** 2
            )
            radius = float(np.max(distances)) * 111000  # 转换为米

            blind_spots.append({
                "center": {"lng": float(center_lng), "lat": float(center_lat)},
                "radius": max(radius, 200),  # 最小200米
                "category": "综合",
                "description": f"该区域服务设施覆盖不足，包含{len(points)}个检测点"
            })

        return blind_spots

    async def get_blind_spot_details(
        self,
        center: Dict[str, float],
        radius: int = BLIND_SPOT_RADIUS
    ) -> Dict[str, Any]:
        """
        获取指定点的详细盲区信息

        Args:
            center: 中心点坐标
            radius: 检查半径

        Returns:
            各类设施的缺失情况
        """
        details = {}

        for category, queries in POI_TYPES.items():
            total_count = 0
            for query in queries:
                pois = await self.baidu_map.search_poi(
                    location=center,
                    query=query,
                    radius=radius
                )
                total_count += len(pois)

            details[category] = {
                "count": total_count,
                "is_blind": total_count < BLIND_SPOT_MIN_COUNT,
                "required": BLIND_SPOT_MIN_COUNT
            }

        return details
