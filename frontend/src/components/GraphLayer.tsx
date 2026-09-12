import React, { useEffect, useRef, useState } from 'react';

interface GraphLayerProps {
  map: any;  // 百度地图实例
  center: { lng: number; lat: number };
  visible: boolean;
}

interface RouteData {
  type: string;
  features: any[];
  total_distance: number;
  total_duration: number;
}

const GraphLayer: React.FC<GraphLayerProps> = ({ map, center, visible }) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlaysRef = useRef<any[]>([]);

  // 清除地图覆盖物
  const clearOverlays = () => {
    if (map && overlaysRef.current.length > 0) {
      overlaysRef.current.forEach(overlay => {
        try {
          map.removeOverlay(overlay);
        } catch (e) {
          // 忽略已移除的覆盖物
        }
      });
      overlaysRef.current = [];
    }
  };

  // 获取路线数据
  const fetchRouteData = async () => {
    if (!center) return;

    setLoading(true);
    setError(null);

    try {
      // 获取等时圈边界点（简化版：只取8个方向）
      const directions = [0, 45, 90, 135, 180, 225, 270, 315];
      const radius = 0.015; // 约1.5km

      const allFeatures: any[] = [];

      // 并行获取各方向的路线
      const promises = directions.map(async (angle) => {
        const rad = (angle * Math.PI) / 180;
        const destLng = center.lng + radius * Math.sin(rad);
        const destLat = center.lat + radius * Math.cos(rad);

        const response = await fetch('/api/graph/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin_lng: center.lng,
            origin_lat: center.lat,
            dest_lng: destLng,
            dest_lat: destLat
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.features || [];
        }
        return [];
      });

      const results = await Promise.all(promises);
      results.forEach(features => allFeatures.push(...features));

      setRouteData({
        type: 'FeatureCollection',
        features: allFeatures,
        total_distance: allFeatures.reduce((sum: number, f: any) => sum + (f.properties?.distance || 0), 0),
        total_duration: allFeatures.reduce((sum: number, f: any) => sum + (f.properties?.duration || 0), 0)
      });
    } catch (err) {
      console.error('获取路线数据失败:', err);
      setError('获取路线数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 在地图上绘制路线
  const drawRoutes = () => {
    if (!map || !routeData || !visible) return;

    clearOverlays();

    const BMap = (window as any).BMap;

    routeData.features.forEach((feature) => {
      const geometry = feature.geometry;
      const properties = feature.properties;

      if (geometry.type === 'LineString') {
        const points = geometry.coordinates.map(
          (coord: number[]) => new BMap.Point(coord[0], coord[1])
        );

        // 绘制路线（蓝色渐变效果）
        const polyline = new BMap.Polyline(points, {
          strokeColor: '#1890ff',
          strokeWeight: 4,
          strokeOpacity: 0.8,
          enableClicking: true
        });

        map.addOverlay(polyline);
        overlaysRef.current.push(polyline);

        // 添加信息窗口
        polyline.addEventListener('click', () => {
          const midIndex = Math.floor(points.length / 2);
          const midPoint = points[midIndex];

          const infoWindow = new BMap.InfoWindow(
            `<div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1890ff;">路段信息</h4>
              <p style="margin: 4px 0;"><strong>距离：</strong>${properties.distance_text}</p>
              <p style="margin: 4px 0;"><strong>时间：</strong>${properties.duration_text}</p>
              <p style="margin: 4px 0;"><strong>道路：</strong>${properties.road_name || '未知'}</p>
            </div>`,
            {
              width: 200,
              height: 100,
              title: '路线详情'
            }
          );

          map.openInfoWindow(infoWindow, midPoint);
        });

        // 在路线中点添加距离/时间标注
        if (points.length > 2) {
          const midIndex = Math.floor(points.length / 2);
          const midPoint = points[midIndex];

          const label = new BMap.Label(
            `<div style="
              background: rgba(255, 255, 255, 0.9);
              border: 1px solid #1890ff;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              color: #333;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${properties.distance_text} · ${properties.duration_text}
            </div>`,
            {
              position: midPoint,
              offset: new BMap.Size(-30, -15)
            }
          );

          label.setStyle({
            backgroundColor: 'transparent',
            border: 'none'
          });

          map.addOverlay(label);
          overlaysRef.current.push(label);
        }
      }
    });
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (visible && center) {
      fetchRouteData();
    }
  }, [visible, center]);

  // 数据更新时绘制路线
  useEffect(() => {
    drawRoutes();
  }, [routeData, visible]);

  // 组件卸载时清除覆盖物
  useEffect(() => {
    return () => {
      clearOverlays();
    };
  }, []);

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="loading-spinner"></div>
        <span>加载路网数据...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="graph-error">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          {error}
        </span>
        <button onClick={fetchRouteData}>重试</button>
      </div>
    );
  }

  if (!visible || !routeData) {
    return null;
  }

  return (
    <div className="graph-info">
      <div className="graph-stats">
        <span className="stat-item">
          🛣️ 路段: {routeData.features.length}
        </span>
        <span className="stat-item">
          📏 总距离: {(routeData.total_distance / 1000).toFixed(1)}km
        </span>
        <span className="stat-item">
          ⏱️ 总时间: {Math.round(routeData.total_duration / 60)}min
        </span>
      </div>
    </div>
  );
};

export default GraphLayer;
