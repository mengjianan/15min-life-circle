import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { iconSvg, Ico } from '../icons';
import { planRoute, getRoutePoints } from '../services/localSearch';

// 一条「中心 -> 设施」的路线几何（由百度 JS SDK 客户端算出，不占后端配额）
type RouteGeo = {
  points: { lng: number; lat: number }[];
  duration: number;   // 秒
  distance: number;   // 米
  ts: number;         // 写入时间戳，用于 30 天过期
};

// ---------- 悬浮路线的本地持久化（30 天） ----------
const ROUTE_CACHE_KEY = 'poi_route_cache_v1';
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
};

const TRAVEL_MODE_LIST = ['walking', 'cycling', 'transit', 'driving'] as const;
const TRAVEL_MODE_LABEL: Record<string, string> = {
  walking: '步行',
  cycling: '骑行',
  transit: '公交',
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
// 步行 -> 只显示步行；骑行 -> 步行+骑行；公交 -> +公交；驾车 -> 全部4种
const MODE_RANK: Record<string, number> = {
  walking: 0,
  cycling: 1,
  transit: 2,
  driving: 3,
};

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
  selectedFacility?: {name: string; category: string; location: {lng: number; lat: number}} | null;
  activeTimeSlot?: number;
  fengshuiData?: any;
  activeMode?: string;
  // 当前时段下，各出行方式**自己**的等时圈（用于判定「哪些方式够得着这个设施」）
  modeIsochrones?: Record<string, { lng: number; lat: number }[]>;
  // 选中设施的唯一出口：地图设施点击 / 折线点击 / 右侧卡片点击都收敛到这里
  onFacilitySelect?: (
    facility: { name: string; category: string; location: { lng: number; lat: number } } | null
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
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number } | null>(null);

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
    const persisted = loadRouteCache();
    persisted.forEach((value, key) => routeCacheRef.current.set(key, value));
  }, []);
  const routePendingRef = useRef<Set<string>>(new Set());
  const hoverTimerRef = useRef<any>(null);
  const hoverTokenRef = useRef(0);
  // clickMode 用 ref 读取：初始化 effect 只跑一次，闭包里捕获不到后续变化
  const clickModeRef = useRef(clickMode);

  useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);

  // 要显现路线的目标：悬浮优先，其次选中
  const activeFacility: HoverFacility | null = hoverFacility || selectedFacility || null;
  const activeKey = activeFacility ? `${activeFacility.name}|${activeMode}` : '';

  // 卡片展示哪些方式，两条规则同时生效：
  //   ① 叠加：只显示速度不高于当前选择的方式
  //      步行->只显示步行；骑行->步行+骑行；公交->+公交；驾车->全部4种
  //   ② 可达性：该方式的等时圈必须真的包含这个设施
  //      例：只在骑行时圈里才出现的新设施，不显示「步行」这一行
  const getDisplayModes = (facility: { location: { lng: number; lat: number } } | null): string[] => {
    if (!facility) return [];
    const currentRank = MODE_RANK[activeMode] ?? 0;
    return TRAVEL_MODE_LIST.filter((mode) => {
      if ((MODE_RANK[mode] ?? 99) > currentRank) return false;
      const ring = modeIsochrones?.[mode];
      // 当前模式的等时圈就是地图上画的那个，设施可见即代表在圈内
      if (!ring || ring.length < 3) return mode === activeMode;
      return isPointInPolygon(facility.location, ring);
    });
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
    facility: { name: string; category: string; location: { lng: number; lat: number } } | null
  ) => {
    if (!onFacilitySelect) return;
    const next =
      facility && selectedFacility && selectedFacility.name === facility.name ? null : facility;
    onFacilitySelect(next);
  };

  // 关闭悬浮卡片（鼠标离开 marker / 拖动缩放地图时）
  const clearHover = () => {
    clearTimeout(hoverTimerRef.current);
    hoverTokenRef.current++;   // 让在途的结果失效
    setHoverFacility(null);
    setHoverTimes(null);
    setHoverModes([]);
    setHoverPixel(null);
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

  // 取一条路线的几何：命中缓存秒回；同一 key 已在途则复用，不重复打
  const fetchRouteGeo = (
    facility: { name: string; location: { lng: number; lat: number } },
    mode: string
  ): Promise<RouteGeo | null> => {
    const key = `${facility.name}|${mode}`;
    const cached = routeCacheRef.current.get(key);
    if (cached) return Promise.resolve(cached);
    if (routePendingRef.current.has(key)) return Promise.resolve(null);
    if (!mapInstanceRef.current || !center) return Promise.resolve(null);

    routePendingRef.current.add(key);
    // 超时兜底：SDK 不回调时也要 settle，否则 Promise.all 卡死、卡片停在"计算中"
    return withTimeout(
      planRoute(mapInstanceRef.current, center, facility.location, mode as any),
      PLAN_ROUTE_TIMEOUT,
      null
    )
      .then((res) => {
        routePendingRef.current.delete(key);
        if (!res) return null;
        const points = getRoutePoints(res.route);
        if (!points || points.length < 2) return null;
        const geo: RouteGeo = {
          points,
          duration: res.duration,
          distance: res.distance,
          ts: Date.now(),
        };
        routeCacheRef.current.set(key, geo);
        schedulePersistRouteCache(routeCacheRef.current);
        return geo;
      })
      .catch(() => {
        routePendingRef.current.delete(key);
        return null;
      });
  };

  // 悬浮/选中变化时确保有一条可画的路线
  useEffect(() => {
    if (!mapReady) return;
    if (!activeFacility || !showRoutes) {
      setRouteState((prev) => (prev.key === '' ? prev : { key: '', geo: null }));
      return;
    }
    const key = `${activeFacility.name}|${activeMode}`;
    const cached = routeCacheRef.current.get(key);
    if (cached) {
      setRouteState((prev) => (prev.key === key ? prev : { key, geo: cached }));
      return;
    }
    fetchRouteGeo(activeFacility, activeMode).then((geo) => {
      if (geo) setRouteState({ key, geo });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, activeFacility, activeMode, showRoutes, routeTick]);

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
        const cached = routeCacheRef.current.get(`${facility.name}|${mode}`);
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
        for (const mode of TRAVEL_MODE_LIST) {
          if (cancelled) return;
          const key = `${fac.name}|${mode}`;
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

  useEffect(() => {
    if (mapReady && mapInstanceRef.current && center) {
      const BMap = (window as any).BMap;
      const point = new BMap.Point(center.lng, center.lat);
      mapInstanceRef.current.panTo(point);
      mapInstanceRef.current.setZoom(15);
    }
  }, [center, mapReady]);

  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const BMap = (window as any).BMap;

      map.clearOverlays();

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

      // 显现「中心 -> 悬浮/选中设施」的这一条真实路线。
      // 不再常驻画所有设施的放射线 —— 那不是路网，看起来很怪。
      if (showRoutes && activeFacility && routeState.key === activeKey && routeState.geo) {
        const routeColor = MODE_COLOR[activeMode] || '#667eea';
        // 选中（点击）= 加粗高亮；仅悬浮 = 常规显现
        const isSelected = !!selectedFacility &&
          selectedFacility.name === activeFacility.name;

        const points = routeState.geo.points.map(
          (p: { lng: number; lat: number }) => new BMap.Point(p.lng, p.lat)
        );

        if (points.length > 1) {
          const polyline = new BMap.Polyline(points, {
            strokeColor: routeColor,
            strokeWeight: isSelected ? 6 : 4,
            strokeOpacity: isSelected ? 1.0 : 0.9,
          } as any);
          map.addOverlay(polyline);

          polyline.addEventListener('click', () => {
            toggleFacility(activeFacility);
          });
        }
      }

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

                // 计算距离
                const centerLng = center?.lng || 118.7969;
                const centerLat = center?.lat || 32.0603;
                const distance = facility.distance || Math.round(
                  Math.sqrt(
                    Math.pow((facility.location.lng - centerLng) * 111000 * Math.cos(centerLat * Math.PI / 180), 2) +
                    Math.pow((facility.location.lat - centerLat) * 111000, 2)
                  )
                );

                // 估算出行时间
                const walkingTime = Math.round(distance / 1.2 / 60);
                const cyclingTime = Math.round(distance / 3.5 / 60);
                const drivingTime = Math.round(distance / 8 / 60);

                const infoWindow = new BMap.InfoWindow(
                  '<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif; min-width: 200px;">' +
                    '<div style="font-weight: 600; color: #333; font-size: 14px; margin-bottom: 8px;">' + facility.name + '</div>' +
                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">' +
                      '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ' + color + ';"></span>' +
                      '<span style="font-size: 13px; color: ' + color + ';">' + category + '</span>' +
                    '</div>' +
                    '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px; color: #666;">' +
                      '<div>' + iconSvg('pin') + ' 距离: ' + distance + '米</div>' +
                      '<div>' + iconSvg('walk') + ' 步行: ' + walkingTime + '分钟</div>' +
                      '<div>' + iconSvg('bike') + ' 骑行: ' + cyclingTime + '分钟</div>' +
                      '<div>' + iconSvg('car') + ' 驾车: ' + drivingTime + '分钟</div>' +
                    '</div>' +
                    (facility.address ? '<div style="margin-top: 8px; font-size: 12px; color: #999;">' + facility.address + '</div>' : '') +
                  '</div>',
                  { width: 280, height: 120 }
                );
                marker.addEventListener('click', () => {
                  map.openInfoWindow(infoWindow, point);
                  // 点击设施 = 切换该设施对应路线的高亮，再点一次取消
                  toggleFacility({
                    name: facility.name,
                    category: facility.category || category,
                    location: { lng: point.lng, lat: point.lat },
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
                  };
                  clearTimeout(hoverTimerRef.current);
                  setHoverPixel({ x: pixel.x, y: pixel.y });
                  setHoverTimes(null);
                  setHoverLoading(true);
                  setHoverFacility(target);

                  // 缓存里已经有这个设施的全部所需方式 -> 立刻出结果，
                  // 不用再等 200ms 防抖（预热命中的情况就是毫秒级）
                  const needModes = getDisplayModes(target);
                  const allCached = needModes.length > 0 && needModes.every(
                    (m) => routeCacheRef.current.has(`${target.name}|${m}`)
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

      // 绘制盲区
      if (showBlindSpots && blindSpots && blindSpots.length > 0) {
        blindSpots.forEach((spot: any) => {
          if (spot.center) {
            const point = new BMap.Point(spot.center.lng, spot.center.lat);
            const radius = spot.radius || 200;

            const circle = new BMap.Circle(point, radius, {
              strokeColor: '#ff4d4f',
              strokeWeight: 2,
              strokeOpacity: 0.6,
              fillColor: '#ff4d4f',
              fillOpacity: 0.15,
            });

            map.addOverlay(circle);
          }
        });
      }
    }
  }, [mapReady, center, isochrone, poiCoverage, blindSpots, multiTimeData, showGraph, showPOI, showBlindSpots, showRoutes, showFengshui, fengshuiData, activeTimeSlot, activeMode, hoverFacility, selectedFacility, routeState]);

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

    const infoWindow = new BMap.InfoWindow(
      '<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
        '<div style="font-weight: 600; font-size: 14px; color: #333; margin-bottom: 8px;">' + selectedFacility.name + '</div>' +
        '<div style="font-size: 12px; color: #667eea;">' + selectedFacility.category + '</div>' +
      '</div>',
      { width: 220, height: 70 }
    );
    map.openInfoWindow(infoWindow, point);
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
      {showRoutes && hoverFacility && hoverPixel && (
        <div
          style={{
            position: 'absolute',
            left: hoverPixel.x,
            top: hoverPixel.y - 14,
            transform: 'translate(-50%, -100%)',
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
                background: CATEGORY_COLOR[hoverFacility.category] || '#666',
              }}
            />
            <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {hoverFacility.name}
            </span>
            <span style={{ color: '#6b7280', flexShrink: 0 }}>{hoverFacility.category}</span>
          </div>

          {hoverFacility.straight != null && (
            <div style={{ color: '#6b7280', marginBottom: 6 }}>
              <Ico n="pin" /> 直线 {Math.round(hoverFacility.straight)} 米
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
                // 没有结果时按方式给出具体说明（公交没线路就是"没有公交到达"）
                const value =
                  secs == null
                    ? mode === 'transit'
                      ? '当前没有公交到达'
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
        </div>
      )}

      <LoadingOverlay loading={loading} />

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
          onClick={() => setClickMode(!clickMode)}
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
        {showBlindSpots && blindSpots && blindSpots.length > 0 && (
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff4d4f' }}></span>
            <span>空间盲区</span>
          </div>
        )}
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
