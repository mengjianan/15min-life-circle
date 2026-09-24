"""
分析报告API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from core.isochrone_engine import IsochroneEngine, GeoPoint
from core.poi_analyzer import POIAnalyzer
from core.blind_spot import BlindSpotDetector
from services.baidu_map import BaiduMapService

router = APIRouter()


class AnalysisRequest(BaseModel):
    """分析报告请求"""
    lng: float
    lat: float
    community_name: Optional[str] = "示例社区"


class AnalysisResponse(BaseModel):
    """分析报告响应"""
    community_name: str
    center: dict
    isochrone: dict
    poi_coverage: dict
    blind_spots: list
    score: dict
    suggestions: list


@router.post("/report", response_model=AnalysisResponse)
async def generate_analysis_report(request: AnalysisRequest):
    """
    生成社区生活圈体检报告

    Args:
        request: 包含社区中心点坐标

    Returns:
        完整的体检报告
    """
    # 初始化服务
    engine = IsochroneEngine()
    poi_analyzer = POIAnalyzer()
    blind_detector = BlindSpotDetector()

    try:
        center = GeoPoint(lng=request.lng, lat=request.lat)
        location = {"lng": request.lng, "lat": request.lat}

        # 1. 计算等时圈
        isochrone_result = await engine.calculate_isochrone(center)
        area = engine.calculate_area(isochrone_result.boundary_points)

        # 2. 分析POI覆盖
        coverage = await poi_analyzer.analyze_coverage(location)

        # 3. 识别盲区（复用步骤2的POI数据，避免逐网格点重复检索）
        blind_spots = await blind_detector.detect_blind_spots_with_data(
            center=location,
            polygon=isochrone_result.polygon,
            coverage_data=coverage
        )

        # 4. 计算评分
        score = calculate_score(coverage, blind_spots, area)

        # 5. 生成改善建议
        suggestions = generate_suggestions(coverage, blind_spots)

        return AnalysisResponse(
            community_name=request.community_name,
            center={"lng": center.lng, "lat": center.lat},
            isochrone={
                "polygon": isochrone_result.polygon,
                "boundary_points": [
                    {"lng": p.lng, "lat": p.lat}
                    for p in isochrone_result.boundary_points
                ],
                "area": area
            },
            poi_coverage=coverage,
            blind_spots=blind_spots,
            score=score,
            suggestions=suggestions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # 关闭HTTP客户端连接
        await engine.baidu_map.close()
        await poi_analyzer.baidu_map.close()
        await blind_detector.baidu_map.close()


def calculate_score(
    coverage: Dict[str, Any],
    blind_spots: list,
    area: float
) -> Dict[str, Any]:
    """
    计算生活圈综合评分

    Args:
        coverage: POI覆盖情况
        blind_spots: 盲区列表
        area: 等时圈面积

    Returns:
        评分详情
    """
    # 各类别评分（满分100）
    category_scores = {}
    for category, data in coverage.items():
        count = data.get("count", 0)
        if count >= 8:
            category_scores[category] = 100
        elif count >= 5:
            category_scores[category] = 90
        elif count >= 3:
            category_scores[category] = 80
        elif count >= 2:
            category_scores[category] = 70
        elif count >= 1:
            category_scores[category] = 60
        else:
            category_scores[category] = 40

    # 综合评分
    if category_scores:
        total_score = sum(category_scores.values()) / len(category_scores)
    else:
        total_score = 50

    # 面积加分（15分钟步行圈正常面积约1-3平方公里）
    if area > 0:
        area_km2 = area / 1000000  # 转换为平方公里
        if area_km2 >= 2.0:
            area_bonus = 5
        elif area_km2 >= 1.0:
            area_bonus = 3
        elif area_km2 >= 0.5:
            area_bonus = 1
        else:
            area_bonus = 0
        total_score += area_bonus

    # 盲区扣分（降低扣分力度）
    blind_penalty = min(len(blind_spots) * 2, 15)
    total_score = max(30, total_score - blind_penalty)

    # 限制最高分为100
    total_score = min(100, total_score)

    # 等级评定
    if total_score >= 90:
        level = "优秀"
    elif total_score >= 75:
        level = "良好"
    elif total_score >= 60:
        level = "一般"
    else:
        level = "需改善"

    return {
        "total": round(total_score, 1),
        "level": level,
        "categories": category_scores,
        "blind_spot_penalty": blind_penalty
    }


def generate_suggestions(
    coverage: Dict[str, Any],
    blind_spots: list
) -> list:
    """
    生成改善建议

    Args:
        coverage: POI覆盖情况
        blind_spots: 盲区列表

    Returns:
        建议列表
    """
    suggestions = []

    # 基于覆盖情况生成建议
    category_names = {
        "医疗": "医疗服务",
        "教育": "教育资源",
        "购物": "购物便利",
        "养老": "养老服务",
        "文体": "文体设施",
        "餐饮": "餐饮服务"
    }

    for category, data in coverage.items():
        count = data.get("count", 0)
        level = data.get("level", "匮乏")

        if level == "匮乏":
            name = category_names.get(category, category)
            suggestions.append({
                "category": category,
                "priority": "高",
                "message": f"建议增加{name}设施，当前覆盖不足"
            })
        elif level == "一般":
            name = category_names.get(category, category)
            suggestions.append({
                "category": category,
                "priority": "中",
                "message": f"{name}设施可进一步完善"
            })

    # 基于盲区生成建议
    if blind_spots:
        suggestions.append({
            "category": "空间布局",
            "priority": "高",
            "message": f"发现{len(blind_spots)}个服务盲区，建议优化设施空间布局"
        })

    return suggestions
