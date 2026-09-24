"""
集成测试脚本
测试完整的分析流程
"""
import asyncio
import json
import os
import socket
import time
from typing import Dict, Any
import pytest

# 连真实后端的集成测试：缺 aiohttp 或后端没起时自动跳过
pytest.importorskip("aiohttp", reason="集成测试需要 aiohttp，未安装则跳过")
import aiohttp  # noqa: E402


def _server_reachable(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False


# 测试配置（后端端口已是 8081，可用 BASE_URL 覆盖）
BASE_URL = os.getenv("BASE_URL", "http://localhost:8081")

pytestmark = pytest.mark.skipif(
    not _server_reachable("localhost", 8081) and BASE_URL == "http://localhost:8081",
    reason="后端服务未启动（需要 localhost:8081），跳过集成测试",
)


async def test_full_analysis_flow():
    """测试完整分析流程"""
    print("="*60)
    print("集成测试: 完整分析流程")
    print("="*60)

    async with aiohttp.ClientSession() as session:
        # 1. 健康检查
        print("\n1. 健康检查...")
        async with session.get(f"{BASE_URL}/health") as response:
            assert response.status == 200
            data = await response.json()
            assert data['status'] == 'healthy'
            print("   ✓ 健康检查通过")

        # 2. 获取示例社区
        print("\n2. 获取示例社区...")
        async with session.get(f"{BASE_URL}/api/isochrone/sample-centers") as response:
            assert response.status == 200
            data = await response.json()
            assert 'centers' in data
            assert len(data['centers']) > 0
            print(f"   ✓ 获取到 {len(data['centers'])} 个示例社区")

        # 3. 计算等时圈
        print("\n3. 计算等时圈...")
        isochrone_request = {
            "lng": 118.7965,
            "lat": 32.0603,
            "max_time": 900,
            "directions": 24
        }
        async with session.post(
            f"{BASE_URL}/api/isochrone/calculate",
            json=isochrone_request
        ) as response:
            assert response.status == 200
            data = await response.json()
            assert 'boundary_points' in data
            assert 'polygon' in data
            assert 'area' in data
            print(f"   ✓ 等时圈计算成功，面积: {data['area']:.0f} 平方米")

        # 4. 计算多时间维度等时圈
        print("\n4. 计算多时间维度等时圈...")
        multi_time_request = {
            "lng": 118.7965,
            "lat": 32.0603,
            "directions": 24
        }
        async with session.post(
            f"{BASE_URL}/api/isochrone/multi-time",
            json=multi_time_request
        ) as response:
            assert response.status == 200
            data = await response.json()
            assert 'layers' in data
            assert len(data['layers']) == 3
            print(f"   ✓ 多时间维度计算成功，包含 {len(data['layers'])} 个时间层")

        # 5. 搜索POI
        print("\n5. 搜索POI...")
        poi_request = {
            "lng": 118.7965,
            "lat": 32.0603,
            "category": "医疗",
            "radius": 1500
        }
        async with session.post(
            f"{BASE_URL}/api/poi/search",
            json=poi_request
        ) as response:
            assert response.status == 200
            data = await response.json()
            assert isinstance(data, list)
            print(f"   ✓ POI搜索成功，找到 {len(data)} 个设施")

        # 6. 生成分析报告
        print("\n6. 生成分析报告...")
        analysis_request = {
            "lng": 118.7965,
            "lat": 32.0603,
            "community_name": "测试社区"
        }
        start_time = time.time()
        async with session.post(
            f"{BASE_URL}/api/analysis/report",
            json=analysis_request
        ) as response:
            assert response.status == 200
            data = await response.json()
            duration = time.time() - start_time

            assert 'community_name' in data
            assert 'score' in data
            assert 'suggestions' in data
            assert 'blind_spots' in data
            assert 'isochrone' in data
            assert 'poi_coverage' in data

            print(f"   ✓ 分析报告生成成功")
            print(f"     - 社区名称: {data['community_name']}")
            print(f"     - 综合评分: {data['score']['total']}")
            print(f"     - 评分等级: {data['score']['level']}")
            print(f"     - 建议数量: {len(data['suggestions'])}")
            print(f"     - 盲区数量: {len(data['blind_spots'])}")
            print(f"     - 耗时: {duration:.2f}秒")

        # 7. 测试快速模式
        print("\n7. 测试快速模式...")
        fast_request = {
            "lng": 118.7965,
            "lat": 32.0603,
            "max_time": 900,
            "directions": 24,
            "fast_mode": True
        }
        start_time = time.time()
        async with session.post(
            f"{BASE_URL}/api/isochrone/calculate",
            json=fast_request
        ) as response:
            assert response.status == 200
            data = await response.json()
            duration = time.time() - start_time
            print(f"   ✓ 快速模式计算成功，耗时: {duration:.2f}秒")

    print("\n" + "="*60)
    print("✓ 所有集成测试通过!")
    print("="*60)


async def test_error_handling():
    """测试错误处理"""
    print("\n" + "="*60)
    print("集成测试: 错误处理")
    print("="*60)

    async with aiohttp.ClientSession() as session:
        # 测试无效坐标
        print("\n1. 测试无效坐标...")
        invalid_request = {
            "lng": 999,  # 无效经度
            "lat": 32.0603,
            "max_time": 900,
            "directions": 24
        }
        async with session.post(
            f"{BASE_URL}/api/isochrone/calculate",
            json=invalid_request
        ) as response:
            # 应该返回错误或成功（取决于API处理）
            print(f"   ✓ 无效坐标处理: {response.status}")

        # 测试无效类别
        print("\n2. 测试无效POI类别...")
        invalid_poi_request = {
            "lng": 118.7965,
            "lat": 32.0603,
            "category": "不存在的类别",
            "radius": 1500
        }
        async with session.post(
            f"{BASE_URL}/api/poi/search",
            json=invalid_poi_request
        ) as response:
            print(f"   ✓ 无效类别处理: {response.status}")

    print("\n✓ 错误处理测试完成")


async def test_caching():
    """测试缓存功能"""
    print("\n" + "="*60)
    print("集成测试: 缓存功能")
    print("="*60)

    async with aiohttp.ClientSession() as session:
        request_data = {
            "lng": 118.7965,
            "lat": 32.0603,
            "max_time": 900,
            "directions": 24
        }

        # 第一次请求
        print("\n1. 第一次请求（无缓存）...")
        start_time = time.time()
        async with session.post(
            f"{BASE_URL}/api/isochrone/calculate",
            json=request_data
        ) as response:
            assert response.status == 200
            first_duration = time.time() - start_time
            print(f"   ✓ 第一次请求耗时: {first_duration:.2f}秒")

        # 第二次请求（应该使用缓存）
        print("\n2. 第二次请求（使用缓存）...")
        start_time = time.time()
        async with session.post(
            f"{BASE_URL}/api/isochrone/calculate",
            json=request_data
        ) as response:
            assert response.status == 200
            second_duration = time.time() - start_time
            print(f"   ✓ 第二次请求耗时: {second_duration:.2f}秒")

        # 比较耗时
        if second_duration < first_duration:
            print(f"   ✓ 缓存生效，速度提升: {((first_duration - second_duration) / first_duration * 100):.1f}%")
        else:
            print(f"   ⚠ 缓存可能未生效")

    print("\n✓ 缓存测试完成")


async def run_all_tests():
    """运行所有集成测试"""
    print("\n" + "="*60)
    print("15分钟生活圈 - 集成测试")
    print("="*60)

    try:
        await test_full_analysis_flow()
        await test_error_handling()
        await test_caching()

        print("\n" + "="*60)
        print("✓ 所有集成测试通过!")
        print("="*60)
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(run_all_tests())
