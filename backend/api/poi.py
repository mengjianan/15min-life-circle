"""
POI检索API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from services.baidu_map import BaiduMapService
from config import POI_TYPES

router = APIRouter()


class POISearchRequest(BaseModel):
    """POI检索请求"""
    lng: float
    lat: float
    category: Optional[str] = None  # 如 "医疗", "教育", "购物"
    query: Optional[str] = None  # 自定义搜索词
    radius: Optional[int] = 1500  # 检索半径（米）


class POIItem(BaseModel):
    """POI项"""
    name: str
    address: Optional[str]
    location: dict
    type: Optional[str]
    tag: Optional[str]
    distance: Optional[int]
    category: str


@router.post("/search", response_model=List[POIItem])
async def search_poi(request: POISearchRequest):
    """
    搜索周边POI设施

    Args:
        request: 包含中心点坐标和搜索条件

    Returns:
        POI列表
    """
    try:
        baidu_map = BaiduMapService()
        location = {"lng": request.lng, "lat": request.lat}

        # 确定搜索关键词
        if request.query:
            queries = [request.query]
        elif request.category and request.category in POI_TYPES:
            queries = POI_TYPES[request.category]
        else:
            # 默认搜索所有类别
            queries = []
            for category_queries in POI_TYPES.values():
                queries.extend(category_queries)

        # 并行搜索所有关键词
        all_pois = []
        for query in queries:
            pois = await baidu_map.search_poi(
                location=location,
                query=query,
                radius=request.radius
            )
            for poi in pois:
                poi["category"] = request.category or "其他"
                all_pois.append(poi)

        # 去重（按名称和地址）
        seen = set()
        unique_pois = []
        for poi in all_pois:
            key = (poi.get("name"), poi.get("address"))
            if key not in seen:
                seen.add(key)
                unique_pois.append(poi)

        return unique_pois
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_poi_categories():
    """
    获取POI分类体系

    Returns:
        分类及其包含的搜索词
    """
    return {"categories": POI_TYPES}


@router.post("/coverage")
async def analyze_poi_coverage(
    lng: float,
    lat: float,
    radius: int = 1500
):
    """
    分析指定点周边的POI覆盖情况

    Args:
        lng: 经度
        lat: 纬度
        radius: 分析半径（米）

    Returns:
        各类设施的覆盖统计
    """
    try:
        baidu_map = BaiduMapService()
        location = {"lng": lng, "lat": lat}

        coverage = {}
        for category, queries in POI_TYPES.items():
            count = 0
            for query in queries:
                pois = await baidu_map.search_poi(
                    location=location,
                    query=query,
                    radius=radius
                )
                count += len(pois)

            coverage[category] = {
                "count": count,
                "level": "充足" if count >= 3 else "一般" if count >= 1 else "匮乏"
            }

        return {"coverage": coverage}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
