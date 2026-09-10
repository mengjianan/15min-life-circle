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


class GraphDataResponse(BaseModel):
    """图数据响应"""
    type: str
    features: list
    node_count: int
    edge_count: int


@router.post("/route", response_model=GraphDataResponse)
async def get_route_graph(request: RouteRequest):
    """
    获取两点之间的路线图数据

    Args:
        request: 起点和终点坐标

    Returns:
        GeoJSON格式的路线图数据，包含距离和时间标注
    """
    try:
        baidu_map = BaiduMapService()
        origin = {"lng": request.origin_lng, "lat": request.origin_lat}
        destination = {"lng": request.dest_lng, "lat": request.dest_lat}

        # 获取路线详情
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
