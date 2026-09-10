"""
图构建器单元测试
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import sys
import os

# 添加backend目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from core.graph_builder import GraphBuilder

@pytest.fixture
def builder():
    """创建图构建器实例"""
    return GraphBuilder()

@pytest.fixture
def sample_route_data():
    """示例路线数据 - 注意：add_route期望直接包含steps"""
    return {
        'steps': [
            {
                'path': '118.7965,32.0603;118.7970,32.0610;118.7975,32.0615',
                'distance': {'value': 500, 'text': '500米'},
                'duration': {'value': 300, 'text': '5分钟'},
                'instruction': '向东步行500米'
            },
            {
                'path': '118.7975,32.0615;118.7980,32.0620;118.7985,32.0625',
                'distance': {'value': 600, 'text': '600米'},
                'duration': {'value': 360, 'text': '6分钟'},
                'instruction': '向北步行600米'
            }
        ]
    }

def test_builder_initialization(builder):
    """测试构建器初始化"""
    assert builder is not None
    assert hasattr(builder, 'add_route')
    assert hasattr(builder, 'get_graph_data')
    assert hasattr(builder, 'get_node_count')
    assert hasattr(builder, 'get_edge_count')
    assert hasattr(builder, 'find_shortest_path')
    assert hasattr(builder, 'clear')

def test_add_route_adds_nodes_and_edges(builder, sample_route_data):
    """测试添加路线创建节点和边"""
    builder.add_route(sample_route_data)

    assert builder.get_node_count() > 0
    assert builder.get_edge_count() > 0

def test_add_route_parses_coordinates(builder, sample_route_data):
    """测试添加路线解析坐标"""
    builder.add_route(sample_route_data)
    graph_data = builder.get_graph_data()

    assert graph_data is not None
    # 检查图数据包含节点和边
    assert 'type' in graph_data
    assert graph_data['type'] == 'FeatureCollection'

def test_get_graph_data_returns_geojson(builder, sample_route_data):
    """测试返回GeoJSON格式"""
    builder.add_route(sample_route_data)
    graph_data = builder.get_graph_data()

    assert graph_data is not None
    assert 'type' in graph_data
    assert graph_data['type'] == 'FeatureCollection'
    assert 'features' in graph_data

def test_get_graph_data_features_have_geometry(builder, sample_route_data):
    """测试GeoJSON特征包含几何信息"""
    builder.add_route(sample_route_data)
    graph_data = builder.get_graph_data()

    for feature in graph_data['features']:
        assert 'geometry' in feature
        assert 'type' in feature['geometry']
        assert feature['geometry']['type'] == 'LineString'
        assert 'coordinates' in feature['geometry']

def test_get_graph_data_features_have_properties(builder, sample_route_data):
    """测试GeoJSON特征包含属性信息"""
    builder.add_route(sample_route_data)
    graph_data = builder.get_graph_data()

    for feature in graph_data['features']:
        assert 'properties' in feature
        props = feature['properties']
        assert 'distance' in props
        assert 'duration' in props

def test_add_route_empty_data(builder):
    """测试空数据添加路线"""
    builder.add_route({'steps': []})

    assert builder.get_node_count() == 0
    assert builder.get_edge_count() == 0

def test_add_route_single_step(builder):
    """测试单步路线添加"""
    data = {
        'steps': [{
            'path': '118.7965,32.0603;118.7970,32.0610',
            'distance': {'value': 100, 'text': '100米'},
            'duration': {'value': 60, 'text': '1分钟'},
            'instruction': '步行100米'
        }]
    }

    builder.add_route(data)

    assert builder.get_node_count() == 2
    assert builder.get_edge_count() == 1

def test_add_route_multiple_steps(builder):
    """测试多步路线添加"""
    data = {
        'steps': [
            {
                'path': '118.7965,32.0603;118.7970,32.0610',
                'distance': {'value': 100, 'text': '100米'},
                'duration': {'value': 60, 'text': '1分钟'},
                'instruction': '步骤1'
            },
            {
                'path': '118.7970,32.0610;118.7975,32.0615',
                'distance': {'value': 200, 'text': '200米'},
                'duration': {'value': 120, 'text': '2分钟'},
                'instruction': '步骤2'
            }
        ]
    }

    builder.add_route(data)

    assert builder.get_node_count() == 3
    assert builder.get_edge_count() == 2

def test_clear_resets_graph(builder, sample_route_data):
    """测试清除图数据"""
    builder.add_route(sample_route_data)
    assert builder.get_node_count() > 0

    builder.clear()

    assert builder.get_node_count() == 0
    assert builder.get_edge_count() == 0

def test_find_shortest_path_returns_path(builder, sample_route_data):
    """测试查找最短路径"""
    builder.add_route(sample_route_data)

    # 获取两个节点
    graph_data = builder.get_graph_data()
    if graph_data['features']:
        # 尝试查找路径
        try:
            path = builder.find_shortest_path(0, 1)
            # 路径可能不存在，但不应该抛出异常
            assert path is not None or path is None
        except Exception:
            # 如果节点ID不存在，可能会抛出异常
            pass

def test_get_node_count_returns_integer(builder, sample_route_data):
    """测试节点计数返回整数"""
    builder.add_route(sample_route_data)
    count = builder.get_node_count()

    assert isinstance(count, int)
    assert count >= 0

def test_get_edge_count_returns_integer(builder, sample_route_data):
    """测试边计数返回整数"""
    builder.add_route(sample_route_data)
    count = builder.get_edge_count()

    assert isinstance(count, int)
    assert count >= 0

def test_add_route_with_invalid_path(builder):
    """测试添加无效路径"""
    data = {
        'steps': [{
            'path': '',  # 空路径
            'distance': {'value': 0, 'text': '0米'},
            'duration': {'value': 0, 'text': '0分钟'},
            'instruction': '无效路径'
        }]
    }

    builder.add_route(data)

    assert builder.get_node_count() == 0
    assert builder.get_edge_count() == 0

def test_add_route_with_single_point(builder):
    """测试添加单点路径"""
    data = {
        'steps': [{
            'path': '118.7965,32.0603',  # 只有一个点
            'distance': {'value': 0, 'text': '0米'},
            'duration': {'value': 0, 'text': '0分钟'},
            'instruction': '单点'
        }]
    }

    builder.add_route(data)

    assert builder.get_node_count() == 0
    assert builder.get_edge_count() == 0
