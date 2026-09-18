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
export const planRoute = (
  map: any,
  origin: { lng: number; lat: number },
  destination: { lng: number; lat: number },
  mode: 'walking' | 'cycling' | 'transit' | 'driving'
): Promise<RouteResult | null> => {
  return new Promise((resolve) => {
    const BMap = (window as any).BMap || {};
    if (!BMap) {
      resolve(null);
      return;
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
      case 'transit':
        RouteClass = BMap.TransitRoute;
        break;
      case 'driving':
        RouteClass = BMap.DrivingRoute;
        break;
      default:
        RouteClass = BMap.WalkingRoute;
    }

    const route = new RouteClass(map, {
      renderOptions: { map: map, autoViewport: false },
      onSearchComplete: (results: any) => {
        if (route.getStatus() === 0) {
          const plan = results.getPlan(0);
          if (plan) {
            resolve({
              distance: plan.getDistance(false),
              duration: plan.getDuration(false),
              steps: [],
              route: route
            });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }
    });

    route.search(originPoint, destPoint);
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
          if (subRoute) {
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
    }
  } catch (e) {
    console.error('获取路线点失败:', e);
  }

  return points;
};
