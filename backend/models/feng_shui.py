"""
风水分析数据模型
"""
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from enum import Enum


class WaterType(str, Enum):
    """水势类型"""
    EMBRACE = "环抱水"  # 吉
    STRAIGHT = "直流水"  # 中
    REVERSE = "反弓水"  # 凶


class RoadType(str, Enum):
    """道路形态"""
    EMBRACE = "环抱路"  # 吉
    STRAIGHT = "直路"  # 中
    RUSH = "路冲"  # 凶
    T_SHAPE = "T字路口"  # 凶


class TerrainType(str, Enum):
    """地形类型"""
    FLAT = "平坦"
    GENTLE_SLOPE = "缓坡"
    STEEP_SLOPE = "陡坡"


class FacilityImpact(str, Enum):
    """设施影响"""
    POSITIVE = "有利"
    NEUTRAL = "中性"
    NEGATIVE = "不利"


class TerrainData(BaseModel):
    """地形数据"""
    elevation: float = 0.0  # 平均高程(米)
    slope: float = 0.0  # 坡度(度)
    terrain_type: TerrainType = TerrainType.FLAT
    score: float = 100.0
    description: str = ""


class WaterData(BaseModel):
    """水系数据"""
    has_water: bool = False
    distance: float = 0.0  # 最近水体距离(米)
    direction: str = ""  # 方位
    water_type: WaterType = WaterType.STRAIGHT
    water_names: List[str] = []
    score: float = 100.0
    description: str = ""


class EnvironmentFacility(BaseModel):
    """环境设施"""
    name: str
    type: str
    impact: FacilityImpact
    distance: float
    direction: str


class EnvironmentData(BaseModel):
    """环境数据"""
    positive_facilities: List[EnvironmentFacility] = []
    negative_facilities: List[EnvironmentFacility] = []
    road_type: RoadType = RoadType.STRAIGHT
    score: float = 100.0
    description: str = ""


class OrientationData(BaseModel):
    """方位数据"""
    facing_direction: str = ""  # 朝向
    auspicious_directions: List[str] = []  # 吉位
    inauspicious_directions: List[str] = []  # 凶位
    score: float = 100.0
    description: str = ""


class FengShuiScore(BaseModel):
    """风水评分"""
    total: float = 0.0
    level: str = ""
    terrain: float = 0.0
    water: float = 0.0
    environment: float = 0.0
    orientation: float = 0.0


class FengShuiSuggestion(BaseModel):
    """风水建议"""
    category: str
    issue: str
    suggestion: str
    priority: str  # 高/中/低


class FengShuiResult(BaseModel):
    """风水分析结果"""
    center: Dict[str, float]
    terrain: TerrainData = TerrainData()
    water: WaterData = WaterData()
    environment: EnvironmentData = EnvironmentData()
    orientation: OrientationData = OrientationData()
    score: FengShuiScore = FengShuiScore()
    suggestions: List[FengShuiSuggestion] = []
