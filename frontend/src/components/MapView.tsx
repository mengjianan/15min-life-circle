import React, { useEffect, useRef } from 'react';

interface MapViewProps {
  center: { lng: number; lat: number; name: string } | null;
  isochrone?: any;
  poiCoverage?: any;
  blindSpots?: any[];
}

const MapView: React.FC<MapViewProps> = ({
  center,
  isochrone,
  poiCoverage,
  blindSpots
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // 初始化百度地图
    if (mapRef.current && !mapInstanceRef.current) {
      const BMap = (window as any).BMap;
      if (BMap) {
        const map = new BMap.Map(mapRef.current);
        map.centerAndZoom(new BMap.Point(118.7969, 32.0603), 14);
        map.enableScrollWheelZoom();
        mapInstanceRef.current = map;
      }
    }
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;

    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;

    // 清除之前的覆盖物
    map.clearOverlays();

    // 设置中心点
    const point = new BMap.Point(center.lng, center.lat);
    map.centerAndZoom(point, 15);

    // 添加中心点标记
    const marker = new BMap.Marker(point);
    map.addOverlay(marker);

    // 添加信息窗口
    const infoWindow = new BMap.InfoWindow(
      `<div>
        <h3>${center.name}</h3>
        <p>经度: ${center.lng}</p>
        <p>纬度: ${center.lat}</p>
      </div>`
    );
    marker.addEventListener('click', () => {
      map.openInfoWindow(infoWindow, point);
    });

    // 绘制等时圈
    if (isochrone?.boundary_points) {
      const polygonPoints = isochrone.boundary_points.map(
        (p: any) => new BMap.Point(p.lng, p.lat)
      );

      const polygon = new BMap.Polygon(polygonPoints, {
        strokeColor: '#1890ff',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#1890ff',
        fillOpacity: 0.2
      });
      map.addOverlay(polygon);
    }

    // 绘制盲区
    if (blindSpots && blindSpots.length > 0) {
      blindSpots.forEach((spot: any) => {
        if (spot.center) {
          const spotPoint = new BMap.Point(spot.center.lng, spot.center.lat);
          const circle = new BMap.Circle(spotPoint, spot.radius || 200, {
            strokeColor: '#ff4d4f',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: '#ff4d4f',
            fillOpacity: 0.3
          });
          map.addOverlay(circle);
        }
      });
    }
  }, [center, isochrone, blindSpots]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map-view" />
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
      </div>
    </div>
  );
};

export default MapView;
