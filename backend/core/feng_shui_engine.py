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
    "公园": ["公园", "花园", "绿地"],
    "学校": ["小学", "幼儿园", "中学"],
    "图书馆": ["图书馆"],
    "体育场馆": ["体育馆", "健身中心"],
}

NEGATIVE_FACILITIES = {
    "医院": ["医院", "诊所"],
    "殡葬": ["殡仪馆", "墓地"],
    "垃圾处理": ["垃圾站"],
    "寺庙": ["寺庙", "教堂"],
}

WATER_KEYWORDS = ["河流", "湖泊", "水库", "河", "湖"]
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

    async def analyze(self, center, radius=1500):
        """综合风水分析"""
        # Convert center to dict if needed (GeoPoint对象转dict，search_poi需要dict)
        if hasattr(center, "lng"):
            center = {"lng": center.lng, "lat": center.lat}

        terrain = await self.analyze_terrain(center, radius)
        water = await self.analyze_water(center, radius)
        environment = await self.analyze_surroundings(center, radius)
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
        TERRAIN_KEYWORDS = ["山", "高地", "丘陵", "坡", "岭", "峰", "山丘", "土丘"]
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
                    if location and name:
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
        WATER_KEYWORDS = ["河流", "湖泊", "水库", "池塘", "喷泉", "河", "湖"]

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
                    d = poi.get("distance", 9999)
                    if d < min_dist:
                        min_dist = d
                    name = poi.get("name", "")
                    if name and name not in names:
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
            return WaterData(
                has_water=False, water_features=unique_features[:10],
                score=60.0, description="距离水系较远"
            )
    async def analyze_surroundings(self, center, radius):
        """周边环境分析"""
        pos = []
        neg = []
        for cat, kws in POSITIVE_FACILITIES.items():
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
        for cat, kws in NEGATIVE_FACILITIES.items():
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
        GREENERY_KEYWORDS = ["公园", "绿地", "花园", "广场", "绿化带", "植物园", "园林", "湿地公园"]
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
                    if location and name:
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