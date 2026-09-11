"""
性能测试脚本
测试API响应时间和并发能力
"""
import asyncio
import aiohttp
import time
import statistics
from typing import List, Dict
import json

# 测试配置
BASE_URL = "http://localhost:8080"
TEST_ENDPOINTS = [
    {
        "name": "等时圈计算",
        "method": "POST",
        "url": "/api/isochrone/calculate",
        "data": {
            "lng": 118.7965,
            "lat": 32.0603,
            "max_time": 900,
            "directions": 36
        }
    },
    {
        "name": "POI搜索",
        "method": "POST",
        "url": "/api/poi/search",
        "data": {
            "lng": 118.7965,
            "lat": 32.0603,
            "category": "医疗",
            "radius": 1500
        }
    },
    {
        "name": "分析报告",
        "method": "POST",
        "url": "/api/analysis/report",
        "data": {
            "lng": 118.7965,
            "lat": 32.0603,
            "community_name": "测试社区"
        }
    }
]


async def test_single_request(
    session: aiohttp.ClientSession,
    endpoint: Dict,
    request_id: int
) -> Dict:
    """测试单个请求"""
    start_time = time.time()

    try:
        async with session.post(
            f"{BASE_URL}{endpoint['url']}",
            json=endpoint['data'],
            timeout=aiohttp.ClientTimeout(total=30)
        ) as response:
            await response.json()
            end_time = time.time()
            duration = end_time - start_time

            return {
                "request_id": request_id,
                "endpoint": endpoint['name'],
                "status": response.status,
                "duration": duration,
                "success": response.status == 200
            }
    except Exception as e:
        end_time = time.time()
        return {
            "request_id": request_id,
            "endpoint": endpoint['name'],
            "status": 0,
            "duration": end_time - start_time,
            "success": False,
            "error": str(e)
        }


async def test_concurrent_requests(
    endpoint: Dict,
    num_requests: int = 10,
    concurrency: int = 5
) -> Dict:
    """测试并发请求"""
    print(f"\n{'='*60}")
    print(f"测试: {endpoint['name']}")
    print(f"请求数: {num_requests}, 并发数: {concurrency}")
    print(f"{'='*60}")

    semaphore = asyncio.Semaphore(concurrency)
    results = []

    async def limited_request(session, endpoint, request_id):
        async with semaphore:
            return await test_single_request(session, endpoint, request_id)

    async with aiohttp.ClientSession() as session:
        tasks = [
            limited_request(session, endpoint, i)
            for i in range(num_requests)
        ]

        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time

    # 统计结果
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    durations = [r['duration'] for r in successful]

    stats = {
        "endpoint": endpoint['name'],
        "total_requests": num_requests,
        "successful_requests": len(successful),
        "failed_requests": len(failed),
        "total_time": total_time,
        "requests_per_second": num_requests / total_time if total_time > 0 else 0,
    }

    if durations:
        stats.update({
            "avg_duration": statistics.mean(durations),
            "min_duration": min(durations),
            "max_duration": max(durations),
            "median_duration": statistics.median(durations),
            "p95_duration": sorted(durations)[int(len(durations) * 0.95)] if len(durations) >= 20 else max(durations),
        })

    # 打印结果
    print(f"\n结果统计:")
    print(f"  成功请求: {stats['successful_requests']}/{stats['total_requests']}")
    print(f"  失败请求: {stats['failed_requests']}")
    print(f"  总耗时: {stats['total_time']:.2f}秒")
    print(f"  吞吐量: {stats['requests_per_second']:.2f} 请求/秒")

    if durations:
        print(f"\n响应时间:")
        print(f"  平均: {stats['avg_duration']*1000:.2f}ms")
        print(f"  最小: {stats['min_duration']*1000:.2f}ms")
        print(f"  最大: {stats['max_duration']*1000:.2f}ms")
        print(f"  中位数: {stats['median_duration']*1000:.2f}ms")
        print(f"  P95: {stats['p95_duration']*1000:.2f}ms")

    if failed:
        print(f"\n失败详情:")
        for r in failed[:5]:  # 只显示前5个失败
            print(f"  请求 {r['request_id']}: {r.get('error', 'Unknown error')}")

    return stats


async def test_health_check() -> bool:
    """测试健康检查"""
    print("\n测试健康检查...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"  ✓ 服务状态: {data.get('status', 'unknown')}")
                    return True
                else:
                    print(f"  ✗ 健康检查失败: {response.status}")
                    return False
    except Exception as e:
        print(f"  ✗ 连接失败: {e}")
        return False


async def run_performance_tests():
    """运行所有性能测试"""
    print("="*60)
    print("15分钟生活圈 - 性能测试")
    print("="*60)

    # 健康检查
    if not await test_health_check():
        print("\n❌ 服务未启动，请先启动后端服务")
        return

    # 测试结果
    all_stats = []

    # 测试每个端点
    for endpoint in TEST_ENDPOINTS:
        stats = await test_concurrent_requests(
            endpoint,
            num_requests=20,
            concurrency=5
        )
        all_stats.append(stats)

    # 打印总结
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)

    for stats in all_stats:
        print(f"\n{stats['endpoint']}:")
        print(f"  吞吐量: {stats['requests_per_second']:.2f} req/s")
        if 'avg_duration' in stats:
            print(f"  平均响应: {stats['avg_duration']*1000:.2f}ms")
            print(f"  P95响应: {stats['p95_duration']*1000:.2f}ms")

    # 保存结果到文件
    report = {
        "test_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "results": all_stats
    }

    with open("performance_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n📊 详细报告已保存到: performance_report.json")


if __name__ == "__main__":
    asyncio.run(run_performance_tests())
