import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';

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
  activeTimeSlot = 900
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(true);
  const [showPOI, setShowPOI] = useState(true);
  const [showBlindSpots, setShowBlindSpots] = useState(true);
  const [clickMode, setClickMode] = useState(false);

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

        map.addEventListener('click', (e: any) => {
          if (clickMode && onCenterChange) {
            onCenterChange(e.point.lng, e.point.lat);
          }
        });

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
  }, [checkBaiduMapAPI, clickMode, onCenterChange]);

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

      // 绘制多时间等时圈
      if (multiTimeData && multiTimeData.layers) {
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

      // 绘制POI设施
      if (showPOI && poiCoverage) {
        // 获取当前选中的等时圈边界点
        let currentPolygon: {lng: number, lat: number}[] = [];
        if (multiTimeData && multiTimeData.layers) {
          const selectedLayer = multiTimeData.layers.find((l: any) => l.time === activeTimeSlot);
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
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="' + color + '" stroke="white" stroke-width="2"/></svg>'
                  ),
                  new BMap.Size(20, 20),
                  { anchor: new BMap.Size(10, 10) }
                );

                const marker = new BMap.Marker(point, { icon });
                map.addOverlay(marker);

                const infoWindow = new BMap.InfoWindow(
                  '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                    '<div style="font-weight: 600; color: #333;">' + facility.name + '</div>' +
                    '<div style="font-size: 12px; color: ' + color + '; margin-top: 4px;">' + category + '</div>' +
                  '</div>',
                  { width: 200, height: 50 }
                );
                marker.addEventListener('click', () => {
                  map.openInfoWindow(infoWindow, point);
                });
              }
            });
          }
        });
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
  }, [mapReady, center, isochrone, poiCoverage, blindSpots, multiTimeData, showPOI, showBlindSpots]);

  // 处理选中的设施
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && selectedFacility) {
      const BMap = (window as any).BMap;
      const map = mapInstanceRef.current;
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
    }
  }, [mapReady, selectedFacility]);

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
      </div>
    </div>
  );
};

export default MapView;
