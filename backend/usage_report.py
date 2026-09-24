"""
统计一次完整体检实际发出的百度地图API请求数

用法（容器内）:
    python usage_report.py          # 冷启动一次 + 紧接着热缓存一次
    python usage_report.py --once   # 只跑一次

说明：
- 按 HTTP 请求计数，绕过每日上限与配额短路，统计的是"真实发出的请求数"
- 临时数据库，保证第一次是真冷启动（不含任何历史缓存）
"""
import asyncio
import collections
import os
import sys
import time
from urllib.parse import urlparse

# ---- 计量前先把环境摆正：绕开每日上限/配额短路，用独立临时库 ----
os.environ["DAILY_API_LIMIT"] = "99999999"
os.environ["USE_MOCK_DATA"] = "false"
os.environ["DATABASE_URL"] = "sqlite:////tmp/usage_report.db"

import httpx  # noqa: E402

from api.full_analysis import FullAnalysisRequest, generate_full_analysis  # noqa: E402
from services.baidu_map import BaiduMapService  # noqa: E402
from services.api_protection import api_protection  # noqa: E402
from services.cache import cache_service  # noqa: E402

api_protection.should_use_mock_cached = lambda ttl=30.0: False

# 今天百度侧日配额已耗尽（返回302），原逻辑会在第一个302后全局短路，
# 导致地点检索请求数被严重低估。计量时每次调用后清掉该标记，
# 保证每个查询都真实发出一次请求（响应仍是模拟数据，但计数准确）。
_orig_search_poi = BaiduMapService.search_poi


async def _measuring_search_poi(self, *args, **kwargs):
    try:
        return await _orig_search_poi(self, *args, **kwargs)
    finally:
        BaiduMapService._quota_exceeded = False


BaiduMapService.search_poi = _measuring_search_poi

_api_counts: collections.Counter = collections.Counter()
_phase = {"name": "init"}

_orig_get = httpx.AsyncClient.get


async def _counting_get(self, url, **kwargs):
    path = urlparse(str(url)).path
    _api_counts[f"{_phase['name']}|{path}"] += 1
    return await _orig_get(self, url, **kwargs)


httpx.AsyncClient.get = _counting_get


def _reset_caches():
    """清掉类级共享缓存，让下一次是真冷启动"""
    BaiduMapService._route_cache.clear()
    BaiduMapService._poi_cache.clear()
    BaiduMapService._quota_exceeded = False
    BaiduMapService._next_place_slot = 0.0
    BaiduMapService._global_api_status["place"] = None
    BaiduMapService._global_api_status["direction"] = None
    BaiduMapService._api_status_last_check["place"] = 0
    BaiduMapService._api_status_last_check["direction"] = 0
    cache_service.clear_all()


def _summarize(label: str):
    """按 API 路径汇总本次调用"""
    per_api: collections.Counter = collections.Counter()
    for key, n in _api_counts.items():
        per_api[key.split("|", 1)[1]] += n

    total = sum(per_api.values())
    print(f"\n{'=' * 64}")
    print(f"{label}  共 {total} 次百度地图API请求")
    print("=" * 64)
    groups = {
        "地点检索 place/v2/search": lambda p: "/place/" in p,
        "路线规划 directionlite": lambda p: "/directionlite/" in p,
        "其他": lambda p: "/place/" not in p and "/directionlite/" not in p,
    }
    for name, match in groups.items():
        sub = {p: n for p, n in per_api.items() if match(p)}
        if not sub:
            continue
        print(f"  {name}: {sum(sub.values())}")
        for p, n in sorted(sub.items(), key=lambda x: -x[1]):
            print(f"      {p:<40} {n:>4}")
    return total


async def run_once(label: str, clear: bool) -> int:
    if clear:
        _reset_caches()
    _api_counts.clear()
    _phase["name"] = label

    t0 = time.time()
    req = FullAnalysisRequest(lng=118.7784, lat=32.0663, community_name="鼓楼区湖南路街道")
    result = await generate_full_analysis(req)
    elapsed = time.time() - t0

    total = _summarize(f"{label}（耗时 {elapsed:.1f}s）")
    modes = result.get("modes", {})
    print(f"  返回: {len(modes)} 种出行方式, 综合分 "
          f"{result.get('comprehensive_score', {}).get('total')}")
    return total


async def run_fengshui(label: str, clear: bool) -> int:
    """前端在体检结束后还会单独再调一次 /api/fengshui/analyze，单独计量"""
    if clear:
        _reset_caches()
    _api_counts.clear()
    _phase["name"] = label

    from api.fengshui import FengShuiRequest, analyze_feng_shui  # noqa: E402

    t0 = time.time()
    await analyze_feng_shui(FengShuiRequest(lng=118.7784, lat=32.0663))
    elapsed = time.time() - t0
    return _summarize(f"{label}（耗时 {elapsed:.1f}s）")


async def main():
    argv = sys.argv[1:]
    if "--fengshui-only" in argv:
        await run_fengshui("单独风水分析 /api/fengshui/analyze（冷）", clear=True)
        return

    clear_first = "--warm-only" not in argv
    await run_once("体检 /api/analysis/full-analysis（冷启动）", clear=clear_first)
    if "--once" not in argv:
        await run_once("体检 /api/analysis/full-analysis（热缓存）", clear=False)
    if "--no-fengshui" not in argv:
        await run_fengshui("体检后单独风水 /api/fengshui/analyze", clear=False)


if __name__ == "__main__":
    asyncio.run(main())
