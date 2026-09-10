"""
Graph路网构建器
将路径规划结果转换为图结构
"""
import networkx as nx
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass


@dataclass
class RoadSegment:
    """路段"""
    start_lng: float
    start_lat: float
    end_lng: float
    end_lat: float
    distance: float  # 米
    duration: float  # 秒
    road_name: str
    points: List[Tuple[float, float]]  # 路径点列表


class GraphBuilder:
    """路网图构建器"""

    def __init__(self):
        self.graph = nx.DiGraph()

    def add_route(self, route_data: Dict[str, Any]) -> None:
        """
        从路径规划结果添加路线到图中

        Args:
            route_data: 百度地图路径规划返回的路线数据
        """
        steps = route_data.get("steps", [])

        for step in steps:
            # 解析路径点
            path_str = step.get("path", "")
            points = self._parse_path(path_str)

            if len(points) < 2:
                continue

            # 添加边到图中
            for i in range(len(points) - 1):
                start = points[i]
                end = points[i + 1]

                # 计算该段的距离和时间
                step_distance = step.get("distance", {}).get("value", 0)
                step_duration = step.get("duration", {}).get("value", 0)

                # 按比例分配到每个小段
                seg_distance = step_distance / (len(points) - 1)
                seg_duration = step_duration / (len(points) - 1)

                self.graph.add_edge(
                    start, end,
                    distance=seg_distance,
                    duration=seg_duration,
                    road_name=step.get("instruction", ""),
                    points=[start, end]
                )

    def _parse_path(self, path_str: str) -> List[Tuple[float, float]]:
        """
        解析路径字符串为坐标点列表

        Args:
            path_str: 路径字符串，格式如 "lng1,lat1;lng2,lat2;..."

        Returns:
            坐标点列表
        """
        if not path_str:
            return []

        points = []
        for point_str in path_str.split(";"):
            if "," in point_str:
                parts = point_str.split(",")
                if len(parts) >= 2:
                    try:
                        lng = float(parts[0])
                        lat = float(parts[1])
                        points.append((lng, lat))
                    except ValueError:
                        continue

        return points

    def get_graph_data(self) -> Dict[str, Any]:
        """
        获取图数据，用于前端渲染

        Returns:
            GeoJSON格式的图数据
        """
        features = []

        for u, v, data in self.graph.edges(data=True):
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [list(u), list(v)]
                },
                "properties": {
                    "distance": data.get("distance", 0),
                    "duration": data.get("duration", 0),
                    "road_name": data.get("road_name", ""),
                    "distance_text": f"{data.get('distance', 0):.0f}m",
                    "duration_text": f"{data.get('duration', 0) / 60:.1f}min"
                }
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features
        }

    def get_node_count(self) -> int:
        """获取节点数量"""
        return self.graph.number_of_nodes()

    def get_edge_count(self) -> int:
        """获取边数量"""
        return self.graph.number_of_edges()

    def find_shortest_path(
        self,
        start: Tuple[float, float],
        end: Tuple[float, float],
        weight: str = "distance"
    ) -> List[Tuple[float, float]]:
        """
        查找最短路径

        Args:
            start: 起点坐标
            end: 终点坐标
            weight: 权重类型（distance或duration）

        Returns:
            路径点列表
        """
        try:
            # 找到最近的节点
            start_node = self._find_nearest_node(start)
            end_node = self._find_nearest_node(end)

            if start_node and end_node:
                path = nx.shortest_path(
                    self.graph, start_node, end_node, weight=weight
                )
                return path
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            pass

        return []

    def _find_nearest_node(
        self, point: Tuple[float, float]
    ) -> Tuple[float, float]:
        """找到图中最近的节点"""
        min_dist = float('inf')
        nearest = None

        for node in self.graph.nodes():
            dist = ((node[0] - point[0]) ** 2 + (node[1] - point[1]) ** 2) ** 0.5
            if dist < min_dist:
                min_dist = dist
                nearest = node

        return nearest

    def clear(self):
        """清空图"""
        self.graph.clear()
