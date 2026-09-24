"""
验证并发/限速/缓存修复（不发真实API请求，退出后删除）
运行: python verify_throttle.py
"""
import asyncio
import time
import sys

from services.baidu_map import BaiduMapService
from services.api_protection import api_protection
from config import MAX_CONCURRENT_PLACE_REQUESTS, PLACE_REQUEST_MIN_INTERVAL

# 本脚本只验证并发/限速/缓存逻辑，绕过每日调用上限判定
api_protection.should_use_mock_cached = lambda ttl=30.0: False

# ---------- 假 HTTP 客户端 ----------
class FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def json(self):
        return self._payload


class FakeClient:
    """记录在途（in-flight）地点检索请求数，并模拟网络延迟"""

    def __init__(self, delay=0.05):
        self.delay = delay
        self.inflight = 0
        self.max_inflight = 0
        self.place_calls = 0
        self.all_calls = 0
        self.status_401_remaining = 0  # 前N次返回401，用于测退避

    async def get(self, url, params=None):
        self.all_calls += 1
        is_place = "place" in url
        if is_place:
            self.inflight += 1
            self.max_inflight = max(self.max_inflight, self.inflight)
            self.place_calls += 1

        try:
            await asyncio.sleep(self.delay)

            if not is_place:
                return FakeResponse({"status": 0, "results": []})

            if self.status_401_remaining > 0:
                self.status_401_remaining -= 1
                return FakeResponse({"status": 401, "message": "并发量已达上限"})

            return FakeResponse({
                "status": 0,
                "results": [{
                    "name": "测试设施", "address": "测试路1号",
                    "location": {"lng": 118.78, "lat": 32.06},
                    "uid": "fake-1"
                }]
            })
        finally:
            if is_place:
                self.inflight -= 1

    async def aclose(self):
        pass


def make_service(fake):
    svc = BaiduMapService()
    svc.client = fake
    return svc


def reset_state():
    """重置类级共享状态"""
    BaiduMapService._global_api_status["place"] = None
    BaiduMapService._global_api_status["direction"] = None
    BaiduMapService._api_status_last_check["place"] = 0
    BaiduMapService._api_status_last_check["direction"] = 0
    BaiduMapService._quota_exceeded = False
    BaiduMapService._poi_cache.clear()
    BaiduMapService._next_place_slot = 0.0


CENTER = {"lng": 118.7784, "lat": 32.0663}

results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}{'  ' + detail if detail else ''}")


async def test_place_concurrency():
    """并发发20个地点检索，在途数不得超过约定上限"""
    reset_state()
    fake = FakeClient(delay=0.05)
    svc = make_service(fake)

    t0 = time.time()
    await asyncio.gather(*[
        svc.search_poi(location=CENTER, query=f"诊所{i}", radius=1000)
        for i in range(20)
    ])
    elapsed = time.time() - t0

    check(
        f"地点检索并发 <= {MAX_CONCURRENT_PLACE_REQUESTS}",
        fake.max_inflight <= MAX_CONCURRENT_PLACE_REQUESTS,
        f"实际峰值={fake.max_inflight}, 调用={fake.place_calls}, 耗时={elapsed:.2f}s"
    )
    # 限速生效：20次 * 0.1s 间隔 => 至少约 1.9s
    check(
        "全局限速生效(>=1.8s)",
        elapsed >= 1.8,
        f"实际={elapsed:.2f}s"
    )
    await svc.close()


async def test_backoff_does_not_block():
    """退避等待期间不得占用并发额度（这是之前卡死的根因）"""
    reset_state()
    fake = FakeClient(delay=0.05)
    svc = make_service(fake)

    # 预热健康检查（先跑完，再置401，确保401发生在 search_poi 上）
    await svc._check_api_type("place")
    fake.status_401_remaining = 1  # 这次真实检索返回401 -> 触发1.5s退避

    t0 = time.time()
    tasks = [
        asyncio.create_task(svc.search_poi(location=CENTER, query="药店", radius=1000)),
    ]
    await asyncio.sleep(0.05)  # 让它进入退避

    t1 = time.time()
    await asyncio.gather(*[
        svc.search_poi(location=CENTER, query=f"超市{i}", radius=1000)
        for i in range(6)
    ])
    others_elapsed = time.time() - t1

    await asyncio.gather(*tasks)

    check(
        "退避期间不阻塞其它请求(<1.5s)",
        others_elapsed < 1.5,
        f"其它6个请求耗时={others_elapsed:.2f}s"
    )
    await svc.close()


async def test_poi_cache():
    """相同坐标+关键词只发一次真实请求"""
    reset_state()
    fake = FakeClient(delay=0.01)
    svc = make_service(fake)

    await svc._check_api_type("place")
    base = fake.place_calls

    await svc.search_poi(location=CENTER, query="公园", radius=1500)
    first = fake.place_calls

    for _ in range(9):
        await svc.search_poi(location=CENTER, query="公园", radius=1500)
    second = fake.place_calls

    check("POI结果缓存命中(重复9次不再发请求)", (second - first) == 0 and (first - base) == 1,
          f"首次={first - base}次, 重复9次新增={second - first}次")
    await svc.close()


async def test_blind_spot_zero_api():
    """盲区检测改用已有数据后，不应再发地点检索请求"""
    reset_state()
    fake = FakeClient(delay=0.01)
    svc = make_service(fake)

    from core.blind_spot import BlindSpotDetector
    det = BlindSpotDetector()
    det.baidu_map = svc

    # 构造一个半径约1km的圆形多边形（等时圈）
    import math
    coords = [
        [118.7784 + 0.009 * math.cos(a), 32.0663 + 0.009 * math.sin(a)]
        for a in [i * math.pi / 18 for i in range(36)]
    ]
    polygon = {"geometry": {"coordinates": [coords]}}

    coverage = {
        "医疗": {"count": 3, "level": "充足", "facilities": [
            {"name": "A", "location": {"lng": 118.779, "lat": 32.066}},
            {"name": "B", "location": {"lng": 118.780, "lat": 32.067}},
        ]},
        "教育": {"count": 2, "level": "一般", "facilities": [
            {"name": "C", "location": {"lng": 118.777, "lat": 32.065}},
        ]},
    }

    t0 = time.time()
    spots = await det.detect_blind_spots_with_data(
        center=CENTER, polygon=polygon, coverage_data=coverage
    )
    elapsed = time.time() - t0

    check("盲区检测零地点检索", fake.place_calls == 0,
          f"place调用={fake.place_calls}, 网格检测耗时={elapsed:.3f}s, 盲区={len(spots)}个")
    await svc.close()


async def main():
    print(f"配置: 地点检索并发上限={MAX_CONCURRENT_PLACE_REQUESTS}, "
          f"最小间隔={PLACE_REQUEST_MIN_INTERVAL}s\n")

    await test_place_concurrency()
    await test_backoff_does_not_block()
    await test_poi_cache()
    await test_blind_spot_zero_api()

    failed = [r for r in results if not r[1]]
    print(f"\n结果: {len(results) - len(failed)}/{len(results)} 通过")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    asyncio.run(main())
