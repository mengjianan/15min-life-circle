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
    BLIND_SPOT_MIN_COUNT,
    MAX_GRID_POINTS
)


# 各类设施缺失时的改善建议（盲区分项直接展示，答辩时更有说服力）
CATEGORY_SUGGESTION = {
    "医疗": "建议增设社区卫生服务站或24小时药店",
    "教育": "建议增设幼儿园、托育点或社区自习空间",
    "养老": "建议增设日间照料中心或老年活动站",
    "购物": "建议增设便利店或社区菜店",
    "文体": "建议增设社区公园或文体活动室",
    "餐饮": "建议引入便民餐饮业态或社区食堂",
}


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

        # 按类别独立判定：每个网格点对每个设施类别单独判断是否为盲区
        blind_by_category: Dict[str, List[Tuple[float, float]]] = {}
        for point in grid_points:
            for category in POI_TYPES:
                if await self._check_blind_spot(point, category, radius, min_count):
                    blind_by_category.setdefault(category, []).append(point)

        return self._cluster_by_category(
            blind_by_category, self._estimate_grid_step(grid_points)
        )

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
        # 网格点超过上限时自动放大间距，避免检测点数量爆炸拖垮分析
        current_size = grid_size
        points = self._build_grid_points(polygon, current_size)
        for _ in range(6):
            if len(points) <= MAX_GRID_POINTS:
                break
            current_size = int(current_size * 1.5)
            print(f"[盲区] 网格点过多({len(points)})，间距放大到{current_size}m")
            points = self._build_grid_points(polygon, current_size)
        return points

    def _build_grid_points(
        self,
        polygon: Polygon,
        grid_size: int
    ) -> List[Tuple[float, float]]:
        """按给定间距生成多边形内的网格点"""
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
        category: str,
        radius: int,
        min_count: int
    ) -> bool:
        """
        检查某个点在【指定类别】上是否为盲区

        Args:
            point: 坐标点
            category: 设施类别（医疗/教育/养老等，各类独立判定）
            radius: 检查半径
            min_count: 该类别最少设施数量

        Returns:
            该类别在此点是否为盲区
        """
        location = {"lng": point[0], "lat": point[1]}

        total_count = 0
        for query in POI_TYPES.get(category, []):
            result = await self.baidu_map.search_poi(
                location=location,
                query=query,
                radius=radius
            )
            # search_poi 返回 (pois, is_mock) 元组，直接 len() 恒为2会让判定失效
            pois = result[0] if isinstance(result, tuple) else result
            total_count += len(pois or [])
            if total_count >= min_count:
                return False  # 该类别已达标，提前结束，少打几次检索

        return True  # 该类别设施不足，此点是该类别的盲区


    async def detect_blind_spots_with_data(
        self,
        center: Dict[str, float],
        polygon: Dict[str, Any],
        coverage_data: Dict[str, Any],
        grid_size: int = BLIND_SPOT_GRID_SIZE,
        radius: int = BLIND_SPOT_RADIUS,
        min_count: int = BLIND_SPOT_MIN_COUNT
    ) -> List[Dict[str, Any]]:
        """
        使用已有的POI数据按【类别】检测盲区（零额外API调用）

        医疗/教育/养老等类别各自独立判定：某网格点在1km内
        某一类别设施少于 min_count，该点即为该类别的盲区。

        Args:
            center: 中心点坐标
            polygon: 等时圈GeoJSON多边形
            coverage_data: 已获取的POI覆盖数据
            grid_size: 网格大小（米）
            radius: 检查半径（米）
            min_count: 该类别最少设施数量

        Returns:
            盲区列表（每项带 category / description / suggestion）
        """
        # 解析多边形
        coordinates = polygon.get("geometry", {}).get("coordinates", [[]])[0]
        if len(coordinates) < 3:
            return []

        # 创建Shapely多边形
        poly = Polygon([(c[0], c[1]) for c in coordinates])

        # 按类别分组收集POI坐标（不再混在一起判断）
        pois_by_category: Dict[str, List[Tuple[float, float]]] = {}
        for category, data in coverage_data.items():
            coords = []
            for poi in data.get("facilities", []):
                loc = poi.get("location") or {}
                lng, lat = loc.get("lng"), loc.get("lat")
                if lng is not None and lat is not None:
                    coords.append((float(lng), float(lat)))
            pois_by_category[category] = coords

        # 生成网格点
        grid_points = self._generate_grid_points(poly, grid_size)

        # 逐点、逐类别判定（只做距离计算，不发API）
        blind_by_category: Dict[str, List[Tuple[float, float]]] = {}
        for point in grid_points:
            for category, coords in pois_by_category.items():
                # coords 为空表示该类别一个设施都没有，整片判定为盲区
                if self._check_blind_spot_with_data(point, coords, radius, min_count):
                    blind_by_category.setdefault(category, []).append(point)

        return self._cluster_by_category(
            blind_by_category, self._estimate_grid_step(grid_points)
        )

    def _check_blind_spot_with_data(
        self,
        point: Tuple[float, float],
        all_pois: List[Tuple[float, float]],
        radius: int,
        min_count: int
    ) -> bool:
        """
        使用已有POI数据检查盲区（距离计算）

        Args:
            point: 检查点
            all_pois: 同一类别下的POI坐标列表
            radius: 检查半径（米）
            min_count: 该类别最少设施数量

        Returns:
            该类别在此点是否为盲区
        """
        from math import radians, cos, sin, asin, sqrt

        def haversine(lon1, lat1, lon2, lat2):
            """计算两点间的距离（米）"""
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            r = 6371000  # 地球半径（米）
            return c * r

        # 统计半径内的POI数量
        count = 0
        for poi_lon, poi_lat in all_pois:
            dist = haversine(point[0], point[1], poi_lon, poi_lat)
            if dist <= radius:
                count += 1
                if count >= min_count:
                    return False  # 已经达到最少数量，不是盲区

        return True  # 设施不足，是盲区

    @staticmethod
    def _estimate_grid_step(grid_points: List[Tuple[float, float]]) -> float:
        """估算网格点最小间距（度），用于让 DBSCAN 的 eps 跟随实际网格密度"""
        if len(grid_points) < 2:
            return 0.001
        pts = np.array(sorted(grid_points))
        diffs = np.diff(pts, axis=0)
        diffs = diffs[diffs > 0]
        return float(np.min(diffs)) if diffs.size else 0.001

    def _cluster_by_category(
        self,
        blind_by_category: Dict[str, List[Tuple[float, float]]],
        grid_step: float = 0.001
    ) -> List[Dict[str, Any]]:
        """按类别分别聚类，合并成带 category 的盲区列表（重要类别排前面）"""
        # eps 必须大于网格间距，否则相邻点连不成簇，DBSCAN 全判为噪声被丢掉
        eps = max(grid_step * 1.5, 0.0005)
        blind_spots: List[Dict[str, Any]] = []
        for category, points in blind_by_category.items():
            blind_spots.extend(
                self._cluster_blind_spots(points, eps=eps, category=category)
            )

        important = {"医疗", "教育", "养老"}
        blind_spots.sort(key=lambda s: 0 if s.get("category") in important else 1)
        return blind_spots

    def _cluster_blind_spots(
        self,
        blind_points: List[Tuple[float, float]],
        eps: float = 0.001,  # 约100米
        min_samples: int = 2,
        category: str = "综合"
    ) -> List[Dict[str, Any]]:
        """
        聚类相邻的盲区点（同一类别内聚类）

        Args:
            blind_points: 某一类别下的盲区点列表
            eps: DBSCAN聚类参数
            min_samples: 最小样本数
            category: 这批盲区点所属的设施类别

        Returns:
            聚类后的盲区区域列表
        """
        if not blind_points:
            return []

        if len(blind_points) < min_samples:
            return [
                self._make_blind_spot(p[0], p[1], 200, 1, category)
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

            blind_spots.append(
                self._make_blind_spot(
                    float(center_lng), float(center_lat),
                    max(radius, 200),  # 最小200米
                    len(points), category
                )
            )

        return blind_spots

    def _make_blind_spot(
        self,
        lng: float,
        lat: float,
        radius: float,
        point_count: int,
        category: str
    ) -> Dict[str, Any]:
        """
        构造单个盲区对象。

        同时输出 location / missing_facilities / suggestion，
        供综合报告与评分模块直接使用（center/radius 供地图打点）。
        """
        suggestion = CATEGORY_SUGGESTION.get(category, f"建议增设{category}设施")
        return {
            "center": {"lng": lng, "lat": lat},
            "radius": float(radius),
            "category": category,
            "description": f"{category}覆盖不足，含{point_count}个检测点",
            "location": {"lng": lng, "lat": lat},
            "missing_facilities": [category],
            "suggestion": suggestion,
        }

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
                result = await self.baidu_map.search_poi(
                    location=center,
                    query=query,
                    radius=radius
                )
                # search_poi 返回 (pois, is_mock) 元组
                pois = result[0] if isinstance(result, tuple) else result
                total_count += len(pois or [])

            details[category] = {
                "count": total_count,
                "is_blind": total_count < BLIND_SPOT_MIN_COUNT,
                "required": BLIND_SPOT_MIN_COUNT
            }

        return details
