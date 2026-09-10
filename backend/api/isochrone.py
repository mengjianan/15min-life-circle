"""
等时圈计算API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from core.isochrone_engine import IsochroneEngine, GeoPoint
from services.baidu_map import BaiduMapService

router = APIRouter()


class IsochroneRequest(BaseModel):
    """等时圈计算请求"""
    lng: float
    lat: float
    max_time: Optional[int] = 900  # 默认15分钟（秒）
    directions: Optional[int] = 36  # 采样方向数


class IsochroneResponse(BaseModel):
    """等时圈计算响应"""
    center: dict
    boundary_points: list
    polygon: dict
    area: float
    max_time: int


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
        engine = IsochroneEngine()
        center = GeoPoint(lng=request.lng, lat=request.lat)

        result = await engine.calculate_isochrone(
            center=center,
            max_time=request.max_time,
            directions=request.directions
        )

        area = engine.calculate_area(result.boundary_points)

        return IsochroneResponse(
            center={"lng": center.lng, "lat": center.lat},
            boundary_points=[
                {"lng": p.lng, "lat": p.lat}
                for p in result.boundary_points
            ],
            polygon=result.polygon,
            area=area,
            max_time=result.max_time
        )
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
