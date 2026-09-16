"""
风水分析API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from core.feng_shui_engine import feng_shui_engine

router = APIRouter(prefix="/api/fengshui", tags=["风水分析"])


class FengShuiRequest(BaseModel):
    lng: float
    lat: float
    radius: Optional[int] = 1500


@router.post("/analyze")
async def analyze_feng_shui(request: FengShuiRequest):
    """风水分析"""
    try:
        center = {"lng": request.lng, "lat": request.lat}
        result = await feng_shui_engine.analyze(center, request.radius)
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score")
async def get_feng_shui_score(request: FengShuiRequest):
    """获取风水评分"""
    try:
        center = {"lng": request.lng, "lat": request.lat}
        result = await feng_shui_engine.analyze(center, request.radius)
        return result.score.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))