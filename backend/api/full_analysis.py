"""
全出行方式分析API
支持步行、骑行、公交、驾车4种出行方式并行分析
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import time

from core.isochrone_engine import IsochroneEngine, GeoPoint
from core.poi_analyzer import POIAnalyzer
from core.blind_spot import BlindSpotDetector
from services.baidu_map import BaiduMapService

router = APIRouter()


class FullAnalysisRequest(BaseModel):
    lng: float
    lat: float
    community_name: Optional[str] = "示例社区"


# 出行方式配置
TRAVEL_MODES = {
    "walking": {"name": "步行", "speed": 1.2, "speed_multiplier": 1.0},
    "cycling": {"name": "骑行", "speed": 3.5, "speed_multiplier": 2.9},
    "transit": {"name": "公交", "speed": 5.0, "speed_multiplier": 4.2},
    "driving": {"name": "驾车", "speed": 8.0, "speed_multiplier": 6.7},
}


async def analyze_single_mode(mode, mode_config, center, location, community_name):
    engine = IsochroneEngine()
    poi_analyzer = POIAnalyzer()
    blind_detector = BlindSpotDetector()

    try:
        speed_multiplier = mode_config["speed_multiplier"]
        time_slots = {}

        for time_minutes in [5, 10, 15]:
            time_seconds = time_minutes * 60
            isochrone_result = await engine.calculate_isochrone(center, max_time=time_seconds)

            if speed_multiplier != 1.0:
                scaled_points = []
                for p in isochrone_result.boundary_points:
                    dlng = p.lng - center.lng
                    dlat = p.lat - center.lat
                    scaled_points.append(GeoPoint(
                        lng=center.lng + dlng * speed_multiplier,
                        lat=center.lat + dlat * speed_multiplier
                    ))
                boundary_points = scaled_points
            else:
                boundary_points = isochrone_result.boundary_points

            area = engine.calculate_area(boundary_points)
            search_radius = int(1500 * speed_multiplier)
            coverage = await poi_analyzer.analyze_coverage(location, radius=search_radius)
            blind_spots = await blind_detector.detect_blind_spots(
                center=location, polygon=isochrone_result.polygon
            )

            time_slots[str(time_seconds)] = {
                "time": time_seconds,
                "area": area,
                "boundary_points": [{"lng": p.lng, "lat": p.lat} for p in boundary_points],
                "polygon": isochrone_result.polygon,
                "poi_coverage": coverage,
                "blind_spots": blind_spots,
                "routes": []
            }

        score = calculate_mode_score(time_slots, mode_config)
        suggestions = generate_mode_suggestions(time_slots, mode_config)

        return {
            "mode": mode,
            "mode_name": mode_config["name"],
            "speed": mode_config["speed"],
            "score": score,
            "time_slots": time_slots,
            "suggestions": suggestions
        }
    except Exception as e:
        print(f"分析出行方式 {mode} 失败: {e}")
        raise
    finally:
        await engine.baidu_map.close()
        await poi_analyzer.baidu_map.close()
        await blind_detector.baidu_map.close()


def calculate_mode_score(time_slots, mode_config):
    slot_15min = time_slots.get("900", {})
    coverage = slot_15min.get("poi_coverage", {})
    blind_spots = slot_15min.get("blind_spots", [])
    area = slot_15min.get("area", 0)

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

    if category_scores:
        total_score = sum(category_scores.values()) / len(category_scores)
    else:
        total_score = 50

    if area > 0:
        area_km2 = area / 1000000
        speed = mode_config["speed"]
        expected_area = speed * 15 * 60 / 1000
        if area_km2 >= expected_area * 0.8:
            area_bonus = 5
        elif area_km2 >= expected_area * 0.5:
            area_bonus = 3
        elif area_km2 >= expected_area * 0.2:
            area_bonus = 1
        else:
            area_bonus = 0
        total_score += area_bonus

    blind_penalty = min(len(blind_spots) * 2, 15)
    total_score = max(30, total_score - blind_penalty)
    total_score = min(100, total_score)

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


def generate_mode_suggestions(time_slots, mode_config):
    suggestions = []
    slot_15min = time_slots.get("900", {})
    coverage = slot_15min.get("poi_coverage", {})
    blind_spots = slot_15min.get("blind_spots", [])

    category_names = {
        "医疗": "医疗服务", "教育": "教育资源", "购物": "购物便利",
        "养老": "养老服务", "文体": "文体设施", "餐饮": "餐饮服务"
    }

    for category, data in coverage.items():
        level = data.get("level", "匮乏")
        if level == "匮乏":
            name = category_names.get(category, category)
            suggestions.append({
                "category": category,
                "priority": "高",
                "message": mode_config["name"] + "范围内建议增加" + name + "设施"
            })
        elif level == "一般":
            name = category_names.get(category, category)
            suggestions.append({
                "category": category,
                "priority": "中",
                "message": mode_config["name"] + "范围内" + name + "设施可完善"
            })

    if blind_spots:
        suggestions.append({
            "category": "空间布局",
            "priority": "高",
            "message": mode_config["name"] + "范围内发现" + str(len(blind_spots)) + "个服务盲区"
        })

    return suggestions


@router.post("/full-analysis")
async def generate_full_analysis(request: FullAnalysisRequest):
    try:
        center = GeoPoint(lng=request.lng, lat=request.lat)
        location = {"lng": request.lng, "lat": request.lat}

        tasks = [
            analyze_single_mode(mode, config, center, location, request.community_name)
            for mode, config in TRAVEL_MODES.items()
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        modes = {}
        comparison = []

        for i, (mode, config) in enumerate(TRAVEL_MODES.items()):
            result = results[i]
            if isinstance(result, Exception):
                print(f"出行方式 {mode} 分析失败: {result}")
                modes[mode] = {
                    "mode": mode, "mode_name": config["name"], "speed": config["speed"],
                    "score": {"total": 0, "level": "需改善", "categories": {}, "blind_spot_penalty": 0},
                    "time_slots": {}, "suggestions": []
                }
            else:
                modes[mode] = result
                time_5 = result.get("time_slots", {}).get("300", {}).get("area", 0) / 1000000
                time_10 = result.get("time_slots", {}).get("600", {}).get("area", 0) / 1000000
                time_15 = result.get("time_slots", {}).get("900", {}).get("area", 0) / 1000000
                comparison.append({
                    "mode": mode, "mode_name": config["name"],
                    "time_5": round(time_5, 2), "time_10": round(time_10, 2), "time_15": round(time_15, 2)
                })

        return {
            "community_name": request.community_name,
            "center": {"lng": center.lng, "lat": center.lat},
            "timestamp": time.time(),
            "modes": modes,
            "comparison": comparison
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))