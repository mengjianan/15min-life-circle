import React, { useEffect, useRef, useState, useCallback } from 'react';
import GraphLayer from './GraphLayer';
import POIMarker from './POIMarker';
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
  const [showGraph, setShowGraph] = useState(true);
  const [showPOI, setShowPOI] = useState(true);
  const [showBlindSpots, setShowBlindSpots] = useState(true);
  const [clickMode, setClickMode] = useState(false);

  // 初始化百度地图
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const BMap = (window as any).BMap;
      if (BMap) {
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
        map.addEventListener('click', handleMapClick);

        mapInstanceRef.current = map;
        setMapReady(true);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.clearOverlays();
      }
    };
  }, []);

  // 处理地图点击事件
  const handleMapClick = useCallback((e: any) => {
    if (!clickMode) return;

    const BMap = (window as any).BMap;
    const map = mapInstanceRef.current;

    if (!map || !BMap) return;

    const point = e.point;

    // 清除之前的点击标记
    map.clearOverlays();

    // 添加点击标记
    const clickIcon = new BMap.Icon(
      `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill="#ff4d4f" stroke="white" stroke-width="2"/>
          <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">📍</text>
        </svg>
      `)}`,
      new BMap.Size(30, 30),
      {
        anchor: new BMap.Size(15, 15)
      }
    );

    const clickMarker = new BMap.Marker(point, { icon: clickIcon });
    map.addOverlay(clickMarker);

    // 添加信息窗口
    const infoWindow = new BMap.InfoWindow(
      `<div style="padding: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #ff4d4f;">📍 选中的位置</h4>
        <p style="margin: 4px 0;"><strong>经度：</strong>${point.lng.toFixed(6)}</p>
        <p style="margin: 4px 0;"><strong>纬度：</strong>${point.lat.toFixed(6)}</p>
        <button onclick="window.confirmCenterSelection(${point.lng}, ${point.lat})" style="
          margin-top: 8px;
          padding: 6px 12px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">确认选择</button>
      </div>`,
      {
        width: 220,
        height: 120,
        title: '位置信息'
      }
    );

    map.openInfoWindow(infoWindow, point);

    // 将确认函数挂载到window
    (window as any).confirmCenterSelection = (lng: number, lat: number) => {
      if (onCenterChange) {
        onCenterChange(lng, lat);
      }
      setClickMode(false);
      map.closeInfoWindow();
    };
  }, [clickMode, onCenterChange]);

  // 更新地图中心点和绘制等时圈
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;

    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;

    // 设置中心点
    const point = new BMap.Point(center.lng, center.lat);
    map.centerAndZoom(point, 15);

    // 清除之前的覆盖物（保留Graph和POI）
    // 注意：不要清除 GraphLayer 和 POIMarker 的覆盖物

    // 添加中心点标记
    const centerIcon = new BMap.Icon(
      `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#1890ff" stroke="white" stroke-width="3"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      `)}`,
      new BMap.Size(40, 40),
      {
        anchor: new BMap.Size(20, 20)
      }
    );

    const centerMarker = new BMap.Marker(point, { icon: centerIcon });
    map.addOverlay(centerMarker);

    // 添加中心点信息窗口
    const centerInfoWindow = new BMap.InfoWindow(
      `<div style="padding: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #1890ff;">📍 ${center.name}</h4>
        <p style="margin: 4px 0;"><strong>经度：</strong>${center.lng}</p>
        <p style="margin: 4px 0;"><strong>纬度：</strong>${center.lat}</p>
      </div>`,
      {
        width: 200,
        height: 80,
        title: '社区中心'
      }
    );

    centerMarker.addEventListener('click', () => {
      map.openInfoWindow(centerInfoWindow, point);
    });
  }, [center]);

  // 绘制等时圈
  useEffect(() => {
    if (!mapInstanceRef.current || !isochrone) return;

    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;

    // 清除之前的等时圈
    map.getOverlays().forEach((overlay: any) => {
      if (overlay instanceof BMap.Polygon) {
        map.removeOverlay(overlay);
      }
    });

    // 绘制新的等时圈
    if (isochrone.polygon && isochrone.polygon.geometry) {
      const coordinates = isochrone.polygon.geometry.coordinates[0];
      const points = coordinates.map((coord: number[]) => new BMap.Point(coord[0], coord[1]));

      const polygon = new BMap.Polygon(points, {
        strokeColor: '#1890ff',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#1890ff',
        fillOpacity: 0.2
      });

      map.addOverlay(polygon);
    }
  }, [isochrone]);

  return (
    <div className="map-container">
      {/* 地图容器 */}
      <div ref={mapRef} className="map-view" />

      {/* 加载遮罩 */}
      {loading && <LoadingOverlay loading={true} />}

      {/* 图层控制面板 */}
      <div className="layer-controls">
        <h4>图层控制</h4>
        <div className="layer-buttons">
          <button
            className={`layer-button ${showGraph ? 'active' : ''}`}
            onClick={() => setShowGraph(!showGraph)}
          >
            🛣️ Graph路网
          </button>
          <button
            className={`layer-button ${showPOI ? 'active' : ''}`}
            onClick={() => setShowPOI(!showPOI)}
          >
            📍 POI设施
          </button>
          <button
            className={`layer-button ${showBlindSpots ? 'active' : ''}`}
            onClick={() => setShowBlindSpots(!showBlindSpots)}
          >
            ⚠️ 盲区
          </button>
          <button
            className={`layer-button ${clickMode ? 'active' : ''}`}
            onClick={() => setClickMode(!clickMode)}
          >
            🎯 点击选位
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="map-legend">
        <h4>图例</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#1890ff' }}></span>
            <span>15分钟步行范围</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#52c41a' }}></span>
            <span>POI设施</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff4d4f' }}></span>
            <span>服务盲区</span>
          </div>
        </div>
      </div>

      {/* Graph图层 */}
      {showGraph && mapReady && center && (
        <GraphLayer
          map={mapInstanceRef.current}
          center={center}
          visible={showGraph}
        />
      )}

      {/* POI标记 */}
      {showPOI && mapReady && poiCoverage && (
        <POIMarker
          map={mapInstanceRef.current}
          poiData={poiCoverage}
          visible={showPOI}
        />
      )}

      {/* 点击模式提示 */}
      {clickMode && (
        <div className="click-mode-hint">
          <span>🎯 点击地图选择位置</span>
        </div>
      )}
    </div>
  );
};

export default MapView;
