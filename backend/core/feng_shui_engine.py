"""
风水检测引擎
"""
import asyncio
import math
from typing import List, Dict, Any, Optional
from models.feng_shui import (
    TerrainData, WaterData, EnvironmentData, OrientationData,
    FengShuiScore, FengShuiResult, FengShuiSuggestion,
    TerrainType, WaterType, RoadType, FacilityImpact,
    EnvironmentFacility, WaterFeature, TerrainFeature, GreeneryData, GreeneryFeature
)
from services.baidu_map import BaiduMapService
from config import BAIDU_MAP_AK

POSITIVE_FACILITIES = {
    "公园": ["公园"],
    "学校": ["小学", "幼儿园"],
    "图书馆": ["图书馆"],
    "体育场馆": ["体育馆"],
}

# 正/负向设施优先从已有 POI coverage 里取，避免重复打地点检索。
# 关键：analyze_surroundings 的评分只看负向数量，正向只进描述文案，
# 所以复用已有数据是零风险的（省 6 次调用，正好抵消关键词扩充）。
# 值 = (coverage 里的类别, 名称关键词)。按名称再过滤一次，
# 否则"文体"整类会被当成"公园"，把图书馆/景点也计入公园组。
POSITIVE_FROM_COVERAGE = {
    "公园": ("文体", ["公园", "绿地", "花园", "广场"]),
    "学校": ("教育", ["小学", "幼儿园", "中学"]),
    "图书馆": ("文体", ["图书馆"]),
    "体育场馆": ("文体", ["体育", "健身", "场馆"]),
}
NEGATIVE_FROM_COVERAGE = {
    "医院": ("医疗", ["医院"]),
}

# 百度是语义检索而非精确匹配，机构/店名/门牌号会被一起召回：
#   "河" -> 泸溪河桃酥(鼓楼湖北路店)、干河沿后街90号院-1幢
#   "山" -> 百步坡-8号楼、五台山少儿运动成长中心
#   "绿地" -> 绿地海珀紫金（楼盘）、绿地中心·紫峰购物广场
# 所以用两层过滤：①名称以地理后缀结尾 ②再过一遍噪声黑名单。
TERRAIN_ENDINGS = ("山", "坡", "岭", "丘", "岗", "墩", "峰", "崖", "谷", "地")
WATER_ENDINGS = ("河", "湖", "江", "溪", "塘", "库", "荡", "洲", "泉", "潭", "港", "湾")
GREEN_ENDINGS = ("公园", "绿地", "花园", "广场", "植物园", "湿地", "游园", "园", "苗圃")

# 即使以地理后缀结尾也排除的噪声（多为商业体/机构）
FEATURE_NOISE = (
    "公司", "大学", "学院", "研究院", "研究所", "实验室", "研究中心",
    "中心", "购物", "大厦", "酒店", "民宿", "公寓", "学校", "医院",
    "维修", "地铁", "公交", "车站", "号院", "号楼", "店)",
)


def _match_feature(name: str, endings) -> bool:
    """名称是否是真实的地理特征：以地理后缀结尾，且不含噪声词"""
    if not name:
        return False
    if not name.endswith(endings):
        return False
    return not any(noise in name for noise in FEATURE_NOISE)


NEGATIVE_FACILITIES = {
    "医院": ["医院"],
    "殡葬": ["殡仪馆"],
    "垃圾处理": ["垃圾站"],
    "寺庙": ["寺庙"],
}

EIGHT_HOUSE_AUSPICIOUS = {
    "坎": ["坎", "巽", "震", "离"],
    "离": ["离", "震", "巽", "坎"],
    "震": ["震", "离", "坎", "巽"],
    "巽": ["巽", "坎", "离", "震"],
}


