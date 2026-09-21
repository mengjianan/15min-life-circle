"""
POI分析器（优化版）
分析社区周边设施覆盖情况，支持缓存
"""
from typing import Dict, List, Any
from services.baidu_map import BaiduMapService
from services.cache import cache_service, generate_cache_key
from config import POI_TYPES, POI_RADIUS


class POIAnalyzer:
    """POI分析器（带缓存）"""

    def __init__(self):
        self.baidu_map = BaiduMapService()
        self.cache = cache_service

    def _get_location_key(self, location: Dict[str, float], precision: int = 3) -> str:
        """
        生成位置缓存键（精度到小数点后3位，约110米范围）

        Args:
            location: 坐标
            precision: 精度

        Returns:
            位置键
        """
        lng = round(location["lng"], precision)
        lat = round(location["lat"], precision)
        return f"{lng},{lat}"

    async def analyze_coverage(
        self,
        location: Dict[str, float],
        radius: int = POI_RADIUS
    ) -> Dict[str, Any]:
        """
        分析指定位置周边的POI覆盖情况（带缓存）

        Args:
            location: 中心点坐标 {"lng": x, "lat": y}
            radius: 检索半径（米）

        Returns:
            各类设施的覆盖统计
        """
        location_key = self._get_location_key(location)
        cache_key = f"poi_coverage:{location_key}:{radius}"

        # 尝试从缓存获取
        cached_result = self.cache.get(cache_key)
        if cached_result is not None:
            print(f"[缓存命中] POI数据: {location_key}")
            return cached_result

        print(f"[缓存未命中] 查询POI数据: {location_key}")
        coverage = {}

        for category, queries in POI_TYPES.items():
            total_count = 0
            facilities = []

            for query in queries:
                # 检查单个查询的缓存
                query_cache_key = f"poi_query:{location_key}:{query}:{radius}"
                cached_pois = self.cache.get(query_cache_key)

                if cached_pois is not None:
                    pois = cached_pois
                    print(f"  [缓存命中] {query}: {len(pois)}条")
                else:
                    result = await self.baidu_map.search_poi(
                        location=location,
                        query=query,
                        radius=radius
                    )
                    # search_poi returns tuple (pois, is_mock)
                    if isinstance(result, tuple):
                        pois, is_mock = result
                    else:
                        pois = result
                        is_mock = False
                    # 只缓存真实数据，不缓存模拟数据
                    if pois is not None and not is_mock:
                        self.cache.set(query_cache_key, pois, ttl=86400)  # 24小时
                        print(f"  [API调用-真实] {query}: {len(pois)}条")
                    elif is_mock:
                        print(f"  [API调用-模拟] {query}: {len(pois)}条(不缓存)")
                    else:
                        print(f"  [API调用] {query}: 0条")

                if pois:
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

        # 只缓存不包含模拟数据的完整结果
        has_mock = False
        for cat_data in coverage.values():
            for f in cat_data.get("facilities", []):
                if f.get("uid", "").startswith("mock_"):
                    has_mock = True
                    break
            if has_mock:
                break

        if not has_mock:
            self.cache.set(cache_key, coverage, ttl=86400)  # 24小时
            print(f"[缓存写入] POI数据(全真实): {location_key}")
        else:
            print(f"[跳过缓存] POI数据含模拟数据: {location_key}")

        return coverage

    def filter_coverage_by_distance(
        self,
        coverage: Dict[str, Any],
        max_distance: float
    ) -> Dict[str, Any]:
        """
        根据距离过滤设施（用于获取5分钟、10分钟的设施子集）

        Args:
            coverage: 15分钟的设施数据
            max_distance: 最大距离（米）

        Returns:
            过滤后的设施数据
        """
        filtered = {}

        for category, data in coverage.items():
            filtered_facilities = [
                f for f in data.get("facilities", [])
                if f.get("distance", 0) <= max_distance
            ]

            filtered[category] = {
                "count": len(filtered_facilities),
                "level": self._evaluate_level(len(filtered_facilities)),
                "facilities": filtered_facilities
            }

        return filtered

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

        # 先获取该类别的所有设施
        coverage = await self.analyze_coverage(location)
        if category in coverage and coverage[category]["facilities"]:
            return coverage[category]["facilities"][0]

        return None

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