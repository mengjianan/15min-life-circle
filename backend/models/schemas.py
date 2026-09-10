"""
数据模型定义
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class GeoPoint(BaseModel):
    """地理坐标点"""
    lng: float
    lat: float


class IsochroneRequest(BaseModel):
    """等时圈计算请求"""
    lng: float
    lat: float
    max_time: Optional[int] = 900
    directions: Optional[int] = 36


class IsochroneResponse(BaseModel):
    """等时圈计算响应"""
    center: GeoPoint
    boundary_points: List[GeoPoint]
    polygon: Dict[str, Any]
    area: float
    max_time: int


class POISearchRequest(BaseModel):
    """POI检索请求"""
    lng: float
    lat: float
    category: Optional[str] = None
    query: Optional[str] = None
    radius: Optional[int] = 1500


class POIItem(BaseModel):
    """POI项"""
    name: str
    address: Optional[str]
    location: GeoPoint
    type: Optional[str]
    tag: Optional[str]
    distance: Optional[int]
    category: str


class AnalysisRequest(BaseModel):
    """分析报告请求"""
    lng: float
    lat: float
    community_name: Optional[str] = "示例社区"


class CategoryScore(BaseModel):
    """类别评分"""
    count: int
    level: str
    score: float


class ScoreResult(BaseModel):
    """评分结果"""
    total: float
    level: str
    categories: Dict[str, int]
    blind_spot_penalty: float


class Suggestion(BaseModel):
    """改善建议"""
    category: str
    priority: str
    message: str


class BlindSpot(BaseModel):
    """盲区信息"""
    center: GeoPoint
    radius: float
    category: str
    description: str


class AnalysisResponse(BaseModel):
    """分析报告响应"""
    community_name: str
    center: GeoPoint
    isochrone: Dict[str, Any]
    poi_coverage: Dict[str, Any]
    blind_spots: List[Dict[str, Any]]
    score: ScoreResult
    suggestions: List[Suggestion]


class GraphDataResponse(BaseModel):
    """图数据响应"""
    type: str
    features: List[Dict[str, Any]]
    node_count: int
    edge_count: int


class ErrorResponse(BaseModel):
    """错误响应"""
    detail: str
    code: Optional[int] = None


class CacheEntry(BaseModel):
    """缓存条目"""
    key: str
    value: Any
    created_at: datetime
    expires_at: datetime


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    timestamp: datetime
