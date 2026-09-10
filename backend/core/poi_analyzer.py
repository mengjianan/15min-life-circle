"""
POI分析器
分析社区周边设施覆盖情况
"""
from typing import Dict, List, Any
from services.baidu_map import BaiduMapService
from config import POI_TYPES, POI_RADIUS


class POIAnalyzer:
    """POI分析器"""

    def __init__(self):
        self.baidu_map = BaiduMapService()

    async def analyze_coverage(
        self,
        location: Dict[str, float],
        radius: int = POI_RADIUS
    ) -> Dict[str, Any]:
        """
        分析指定位置周边的POI覆盖情况

        Args:
            location: 中心点坐标 {"lng": x, "lat": y}
            radius: 检索半径（米）

        Returns:
            各类设施的覆盖统计
        """
        coverage = {}

        for category, queries in POI_TYPES.items():
            total_count = 0
            facilities = []

            for query in queries:
                pois = await self.baidu_map.search_poi(
                    location=location,
                    query=query,
                    radius=radius
                )
                total_count += len(pois)
                facilities.extend(pois)

            # 去重
            seen = set()
            unique_facilities = []
            for poi in facilities:
                key = (poi.get("name"), poi.get("address"))
                if key not in seen:
                    seen.add(key)
                    unique_facilities.append(poi)

            # 评估覆盖等级
            level = self._evaluate_level(len(unique_facilities))

            coverage[category] = {
                "count": len(unique_facilities),
                "level": level,
                "facilities": unique_facilities[:10]  # 只返回前10个
            }

        return coverage

    def _evaluate_level(self, count: int) -> str:
        """
        评估设施覆盖等级

        Args:
            count: 设施数量

        Returns:
            等级：充足、一般、匮乏
        """
        if count >= 5:
            return "充足"
        elif count >= 2:
            return "一般"
        elif count >= 1:
            return "较少"
        else:
            return "匮乏"

    async def get_nearest_facility(
        self,
        location: Dict[str, float],
        category: str
    ) -> Dict[str, Any]:
        """
        获取最近的指定类别设施

        Args:
            location: 中心点坐标
            category: 设施类别

        Returns:
            最近的设施信息
        """
        if category not in POI_TYPES:
            return None

        queries = POI_TYPES[category]
        nearest = None
        min_distance = float('inf')

        for query in queries:
            pois = await self.baidu_map.search_poi(
                location=location,
                query=query,
                radius=2000
            )

            for poi in pois:
                distance = poi.get("distance", float('inf'))
                if distance and distance < min_distance:
                    min_distance = distance
                    nearest = poi

        return nearest

    async def calculate_satisfaction_score(
        self,
        location: Dict[str, float],
        requirements: Dict[str, int] = None
    ) -> float:
        """
        计算设施满足度评分

        Args:
            location: 中心点坐标
            requirements: 各类设施的需求数量，默认每类至少1个

        Returns:
            满足度评分（0-100）
        """
        if requirements is None:
            requirements = {cat: 1 for cat in POI_TYPES.keys()}

        coverage = await self.analyze_coverage(location)
        total_score = 0
        total_weight = 0

        for category, required in requirements.items():
            if category in coverage:
                count = coverage[category]["count"]
                # 计算该类别的满足度
                satisfaction = min(count / required, 1.0) if required > 0 else 1.0
                total_score += satisfaction * 100
                total_weight += 1

        return total_score / total_weight if total_weight > 0 else 0
