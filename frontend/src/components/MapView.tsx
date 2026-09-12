import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';

interface MapViewProps {
  center: { lng: number; lat: number; name: string } | null;
  isochrone?: any;
  poiCoverage?: any;
  blindSpots?: any[];
  multiTimeData?: any;
  loading?: boolean;
  onCenterChange?: (lng: number, lat: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  isochrone,
  poiCoverage,
  blindSpots,
  multiTimeData,
  loading = false,
  onCenterChange
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
      mapInstanceRef.current.setZoom(14);
    }
  }, [center, mapReady]);

  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const BMap = (window as any).BMap;

      map.clearOverlays();

      // 绘制多时间路线（如果有多时间数据）
      if (multiTimeData && multiTimeData.layers) {
        const timeColors: Record<number, string> = {
          300: '#52c41a',   // 5分钟 - 绿色
          600: '#faad14',   // 10分钟 - 橙色
          900: '#1890ff'    // 15分钟 - 蓝色
        };

        multiTimeData.layers.forEach((layer: any) => {
          if (layer.boundary_points && layer.boundary_points.length > 0) {
            const points = layer.boundary_points.map(
              (p: any) => new BMap.Point(p.lng, p.lat)
            );

            const color = timeColors[layer.time] || '#667eea';

            const polygon = new BMap.Polygon(points, {
              strokeColor: color,
              strokeWeight: 3,
              strokeOpacity: 0.8,
              fillColor: color,
              fillOpacity: 0.08,
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

      if (showPOI && poiCoverage) {
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
                    (facility.address ? '<div style="font-size: 11px; color: #999; margin-top: 2px;">' + facility.address + '</div>' : '') +
                    (facility.distance ? '<div style="font-size: 11px; color: #666; margin-top: 2px;">距离: ' + facility.distance + '米</div>' : '') +
                  '</div>',
                  { width: 250, height: 80 }
                );
                marker.addEventListener('click', () => {
                  map.openInfoWindow(infoWindow, point);
                });
              }
            });
          }
        });
      }

      if (showBlindSpots && blindSpots && blindSpots.length > 0) {
        blindSpots.forEach((spot: any, index: number) => {
          if (spot.center) {
            const point = new BMap.Point(spot.center.lng, spot.center.lat);

            const icon = new BMap.Icon(
              'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" fill="#ff4d4f" stroke="white" stroke-width="1.5"/><text x="12" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text></svg>'
              ),
              new BMap.Size(24, 24),
              { anchor: new BMap.Size(12, 24) }
            );

            const marker = new BMap.Marker(point, { icon });
            map.addOverlay(marker);

            const infoWindow = new BMap.InfoWindow(
              '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                '<div style="font-weight: 600; color: #ff4d4f;">服务盲区 #' + (index + 1) + '</div>' +
                '<div style="font-size: 12px; color: #333; margin-top: 4px;">类别: ' + (spot.category || '未知') + '</div>' +
                '<div style="font-size: 11px; color: #666; margin-top: 2px;">' + (spot.description || '该区域缺少相关设施覆盖') + '</div>' +
              '</div>',
              { width: 250, height: 80 }
            );
            marker.addEventListener('click', () => {
              map.openInfoWindow(infoWindow, point);
            });
          }
        });
      }
    }
  }, [mapReady, isochrone, center, poiCoverage, blindSpots, multiTimeData, showPOI, showBlindSpots]);

  const toggleClickMode = useCallback(() => {
    setClickMode(prev => !prev);
  }, []);

  const toggleGraph = useCallback(() => {
    setShowGraph(prev => !prev);
  }, []);

  const togglePOI = useCallback(() => {
    setShowPOI(prev => !prev);
  }, []);

  const toggleBlindSpots = useCallback(() => {
    setShowBlindSpots(prev => !prev);
  }, []);

  if (mapError) {
    return (
      <div className="map-error">
        <div className="map-error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <p>{mapError}</p>
        <button onClick={() => window.location.reload()}>刷新页面</button>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <div className="map-controls">
        <button
          className={`map-control-btn ${clickMode ? 'active' : ''}`}
          onClick={toggleClickMode}
          title={clickMode ? '关闭点击选点' : '开启点击选点'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showGraph ? 'active' : ''}`}
          onClick={toggleGraph}
          title={showGraph ? '隐藏路网' : '显示路网'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showPOI ? 'active' : ''}`}
          onClick={togglePOI}
          title={showPOI ? '隐藏设施' : '显示设施'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showBlindSpots ? 'active' : ''}`}
          onClick={toggleBlindSpots}
          title={showBlindSpots ? '隐藏盲区' : '显示盲区'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </div>

      <div ref={mapRef} className="map-container" />

      {loading && <LoadingOverlay loading={true} />}

      {clickMode && (
        <div className="click-mode-hint">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
          </svg>
          点击地图选择位置
        </div>
      )}
    </div>
  );
};

export default MapView;
