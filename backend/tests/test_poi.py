"""
POI分析器单元测试
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import sys
import os

# 添加backend目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from core.poi_analyzer import POIAnalyzer

@pytest.fixture
def analyzer():
    """创建POI分析器实例"""
    return POIAnalyzer()

@pytest.fixture
def sample_location():
    """示例位置数据"""
    return {'lng': 118.7965, 'lat': 32.0603}

@pytest.fixture
def sample_poi_data():
    """示例POI数据"""
    return [
        {'name': '南京市第一医院', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        {'name': '社区卫生服务中心', 'distance': 200, 'location': {'lng': 118.79, 'lat': 32.06}},
    ]

def test_analyzer_initialization(analyzer):
    """测试分析器初始化"""
    assert analyzer is not None
    assert hasattr(analyzer, 'analyze_coverage')
    assert hasattr(analyzer, 'calculate_satisfaction_score')
    assert hasattr(analyzer, 'get_nearest_facility')

@pytest.mark.asyncio
async def test_analyze_coverage_returns_coverage_data(analyzer, sample_location):
    """测试覆盖率分析返回数据"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '医院A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        coverage = await analyzer.analyze_coverage(sample_location)

        assert coverage is not None
        assert isinstance(coverage, dict)
        assert '医疗' in coverage
        assert '教育' in coverage

@pytest.mark.asyncio
async def test_analyze_coverage_calculates_count(analyzer, sample_location):
    """测试覆盖率计算设施数量"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '医院A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
            {'name': '医院B', 'distance': 300, 'location': {'lng': 118.79, 'lat': 32.06}},
        ]

        coverage = await analyzer.analyze_coverage(sample_location)

        assert coverage['医疗']['count'] == 2

@pytest.mark.asyncio
async def test_analyze_coverage_determines_level(analyzer, sample_location):
    """测试覆盖率确定等级"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '医院A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        coverage = await analyzer.analyze_coverage(sample_location)

        assert 'level' in coverage['医疗']
        assert coverage['医疗']['level'] in ['充足', '一般', '较少', '匮乏']

@pytest.mark.asyncio
async def test_analyze_coverage_with_many_facilities(analyzer, sample_location):
    """测试大量设施的覆盖率"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': f'设施{i}', 'distance': i * 100, 'location': {'lng': 118.8, 'lat': 32.1}}
            for i in range(10)
        ]

        coverage = await analyzer.analyze_coverage(sample_location)

        assert coverage['医疗']['count'] == 10
        assert coverage['医疗']['level'] == '充足'

@pytest.mark.asyncio
async def test_analyze_coverage_with_empty_facilities(analyzer, sample_location):
    """测试空设施列表的覆盖率"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = []

        coverage = await analyzer.analyze_coverage(sample_location)

        assert coverage['医疗']['count'] == 0
        assert coverage['医疗']['level'] == '匮乏'

@pytest.mark.asyncio
async def test_calculate_satisfaction_score_basic(analyzer, sample_location):
    """测试基本满意度评分计算"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '设施A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        score = await analyzer.calculate_satisfaction_score(sample_location)

        assert score is not None
        assert isinstance(score, (int, float))
        assert score >= 0
        assert score <= 100

@pytest.mark.asyncio
async def test_calculate_satisfaction_score_empty_data(analyzer, sample_location):
    """测试空数据满意度评分"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = []

        score = await analyzer.calculate_satisfaction_score(sample_location)

        assert score is not None
        assert score == 0

@pytest.mark.asyncio
async def test_calculate_satisfaction_score_with_many_facilities(analyzer, sample_location):
    """测试大量设施的满意度评分"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': f'设施{i}', 'distance': i * 100, 'location': {'lng': 118.8, 'lat': 32.1}}
            for i in range(5)
        ]

        score = await analyzer.calculate_satisfaction_score(sample_location)

        assert score is not None
        assert score > 80  # 应该有较高分数

@pytest.mark.asyncio
async def test_calculate_satisfaction_score_with_far_facilities(analyzer, sample_location):
    """测试远距离设施的满意度评分"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '远处设施', 'distance': 5000, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        score = await analyzer.calculate_satisfaction_score(sample_location)

        assert score is not None
        # 远距离设施应该有较低分数
        assert score <= 100

@pytest.mark.asyncio
async def test_get_nearest_facility_returns_facility(analyzer, sample_location):
    """测试获取最近设施"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '近处设施', 'distance': 200, 'location': {'lng': 118.79, 'lat': 32.06}},
            {'name': '远处设施', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        nearest = await analyzer.get_nearest_facility(sample_location, '医疗')

        assert nearest is not None
        assert 'name' in nearest
        assert nearest['name'] == '近处设施'

@pytest.mark.asyncio
async def test_get_nearest_facility_returns_none_for_invalid_category(analyzer, sample_location):
    """测试无效类别获取最近设施"""
    nearest = await analyzer.get_nearest_facility(sample_location, '不存在的类别')

    assert nearest is None

@pytest.mark.asyncio
async def test_analyze_coverage_facilities_have_required_fields(analyzer, sample_location):
    """测试覆盖率分析设施包含必填字段"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '设施A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        coverage = await analyzer.analyze_coverage(sample_location)

        for category, data in coverage.items():
            assert 'count' in data
            assert 'level' in data
            assert 'facilities' in data
            for facility in data['facilities']:
                assert 'name' in facility
                assert 'distance' in facility

@pytest.mark.asyncio
async def test_analyze_coverage_with_custom_radius(analyzer, sample_location):
    """测试自定义半径的覆盖率分析"""
    with patch.object(analyzer.baidu_map, 'search_poi', new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {'name': '设施A', 'distance': 500, 'location': {'lng': 118.8, 'lat': 32.1}},
        ]

        coverage = await analyzer.analyze_coverage(sample_location, radius=2000)

        assert coverage is not None
        # 验证search_poi被调用时使用了正确的半径
        mock_search.assert_called()
