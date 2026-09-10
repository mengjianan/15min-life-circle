"""
测试配置文件
"""
import pytest
import asyncio
from typing import AsyncGenerator

@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def sample_community():
    """示例社区数据"""
    return {
        'name': '测试社区',
        'lng': 118.7965,
        'lat': 32.0603
    }

@pytest.fixture
def sample_isochrone_data():
    """示例等时圈数据"""
    return {
        'polygon': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [[[118.79, 32.06], [118.80, 32.06], [118.80, 32.07], [118.79, 32.07], [118.79, 32.06]]]
            },
            'properties': {}
        },
        'boundary_points': [
            (118.79, 32.06),
            (118.80, 32.06),
            (118.80, 32.07),
            (118.79, 32.07)
        ],
        'area': 1000000,
        'max_time': 900
    }

@pytest.fixture
def sample_poi_coverage():
    """示例POI覆盖数据"""
    return {
        '医疗': {
            'count': 3,
            'level': '充足',
            'facilities': [
                {'name': '医院A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
                {'name': '诊所B', 'distance': 200, 'location': {'lng': 118.79, 'lat': 32.06}},
                {'name': '药店C', 'distance': 100, 'location': {'lng': 118.795, 'lat': 32.065}}
            ]
        },
        '教育': {
            'count': 2,
            'level': '一般',
            'facilities': [
                {'name': '学校A', 'distance': 800, 'location': {'lng': 118.81, 'lat': 32.08}},
                {'name': '幼儿园B', 'distance': 300, 'location': {'lng': 118.798, 'lat': 32.062}}
            ]
        }
    }

@pytest.fixture
def sample_blind_spots():
    """示例盲区数据"""
    return [
        {
            'center': {'lng': 118.795, 'lat': 32.055},
            'radius': 500,
            'category': '医疗',
            'description': '医疗设施覆盖不足'
        },
        {
            'center': {'lng': 118.805, 'lat': 32.065},
            'radius': 300,
            'category': '教育',
            'description': '教育资源匮乏'
        }
    ]

@pytest.fixture
def sample_score_data():
    """示例评分数据"""
    return {
        'total': 75,
        'level': '良好',
        'categories': {
            '医疗': 80,
            '教育': 70,
            '购物': 75,
            '养老': 65,
            '文体': 80,
            '餐饮': 85
        },
        'blind_spot_penalty': 5
    }