class FengShuiEngine:
    """风水检测引擎"""

    def __init__(self):
        self.baidu_map = BaiduMapService()

    async def analyze(self, center, radius=1500, coverage_data=None):
        """综合风水分析"""

        # coverage_data: 体检里已经查过的 POI 覆盖数据（可选）。
        # 传入后正/负向设施直接复用它，不再重复打地点检索。
        # Convert center to dict if needed (GeoPoint对象转dict，search_poi需要dict)
        if hasattr(center, "lng"):
            center = {"lng": center.lng, "lat": center.lat}

        terrain = await self.analyze_terrain(center, radius)
        # 水系单独放宽到2倍半径：城市里水体稀疏，实测1500m内4个关键词
        # 全部为空（只有饭店/酒店噪声），3000m内才有燕王河、玄武湖梁洲等真水体。
        # 关键词数量不变，调用次数完全不变。
        water = await self.analyze_water(center, radius * 2)
        environment = await self.analyze_surroundings(center, radius, coverage_data)
        orientation = await self.analyze_orientation(center)
        greenery = await self.analyze_greenery(center, radius)
        score = self.calculate_score(terrain, water, environment, orientation, greenery)
        suggestions = self.generate_suggestions(terrain, water, environment, orientation)
        center_dict = center

        return FengShuiResult(
            center=center_dict, terrain=terrain, water=water,
            environment=environment, orientation=orientation,
            greenery=greenery, score=score, suggestions=suggestions
        )
    async def analyze_terrain(self, center, radius):
        """地形分析"""
        TERRAIN_KEYWORDS = ["山", "丘陵", "坡", "峰", "高地"]
        terrain_features = []
        found_terrain = False

        for kw in TERRAIN_KEYWORDS:
            try:
                result = await self.baidu_map.search_poi(location=center, query=kw, radius=radius, page_size=10)
                if isinstance(result, tuple):
                    pois, is_mock = result
                else:
                    pois = result
                    is_mock = False

                for poi in (pois or []):
                    name = poi.get("name", "")
                    location = poi.get("location")
                    d = poi.get("distance", 9999)
                    if location and _match_feature(name, TERRAIN_ENDINGS):
                        found_terrain = True
                        terrain_features.append(TerrainFeature(
                            name=name,
                            location=location,
                            distance=d,
                            type=kw
                        ))
            except Exception as e:
                print(f"地形搜索失败({kw}): {e}")
                continue

        # 去重
        seen = set()
        unique_features = []
        for f in terrain_features:
            if f.name not in seen:
                seen.add(f.name)
                unique_features.append(f)

        # 模拟地形数据（基于是否有地形特征）
        elevations = [50.0, 52.0, 48.0, 51.0, 49.0]
        avg = sum(elevations) / len(elevations)
        diff = max(elevations) - min(elevations)
        slope = math.degrees(math.atan(diff / 100))

        if found_terrain:
            # 有地形特征，评分根据数量和距离
            close_count = sum(1 for f in unique_features if f.distance < 1000)
            if close_count >= 3:
                score = 70.0  # 周围地形丰富
                desc = f"周边有{len(unique_features)}个地形特征"
                terrain_type = TerrainType.GENTLE_SLOPE
            elif close_count >= 1:
                score = 80.0
                desc = f"周边有少量地形特征"
                terrain_type = TerrainType.GENTLE_SLOPE
            else:
                score = 90.0
                desc = "地形较为平坦"
                terrain_type = TerrainType.FLAT
        else:
            score = 100.0
            desc = "地势平坦，适宜居住"
            terrain_type = TerrainType.FLAT

        # 按距离升序，保证展示的是最近的10个（否则受关键词发现顺序影响）
        unique_features.sort(key=lambda f: f.distance)

        return TerrainData(
            elevation=avg, slope=slope, terrain_type=terrain_type,
            terrain_features=unique_features[:10],
            score=score, description=desc
        )

    async def analyze_water(self, center, radius):
        """水系分析"""
        min_dist = float("inf")
        names = []
        water_features = []
        WATER_KEYWORDS = ["河流", "湖泊", "水库", "池塘", "河", "湖"]

        for kw in WATER_KEYWORDS:
            try:
                # search_poi returns tuple (pois, is_mock)
                result = await self.baidu_map.search_poi(location=center, query=kw, radius=radius, page_size=10)
                if isinstance(result, tuple):
                    pois, is_mock = result
                else:
                    pois = result
                    is_mock = False

                for poi in (pois or []):
                    name = poi.get("name", "")
                    # 必须先做名称过滤再统计距离：否则被排除的噪声
                    # （饭店、研究院）仍会把 min_dist 拉近，把水系评分虚高到 100
                    if not _match_feature(name, WATER_ENDINGS) or name in names:
                        continue
                    d = poi.get("distance", 9999)
                    if d < min_dist:
                        min_dist = d
                    names.append(name)
                    # 添加水系特征点（包含坐标）
                    location = poi.get("location")
                    if location:
                        water_features.append(WaterFeature(
                            name=name,
                            location=location,
                            distance=d,
                            type=kw
                        ))
            except Exception as e:
                print(f"水系搜索失败({kw}): {e}")
                continue

        # 去重（按名称）
        seen = set()
        unique_features = []
        for f in water_features:
            if f.name not in seen:
                seen.add(f.name)
                unique_features.append(f)

        unique_features.sort(key=lambda f: f.distance)

        if min_dist < 500:
            return WaterData(
                has_water=True, distance=min_dist, water_type=WaterType.EMBRACE,
                water_names=list(set(names))[:5], water_features=unique_features[:10],
                score=100.0, description="近水而居，距离{}米".format(min_dist)
            )
        elif min_dist < 1000:
            return WaterData(
                has_water=True, distance=min_dist, water_type=WaterType.STRAIGHT,
                water_names=list(set(names))[:5], water_features=unique_features[:10],
                score=80.0, description="距离水系适中，约{}米".format(min_dist)
            )
        else:
            # 有水体但都在1公里开外：如实标记「有水但远」，
            # 否则会出现"列了4条水系却 has_water=False"的自相矛盾
            has_water = bool(unique_features)
            distance = round(min_dist) if min_dist != float("inf") else 0
            return WaterData(
                has_water=has_water,
                distance=distance,
                water_type=WaterType.STRAIGHT,
                water_names=list(set(names))[:5],
                water_features=unique_features[:10],
                score=60.0,
                description=(
                    f"距离水系较远，约{distance}米" if has_water else "距离水系较远"
                ),
            )
    async def analyze_surroundings(self, center, radius, coverage_data=None):
        """
        周边环境分析

        coverage_data 存在时优先从已有的 POI 覆盖数据里按名称匹配取设施，
        命中就不再打地点检索（省 6 次调用）。评分只看负向数量、正向仅进
        描述文案，所以复用已有数据是零风险的；取不到时回退原来的逐词查询，
        保证 /api/fengshui/analyze 独立入口（不传 coverage）仍能工作。
        """
        pos = []
        neg = []

        def _from_coverage(mapping, group, impact):
            """从 coverage 里按名称关键词取某语义组的设施；取不到返回 None 触发回退"""
            if not coverage_data:
                return None
            entry = mapping.get(group)
            if not entry:
                return None
            category, name_keys = entry
            data = coverage_data.get(category)
            if not data or not data.get("facilities"):
                return None

            out = []
            for fac in data["facilities"]:
                name = fac.get("name") or ""
                if not any(key in name for key in name_keys):
                    continue
                loc = fac.get("location") or {}
                out.append(EnvironmentFacility(
                    name=name, type=group, impact=impact,
                    distance=fac.get("distance", 0) or 0, direction=""
                ))
            return out

        # 正向设施：优先复用 coverage（5 次调用 → 0）
        for cat, kws in POSITIVE_FACILITIES.items():
            reused = _from_coverage(POSITIVE_FROM_COVERAGE, cat, FacilityImpact.POSITIVE)
            if reused is not None:
                pos.extend(reused)
                continue
            for kw in kws:
                try:
                    result = await self.baidu_map.search_poi(location=center, query=kw, radius=radius, page_size=5)
                    if isinstance(result, tuple):
                        pois, _ = result
                    else:
                        pois = result
                    for poi in (pois or []):
                        pos.append(EnvironmentFacility(name=poi.get("name", ""), type=cat, impact=FacilityImpact.POSITIVE, distance=poi.get("distance", 0), direction=""))
                except Exception as e:
                    print(f"环境搜索失败({kw}): {e}")
                    continue

        # 负向设施：医院从 coverage 取，其余（殡仪馆/垃圾站/寺庙）照旧查
        for cat, kws in NEGATIVE_FACILITIES.items():
            reused = _from_coverage(NEGATIVE_FROM_COVERAGE, cat, FacilityImpact.NEGATIVE)
            if reused is not None:
                neg.extend(reused)
                continue
            for kw in kws:
                try:
                    result = await self.baidu_map.search_poi(location=center, query=kw, radius=radius, page_size=5)
                    if isinstance(result, tuple):
                        pois, _ = result
                    else:
                        pois = result
                    for poi in (pois or []):
                        neg.append(EnvironmentFacility(name=poi.get("name", ""), type=cat, impact=FacilityImpact.NEGATIVE, distance=poi.get("distance", 0), direction=""))
                except Exception as e:
                    print(f"环境搜索失败({kw}): {e}")
                    continue

        if len(neg) == 0:
            score = 100.0
            desc = "周边环境良好，有{}个有利设施".format(len(pos))
        elif len(neg) <= 2:
            score = 80.0
            desc = "周边环境一般"
        else:
            score = 60.0
            desc = "周边环境较差，有{}个不利设施".format(len(neg))
        return EnvironmentData(positive_facilities=pos[:10], negative_facilities=neg[:10], road_type=RoadType.STRAIGHT, score=score, description=desc)

    async def analyze_orientation(self, center):
        """方位分析"""
        return OrientationData(facing_direction="南", auspicious_directions=["坎", "巽", "震", "离"], inauspicious_directions=["乾", "坤", "艮", "兑"], score=90.0, description="坐北朝南，采光通风良好")

    async def analyze_greenery(self, center, radius):
        """绿化分析"""
        GREENERY_KEYWORDS = ["公园", "绿地", "花园", "广场", "湿地公园", "植物园"]
        greenery_features = []

        for kw in GREENERY_KEYWORDS:
            try:
                result = await self.baidu_map.search_poi(location=center, query=kw, radius=radius, page_size=10)
                if isinstance(result, tuple):
                    pois, is_mock = result
                else:
                    pois = result
                    is_mock = False

                for poi in (pois or []):
                    name = poi.get("name", "")
                    location = poi.get("location")
                    d = poi.get("distance", 9999)
                    if location and _match_feature(name, GREEN_ENDINGS):
                        greenery_features.append(GreeneryFeature(
                            name=name,
                            location=location,
                            distance=d,
                            type=kw
                        ))
            except Exception as e:
                print(f"绿化搜索失败({kw}): {e}")
                continue

        # 去重
        seen = set()
        unique_features = []
        for f in greenery_features:
            if f.name not in seen:
                seen.add(f.name)
                unique_features.append(f)

        count = len(unique_features)
        if count >= 5:
            score = 100.0
            desc = f"绿化资源丰富，有{count}个绿化区域"
        elif count >= 3:
            score = 85.0
            desc = f"绿化较好，有{count}个绿化区域"
        elif count >= 1:
            score = 70.0
            desc = f"绿化一般，有{count}个绿化区域"
        else:
            score = 50.0
            desc = "绿化较少"

        unique_features.sort(key=lambda f: f.distance)

        return GreeneryData(
            has_greenery=count > 0,
            count=count,
            greenery_features=unique_features[:10],
            score=score,
            description=desc
        )
    def calculate_score(self, terrain, water, environment, orientation, greenery=None):
        """计算综合评分"""
        # 权重分配：地形15%、水系20%、环境25%、朝向15%、绿化25%
        total = terrain.score * 0.15 + water.score * 0.2 + environment.score * 0.25 + orientation.score * 0.15
        if greenery:
            total += greenery.score * 0.25
        else:
            total += 75 * 0.25  # 默认绿化分

        level = "优秀" if total >= 90 else "良好" if total >= 80 else "一般" if total >= 70 else "较差"
        return FengShuiScore(total=round(total, 1), level=level, terrain=terrain.score, water=water.score, environment=environment.score, orientation=orientation.score)

    def generate_suggestions(self, terrain, water, environment, orientation):
        """生成建议"""
        suggestions = []
        if terrain.score < 80:
            suggestions.append(FengShuiSuggestion(category="地形", issue=terrain.description, suggestion="建议选择地势更平坦的区域", priority="中"))
        if water.score < 80:
            suggestions.append(FengShuiSuggestion(category="水系", issue=water.description, suggestion="建议选择靠近水系的位置", priority="中"))
        if environment.negative_facilities:
            names = [f.name for f in environment.negative_facilities[:3]]
            suggestions.append(FengShuiSuggestion(category="环境", issue="周边有不利设施：" + ", ".join(names), suggestion="建议与不利设施保持距离", priority="高"))
        return suggestions

    async def close(self):
        await self.baidu_map.close()


feng_shui_engine = FengShuiEngine()