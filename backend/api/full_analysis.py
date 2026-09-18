"""
全出行方式分析API（优化版）
支持步行、骑行、公交、驾车4种出行方式并行分析
优化：只查询15分钟POI，其他时间按距离过滤
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import time

from core.isochrone_engine import IsochroneEngine, GeoPoint
from core.poi_analyzer import POIAnalyzer
from core.blind_spot import BlindSpotDetector
from core.scoring import calculate_comprehensive_score
from services.baidu_map import BaiduMapService

router = APIRouter()


class FullAnalysisRequest(BaseModel):
    lng: float
    lat: float
    community_name: Optional[str] = "示例社区"


# 出行方式配置
TRAVEL_MODES = {
    "walking": {"name": "步行", "speed": 1.2, "speed_multiplier": 1.0},
    "cycling": {"name": "骑行", "speed": 3.5, "speed_multiplier": 1.8},
    "transit": {"name": "公交", "speed": 5.0, "speed_multiplier": 2.2},
    "driving": {"name": "驾车", "speed": 8.0, "speed_multiplier": 2.8},
}

# 时间点对应的最大距离（米）
TIME_DISTANCE_MAP = {
    300: 600,   # 5分钟步行约600米
    600: 1200,  # 10分钟步行约1200米
    900: 1800,  # 15分钟步行约1800米
}

# 出行方式对应的POI搜索半径（米）
MODE_POI_RADIUS = {
    "walking": 1500,   # 步行1.5km
    "cycling": 4000,   # 骑行4km
    "transit": 6000,   # 公交6km
    "driving": 9000    # 驾车9km
}


# 共享数据字典
modes_cache = {}

async def analyze_single_mode(mode, mode_config, center, location, community_name):
    """分析单种出行方式（每种方式独立查询POI）"""
    engine = IsochroneEngine()
    poi_analyzer = POIAnalyzer()
    blind_detector = BlindSpotDetector()

    try:
        speed_multiplier = mode_config["speed_multiplier"]
        time_slots = {}
        blind_spots_15min = []

        # 使用出行方式对应的搜索半径（而不是统一的步行半径）
        search_radius = MODE_POI_RADIUS.get(mode, 1500)
        print(f"[{mode}] 使用搜索半径: {search_radius}m")
        coverage_15min = await poi_analyzer.analyze_coverage(location, radius=search_radius)

        # 计算15分钟等时圈（使用速度缩放，减少计算）
        base_isochrone = await engine.calculate_isochrone(center, max_time=900)

        # 根据出行方式缩放等时圈
        if speed_multiplier != 1.0:
            scaled_points = []
            for p in base_isochrone.boundary_points:
                dlng = p.lng - center.lng
                dlat = p.lat - center.lat
                scaled_points.append(GeoPoint(
                    lng=center.lng + dlng * speed_multiplier,
                    lat=center.lat + dlat * speed_multiplier
                ))
            isochrone_15min = type(base_isochrone)(
                center=base_isochrone.center,
                boundary_points=scaled_points,
                polygon=[(p.lng, p.lat) for p in scaled_points],
                max_time=900
            )
        else:
            isochrone_15min = base_isochrone

        # 盲区检测（只对步行做，其他复用）
        if mode == "walking":
            blind_spots_15min = await blind_detector.detect_blind_spots(
                center=location, polygon=isochrone_15min.polygon
            )
        else:
            # 复用步行的盲区数据，按距离过滤
            walking_blind = modes.get("walking", {}).get("time_slots", {}).get("900", {}).get("blind_spots", [])
            max_dist = MODE_POI_RADIUS.get(mode, 1500)
            blind_spots_15min = [s for s in walking_blind if s.get("distance", 0) <= max_dist]

        for time_minutes in [5, 10, 15]:
            time_seconds = time_minutes * 60

            # 计算等时圈
            if time_minutes == 15:
                isochrone_result = isochrone_15min
            else:
                isochrone_result = await engine.calculate_isochrone(center, max_time=time_seconds)

            # 根据出行方式缩放等时圈范围
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

            # 根据时间点过滤设施（而不是重新查询）
            if time_minutes == 15:
                coverage = coverage_15min
                blind_spots = blind_spots_15min
            else:
                # 根据距离过滤
                max_distance = TIME_DISTANCE_MAP.get(time_seconds, 1800) * speed_multiplier
                coverage = poi_analyzer.filter_coverage_by_distance(coverage_15min, max_distance)

                # 过滤盲区
                blind_spots = [
                    spot for spot in blind_spots_15min
                    if spot.get("distance", 0) <= max_distance
                ]

            time_slots[str(time_seconds)] = {
                "time": time_seconds,
                "area": area,
                "boundary_points": [{"lng": p.lng, "lat": p.lat} for p in boundary_points],
                "polygon": isochrone_result.polygon,
                "poi_coverage": coverage,
                "blind_spots": blind_spots,
                "routes": []
            }

        # 获取从中心到主要设施的路线
        routes_to_facilities = []
        slot_15min = time_slots.get("900", {})
        coverage_15min_data = slot_15min.get("poi_coverage", {})
        for category, data in coverage_15min_data.items():
            facilities = data.get("facilities", [])[:2]  # 每类取前2个
            for fac in facilities:
                if fac.get("location"):
                    try:
                        baidu_map_temp = BaiduMapService()
                        origin = {"lng": center.lng, "lat": center.lat}
                        dest = {"lng": fac["location"]["lng"], "lat": fac["location"]["lat"]}
                        if mode == "walking":
                            route = await baidu_map_temp.get_walking_route(origin, dest)
                        elif mode == "cycling":
                            route = await baidu_map_temp.get_riding_route(origin, dest)
                        elif mode == "driving":
                            route = await baidu_map_temp.get_driving_route(origin, dest)
                        else:
                            route = await baidu_map_temp.get_walking_route(origin, dest)
                        if route:
                            routes_to_facilities.append({
                                "facility_name": fac.get("name", ""),
                                "category": category,
                                "route": route
                            })
                        await baidu_map_temp.close()
                    except Exception as e:
                        print(f"获取路线失败: {e}")

        score = calculate_mode_score(time_slots, mode_config)
        suggestions = generate_mode_suggestions(time_slots, mode_config)

        return {
            "mode": mode,
            "mode_name": mode_config["name"],
            "speed": mode_config["speed"],
            "score": score,
            "time_slots": time_slots,
            "suggestions": suggestions,
            "routes": routes_to_facilities
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

        print(f"[分析开始] 位置: {request.lng}, {request.lat}, 社区: {request.community_name}")

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

        print(f"[分析完成] 成功分析 {len([r for r in results if not isinstance(r, Exception)])} 种出行方式")

        # 计算综合评分
        comprehensive_score = calculate_comprehensive_score(modes)

        return {
            "community_name": request.community_name,
            "center": {"lng": center.lng, "lat": center.lat},
            "timestamp": time.time(),
            "modes": modes,
            "comparison": comparison,
            "comprehensive_score": {
                "facility_coverage": comprehensive_score.facility_coverage,
                "accessibility": comprehensive_score.accessibility,
                "mode_adaptability": comprehensive_score.mode_adaptability,
                "blind_spot": comprehensive_score.blind_spot,
                "fengshui": comprehensive_score.fengshui,
                "total": comprehensive_score.total,
                "level": comprehensive_score.level,
                "fengshui_detail": {
                    "terrain": comprehensive_score.fengshui_detail.terrain,
                    "orientation": comprehensive_score.fengshui_detail.orientation,
                    "water": comprehensive_score.fengshui_detail.water,
                    "road_form": comprehensive_score.fengshui_detail.road_form,
                    "sensitive_facilities": comprehensive_score.fengshui_detail.sensitive_facilities,
                    "greenery": comprehensive_score.fengshui_detail.greenery,
                    "popularity": comprehensive_score.fengshui_detail.popularity,
                    "total": comprehensive_score.fengshui_detail.total,
                    "level": comprehensive_score.fengshui_detail.level
                }
            }
        }
    except Exception as e:
        print(f"[分析失败] {e}")
        raise HTTPException(status_code=500, detail=str(e))