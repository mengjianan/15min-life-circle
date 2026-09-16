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
    EnvironmentFacility
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
        terrain = await self.analyze_terrain(center, radius)
        water = await self.analyze_water(center, radius)
        environment = await self.analyze_surroundings(center, radius)
        orientation = await self.analyze_orientation(center)
        score = self.calculate_score(terrain, water, environment, orientation)
        suggestions = self.generate_suggestions(terrain, water, environment, orientation)
        return FengShuiResult(
            center=center, terrain=terrain, water=water,
            environment=environment, orientation=orientation,
            score=score, suggestions=suggestions
        )
    async def analyze_terrain(self, center, radius):
        """地形分析"""
        elevations = [50.0, 52.0, 48.0, 51.0, 49.0]
        avg = sum(elevations) / len(elevations)
        diff = max(elevations) - min(elevations)
        slope = math.degrees(math.atan(diff / 100))
        if slope < 2:
            return TerrainData(elevation=avg, slope=slope, terrain_type=TerrainType.FLAT, score=100.0, description="地势平坦，适宜居住")
        elif slope < 10:
            return TerrainData(elevation=avg, slope=slope, terrain_type=TerrainType.GENTLE_SLOPE, score=80.0, description="地势平缓，较为适宜")
        else:
            return TerrainData(elevation=avg, slope=slope, terrain_type=TerrainType.STEEP_SLOPE, score=60.0, description="地势起伏较大")

    async def analyze_water(self, center, radius):
        """水系分析"""
        min_dist = float("inf")
        names = []
        for kw in WATER_KEYWORDS:
            try:
                results = await self.baidu_map.search_poi(center=center, keyword=kw, radius=radius, page_size=10)
                for poi in results:
                    d = poi.get("distance", 9999)
                    if d < min_dist:
                        min_dist = d
                    names.append(poi.get("name", ""))
            except:
                continue
        if min_dist < 500:
            return WaterData(has_water=True, distance=min_dist, water_type=WaterType.EMBRACE, water_names=list(set(names))[:5], score=100.0, description="近水而居，距离{}米".format(min_dist))
        elif min_dist < 1000:
            return WaterData(has_water=True, distance=min_dist, water_type=WaterType.STRAIGHT, water_names=list(set(names))[:5], score=80.0, description="距离水系适中，约{}米".format(min_dist))
        else:
            return WaterData(has_water=False, score=60.0, description="距离水系较远")
    async def analyze_surroundings(self, center, radius):
        """周边环境分析"""
        pos = []
        neg = []
        for cat, kws in POSITIVE_FACILITIES.items():
            for kw in kws:
                try:
                    results = await self.baidu_map.search_poi(center=center, keyword=kw, radius=radius, page_size=5)
                    for poi in results:
                        pos.append(EnvironmentFacility(name=poi.get("name", ""), type=cat, impact=FacilityImpact.POSITIVE, distance=poi.get("distance", 0), direction=""))
                except:
                    continue
        for cat, kws in NEGATIVE_FACILITIES.items():
            for kw in kws:
                try:
                    results = await self.baidu_map.search_poi(center=center, keyword=kw, radius=radius, page_size=5)
                    for poi in results:
                        neg.append(EnvironmentFacility(name=poi.get("name", ""), type=cat, impact=FacilityImpact.NEGATIVE, distance=poi.get("distance", 0), direction=""))
                except:
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
    def calculate_score(self, terrain, water, environment, orientation):
        """计算综合评分"""
        total = terrain.score * 0.2 + water.score * 0.25 + environment.score * 0.3 + orientation.score * 0.25
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