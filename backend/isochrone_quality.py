"""
等时圈质量诊断：统计边界点有多少来自真实API、调用了几次矩阵、半径分布

用法: docker compose run --rm backend python isochrone_quality.py
"""
import asyncio
import math

from core.isochrone_engine import GeoPoint, IsochroneEngine

CENTER = GeoPoint(lng=118.7784, lat=32.0663)

stats = {"matrix_calls": 0, "probes": 0, "ok": 0, "fail": 0}


def instrument(engine):
    bmap = engine.baidu_map
    orig = bmap.get_times_matrix

    async def wrapped(mode, origin, destinations):
        stats["matrix_calls"] += 1
        times = await orig(mode, origin, destinations)
        for t in times:
            stats["probes"] += 1
            if t is None:
                stats["fail"] += 1
            else:
                stats["ok"] += 1
        return times

    bmap.get_times_matrix = wrapped


def radii_of(engine, points):
    out = []
    for p in points:
        dlng = (p.lng - CENTER.lng) * 111320 * math.cos(math.radians(CENTER.lat))
        dlat = (p.lat - CENTER.lat) * 111320
        out.append(math.hypot(dlng, dlat))
    return out


async def run(label, speed):
    for k in stats:
        stats[k] = 0
    engine = IsochroneEngine()
    instrument(engine)

    # 清掉引擎级缓存，保证测的是真实计算
    from services.cache import cache_service
    from services.baidu_map import BaiduMapService
    BaiduMapService._route_cache.clear()
    cache_service.clear_all()

    r = await engine.calculate_isochrone(CENTER, max_time=900, speed=speed)

    rs = radii_of(engine, r.boundary_points)
    uniq = sorted({round(x) for x in rs})
    fail_pct = (stats["fail"] / stats["probes"] * 100) if stats["probes"] else 0

    print(f"\n{label}（速度 {speed} m/s）")
    print(f"  矩阵调用次数: {stats['matrix_calls']}   （旧实现是 64 次单发）")
    print(f"  边界探测点数: {stats['probes']}   成功 {stats['ok']}  失败 {stats['fail']}"
          f"  失败率 {fail_pct:.0f}%")
    print(f"  顶点数: {len(r.boundary_points)}")
    print(f"  半径: min={min(rs):.0f}m  max={max(rs):.0f}m  "
          f"mean={sum(rs) / len(rs):.0f}m  不同取值={len(uniq)}")
    print(f"  各方向半径: {[round(x) for x in rs]}")
    print(f"  理想半径(速度×900s): {speed * 900:.0f}m   "
          f"实际/理想 = {sum(rs) / len(rs) / (speed * 900) * 100:.0f}%")

    await engine.baidu_map.close()


async def main():
    print(f"中心 lng={CENTER.lng} lat={CENTER.lat}   时限 900s")
    await run("步行", 1.2)
    await run("骑行", 3.5)
    await run("驾车", 8.0)


if __name__ == "__main__":
    asyncio.run(main())
