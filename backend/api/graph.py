"""
路网图API
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from core.graph_builder import GraphBuilder
from services.baidu_map import BaiduMapService

router = APIRouter()


class RouteRequest(BaseModel):
    """路线请求"""
    origin_lng: float
    origin_lat: float
    dest_lng: float
    dest_lat: float
    travel_mode: str = "walking"  # walking, cycling, ebike, driving


class GraphDataResponse(BaseModel):
    """图数据响应"""
    type: str
    features: list
    node_count: int
    edge_count: int


class FacilityRoutesRequest(BaseModel):
    """中心点 -> 设施路线请求"""
    lng: float
    lat: float
    mode: str = "walking"   # walking / cycling / transit / driving
    max_time: int = 900     # 秒，用于判定“等时圈内”


# 每种出行方式对应的路线接口（必须走 directionlite：routematrix 只有时长、没有几何，
# 画不出折线。transit 也必须用公交接口，不能像旧代码那样降级成步行）
async def _route_for_mode(baidu_map: BaiduMapService, mode: str, origin, destination):
    if mode == "walking":
        return await baidu_map.get_walking_route(origin, destination)
    if mode == "cycling":
        return await baidu_map.get_riding_route(origin, destination)
    if mode == "transit":
        return await baidu_map.get_transit_route(origin, destination)
    if mode == "driving":
        return await baidu_map.get_driving_route(origin, destination)
    return None


@router.post("/route", response_model=GraphDataResponse)
async def get_route_graph(request: RouteRequest):
    """
    获取两点之间的路线图数据

    Args:
        request: 起点和终点坐标，以及出行方式

    Returns:
        GeoJSON格式的路线图数据，包含距离和时间标注
    """
    try:
        baidu_map = BaiduMapService()
        origin = {"lng": request.origin_lng, "lat": request.origin_lat}
        destination = {"lng": request.dest_lng, "lat": request.dest_lat}

        # 根据出行方式获取路线
        if request.travel_mode == "walking":
            route = await baidu_map.get_walking_route(origin, destination)
        elif request.travel_mode == "cycling":
            route = await baidu_map.get_riding_route(origin, destination)
        elif request.travel_mode == "ebike":
            route = await baidu_map.get_riding_route(origin, destination)  # 电动车用骑行路线
        elif request.travel_mode == "driving":
            route = await baidu_map.get_driving_route(origin, destination)
        else:
            route = await baidu_map.get_walking_route(origin, destination)

        if not route:
            raise HTTPException(status_code=404, detail="无法找到路线")

        # 构建图
        builder = GraphBuilder()
        builder.add_route(route)

        graph_data = builder.get_graph_data()
        graph_data["node_count"] = builder.get_node_count()
        graph_data["edge_count"] = builder.get_edge_count()
        graph_data["total_distance"] = route.get("distance", 0)
        graph_data["total_duration"] = route.get("duration", 0)
        graph_data["travel_mode"] = request.travel_mode

        return graph_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/isochrone-graph")
async def get_isochrone_graph(
    lng: float,
    lat: float,
    directions: int = 12
):
    """
    获取等时圈范围内的路网图

    Args:
        lng: 中心点经度
        lat: 中心点纬度
        directions: 采样方向数

    Returns:
        等时圈范围内的路网GeoJSON数据
    """
    try:
        from core.isochrone_engine import IsochroneEngine, GeoPoint

        engine = IsochroneEngine()
        center = GeoPoint(lng=lng, lat=lat)

        # 计算等时圈
        isochrone = await engine.calculate_isochrone(
            center=center,
            directions=directions
        )

        # 构建路网图
        builder = GraphBuilder()
        baidu_map = BaiduMapService()

        # 从中心点向各边界点请求路线
        for point in isochrone.boundary_points:
            origin = {"lng": center.lng, "lat": center.lat}
            destination = {"lng": point.lng, "lat": point.lat}

            route = await baidu_map.get_walking_route(origin, destination)
            if route:
                builder.add_route(route)

        graph_data = builder.get_graph_data()
        graph_data["isochrone"] = isochrone.polygon
        graph_data["node_count"] = builder.get_node_count()
        graph_data["edge_count"] = builder.get_edge_count()

        return graph_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/facility-routes")
async def get_facility_routes(request: FacilityRoutesRequest):
    """
    中心点到「该模式15分钟等时圈内」每个设施的真实路线

    按出行方式返回，供前端切换出行方式时直接切换路线。

    消耗说明：
    - POI 覆盖、等时圈都命中 30 天缓存，重复调用零 API
    - 只有「路线」本身消耗方向API配额，且每条路线有 30 天缓存 + 方向限速保护
    """
    mode = request.mode
    if mode not in ("walking", "cycling", "transit", "driving"):
        raise HTTPException(status_code=400, detail=f"不支持的出行方式: {mode}")

    try:
        # 函数内导入：避免与 full_analysis 在模块加载期互相引用
        from api.full_analysis import MODE_POI_RADIUS, TRAVEL_MODES
        from core.isochrone_engine import IsochroneEngine, GeoPoint
        from core.poi_analyzer import POIAnalyzer
        from shapely.geometry import Point, Polygon

        location = {"lng": request.lng, "lat": request.lat}
        center = GeoPoint(lng=request.lng, lat=request.lat)
        speed = TRAVEL_MODES[mode]["speed"]

        poi_analyzer = POIAnalyzer()
        baidu_map = BaiduMapService()
        engine = IsochroneEngine()

        try:
            # 1) POI 覆盖（按模式半径过滤，命中缓存）
            shared = await poi_analyzer.analyze_coverage(
                location, radius=max(MODE_POI_RADIUS.values())
            )
            coverage = poi_analyzer.filter_coverage_by_distance(
                shared, MODE_POI_RADIUS[mode]
            )

            # 2) 该模式自己的等时圈（引擎30天缓存）
            iso = await engine.calculate_isochrone(
                center=center, max_time=request.max_time, speed=speed
            )
            ring = iso.polygon.get("geometry", {}).get("coordinates", [[]])[0]
            poly = Polygon([(c[0], c[1]) for c in ring]) if len(ring) >= 3 else None

            # 3) 只保留等时圈内的设施
            targets = []
            for category, data in coverage.items():
                for fac in data.get("facilities", []):
                    loc = fac.get("location") or {}
                    if loc.get("lng") is None or loc.get("lat") is None:
                        continue
                    if poly is not None and not poly.contains(
                        Point(float(loc["lng"]), float(loc["lat"]))
                    ):
                        continue
                    targets.append((category, fac, loc))

            # 4) 逐个取真实路线（复用同一个 client）
            routes = []
            for category, fac, loc in targets:
                route = await _route_for_mode(baidu_map, mode, location, loc)
                if route and route.get("steps"):
                    routes.append({
                        "facility_name": fac.get("name", ""),
                        "category": category,
                        "location": {"lng": float(loc["lng"]), "lat": float(loc["lat"])},
                        "route": route,
                    })

            print(f"[设施路线] {mode} {request.max_time}s 等时圈内 {len(targets)} 个设施，"
                  f"成功 {len(routes)} 条")
            return {"mode": mode, "count": len(routes), "routes": routes}
        finally:
            await baidu_map.close()
            await poi_analyzer.baidu_map.close()
            await engine.baidu_map.close()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
