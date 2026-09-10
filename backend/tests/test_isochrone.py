"""
等时圈引擎单元测试
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import sys
import os

# 添加backend目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from core.isochrone_engine import IsochroneEngine, GeoPoint

@pytest.fixture
def engine():
    """创建等时圈引擎实例"""
    return IsochroneEngine()

@pytest.fixture
def sample_center():
    """示例中心点"""
    return GeoPoint(lng=118.7965, lat=32.0603)

def test_engine_initialization(engine):
    """测试引擎初始化"""
    assert engine is not None
    assert hasattr(engine, 'calculate_isochrone')
    assert hasattr(engine, 'calculate_area')

@pytest.mark.asyncio
async def test_calculate_isochrone_returns_data(engine, sample_center):
    """测试等时圈计算返回数据"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        # 模拟步行时间返回
        mock_time.return_value = 600  # 10分钟

        result = await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=8  # 测试用8个方向
        )

        assert result is not None
        assert hasattr(result, 'boundary_points')
        assert hasattr(result, 'polygon')
        assert len(result.boundary_points) == 8

@pytest.mark.asyncio
async def test_calculate_isochrone_handles_exceptions(engine, sample_center):
    """测试等时圈计算处理异常情况"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        # 模拟API调用失败
        mock_time.return_value = None

        result = await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=4
        )

        # 应该返回结果，即使部分失败
        assert result is not None
        assert len(result.boundary_points) == 4

@pytest.mark.asyncio
async def test_calculate_isochrone_validates_center(engine):
    """测试等时圈计算验证中心点"""
    with pytest.raises(Exception):
        await engine.calculate_isochrone(
            center=None,
            max_time=900,
            directions=8
        )

@pytest.mark.asyncio
async def test_calculate_isochrone_validates_directions(engine, sample_center):
    """测试等时圈计算验证方向数"""
    with pytest.raises(Exception):
        await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=0  # 无效
        )

def test_calculate_area_returns_area(engine):
    """测试面积计算"""
    # 创建一个简单的多边形
    points = [
        GeoPoint(lng=118.79, lat=32.06),
        GeoPoint(lng=118.80, lat=32.06),
        GeoPoint(lng=118.80, lat=32.07),
        GeoPoint(lng=118.79, lat=32.07),
    ]

    area = engine.calculate_area(points)

    assert area is not None
    assert isinstance(area, float)
    assert area > 0

def test_calculate_area_empty_polygon(engine):
    """测试空多边形面积计算"""
    points = []

    area = engine.calculate_area(points)

    assert area == 0

def test_calculate_area_single_point(engine):
    """测试单点面积计算"""
    points = [GeoPoint(lng=118.79, lat=32.06)]

    area = engine.calculate_area(points)

    assert area == 0

def test_calculate_area_two_points(engine):
    """测试两点面积计算"""
    points = [
        GeoPoint(lng=118.79, lat=32.06),
        GeoPoint(lng=118.80, lat=32.07),
    ]

    area = engine.calculate_area(points)

    assert area == 0

@pytest.mark.asyncio
async def test_calculate_isochrone_with_different_max_times(engine, sample_center):
    """测试不同最大时间的等时圈计算"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        mock_time.return_value = 300  # 5分钟

        # 测试5分钟等时圈
        result5 = await engine.calculate_isochrone(
            center=sample_center,
            max_time=300,
            directions=4
        )

        # 测试10分钟等时圈
        result10 = await engine.calculate_isochrone(
            center=sample_center,
            max_time=600,
            directions=4
        )

        # 测试15分钟等时圈
        result15 = await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=4
        )

        # 所有结果都应该有效
        assert result5 is not None
        assert result10 is not None
        assert result15 is not None

@pytest.mark.asyncio
async def test_calculate_isochrone_returns_polygon(engine, sample_center):
    """测试等时圈计算返回多边形"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        mock_time.return_value = 600  # 10分钟

        result = await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=8
        )

        polygon = result.polygon
        assert polygon is not None
        assert polygon['type'] == 'Feature'
        assert polygon['geometry']['type'] == 'Polygon'
        assert 'coordinates' in polygon['geometry']

@pytest.mark.asyncio
async def test_calculate_isochrone_boundary_points_count(engine, sample_center):
    """测试等时圈计算返回正确数量的边界点"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        mock_time.return_value = 600

        # 测试不同方向数
        for directions in [4, 8, 16, 36]:
            result = await engine.calculate_isochrone(
                center=sample_center,
                max_time=900,
                directions=directions
            )

            assert len(result.boundary_points) == directions

@pytest.mark.asyncio
async def test_calculate_isochrone_with_high_walking_time(engine, sample_center):
    """测试高步行时间的等时圈计算"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        mock_time.return_value = 1200  # 20分钟，超过最大时间

        result = await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=4
        )

        assert result is not None
        assert len(result.boundary_points) == 4

@pytest.mark.asyncio
async def test_calculate_isochrone_with_zero_walking_time(engine, sample_center):
    """测试零步行时间的等时圈计算"""
    with patch.object(engine.baidu_map, 'get_walking_time', new_callable=AsyncMock) as mock_time:
        mock_time.return_value = 0

        result = await engine.calculate_isochrone(
            center=sample_center,
            max_time=900,
            directions=4
        )

        assert result is not None
        assert len(result.boundary_points) == 4

def test_geo_point_initialization():
    """测试GeoPoint初始化"""
    point = GeoPoint(lng=118.7965, lat=32.0603)

    assert point.lng == 118.7965
    assert point.lat == 32.0603

def test_geo_point_to_dict():
    """测试GeoPoint转字典"""
    point = GeoPoint(lng=118.7965, lat=32.0603)
    point_dict = point.to_dict()

    assert point_dict == {'lng': 118.7965, 'lat': 32.0603}
