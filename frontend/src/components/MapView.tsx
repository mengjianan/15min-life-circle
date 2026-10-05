import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { iconSvg, Ico } from '../icons';
import { planRoute, getRoutePoints } from '../services/localSearch';
import { ensureCustomPointUnlocked } from '../services/pointGuard';

// 一条「中心 -> 设施」的路线几何（由百度 JS SDK 客户端算出，不占后端配额）
type RouteGeo = {
  points: { lng: number; lat: number }[];
  duration: number;   // 秒
  distance: number;   // 米
  ts: number;         // 写入时间戳，用于 30 天过期
};

// ---------- 悬浮路线的本地持久化（30 天） ----------
// v2：key 加了中心坐标 —— v1 的 设施名|方式 不区分中心，换点后会命中旧位置的路线，整批作废
const ROUTE_CACHE_KEY = 'poi_route_cache_v2';
const ROUTE_CACHE_TTL = 30 * 24 * 60 * 60 * 1000;  // 30 天
const ROUTE_CACHE_MAX = 250;                         // 条数上限，防撑爆 localStorage
const ROUTE_CACHE_MAX_POINTS = 100;                  // 单条折线最多保留的点数
const PLAN_ROUTE_TIMEOUT = 4000;                     // SDK 单次规划超时（毫秒）
const PREFETCH_FACILITY_LIMIT = 20;                  // 后台预热的可见设施数量上限
const PREFETCH_INTERVAL = 200;                       // 预热时每次之间的间隔（毫秒）

function loadRouteCache(): Map<string, RouteGeo> {
  const map = new Map<string, RouteGeo>();
  try {
    const raw = localStorage.getItem(ROUTE_CACHE_KEY);
    if (!raw) return map;
    const obj = JSON.parse(raw) as Record<string, RouteGeo>;
    const now = Date.now();
    Object.keys(obj).forEach((key) => {
      const v = obj[key];
      if (v && Array.isArray(v.points) && now - (v.ts || 0) < ROUTE_CACHE_TTL) {
        map.set(key, v);
      }
    });
  } catch {
    // localStorage 不可用或数据损坏 -> 当作没有缓存，走 SDK 重新算
  }
  return map;
}

function persistRouteCache(map: Map<string, RouteGeo>) {
  try {
    // 超出条数上限时丢最旧的（Map 保持插入顺序）
    while (map.size > ROUTE_CACHE_MAX) {
      map.delete(map.keys().next().value as string);
    }
    const obj: Record<string, RouteGeo> = {};
    map.forEach((geo, key) => {
      let points = geo.points;
      if (points.length > ROUTE_CACHE_MAX_POINTS) {
        const step = Math.ceil(points.length / ROUTE_CACHE_MAX_POINTS);
        points = points.filter((_, i) => i % step === 0 || i === points.length - 1);
      }
      obj[key] = { ...geo, points };
    });
    localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // 写失败（配额满等）不影响运行
  }
}

// 节流写入：连续悬浮时不必每次都序列化整个 Map
let persistTimer: any = null;
function schedulePersistRouteCache(map: Map<string, RouteGeo>) {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persistRouteCache(map);
  }, 800);
}

// SDK 规划可能永远不回调（尤其 TransitRoute 缺 city 参数时），
// 不加超时的话 Promise.all 会卡死 -> 卡片永远停在「计算中」
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// 悬浮中的设施
type HoverFacility = {
  name: string;
  category: string;
  location: { lng: number; lat: number };
  straight?: number;   // 直线距离（米），只有悬浮时才填
  address?: string;
  // 公共交通可达（中心与该设施 500m 内都有站点），由后端标注
  transit_reachable?: boolean;
};

const TRAVEL_MODE_LIST = ['walking', 'cycling', 'transit', 'driving'] as const;
// 悬浮卡片的行：公共交通拆成「公交」「地铁」两行，各自独立规划、各显各的耗时
const DISPLAY_ROWS = ['walking', 'cycling', 'transit_bus', 'transit_metro', 'driving'] as const;
const TRAVEL_MODE_LABEL: Record<string, string> = {
  walking: '步行',
  cycling: '骑行',
  transit: '公共交通',
  transit_bus: '公交',
  transit_metro: '地铁',
  driving: '驾车',
};

// 模块级配色（悬浮卡片与地图绘制共用，避免多处重复维护）
const MODE_COLOR: Record<string, string> = {
  walking: '#52c41a',
  cycling: '#1890ff',
  transit: '#faad14',
  driving: '#ff4d4f',
};
const CATEGORY_COLOR: Record<string, string> = {
  医疗: '#ff4d4f',
  教育: '#1890ff',
  购物: '#52c41a',
  养老: '#722ed1',
  文体: '#fa8c16',
  餐饮: '#eb2f96',
  交通: '#13c2c2',
};

// 当前时段的等时圈边界 —— 与画 POI marker 用的 currentPolygon 同一套逻辑，
// 供「哪些设施可见 / 该预热哪些设施」复用
function getIsochroneRing(
  multiTimeData: any,
  activeTimeSlot: number
): { lng: number; lat: number }[] {
  if (!multiTimeData?.layers) return [];
  const valid = multiTimeData.layers.filter((l: any) => l.time <= activeTimeSlot);
  const selected = [...valid].sort((a: any, b: any) => b.time - a.time)[0];
  return selected?.boundary_points || [];
}

// 出行方式速度档位：卡片按「只往更快的方式叠加」显示
// 步行 -> 只显示步行；骑行 -> 步行+骑行；公共交通 -> +公共交通；驾车 -> 全部4种
const MODE_RANK: Record<string, number> = {
  walking: 0,
  cycling: 1,
  transit: 2,
  driving: 3,
};

