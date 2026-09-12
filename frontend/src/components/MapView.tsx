import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';

interface MapViewProps {
  center: { lng: number; lat: number; name: string } | null;
  isochrone?: any;
  poiCoverage?: any;
  blindSpots?: any[];
  loading?: boolean;
  onCenterChange?: (lng: number, lat: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  isochrone,
  poiCoverage,
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

  // 检查百度地图API是否加载完成
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
      // 超时处理
      setTimeout(() => reject(new Error('百度地图API加载超时')), 10000);
    });
  }, []);

  // 初始化百度地图
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        await checkBaiduMapAPI();

        if (!mounted || !mapRef.current || mapInstanceRef.current) return;

        const BMap = (window as any).BMap;
        const map = new BMap.Map(mapRef.current);

        // 设置默认中心点（南京市中心）
        const defaultPoint = new BMap.Point(118.7969, 32.0603);
        map.centerAndZoom(defaultPoint, 14);

        // 启用滚轮缩放
        map.enableScrollWheelZoom();

        // 添加控件
        map.addControl(new BMap.NavigationControl());
        map.addControl(new BMap.ScaleControl());
        map.addControl(new BMap.OverviewMapControl());

        // 添加点击事件监听
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

  // 更新地图中心点
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && center) {
      const BMap = (window as any).BMap;
      const point = new BMap.Point(center.lng, center.lat);
      mapInstanceRef.current.panTo(point);
      mapInstanceRef.current.setZoom(14);
    }
  }, [center, mapReady]);

  // 更新等时圈
  useEffect(() => {
    if (mapReady && mapInstanceRef.current && isochrone) {
      const map = mapInstanceRef.current;
      const BMap = (window as any).BMap;

      // 清除之前的覆盖物
      map.clearOverlays();

      // 绘制等时圈多边形
      if (isochrone.boundary_points && isochrone.boundary_points.length > 0) {
        const points = isochrone.boundary_points.map(
          (p: any) => new BMap.Point(p.lng, p.lat)
        );

        const polygon = new BMap.Polygon(points, {
          strokeColor: '#667eea',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#667eea',
          fillOpacity: 0.2,
        });

        map.addOverlay(polygon);
      }

      // 添加中心点标记
      if (center) {
        const centerPoint = new BMap.Point(center.lng, center.lat);
        const marker = new BMap.Marker(centerPoint);
        map.addOverlay(marker);

        // 添加信息窗口
        const infoWindow = new BMap.InfoWindow(
          `<div style="padding: 8px;">
            <strong>${center.name}</strong>
          </div>`,
          { width: 200, height: 60 }
        );
        marker.addEventListener('click', () => {
          map.openInfoWindow(infoWindow, centerPoint);
        });
      }

      // 添加POI标记
      if (showPOI && poiCoverage) {
        Object.entries(poiCoverage).forEach(([category, data]: [string, any]) => {
          if (data.facilities) {
            data.facilities.forEach((facility: any) => {
              const point = new BMap.Point(facility.location.lng, facility.location.lat);
              const marker = new BMap.Marker(point);
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                `<div style="padding: 8px;">
                  <strong>${facility.name}</strong><br/>
                  <span style="color: #666;">${category}</span>
                </div>`,
                { width: 200, height: 60 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            });
          }
        });
      }
    }
  }, [mapReady, isochrone, center, poiCoverage, showPOI]);

  // 切换点击模式
  const toggleClickMode = useCallback(() => {
    setClickMode(prev => !prev);
  }, []);

  // 切换图层显示
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
          title={showPOI ? '隐藏POI' : '显示POI'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
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
