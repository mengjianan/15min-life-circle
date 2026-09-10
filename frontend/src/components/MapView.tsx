import React, { useEffect, useRef, useState } from 'react';
import GraphLayer from './GraphLayer';
import POIMarker from './POIMarker';
import LoadingOverlay from './LoadingOverlay';

interface MapViewProps {
  center: { lng: number; lat: number; name: string } | null;
  isochrone?: any;
  poiCoverage?: any;
  blindSpots?: any[];
  loading?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  isochrone,
  poiCoverage,
  blindSpots,
  loading = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [showGraph, setShowGraph] = useState(true);
  const [showPOI, setShowPOI] = useState(true);
  const [showBlindSpots, setShowBlindSpots] = useState(true);

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

    // 绘制等时圈
    if (isochrone?.boundary_points) {
      const polygonPoints = isochrone.boundary_points.map(
        (p: any) => new BMap.Point(p.lng, p.lat)
      );

      // 等时圈多边形（半透明蓝色）
      const polygon = new BMap.Polygon(polygonPoints, {
        strokeColor: '#1890ff',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#1890ff',
        fillOpacity: 0.15,
        enableClicking: true
      });

      map.addOverlay(polygon);

      // 点击等时圈显示信息
      polygon.addEventListener('click', () => {
        const area = isochrone.area ? `${(isochrone.area / 1000000).toFixed(2)} km²` : '计算中';
        const infoWindow = new BMap.InfoWindow(
          `<div style="padding: 10px;">
            <h4 style="margin: 0 0 8px 0; color: #1890ff;">🕐 15分钟步行范围</h4>
            <p style="margin: 4px 0;"><strong>面积：</strong>${area}</p>
            <p style="margin: 4px 0;"><strong>最大步行时间：</strong>15分钟</p>
            <p style="margin: 4px 0;"><strong>采样方向：</strong>${isochrone.boundary_points.length}个</p>
          </div>`,
          {
            width: 220,
            height: 100,
            title: '等时圈信息'
          }
        );

        const centerPoint = new BMap.Point(center.lng, center.lat);
        map.openInfoWindow(infoWindow, centerPoint);
      });
    }

    // 绘制盲区
    if (showBlindSpots && blindSpots && blindSpots.length > 0) {
      blindSpots.forEach((spot: any) => {
        if (spot.center) {
          const spotPoint = new BMap.Point(spot.center.lng, spot.center.lat);
          const radius = spot.radius || 200;

          // 盲区圆形（红色半透明）
          const circle = new BMap.Circle(spotPoint, radius, {
            strokeColor: '#ff4d4f',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: '#ff4d4f',
            fillOpacity: 0.2,
            enableClicking: true
          });

          map.addOverlay(circle);

          // 点击盲区显示信息
          circle.addEventListener('click', () => {
            const infoWindow = new BMap.InfoWindow(
              `<div style="padding: 10px;">
                <h4 style="margin: 0 0 8px 0; color: #ff4d4f;">⚠️ 服务盲区</h4>
                <p style="margin: 4px 0;"><strong>类别：</strong>${spot.category || '综合'}</p>
                <p style="margin: 4px 0;"><strong>半径：</strong>${radius}米</p>
                <p style="margin: 4px 0;"><strong>说明：</strong>${spot.description || '该区域服务设施覆盖不足'}</p>
              </div>`,
              {
                width: 220,
                height: 100,
                title: '盲区详情'
              }
            );

            map.openInfoWindow(infoWindow, spotPoint);
          });

          // 添加盲区标签
          const label = new BMap.Label(
            `<div style="
              background: rgba(255, 77, 79, 0.9);
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
            ">
              ⚠️ ${spot.category || '盲区'}
            </div>`,
            {
              position: spotPoint,
              offset: new BMap.Size(-20, -10)
            }
          );

          label.setStyle({
            backgroundColor: 'transparent',
            border: 'none'
          });

          map.addOverlay(label);
        }
      });
    }
  }, [center, isochrone, blindSpots, showBlindSpots]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map-view" />

      <LoadingOverlay loading={loading} message="正在计算15分钟生活圈..." />

      {/* 图层控制面板 */}
      <div className="layer-controls">
        <label className="layer-toggle">
          <input
            type="checkbox"
            checked={showGraph}
            onChange={(e) => setShowGraph(e.target.checked)}
          />
          <span>🛣️ 路网</span>
        </label>
        <label className="layer-toggle">
          <input
            type="checkbox"
            checked={showPOI}
            onChange={(e) => setShowPOI(e.target.checked)}
          />
          <span>📍 设施</span>
        </label>
        <label className="layer-toggle">
          <input
            type="checkbox"
            checked={showBlindSpots}
            onChange={(e) => setShowBlindSpots(e.target.checked)}
          />
          <span>⚠️ 盲区</span>
        </label>
      </div>

      {/* 图例 */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#1890ff', opacity: 0.2 }}></span>
          <span>15分钟步行范围</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff4d4f', opacity: 0.3 }}></span>
          <span>服务盲区</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker">📍</span>
          <span>社区中心</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: '#1890ff' }}></span>
          <span>步行路线</span>
        </div>
      </div>

      {/* Graph路网图层 */}
      {mapReady && (
        <GraphLayer
          map={mapInstanceRef.current}
          center={center ? { lng: center.lng, lat: center.lat } : { lng: 0, lat: 0 }}
          visible={showGraph}
        />
      )}

      {/* POI标注图层 */}
      {mapReady && (
        <POIMarker
          map={mapInstanceRef.current}
          poiData={poiCoverage || {}}
          visible={showPOI}
        />
      )}
    </div>
  );
};

export default MapView;