// 两点间直线距离（米），用于卡片上的「直线 xxx 米」
function haversineMeters(a: { lng: number; lat: number }, b: { lng: number; lat: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 判断点是否在多边形内
const isPointInPolygon = (point: {lng: number, lat: number}, polygon: {lng: number, lat: number}[]) => {
  const x = point.lng;
  const y = point.lat;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};



interface MapViewProps {
  center: { lng: number; lat: number; name: string } | null;
  isochrone?: any;
  poiCoverage?: any;
  blindSpots?: any[];
  multiTimeData?: any;
  loading?: boolean;
  onCenterChange?: (lng: number, lat: number) => void;
  selectedFacility?: {name: string; category: string; location: {lng: number; lat: number}; address?: string; transit_reachable?: boolean} | null;
  activeTimeSlot?: number;
  fengshuiData?: any;
  activeMode?: string;
  // 设施类别筛选（「全部」= 七类都画）；只影响地图标记，评分/盲区不重算
  activeCategory?: string;
  // 当前时段下，各出行方式**自己**的等时圈（用于判定「哪些方式够得着这个设施」）
  modeIsochrones?: Record<string, { lng: number; lat: number }[]>;
  // 选中设施的唯一出口：地图设施点击 / 折线点击 / 右侧卡片点击都收敛到这里
  onFacilitySelect?: (
    facility: { name: string; category: string; location: { lng: number; lat: number }; address?: string } | null
  ) => void;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  isochrone,
  poiCoverage,
  blindSpots,
  multiTimeData,
  loading = false,
  onCenterChange,
  selectedFacility,
  activeTimeSlot = 900,
  fengshuiData,
  activeMode = 'walking',
  activeCategory = '全部',
  modeIsochrones,
  onFacilitySelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(true);
  const [showPOI, setShowPOI] = useState(true);
  const [showBlindSpots, setShowBlindSpots] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showFengshui, setShowFengshui] = useState(true);
  const [clickMode, setClickMode] = useState(false);

  // 悬浮：只显现「中心 -> 该设施」这一条路线，不再常驻画所有放射线。
  // 悬浮阶段刻意不移动镜头 —— 否则地图会在光标下滑动、光标落到另一个 POI、
  // 再次移动，形成无限震荡。聚焦放在用户主动点击上（无回路）。
  const [hoverFacility, setHoverFacility] = useState<HoverFacility | null>(null);
  const [hoverTimes, setHoverTimes] = useState<Record<string, number | null> | null>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  // 当前卡片要展示的出行方式（叠加规则 + 该设施实际可达 的结果）
  const [hoverModes, setHoverModes] = useState<string[]>([]);
  // 大 effect 每次重绘后递增，让「单独画路线」的 effect 跟着重画
  const [overlayEpoch, setOverlayEpoch] = useState(0);
  // POI 标记句柄：悬浮时用 hide/show 显隐，不走全量重绘
  const poiMarkersRef = useRef<Array<{ marker: any; name: string }>>([]);
  // 当前那条路线的折线句柄
  const routeOverlayRef = useRef<any>(null);
  // below: 卡片放在设施下方（路线从中心上方过来时），否则放上方
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number; below: boolean } | null>(null);

  // 当前要画的那条路线。key 必须与目标设施匹配才渲染，避免显示上一条的残影
  const [routeState, setRouteState] = useState<{ key: string; geo: RouteGeo | null }>({
    key: '',
    geo: null,
  });
  // 异步取到路线后的重绘信号
  const [routeTick, setRouteTick] = useState(0);

  const routeCacheRef = useRef<Map<string, RouteGeo>>(new Map());

  // 挂载时从 localStorage 恢复 30 天内的悬浮路线，刷新页面后不用重算
  useEffect(() => {
    // v1 key 不含中心坐标，永远不会被新 key 命中，直接删掉释放空间
    try { localStorage.removeItem('poi_route_cache_v1'); } catch { /* 忽略 */ }
    const persisted = loadRouteCache();
    persisted.forEach((value, key) => routeCacheRef.current.set(key, value));
  }, []);
  const routePendingRef = useRef<Map<string, Promise<RouteGeo | null>>>(new Map());
  const hoverTimerRef = useRef<any>(null);
  const hoverTokenRef = useRef(0);
  // clickMode 用 ref 读取：初始化 effect 只跑一次，闭包里捕获不到后续变化
  const clickModeRef = useRef(clickMode);

  useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);

  // selectedFacility 同样用 ref 读取：toggleFacility 会被注册进 marker 的
  // click 闭包（注册发生在大 effect 内），而 selectedFacility 已经不在那个
  // effect 的依赖里（避免每次 hover 都全量重绘）—— 不加 ref 会读到过期值，
  // 表现为「点第二次取消不了选中」。
  const selectedFacilityRef = useRef(selectedFacility);
  // marker/路线点击可能连带触发 map click，短时间内别当成「点空白退出」
  const skipMapClickRef = useRef(0);

  useEffect(() => {
    selectedFacilityRef.current = selectedFacility;
  }, [selectedFacility]);

  // 路线缓存 key 必须带中心坐标：缓存的是「中心→设施」的几何，
  // 只用 设施名|方式 会在换中心后命中旧中心的路线（设施路线总是停在上一个位置）
  const routeKey = (name: string, mode: string) =>
    `${center ? `${center.lng},${center.lat}` : '0,0'}|${name}|${mode}`;

  // 要显现路线的目标：悬浮优先，其次选中
  const activeFacility: HoverFacility | null = hoverFacility || selectedFacility || null;
  const activeKey = activeFacility ? routeKey(activeFacility.name, activeMode) : '';

  // 公共交通模式：中心 500m 内没有站点时，所有设施都被接驳规则隐藏 ——
  // 地图会一片空白，给一条提示说明原因（与后端 annotate_transit_reachability 同口径）
  const transitNoStopNear =
    activeMode === 'transit' &&
    center != null &&
    !((poiCoverage?.['交通']?.facilities || []) as any[]).some(
      (f) => f.location && haversineMeters(center, f.location) <= 500
    );

  // 卡片展示哪些行，两条规则同时生效：
  //   ① 叠加：只显示速度不高于当前选择的方式
  //      步行->只显示步行；骑行->步行+骑行；公共交通->+公交/地铁两行；驾车->全部
  //   ② 可达性：该方式的等时圈必须真的包含这个设施
  //      例：只在骑行时圈里才出现的新设施，不显示「步行」这一行
  const getDisplayModes = (
    facility: { location: { lng: number; lat: number }; transit_reachable?: boolean } | null
  ): string[] => {
    if (!facility) return [];
    const currentRank = MODE_RANK[activeMode] ?? 0;
    return TRAVEL_MODE_LIST.filter((mode) => {
      if ((MODE_RANK[mode] ?? 99) > currentRank) return false;
      // 公共交通：两端 500m 接驳不上的设施，不展示这一行
      if (mode === 'transit' && facility.transit_reachable === false) return false;
      const ring = modeIsochrones?.[mode];
      // 当前模式的等时圈就是地图上画的那个，设施可见即代表在圈内
      if (!ring || ring.length < 3) return mode === activeMode;
      return isPointInPolygon(facility.location, ring);
    }).flatMap((mode) => (mode === 'transit' ? ['transit_bus', 'transit_metro'] : [mode]));
  };

  // 推荐方式：只在「实际可达（有真实耗时）」的方式里选最短的，
  // 没有公交就让公交不参与，而不是拿它当 0 去比
  const bestHoverMode: string | null = (() => {
    if (!hoverTimes || !hoverModes.length) return null;
    let best: string | null = null;
    let bestSec = Infinity;
    hoverModes.forEach((mode) => {
      const sec = hoverTimes[mode];
      if (sec != null && sec < bestSec) {
        bestSec = sec;
        best = mode;
      }
    });
    return best;
  })();

  // 再次点击同一个设施 = 取消选中
  const toggleFacility = (
    facility: { name: string; category: string; location: { lng: number; lat: number }; address?: string } | null
  ) => {
    if (!onFacilitySelect) return;
    const prev = selectedFacilityRef.current;
    const next = facility && prev && prev.name === facility.name ? null : facility;
    onFacilitySelect(next);
    skipMapClickRef.current = Date.now() + 400;
  };

  // 关闭悬浮卡片（鼠标离开 marker / 拖动缩放地图时）
  const clearHover = () => {
    clearTimeout(hoverTimerRef.current);
    hoverTokenRef.current++;   // 让在途的结果失效
    setHoverFacility(null);
    setHoverTimes(null);
    setHoverModes([]);
    // 不在这里清 hoverPixel：像素归「卡片位置」effect 管。
    // 若清空后 activeFacility 仍是选中的那个（effect 依赖没变），卡片会永久消失。
    setHoverLoading(false);
  };

  // 地图上实际可见的设施（与画 marker 的过滤逻辑一致）—— 决定要预热哪些
  const getVisibleFacilities = (): HoverFacility[] => {
    if (!poiCoverage) return [];
    const ring = getIsochroneRing(multiTimeData, activeTimeSlot);
    const out: HoverFacility[] = [];
    Object.entries(poiCoverage).forEach(([category, data]: [string, any]) => {
      (data?.facilities || []).forEach((f: any) => {
        if (!f?.name || !f?.location) return;
        if (ring.length >= 3 && !isPointInPolygon(f.location, ring)) return;
        out.push({
          name: f.name,
          category: f.category || category,
          location: { lng: f.location.lng, lat: f.location.lat },
        });
      });
    });
    // 按离中心距离升序：最近的设施最可能被悬浮，优先预热
    const dist2 = (p: { lng: number; lat: number }) => {
      if (!center) return 0;
      const dx = (p.lng - center.lng) * Math.cos((center.lat * Math.PI) / 180);
      const dy = p.lat - center.lat;
      return dx * dx + dy * dy;
    };
    out.sort((a, b) => dist2(a.location) - dist2(b.location));
    return out;
  };

  // 取一条路线的几何：命中缓存秒回；同一 key 在途则共享同一个 Promise
  // （不能返回 null 了事 —— 悬浮和预热撞车时会被当成「没路线」，误显示"没有公交到达"）
  const fetchRouteGeo = (
    facility: { name: string; location: { lng: number; lat: number } },
    mode: string
  ): Promise<RouteGeo | null> => {
    const key = routeKey(facility.name, mode);
    const cached = routeCacheRef.current.get(key);
    if (cached) return Promise.resolve(cached);
    const pending = routePendingRef.current.get(key);
    if (pending) return pending;
    if (!mapInstanceRef.current || !center) return Promise.resolve(null);

    // 超时兜底：SDK 不回调时也要 settle，否则 Promise.all 卡死、卡片停在"计算中"
    const p = withTimeout(
      planRoute(mapInstanceRef.current, center, facility.location, mode as any),
      PLAN_ROUTE_TIMEOUT,
      null
    )
      .then((res) => {
        if (!res) return null;
        const points = getRoutePoints(res.route);
        // 折线点不够也要留下耗时，只是没法画线 —— 否则会误显示「没有XX到达」
        const geo: RouteGeo = {
          points: points && points.length >= 2 ? points : [],
          duration: res.duration,
          distance: res.distance,
          ts: Date.now(),
        };
        routeCacheRef.current.set(key, geo);
        schedulePersistRouteCache(routeCacheRef.current);
        return geo;
      })
      .catch(() => null)
      .finally(() => {
        routePendingRef.current.delete(key);
      });
    routePendingRef.current.set(key, p);
    return p;
  };

  // 悬浮/选中变化时确保有一条可画的路线
  useEffect(() => {
    if (!mapReady) return;
    if (!activeFacility || !showRoutes) {
      setRouteState((prev) => (prev.key === '' ? prev : { key: '', geo: null }));
      return;
    }
    const key = routeKey(activeFacility.name, activeMode);
    const cached = routeCacheRef.current.get(key);
    if (cached) {
      setRouteState((prev) => (prev.key === key ? prev : { key, geo: cached }));
      return;
    }
    fetchRouteGeo(activeFacility, activeMode).then((geo) => {
      if (geo) setRouteState({ key, geo });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, activeFacility, activeMode, showRoutes, routeTick, center]);

  // 悬浮时并行取 4 种出行方式的耗时（全部走百度 JS SDK 客户端，零后端调用）
  const loadHoverTimes = (facility: HoverFacility) => {
    // 只为「叠加规则 + 该设施实际可达」的那些方式发起规划，不白白多调
    const modes = getDisplayModes(facility);
    if (!modes.length) {
      setHoverModes([]);
      setHoverTimes({});
      setHoverLoading(false);
      return;
    }

    const token = ++hoverTokenRef.current;
    Promise.all(
      modes.map(async (mode) => {
        const cached = routeCacheRef.current.get(routeKey(facility.name, mode));
        if (cached) return [mode, cached.duration] as [string, number];
        try {
          const geo = await fetchRouteGeo(facility, mode);
          return [mode, geo ? geo.duration : null] as [string, number | null];
        } catch {
          return [mode, null] as [string, number | null];
        }
      })
    ).then((pairs) => {
      if (token !== hoverTokenRef.current) return;   // 已经移开，丢弃
      const times: Record<string, number | null> = {};
      pairs.forEach(([m, d]) => {
        times[m] = d;
      });
      setHoverModes(modes);
      setHoverTimes(times);
      setHoverLoading(false);
      setRouteTick((t) => t + 1);   // 几何可能刚写进缓存，触发一次重绘
    });
  };

  // 后台预热：地图就绪后**串行**预取可见设施的4种方式耗时，
  // 让「第一次悬浮」就有数据，而不是等现场调4次 SDK（最坏4秒）。
  // 全部走浏览器侧百度 JS SDK，不占后端配额；结果本身30天有效。
  // 串行 + 200ms 间隔：既不打断交互，也不刷爆浏览器侧 SDK 的调用频率。
  useEffect(() => {
    if (!mapReady || !poiCoverage || !showRoutes) return;

    let cancelled = false;
    (async () => {
      const facilities = getVisibleFacilities().slice(0, PREFETCH_FACILITY_LIMIT);
      for (const fac of facilities) {
        if (cancelled) return;
        for (const mode of DISPLAY_ROWS) {
          if (cancelled) return;
          const key = routeKey(fac.name, mode);
          if (routeCacheRef.current.has(key) || routePendingRef.current.has(key)) {
            continue;
          }
          await fetchRouteGeo(fac, mode);
          await new Promise((resolve) => setTimeout(resolve, PREFETCH_INTERVAL));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, poiCoverage, showRoutes, center, activeTimeSlot, multiTimeData]);

  // 兜底：悬浮卡片的「计算中」最多显示 6 秒。
  // 单次 SDK 规划有 4 秒超时，这里是第二道保险 —— 万一某条路径没走到
  // 收尾逻辑（token 不匹配提前 return 等），也不至于永远转圈。
  useEffect(() => {
    if (!hoverLoading) return;
    const timer = setTimeout(() => {
      setHoverLoading(false);
      setHoverTimes((prev) => prev || {});
    }, 6000);
    return () => clearTimeout(timer);
  }, [hoverLoading]);

  const checkBaiduMapAPI = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      const check = () => {
        const BMap = (window as any).BMap;
        if (BMap && BMap.Map) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      setTimeout(() => reject(new Error('百度地图API加载超时')), 10000);
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        await checkBaiduMapAPI();

        if (!mounted || !mapRef.current || mapInstanceRef.current) return;

        const BMap = (window as any).BMap;
        const map = new BMap.Map(mapRef.current);

        const defaultPoint = new BMap.Point(118.7969, 32.0603);
        map.centerAndZoom(defaultPoint, 14);

        map.enableScrollWheelZoom();
        map.addControl(new BMap.NavigationControl());
        map.addControl(new BMap.ScaleControl());
        map.addControl(new BMap.OverviewMapControl());

        // 用 ref 读 clickMode：本 effect 只在初始化时跑一次，
        // 闭包里捕获不到后续的开关变化（此前"点击地图选位置"因此失效）
        map.addEventListener('click', (e: any) => {
          if (clickModeRef.current && onCenterChange) {
            onCenterChange(e.point.lng, e.point.lat);
            setClickMode(false); // 选完即退出选点模式，不然下一次点击还会挪中心
          } else if (Date.now() >= skipMapClickRef.current) {
            toggleFacility(null); // 点地图空白处退出设施聚焦，地图回到中心
          }
        });

        // 拖动/缩放时隐藏悬浮卡片，否则卡片位置会停留在旧的屏幕坐标
        map.addEventListener('dragstart', clearHover);
        map.addEventListener('zoomstart', clearHover);

        mapInstanceRef.current = map;
        if (mounted) {
          setMapReady(true);
        }
      } catch (error) {
        console.error('地图初始化失败:', error);
        if (mounted) {
          setMapError('地图加载失败，请刷新页面重试');
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
    };
  }, [checkBaiduMapAPI, onCenterChange, clearHover]);

  // BMap 只在初始化时取一次容器尺寸，面板高度变化后不会自己重排 —— 容器变了就同步
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      (mapInstanceRef.current as any)?.checkResize?.();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (mapReady && mapInstanceRef.current && center) {
      const BMap = (window as any).BMap;
      const point = new BMap.Point(center.lng, center.lat);
      mapInstanceRef.current.panTo(point);
      mapInstanceRef.current.setZoom(15);
    }
    // 换中心后旧悬浮卡/耗时属于上一个位置 —— 一并清掉，否则卡片和路线还挂在旧设施上
    clearHover();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, mapReady]);

  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const BMap = (window as any).BMap;

      map.clearOverlays();
      poiMarkersRef.current = [];   // 标记会被销毁重建，先清空记录

      // 绘制多时间等时圈（受 showGraph 开关控制 —— 该按钮原本就叫"显示/隐藏等时圈"，
      // 但此前既不在依赖数组也没被读取，是个点了没反应的死开关）
      if (showGraph && multiTimeData && multiTimeData.layers) {
        const timeColors: Record<number, string> = {
          300: '#52c41a',   // 5分钟 - 绿色
          600: '#faad14',   // 10分钟 - 橙色
          900: '#1890ff'    // 15分钟 - 蓝色
        };

        // 按时间从大到小绘制，这样5分钟的在最上层
        const sortedLayers = [...multiTimeData.layers].sort((a: any, b: any) => b.time - a.time);

        sortedLayers.forEach((layer: any) => {
          if (layer.boundary_points && layer.boundary_points.length > 0) {
            const points = layer.boundary_points.map(
              (p: any) => new BMap.Point(p.lng, p.lat)
            );

            const color = timeColors[layer.time] || '#667eea';
            const opacity = layer.time === 300 ? 0.15 : layer.time === 600 ? 0.1 : 0.06;

            const polygon = new BMap.Polygon(points, {
              strokeColor: color,
              strokeWeight: 3,
              strokeOpacity: 0.9,
              fillColor: color,
              fillOpacity: opacity,
            });

            map.addOverlay(polygon);
          }
        });
      } else if (isochrone && isochrone.boundary_points && isochrone.boundary_points.length > 0) {
        // 如果没有多时间数据，只绘制单个等时圈
        const points = isochrone.boundary_points.map(
          (p: any) => new BMap.Point(p.lng, p.lat)
        );

        const polygon = new BMap.Polygon(points, {
          strokeColor: '#667eea',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#667eea',
          fillOpacity: 0.15,
        });

        map.addOverlay(polygon);
      }

      // 绘制中心点
      if (center) {
        const centerPoint = new BMap.Point(center.lng, center.lat);

        const centerIcon = new BMap.Icon(
          'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#667eea" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="white"/></svg>'
          ),
          new BMap.Size(32, 32),
          { anchor: new BMap.Size(16, 16) }
        );

        const marker = new BMap.Marker(centerPoint, { icon: centerIcon });
        map.addOverlay(marker);

        const infoWindow = new BMap.InfoWindow(
          '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
            '<div style="font-weight: 600; color: #333; margin-bottom: 4px;">' + center.name + '</div>' +
            '<div style="font-size: 12px; color: #666;">经度: ' + center.lng.toFixed(4) + ', 纬度: ' + center.lat.toFixed(4) + '</div>' +
          '</div>',
          { width: 220, height: 60 }
        );
        marker.addEventListener('click', () => {
          map.openInfoWindow(infoWindow, centerPoint);
        });
      }

      // 注：「中心 -> 悬浮/选中设施」的那条路线在下面单独的 effect 里画，
      // 不放进这个大 effect —— 否则每次 hover 都会 clearOverlays 全量重绘，
      // 标记在光标下被销毁再重建，会触发 mouseout/mouseover 来回抖动。

      // 绘制POI设施（累积显示：15分钟包含10分钟和5分钟的所有设施）
      if (showPOI && poiCoverage) {
        // 获取当前选中时间及更小时间的等时圈边界点
        let currentPolygon: {lng: number, lat: number}[] = [];
        if (multiTimeData && multiTimeData.layers) {
          // 获取所有小于等于当前选中时间的层
          const validLayers = multiTimeData.layers.filter((l: any) => l.time <= activeTimeSlot);
          // 使用最大的时间层作为过滤边界（这样15分钟会包含所有设施）
          const selectedLayer = validLayers.sort((a: any, b: any) => b.time - a.time)[0];
          if (selectedLayer && selectedLayer.boundary_points) {
            currentPolygon = selectedLayer.boundary_points;
          }
        }

        Object.entries(poiCoverage).forEach(([category, data]: [string, any]) => {
          // 类别筛选：只画选中的那类（「全部」= 七类都画）。评分/盲区不重算
          if (activeCategory !== '全部' && category !== activeCategory) return;
          if (data.facilities && data.facilities.length > 0) {
            const categoryColors: Record<string, string> = {
              '医疗': '#ff4d4f',
              '教育': '#1890ff',
              '购物': '#52c41a',
              '养老': '#722ed1',
              '文体': '#fa8c16',
              '餐饮': '#eb2f96',
              '交通': '#13c2c2',
            };
            const color = categoryColors[category] || '#666';

            data.facilities.forEach((facility: any) => {
              if (facility.location) {
                // 公共交通模式：中心/设施两端 50m 内没有站点、坐公交地铁到不了的，
                // 直接不显示 —— 它应该只在驾车等更高一档才出现
                if (activeMode === 'transit' && facility.transit_reachable === false) {
                  return;
                }
                // 如果有等时圈，只显示在等时圈内的设施
                if (currentPolygon.length > 0 && !isPointInPolygon(facility.location, currentPolygon)) {
                  return; // 跳过不在等时圈内的设施
                }
                const point = new BMap.Point(facility.location.lng, facility.location.lat);

                const icon = new BMap.Icon(
                  'data:image/svg+xml,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="' + color + '"/><circle cx="12" cy="12" r="5" fill="white"/></svg>'
                  ),
                  new BMap.Size(24, 32),
                  { anchor: new BMap.Size(12, 32) }
                );

                const marker = new BMap.Marker(point, { icon });
                map.addOverlay(marker);
                poiMarkersRef.current.push({ marker, name: facility.name });

                // 计算距离
                const centerLng = center?.lng || 118.7969;
                const centerLat = center?.lat || 32.0603;
                const distance = facility.distance || Math.round(
                  Math.sqrt(
                    Math.pow((facility.location.lng - centerLng) * 111000 * Math.cos(centerLat * Math.PI / 180), 2) +
                    Math.pow((facility.location.lat - centerLat) * 111000, 2)
                  )
                );

                // 不再弹 InfoWindow：悬浮和点击都用同一张卡片，
                // 卡片内容是它的超集（名称/类别/地址/直线距离/4种方式真实耗时/推荐），
                // 两个都弹会重叠。
                marker.addEventListener('click', () => {
                  // 点击 = 显示卡片 + 高亮该路线，再点一次取消
                  toggleFacility({
                    name: facility.name,
                    category: facility.category || category,
                    location: { lng: point.lng, lat: point.lat },
                    address: facility.address,
                  });
                });

                // 悬浮：显示各出行方式耗时 + 推荐方式，同时显现该条路线。
                // 刻意不移动镜头 —— 悬停时平移会让地图在光标下滑动，
                // 光标落到另一个 POI 再次触发，形成无限震荡；聚焦放在点击上。
                marker.addEventListener('mouseover', () => {
                  if (!showRoutes) return;
                  const pixel = map.pointToPixel(point);
                  const target: HoverFacility = {
                    name: facility.name,
                    category: facility.category || category,
                    location: { lng: point.lng, lat: point.lat },
                    straight: distance,
                    transit_reachable: facility.transit_reachable,
                  };
                  clearTimeout(hoverTimerRef.current);
                  // 只留当前设施：关掉之前点开的其它设施弹窗
                  map.closeInfoWindow();
                  setHoverPixel({ x: pixel.x, y: pixel.y, below: cardBelow(pixel) });
                  setHoverTimes(null);
                  setHoverLoading(true);
                  setHoverFacility(target);

                  // 缓存里已经有这个设施的全部所需方式 -> 立刻出结果，
                  // 不用再等 200ms 防抖（预热命中的情况就是毫秒级）
                  const needModes = getDisplayModes(target);
                  const allCached = needModes.length > 0 && needModes.every(
                    (m) => routeCacheRef.current.has(routeKey(target.name, m))
                  );
                  if (allCached) {
                    loadHoverTimes(target);
                    return;
                  }
                  // 防抖 200ms：扫过多个 POI 时不至于并发打一堆路线请求
                  hoverTimerRef.current = setTimeout(() => loadHoverTimes(target), 200);
                });

                marker.addEventListener('mouseout', clearHover);
              }
            });
          }
        });
      }

      // 绘制风水数据（水系、地形、绿化）- 使用实际坐标，按时间过滤
      if (showFengshui && fengshuiData) {
        console.log('[MapView] fengshuiData:', fengshuiData);
        console.log('[MapView] water:', fengshuiData.water);
        console.log('[MapView] water_features:', fengshuiData.water?.water_features);
        console.log('[MapView] terrain_features:', fengshuiData.terrain?.terrain_features);
        console.log('[MapView] greenery_features:', fengshuiData.greenery?.greenery_features);

        // 获取当前等时圈边界用于过滤
        let currentPolygon: {lng: number, lat: number}[] = [];
        if (multiTimeData && multiTimeData.layers) {
          const validLayers = multiTimeData.layers.filter((l: any) => l.time <= activeTimeSlot);
          const selectedLayer = validLayers.sort((a: any, b: any) => b.time - a.time)[0];
          if (selectedLayer && selectedLayer.boundary_points) {
            currentPolygon = selectedLayer.boundary_points;
          }
        }
        console.log('[MapView] currentPolygon length:', currentPolygon.length);

        // 绘制水系（蓝色水滴图标）
        if (fengshuiData.water && fengshuiData.water.water_features) {
          const waterIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#1890ff" stroke="white" stroke-width="2" opacity="0.9"/><path d="M14 6c-3 4-5 7-5 9.5 0 3.5 2.5 5.5 5 5.5s5-2 5-5.5c0-2.5-2-5.5-5-9.5z" fill="white"/></svg>'
            ),
            new BMap.Size(28, 28),
            { anchor: new BMap.Size(14, 28) }
          );

          fengshuiData.water.water_features.forEach((feature: any) => {
            if (feature.location) {
              // 按时间过滤：只显示在当前等时圈内的水系
              if (currentPolygon.length > 0 && !isPointInPolygon(feature.location, currentPolygon)) {
                return;
              }
              const point = new BMap.Point(feature.location.lng, feature.location.lat);
              const marker = new BMap.Marker(point, { icon: waterIcon });
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #1890ff;">' + iconSvg('droplet', 16) + ' ' + feature.name + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
                    '类型: ' + (feature.type || '水系') + '<br>' +
                    '距离: ' + (feature.distance ? Math.round(feature.distance) + '米' : '未知') +
                  '</div>' +
                '</div>',
                { width: 200, height: 70 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            }
          });
        }

        // 绘制地形（绿色三角形图标）
        if (fengshuiData.terrain && fengshuiData.terrain.terrain_features) {
          const terrainIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><polygon points="14,4 24,24 4,24" fill="#52c41a" stroke="white" stroke-width="2" opacity="0.9"/></svg>'
            ),
            new BMap.Size(28, 28),
            { anchor: new BMap.Size(14, 28) }
          );

          fengshuiData.terrain.terrain_features.forEach((feature: any) => {
            if (feature.location) {
              if (currentPolygon.length > 0 && !isPointInPolygon(feature.location, currentPolygon)) {
                return;
              }
              const point = new BMap.Point(feature.location.lng, feature.location.lat);
              const marker = new BMap.Marker(point, { icon: terrainIcon });
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #52c41a;">' + iconSvg('mountain', 16) + ' ' + feature.name + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
                    '类型: ' + (feature.type || '地形') + '<br>' +
                    '距离: ' + (feature.distance ? Math.round(feature.distance) + '米' : '未知') +
                  '</div>' +
                '</div>',
                { width: 200, height: 70 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            }
          });
        }

        // 绘制绿化（绿色方形图标）
        if (fengshuiData.greenery && fengshuiData.greenery.greenery_features) {
          const greeneryIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><rect x="4" y="4" width="20" height="20" rx="4" fill="#389e0d" stroke="white" stroke-width="2" opacity="0.9"/><path d="M14 8c-2 2-4 4-4 6 0 3 2 4 4 4s4-1 4-4c0-2-2-4-4-6z" fill="white"/></svg>'
            ),
            new BMap.Size(28, 28),
            { anchor: new BMap.Size(14, 28) }
          );

          fengshuiData.greenery.greenery_features.forEach((feature: any) => {
            if (feature.location) {
              if (currentPolygon.length > 0 && !isPointInPolygon(feature.location, currentPolygon)) {
                return;
              }
              const point = new BMap.Point(feature.location.lng, feature.location.lat);
              const marker = new BMap.Marker(point, { icon: greeneryIcon });
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #389e0d;">' + iconSvg('tree', 16) + ' ' + feature.name + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
                    '类型: ' + (feature.type || '绿化') + '<br>' +
                    '距离: ' + (feature.distance ? Math.round(feature.distance) + '米' : '未知') +
                  '</div>' +
                '</div>',
                { width: 200, height: 70 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            }
          });
        }
      }

      // 绘制盲区（空间盲区，按设施类别着色，与图例同色）
      if (showBlindSpots && blindSpots && blindSpots.length > 0) {
        blindSpots.forEach((spot: any) => {
          if (spot.center) {
            const point = new BMap.Point(spot.center.lng, spot.center.lat);
            const radius = spot.radius || 200;
            const category = spot.category || '综合';
            const color = CATEGORY_COLOR[category] || '#ff4d4f';

            // 后端 polygon 是贴合等时圈的不规则轮廓（已裁剪不越界）；
            // 旧快照没有 polygon，回退画圆
            let shape: any;
            if (Array.isArray(spot.polygon) && spot.polygon.length >= 4) {
              const pts = spot.polygon.map((c: number[]) => new BMap.Point(c[0], c[1]));
              shape = new BMap.Polygon(pts, {
                strokeColor: color,
                strokeWeight: 1.5,
                strokeOpacity: 0.5,
                fillColor: color,
                fillOpacity: 0.13,
              });
            } else {
              shape = new BMap.Circle(point, radius, {
                strokeColor: color,
                strokeWeight: 2,
                strokeOpacity: 0.6,
                fillColor: color,
                fillOpacity: 0.15,
              });
            }

            map.addOverlay(shape);

            // 悬浮提示缺哪类设施（色块重叠时靠颜色+文案区分是哪类盲区）
            const info = new BMap.InfoWindow(
              '<div style="padding: 6px 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                '<div style="font-weight: 600; color: ' + color + ';">' + category + '空间盲区</div>' +
                '<div style="font-size: 12px; color: #666; margin-top: 2px;">' +
                  (spot.description || category + '覆盖不足') +
                '</div>' +
              '</div>',
              { width: 220, height: 70 }
            );
            shape.addEventListener('mouseover', () => map.openInfoWindow(info, point));
            shape.addEventListener('mouseout', () => map.closeInfoWindow());
          }
        });
      }

    // 重绘完成：通知「单独画路线」的 effect 跟着重画一次
    // （它的依赖里没有上面这些，不递增就会被 clearOverlays 清掉后不再补上）
    setOverlayEpoch((n) => n + 1);
    }
  }, [mapReady, center, isochrone, poiCoverage, blindSpots, multiTimeData, showGraph, showPOI, showBlindSpots, showFengshui, fengshuiData, activeTimeSlot, activeMode, activeCategory]);

  // 「中心 -> 悬浮/选中设施」的那条路线，单独画。
  // 不放进大 effect：否则每次 hover 都会 clearOverlays 全量重绘，
  // 标记在光标下销毁重建 -> 触发 mouseout/mouseover 来回抖动。
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;

    if (routeOverlayRef.current) {
      try { map.removeOverlay(routeOverlayRef.current); } catch { /* 已被 clearOverlays 清掉 */ }
      routeOverlayRef.current = null;
    }

    if (!showRoutes || !activeFacility || routeState.key !== activeKey || !routeState.geo) return;

    const points = routeState.geo.points.map(
      (p: { lng: number; lat: number }) => new BMap.Point(p.lng, p.lat)
    );
    if (points.length < 2) return;

    const isSelected = !!selectedFacility && selectedFacility.name === activeFacility.name;
    const polyline = new BMap.Polyline(points, {
      strokeColor: MODE_COLOR[activeMode] || '#667eea',
      strokeWeight: isSelected ? 6 : 4,
      strokeOpacity: isSelected ? 1.0 : 0.9,
    } as any);
    map.addOverlay(polyline);
    routeOverlayRef.current = polyline;
    polyline.addEventListener('click', () => toggleFacility(activeFacility));
  }, [mapReady, overlayEpoch, showRoutes, activeFacility, activeKey, routeState, selectedFacility, activeMode]);

  // 悬浮 或 选中（点右侧设施卡片 / 点地图）时，把其余 POI 标记先隐藏，
  // 只留「当前设施 + 它的路线」—— 两种交互效果一致。
  // 用 hide/show 而不是重绘：重绘会让标记在光标下销毁重建、来回抖。
  useEffect(() => {
    const list = poiMarkersRef.current;
    if (!list.length) return;
    const target = activeFacility ? activeFacility.name : null;
    list.forEach(({ marker, name }) => {
      try {
        if (!target || name === target) marker.show();
        else marker.hide();
      } catch {
        // 标记可能已被地图回收，忽略
      }
    });
  }, [activeFacility, overlayEpoch]);

  // 卡片放设施上方还是下方（mouseover 与位置 effect 共用同一判断）：
  // 路线从中心画过来，中心在设施屏幕上方时末段从上边进入——卡片翻到下方避开；
  // 中心在下方/两侧保持默认上方。只依赖中心与设施坐标，路线算完前位置已定，
  // 路线到达后不会跳。再做边缘夹取：贴顶/贴底放不下就翻到另一侧。
  const cardBelow = (px: { x: number; y: number }): boolean => {
    const CARD_H = 200; // 卡片最大高度估算（地址换行 + 5 行耗时）
    const GAP = 14;
    const containerH = mapRef.current?.clientHeight ?? 0;
    const map = mapInstanceRef.current;
    let below = false;
    if (center && map) {
      const BMap = (window as any).BMap;
      const cpx = map.pointToPixel(new BMap.Point(center.lng, center.lat));
      below = cpx.y < px.y - 24; // 中心明显在设施上方才翻（贴太近不折腾）
    }
    if (below && px.y + GAP + CARD_H > containerH && px.y - GAP - CARD_H >= 0) below = false;
    else if (!below && px.y - GAP - CARD_H < 0 && px.y + GAP + CARD_H <= containerH) below = true;
    return below;
  };

  // 卡片位置由 activeFacility（悬浮或选中）驱动。
  // 相机推近/缩放后必须重算，否则点了设施、镜头一动卡片就留在旧的屏幕坐标。
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !activeFacility) {
      setHoverPixel(null);
      return;
    }
    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;
    const place = () => {
      const px = map.pointToPixel(
        new BMap.Point(activeFacility.location.lng, activeFacility.location.lat)
      );
      setHoverPixel({ x: px.x, y: px.y, below: cardBelow(px) });
    };
    place();
    map.addEventListener('moveend', place);
    map.addEventListener('zoomend', place);
    return () => {
      map.removeEventListener('moveend', place);
      map.removeEventListener('zoomend', place);
    };
  }, [mapReady, activeFacility, center]);

  // 「选中」也要有和悬浮一样的卡片（点右侧设施卡片时就是这条路）。
  // 悬浮路径已在 mouseover 里触发，这里只在「没有悬浮、但有选中」时补上。
  useEffect(() => {
    if (!showRoutes || hoverFacility || !selectedFacility) return;
    // 已经为这个设施加载过就别重复触发
    if (hoverModes.length && activeFacility && activeFacility.name === selectedFacility.name) return;

    const target: HoverFacility = {
      name: selectedFacility.name,
      category: selectedFacility.category,
      location: selectedFacility.location,
      straight: center ? haversineMeters(center, selectedFacility.location) : undefined,
      transit_reachable: selectedFacility.transit_reachable,
    };
    setHoverTimes(null);
    setHoverModes([]);
    setHoverLoading(true);
    loadHoverTimes(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverFacility, selectedFacility, showRoutes, hoverModes, activeFacility, center]);

  // 处理选中的设施：集中画面（推近 + 弹窗）。取消选中时把镜头还原到中心。
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;

    if (!selectedFacility) {
      if (center) {
        map.panTo(new BMap.Point(center.lng, center.lat));
        map.setZoom(15);
      }
      return;
    }

    const point = new BMap.Point(selectedFacility.location.lng, selectedFacility.location.lat);
    map.panTo(point);
    map.setZoom(16);
    // 不再弹 InfoWindow —— 卡片就是这个设施的信息面，弹窗会和卡片重叠
  }, [mapReady, selectedFacility, center]);

  if (mapError) {
    return (
      <div className="map-error">
        <div className="error-icon">x</div>
        <p>{mapError}</p>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <div ref={mapRef} className="map-view" />

      {/* 悬浮 POI：各出行方式耗时 + 推荐方式。
          全部走百度 JS SDK 客户端规划，零后端配额；pointer-events:none
          让鼠标离开 marker 时直接隐藏，不会因为滑到卡片上而抖动 */}
      {showRoutes && activeFacility && hoverPixel && (
        <div
          style={{
            position: 'absolute',
            left: hoverPixel.x,
            // 默认在设施上方；路线从上方进入（中心在北侧）时翻到下方，别压住路线
            top: hoverPixel.below ? hoverPixel.y + 14 : hoverPixel.y - 14,
            transform: hoverPixel.below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 13,
            pointerEvents: 'none',
            width: 210,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            fontSize: 12,
            color: '#1f2937',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: CATEGORY_COLOR[activeFacility.category] || '#666',
              }}
            />
            <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeFacility.name}
            </span>
            <span style={{ color: '#6b7280', flexShrink: 0 }}>{activeFacility.category}</span>
          </div>

          {activeFacility.straight != null && (
            <div style={{ color: '#6b7280', marginBottom: 4 }}>
              <Ico n="pin" /> 直线 {Math.round(activeFacility.straight)} 米
            </div>
          )}

          {activeFacility.address && (
            <div
              style={{
                color: '#9ca3af',
                marginBottom: 6,
                fontSize: 11,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeFacility.address}
            </div>
          )}

          {hoverLoading && !hoverTimes ? (
            <div style={{ color: '#667eea', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              正在计算各方式耗时…
            </div>
          ) : hoverModes.length === 0 ? (
            <div style={{ color: '#9ca3af' }}>
              当前等时圈内没有可达的出行方式
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {hoverModes.map((mode) => {
                const secs = hoverTimes ? hoverTimes[mode] : null;
                const best = bestHoverMode === mode;
                // 没有结果时按行给出具体说明（公交/地铁各自独立，互不影响）
                const value =
                  secs == null
                    ? mode === 'transit_bus'
                      ? '当前没有公交直达'
                      : mode === 'transit_metro'
                        ? '当前没有地铁直达'
                        : '当前无法到达'
                    : `${Math.max(1, Math.round(secs / 60))} 分钟`;
                return (
                  <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 44, color: '#6b7280' }}>{TRAVEL_MODE_LABEL[mode]}</span>
                    <span
                      style={{
                        flex: 1,
                        fontWeight: 600,
                        fontSize: secs == null ? 12 : 13,
                        color: secs == null ? '#f59e0b' : best ? '#667eea' : '#1f2937',
                      }}
                    >
                      {value}
                    </span>
                    {best && (
                      <span style={{ fontSize: 11, color: '#fff', background: '#667eea', borderRadius: 8, padding: '1px 7px', flexShrink: 0 }}>
                        推荐
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* 耗时口径：门到门，不只是车内时间——只在有公交/地铁耗时的卡片上标注 */}
          {!hoverLoading && hoverModes.some((m) => (m === 'transit_bus' || m === 'transit_metro') && hoverTimes?.[m] != null) && (
            <div style={{ marginTop: 5, fontSize: 10, lineHeight: 1.5, color: '#9ca3af' }}>
              全程时长（门到门）：两端步行进出站 + 换乘步行 + 估算的等车时间 + 车内时间
            </div>
          )}
        </div>
      )}

      <LoadingOverlay loading={loading} />

      {/* 公共交通无接驳站点提示：设施被隐藏不是 bug，说明原因 */}
      {transitNoStopNear && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 11,
            padding: '8px 14px',
            borderRadius: 8,
            background: 'rgba(255, 251, 235, 0.96)',
            border: '1px solid #ffe58f',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: 12,
            color: '#ad6800',
            whiteSpace: 'nowrap',
          }}
        >
          该位置 500 米内无公交/地铁站，公共交通模式不显示设施
        </div>
      )}

      {/* 地图控制按钮 */}
      <div className="map-controls">
        <button
          className={`map-control-btn ${showGraph ? 'active' : ''}`}
          onClick={() => setShowGraph(!showGraph)}
          title="显示/隐藏等时圈"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showPOI ? 'active' : ''}`}
          onClick={() => setShowPOI(!showPOI)}
          title="显示/隐藏设施"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showBlindSpots ? 'active' : ''}`}
          onClick={() => setShowBlindSpots(!showBlindSpots)}
          title="显示/隐藏盲区"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showRoutes ? 'active' : ''}`}
          onClick={() => setShowRoutes(!showRoutes)}
          title="显示/隐藏路线"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17h18M3 17l4-4m-4 4l4 4m14-8l-4-4m4 4l-4 4"/>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showFengshui ? 'active' : ''}`}
          onClick={() => setShowFengshui(!showFengshui)}
          title="显示/隐藏风水"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
          </svg>
        </button>
        <button
          className={`map-control-btn ${clickMode ? 'active' : ''}`}
          onClick={() => {
            // 只在「开启」时要密码（关闭不该被拦）——防开源部署后任意选点刷 API
            if (!clickMode && !ensureCustomPointUnlocked()) return;
            setClickMode(!clickMode);
          }}
          title="点击地图选择位置"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
      </div>

      {/* 图例 */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#52c41a' }}></span>
          <span>5分钟</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#faad14' }}></span>
          <span>10分钟</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#1890ff' }}></span>
          <span>15分钟</span>
        </div>
        {showRoutes && (
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#c9ced9' }}></span>
            <span>路线</span>
          </div>
        )}
        {showBlindSpots &&
          blindSpots &&
          blindSpots.length > 0 &&
          Array.from(new Set(blindSpots.map((s: any) => s.category || '综合'))).map((cat: any) => (
            <div className="legend-item" key={cat}>
              <span
                className="legend-color"
                style={{ backgroundColor: CATEGORY_COLOR[cat] || '#ff4d4f' }}
              ></span>
              <span>{cat}盲区</span>
            </div>
          ))}
        {showFengshui && (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#1890ff' }}></span>
              <span>水系</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#52c41a' }}></span>
              <span>地形</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#389e0d' }}></span>
              <span>绿化</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapView;
