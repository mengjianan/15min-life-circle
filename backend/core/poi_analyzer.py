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
        优化：使用统一缓存键（不含半径），避免不同模式重复查询

        Args:
            location: 中心点坐标 {"lng": x, "lat": y}
            radius: 检索半径（米）

        Returns:
            各类设施的覆盖统计
        """
        location_key = self._get_location_key(location)
        # 使用不含半径的缓存键，所有模式共享同一份POI数据
        cache_key = f"poi_coverage:{location_key}"

        # 尝试从缓存获取
        cached_result = self.cache.get(cache_key)
        if cached_result is not None:
            print(f"[缓存命中] POI数据: {location_key}")
            return cached_result

        print(f"[缓存未命中] 查询POI数据: {location_key}，半径: {radius}m")
        coverage = {}

        for category, queries in POI_TYPES.items():
            total_count = 0
            facilities = []

            for query in queries:
                # 使用不含半径的缓存键
                query_cache_key = f"poi_query:{location_key}:{query}"
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
                    # 真实数据永久缓存，模拟数据短期缓存（避免重复调用）
                    if pois is not None:
                        ttl = 2592000 if not is_mock else 3600  # 真实30天，模拟1小时
                        self.cache.set(query_cache_key, pois, ttl=ttl)
                        label = "真实" if not is_mock else "模拟"
                        print(f"  [API调用-{label}] {query}: {len(pois)}条")
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
                # 保留更多设施：盲区判定按距离计算，截断过多会漏判
                "facilities": unique_facilities[:50]
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

        # 真实数据永久缓存，模拟数据短期缓存
        if not has_mock:
            self.cache.set(cache_key, coverage, ttl=2592000)  # 30天
            print(f"[缓存写入] POI数据(全真实): {location_key}")
        else:
            self.cache.set(cache_key, coverage, ttl=3600)  # 模拟数据缓存1小时
            print(f"[缓存写入] POI数据(含模拟): {location_key}, 1小时后重试")

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

    def filter_coverage_by_polygon(
        self,
        coverage: Dict[str, Any],
        polygon: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        只保留真正落在等时圈多边形内的设施 —— 即该时段「能到达」的。

        与 filter_coverage_by_distance 的区别：distance 用的是检索半径
        （MODE_POI_RADIUS，步行1500m），远大于实际等时圈（步行约700m），
        会把走不到的设施也算进来，导致可达性盲区被低估。

        Args:
            coverage: POI覆盖数据 {类别: {count, facilities, ...}}
            polygon: 等时圈GeoJSON Feature

        Returns:
            按等时圈过滤后的覆盖数据
        """
        ring = polygon.get("geometry", {}).get("coordinates", [[]])[0]
        if len(ring) < 3:
            return coverage

        from shapely.geometry import Point, Polygon as ShapelyPolygon

        poly = ShapelyPolygon([(c[0], c[1]) for c in ring])
        filtered: Dict[str, Any] = {}

        for category, data in coverage.items():
            inside = []
            for fac in data.get("facilities", []):
                loc = fac.get("location") or {}
                if loc.get("lng") is None or loc.get("lat") is None:
                    continue
                if poly.contains(Point(float(loc["lng"]), float(loc["lat"]))):
                    inside.append(fac)

            filtered[category] = {
                "count": len(inside),
                "level": self._evaluate_level(len(inside)),
                "facilities": inside,
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