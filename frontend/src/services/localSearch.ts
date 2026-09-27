// 前端JS API服务 - 地点检索和路线规划

export interface POIResult {
  name: string;
  location: { lng: number; lat: number };
  address: string;
  distance: number;
  uid: string;
  type?: string;
}

export interface RouteResult {
  distance: number;
  duration: number;
  steps: any[];
  route: any;
}

// 使用JS API进行地点检索（不受Web API配额限制）
export const searchNearby = (
  center: { lng: number; lat: number },
  keyword: string,
  radius: number = 1500
): Promise<POIResult[]> => {
  return new Promise((resolve) => {
    const BMap = (window as any).BMap || {};
    if (!BMap || !BMap.LocalSearch) {
      console.error('BMap.LocalSearch not available');
      resolve([]);
      return;
    }

    const point = new BMap.Point(center.lng, center.lat);
    const local = new BMap.LocalSearch(point, {
      renderOptions: { map: null },
      pageCapacity: 20,
      searchComplete: (results: any) => {
        const pois: POIResult[] = [];
        if (results && results.getCurrentNumPois) {
          const count = results.getCurrentNumPois();
          for (let i = 0; i < count; i++) {
            const poi = results.getPoi(i);
            if (poi && poi.point) {
              const distance = Math.round(
                BMap.getDistance(point, poi.point)
              );
              pois.push({
                name: poi.title || '',
                location: { lng: poi.point.lng, lat: poi.point.lat },
                address: poi.address || '',
                distance: distance,
                uid: poi.uid || `js_${i}`,
                type: keyword
              });
            }
          }
        }
        resolve(pois);
      }
    });
    local.searchNearby(keyword, point, radius);
  });
};

// 批量搜索多个类别
export const searchMultipleCategories = async (
  center: { lng: number; lat: number },
  categories: Record<string, string[]>,
  radius: number = 1500
): Promise<Record<string, POIResult[]>> => {
  const results: Record<string, POIResult[]> = {};

  for (const [category, keywords] of Object.entries(categories)) {
    const allPois: POIResult[] = [];
    const seen = new Set<string>();

    for (const keyword of keywords) {
      const pois = await searchNearby(center, keyword, radius);
      for (const poi of pois) {
        const key = `${poi.name}_${poi.location.lng}_${poi.location.lat}`;
        if (!seen.has(key)) {
          seen.add(key);
          allPois.push(poi);
        }
      }
    }

    // 按距离排序
    allPois.sort((a, b) => a.distance - b.distance);
    results[category] = allPois;
  }

  return results;
};

// 使用JS API进行路线规划
const CITY_CACHE_KEY = 'baidu_city_cache_v1';
const CITY_RESOLVE_TIMEOUT = 3000;

// 公共交通必须带城市，否则 Baidu 的 TransitRoute 检索不到线路、
// onSearchComplete 干脆不回调 -> 卡片会一直停在「计算中」。
// 用逆地理编码解析一次并存 localStorage（看地图时城市不会变）。
function resolveCity(point: any): Promise<string | null> {
  try {
    const cached = localStorage.getItem(CITY_CACHE_KEY);
    if (cached) return Promise.resolve(cached);
  } catch {
    // 隐私模式等场景 localStorage 不可用，忽略继续实时解析
  }

  return new Promise((resolve) => {
    const BMap = (window as any).BMap;
    if (!BMap?.Geocoder) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = (city: string | null) => {
      if (settled) return;
      settled = true;
      if (city) {
        try {
          localStorage.setItem(CITY_CACHE_KEY, city);
        } catch {
          // 写入失败不影响本次使用
        }
      }
      resolve(city);
    };
    // 逆地理编码也可能不回调，超时兜底，避免把 planRoute 卡死
    setTimeout(() => finish(null), CITY_RESOLVE_TIMEOUT);
    try {
      new BMap.Geocoder().getLocation(point, (res: any) => {
        const parts = res && res.addressComponents;
        finish((parts && (parts.city || parts.province)) || null);
      });
    } catch {
      finish(null);
    }
  });
}

export const planRoute = async (
  map: any,
  origin: { lng: number; lat: number },
  destination: { lng: number; lat: number },
  mode: 'walking' | 'cycling' | 'transit' | 'transit_bus' | 'transit_metro' | 'driving'
): Promise<RouteResult | null> => {
  const BMap = (window as any).BMap || {};
  if (!BMap.Point) {
    return null;
  }

  const originPoint = new BMap.Point(origin.lng, origin.lat);
  const destPoint = new BMap.Point(destination.lng, destination.lat);

  let RouteClass: any;
  switch (mode) {
    case 'walking':
      RouteClass = BMap.WalkingRoute;
      break;
    case 'cycling':
      RouteClass = BMap.RidingRoute;
      break;
    case 'driving':
      RouteClass = BMap.DrivingRoute;
      break;
    default:
      // transit / transit_bus / transit_metro
      RouteClass = BMap.TransitRoute;
  }

  const options: any = {
    // map: null —— 只让 SDK 算路线，不让它自己往地图上画一条线，
    // 否则悬浮时地图会同时出现 SDK 画的线和我们自己绘制的线
    renderOptions: { map: null, autoViewport: false },
  };
  if (mode.startsWith('transit')) {
    const city = await resolveCity(originPoint);
    if (city) options.city = city;
    // 公交/地铁各自独立规划：不坐地铁 vs 优先地铁
    const w = window as any;
    if (mode === 'transit_bus') options.policy = w.BMAP_TRANSIT_POLICY_AVOID_SUBWAYS ?? 3;
    if (mode === 'transit_metro') options.policy = w.BMAP_TRANSIT_POLICY_FIRST_SUBWAYS ?? 5;
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = (value: RouteResult | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    try {
      const route = new RouteClass(map, {
        ...options,
        onSearchComplete: (results: any) => {
          if (route.getStatus() === 0) {
            const plan = results.getPlan(0);
            if (plan) {
              done({
                distance: plan.getDistance(false),
                duration: plan.getDuration(false),
                steps: [],
                route: route
              });
              return;
            }
          }
          done(null);
        },
      });

      route.search(originPoint, destPoint);
    } catch {
      // RouteClass 缺失、参数非法等 -> 当作该方式不可用
      done(null);
    }
  });
};

// 获取路线的坐标点序列（用于绘制路线）
export const getRoutePoints = (route: any): { lng: number; lat: number }[] => {
  const points: { lng: number; lat: number }[] = [];
  if (!route) return points;

  try {
    const results = route.getResults();
    if (results) {
      const plan = results.getPlan(0);
      if (plan) {
        const numRoutes = plan.getNumRoutes();
        for (let i = 0; i < numRoutes; i++) {
          const subRoute = plan.getRoute(i);
          if (!subRoute) continue;

          // 优先取整条路线的完整点列（step.getPosition 只有每个步骤的
          // 一个代表点，画出来是折线段太少、像直线）
          let pushed = false;
          if (typeof subRoute.getPoints === 'function') {
            const pts = subRoute.getPoints() || [];
            if (pts.length > 1) {
              pts.forEach((p: any) => {
                if (p) points.push({ lng: p.lng, lat: p.lat });
              });
              pushed = points.length > 0;
            }
          }
          if (pushed) continue;

          const numSteps = subRoute.getNumSteps();
          for (let j = 0; j < numSteps; j++) {
            const step = subRoute.getStep(j);
            if (step && step.getPosition) {
              const point = step.getPosition();
              if (point) {
                points.push({ lng: point.lng, lat: point.lat });
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('获取路线点失败:', e);
  }

  return points;
};
