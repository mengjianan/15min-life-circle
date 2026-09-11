"""
等时圈计算API（优化版）
支持快速模式和标准模式
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from core.isochrone_engine import IsochroneEngine, GeoPoint
from services.baidu_map import BaiduMapService
from services.cache import cache_service, generate_cache_key

router = APIRouter()


class IsochroneRequest(BaseModel):
    """等时圈计算请求"""
    lng: float
    lat: float
    max_time: Optional[int] = 900  # 默认15分钟（秒）
    directions: Optional[int] = 24  # 采样方向数（优化：从36减少到24）
    fast_mode: Optional[bool] = False  # 快速模式


class IsochroneResponse(BaseModel):
    """等时圈计算响应"""
    center: dict
    boundary_points: list
    polygon: dict
    area: float
    max_time: int


class MultiTimeIsochroneResponse(BaseModel):
    """多时间维度等时圈响应"""
    center: dict
    layers: List[Dict[str, Any]]
    selected_time: int


@router.post("/calculate", response_model=IsochroneResponse)
async def calculate_isochrone(request: IsochroneRequest):
    """
    计算15分钟步行等时圈

    Args:
        request: 包含中心点坐标和参数

    Returns:
        等时圈计算结果，包含边界点和GeoJSON多边形
    """
    try:
        # 检查缓存
        cache_key = generate_cache_key(
            "isochrone",
            request.lng,
            request.lat,
            request.max_time,
            request.directions,
            request.fast_mode
        )
        cached_result = cache_service.get(cache_key)
        if cached_result:
            return cached_result

        engine = IsochroneEngine()
        center = GeoPoint(lng=request.lng, lat=request.lat)

        result = await engine.calculate_isochrone(
            center=center,
            max_time=request.max_time,
            directions=request.directions,
            fast_mode=request.fast_mode
        )

        area = engine.calculate_area(result.boundary_points)

        response = IsochroneResponse(
            center={"lng": center.lng, "lat": center.lat},
            boundary_points=[
                {"lng": p.lng, "lat": p.lat}
                for p in result.boundary_points
            ],
            polygon=result.polygon,
            area=area,
            max_time=result.max_time
        )

        # 缓存结果
        cache_service.set(cache_key, response.dict(), ttl=3600)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/multi-time")
async def calculate_multi_time_isochrone(request: IsochroneRequest):
    """
    计算多时间维度等时圈（5/10/15分钟）

    Args:
        request: 包含中心点坐标

    Returns:
        多时间维度等时圈计算结果
    """
    try:
        # 检查缓存
        cache_key = generate_cache_key(
            "multi_isochrone",
            request.lng,
            request.lat,
            request.directions,
            request.fast_mode
        )
        cached_result = cache_service.get(cache_key)
        if cached_result:
            return cached_result

        engine = IsochroneEngine()
        center = GeoPoint(lng=request.lng, lat=request.lat)

        # 计算三个时间维度
        time_periods = [300, 600, 900]  # 5分钟、10分钟、15分钟（秒）
        layers = []

        for time_period in time_periods:
            result = await engine.calculate_isochrone(
                center=center,
                max_time=time_period,
                directions=request.directions,
                fast_mode=request.fast_mode
            )

            area = engine.calculate_area(result.boundary_points)

            layers.append({
                "time": time_period,
                "time_text": f"{time_period // 60}分钟",
                "boundary_points": [
                    {"lng": p.lng, "lat": p.lat}
                    for p in result.boundary_points
                ],
                "polygon": result.polygon,
                "area": area
            })

        response = {
            "center": {"lng": center.lng, "lat": center.lat},
            "layers": layers,
            "selected_time": 15
        }

        # 缓存结果
        cache_service.set(cache_key, response, ttl=3600)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sample-centers")
async def get_sample_centers():
    """
    获取示例社区中心点列表（南京市）

    Returns:
        社区中心点坐标列表
    """
    from config import SAMPLE_COMMUNITIES
    return {"centers": SAMPLE_COMMUNITIES}
