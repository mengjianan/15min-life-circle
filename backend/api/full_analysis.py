"""
全出行方式分析API（优化版 v3）
支持步行、骑行、公交、驾车4种出行方式并行分析
优化：只查询15分钟POI，其他时间按距离过滤
优化：顺序执行避免并发限流
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import asyncio
import time

from core.isochrone_engine import IsochroneEngine, GeoPoint
from core.poi_analyzer import POIAnalyzer
from core.blind_spot import BlindSpotDetector
from core.scoring import calculate_comprehensive_score, calculate_accessibility_blind_spots
from core.report_generator import generate_comprehensive_report, report_to_dict
from core.feng_shui_engine import feng_shui_engine

router = APIRouter()


class FullAnalysisRequest(BaseModel):
    lng: float
    lat: float
    community_name: Optional[str] = "示例社区"


# 出行方式配置
TRAVEL_MODES = {
    "walking": {"name": "步行", "speed": 1.2, "speed_multiplier": 1.0},
    "cycling": {"name": "骑行", "speed": 3.5, "speed_multiplier": 2.9},  # 骑行速度约3.5m/s，15分钟约3150m
    "transit": {"name": "公交", "speed": 5.0, "speed_multiplier": 4.2},  # 公交速度约5m/s，15分钟约4500m
    "driving": {"name": "驾车", "speed": 8.0, "speed_multiplier": 6.7},  # 驾车速度约8m/s，15分钟约7200m
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


async def analyze_single_mode(mode, mode_config, center, location, community_name, shared_poi_data=None):
    """分析单种出行方式（共享POI数据，按距离过滤）"""
    engine = IsochroneEngine()
    poi_analyzer = POIAnalyzer()
    blind_detector = BlindSpotDetector()

    try:
        time_slots = {}

        # 使用共享的POI数据（最大半径查询一次，按距离过滤）
        if shared_poi_data:
            max_radius = MODE_POI_RADIUS.get(mode, 1500)
            coverage_15min = poi_analyzer.filter_coverage_by_distance(shared_poi_data, max_radius)
            print(f"[{mode}] 使用共享POI数据，过滤半径: {max_radius}m")
        else:
            search_radius = MODE_POI_RADIUS.get(mode, 1500)
            print(f"[{mode}] 使用搜索半径: {search_radius}m")
            coverage_15min = await poi_analyzer.analyze_coverage(location, radius=search_radius)

        # 直接用出行方式的速度计算15分钟等时圈（不再缩放）
        mode_speed = mode_config["speed"]  # 步行1.2, 骑行3.5, 公交5.0, 驾车8.0 m/s
        isochrone_15min = await engine.calculate_isochrone(center, max_time=900, speed=mode_speed)

        # 盲区在下面的时段循环里，按「本模式 + 本时段」的等时圈和设施集独立计算。
        # 旧实现只对步行算一次，其它模式复用时按 distance 过滤 —— 但盲区对象没有
        # distance 字段，过滤恒真，导致四个模式的盲区完全一样。

        for time_minutes in [5, 10, 15]:
            time_seconds = time_minutes * 60

            # 15分钟等时圈已计算，5/10分钟按时间比例缩放（节省API调用）
            if time_minutes == 15:
                isochrone_result = isochrone_15min
            else:
                scale = time_minutes / 15.0
                scaled_points = []
                for p in isochrone_15min.boundary_points:
                    dlng = p.lng - center.lng
                    dlat = p.lat - center.lat
                    scaled_points.append(GeoPoint(
                        lng=center.lng + dlng * scale,
                        lat=center.lat + dlat * scale
                    ))
                # 构建缩放后的等时圈结果
                polygon = engine._build_polygon(scaled_points)
                isochrone_result = type(isochrone_15min)(
                    center=center,
                    boundary_points=scaled_points,
                    polygon=polygon,
                    max_time=time_seconds
                )

            boundary_points = isochrone_result.boundary_points

            area = engine.calculate_area(boundary_points)

            # 根据时间点过滤设施（而不是重新查询）
            if time_minutes == 15:
                coverage = coverage_15min
            else:
                max_distance = mode_speed * time_seconds
                coverage = poi_analyzer.filter_coverage_by_distance(coverage_15min, max_distance)

            # 盲区按「本时段的等时圈 + 本时段的设施集」独立判定，零API调用。
            # 时段越短圈越小、设施越少，盲区自然随之变化。
            blind_spots = await blind_detector.detect_blind_spots_with_data(
                center=location,
                polygon=isochrone_result.polygon,
                coverage_data=coverage,
            )

            # 可达性盲区：该模式该时段「能到达的设施数量」是否达标。
            # 报告只展示这个口径 —— 它能直接体现出行方式差异（圈越大能到的越多），
            # 而空间盲区（画在地图上的红圈）圈越大反而越多，容易让人误解。
            #
            # 必须按等时圈过滤而不是按 MODE_POI_RADIUS：后者是检索半径
            # （步行1500m），远大于实际等时圈（步行约700m），会把走不到的
            # 设施也算进来，15分钟就全都"达标"了、看不出差异。
            coverage_reachable = poi_analyzer.filter_coverage_by_polygon(
                coverage, isochrone_result.polygon
            )
            accessibility_blind_spots = calculate_accessibility_blind_spots(
                coverage_reachable, f"{time_minutes}分钟"
            )

            time_slots[str(time_seconds)] = {
                "time": time_seconds,
                "area": area,
                "boundary_points": [{"lng": p.lng, "lat": p.lat} for p in boundary_points],
                "polygon": isochrone_result.polygon,
                "poi_coverage": coverage,
                "blind_spots": blind_spots,
                "accessibility_blind_spots": accessibility_blind_spots,
            }

        # 中心到设施的路线不再在这里取：改由 /api/graph/facility-routes 按需提供
        # （directionlite 必须串行+限速，全量预取会让体检多花 30 秒以上）

        score = calculate_mode_score(time_slots, mode_config)
        suggestions = generate_mode_suggestions(time_slots, mode_config)

        return {
            "mode": mode,
            "mode_name": mode_config["name"],
            "speed": mode_config["speed"],
            "score": score,
            "time_slots": time_slots,
            "suggestions": suggestions,
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

        print(f"[分析开始] 位置: {request.lng}, {request.lat}, 社区: {request.community_name}", flush=True)

        # 预加载POI数据（用最大半径查询一次，所有模式共享）
        poi_analyzer = POIAnalyzer()
        max_poi_radius = max(MODE_POI_RADIUS.values())  # 9000m（驾车半径）
        print(f"[POI预加载] 使用最大半径: {max_poi_radius}m")
        shared_poi_data = await poi_analyzer.analyze_coverage(location, radius=max_poi_radius)
        await poi_analyzer.baidu_map.close()

        # 顺序执行各出行方式分析（避免并发API请求过多被限流）
        results = []
        for mode, config in TRAVEL_MODES.items():
            try:
                result = await analyze_single_mode(mode, config, center, location, request.community_name, shared_poi_data)
                results.append(result)
            except Exception as e:
                print(f"出行方式 {mode} 分析失败: {e}", flush=True)
                results.append(e)

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

        # 获取风水评分（包含完整的水系、地形、绿化数据）
        fengshui_data = None
        try:
            fengshui_result = await feng_shui_engine.analyze(center, radius=1500)
            fengshui_data = {
                "terrain": {
                    "score": fengshui_result.terrain.score,
                    "terrain_type": fengshui_result.terrain.terrain_type.value if hasattr(fengshui_result.terrain.terrain_type, 'value') else str(fengshui_result.terrain.terrain_type),
                    "elevation": fengshui_result.terrain.elevation,
                    "slope": fengshui_result.terrain.slope,
                    "description": fengshui_result.terrain.description,
                    "terrain_features": [f.dict() for f in fengshui_result.terrain.terrain_features]
                },
                "water": {
                    "score": fengshui_result.water.score,
                    "has_water": fengshui_result.water.has_water,
                    "distance": fengshui_result.water.distance,
                    "description": fengshui_result.water.description,
                    "water_features": [f.dict() for f in fengshui_result.water.water_features]
                },
                "environment": {
                    "score": fengshui_result.environment.score,
                    "description": fengshui_result.environment.description
                },
                "orientation": {
                    "score": fengshui_result.orientation.score,
                    "facing_direction": fengshui_result.orientation.facing_direction,
                    "description": fengshui_result.orientation.description
                },
                "greenery": {
                    "score": fengshui_result.greenery.score,
                    "has_greenery": fengshui_result.greenery.has_greenery,
                    "count": fengshui_result.greenery.count,
                    "description": fengshui_result.greenery.description,
                    "greenery_features": [f.dict() for f in fengshui_result.greenery.greenery_features]
                },
                # 补齐顶层评分/建议，使本接口与 /api/fengshui/analyze 结构一致。
                # 前端 FengShuiRadar 靠 data.score.terrain 取值，缺了会拿到对象而非数字。
                # 补上之后前端就不必在体检结束后再单独调一次风水接口。
                "score": fengshui_result.score.dict(),
                "suggestions": [s.dict() for s in fengshui_result.suggestions],
            }
        except Exception as e:
            print(f"风水分析失败: {e}")

        # 计算综合评分
        comprehensive_score = calculate_comprehensive_score(modes, fengshui_data)

        # 生成综合报告
        # 获取15分钟步行POI数据用于报告
        walking_data = modes.get("walking", {})
        slot_15min = walking_data.get("time_slots", {}).get("900", {})
        poi_coverage = slot_15min.get("poi_coverage", {})
        blind_spots_data = slot_15min.get("blind_spots", [])
        accessibility_blind_spots = slot_15min.get("accessibility_blind_spots", [])

        report = generate_comprehensive_report(
            community_name=request.community_name,
            center={"lng": center.lng, "lat": center.lat},
            comprehensive_score=comprehensive_score,
            modes_data=modes,
            blind_spots=blind_spots_data,
            accessibility_blind_spots=accessibility_blind_spots,
            fengshui_data=fengshui_data,
            poi_coverage=poi_coverage
        )

        return {
            "api_version": "v3",
            "community_name": request.community_name,
            "center": {"lng": center.lng, "lat": center.lat},
            "timestamp": time.time(),
            "modes": modes,
            "comparison": comparison,
            "fengshui": fengshui_data,  # 完整风水数据（包含水系、地形、绿化坐标）
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
            },
            "report": report_to_dict(report)
        }
    except Exception as e:
        print(f"[分析失败] {e}")
        raise HTTPException(status_code=500, detail=str(e))