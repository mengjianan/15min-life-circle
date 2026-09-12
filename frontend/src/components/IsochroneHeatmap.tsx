import React, { useEffect, useRef } from 'react';

interface IsochroneHeatmapProps {
  map: any;  // 百度地图实例
  center: { lng: number; lat: number };
  isochroneData: any;
  visible: boolean;
}

const IsochroneHeatmap: React.FC<IsochroneHeatmapProps> = ({
  map,
  center,
  isochroneData,
  visible
}) => {
  const overlaysRef = useRef<any[]>([]);

  // 清除覆盖物
  const clearOverlays = () => {
    if (map && overlaysRef.current.length > 0) {
      overlaysRef.current.forEach(overlay => {
        try {
          map.removeOverlay(overlay);
        } catch (e) {
          // 忽略错误
        }
      });
      overlaysRef.current = [];
    }
  };

  // 绘制多层等时圈（5/10/15分钟）
  const drawHeatmapLayers = () => {
    if (!map || !isochroneData || !visible) return;

    clearOverlays();

    const BMap = (window as any).BMap;

    // 颜色配置（从浅到深表示时间从短到长）
    const layers = [
      { time: 5, color: '#52c41a', opacity: 0.15, label: '5分钟' },
      { time: 10, color: '#faad14', opacity: 0.20, label: '10分钟' },
      { time: 15, color: '#1890ff', opacity: 0.25, label: '15分钟' }
    ];

    // 如果有完整的等时圈数据，绘制多层
    if (isochroneData.layers) {
      isochroneData.layers.forEach((layer: any, index: number) => {
        const config = layers[index] || layers[2];

        if (layer.boundary_points && layer.boundary_points.length > 0) {
          const points = layer.boundary_points.map(
            (p: any) => new BMap.Point(p.lng, p.lat)
          );

          const polygon = new BMap.Polygon(points, {
            strokeColor: config.color,
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: config.color,
            fillOpacity: config.opacity,
            enableClicking: true
          });

          map.addOverlay(polygon);
          overlaysRef.current.push(polygon);

          // 点击显示信息
          polygon.addEventListener('click', () => {
            const area = layer.area ? `${(layer.area / 1000000).toFixed(2)} km²` : '计算中';
            const infoWindow = new BMap.InfoWindow(
              `<div style="padding: 10px;">
                <h4 style="margin: 0 0 8px 0; color: ${config.color};">
                  ${config.label}步行范围
                </h4>
                <p style="margin: 4px 0;"><strong>面积：</strong>${area}</p>
                <p style="margin: 4px 0;"><strong>步行时间：</strong>${config.time}分钟</p>
                <p style="margin: 4px 0;"><strong>采样点：</strong>${layer.boundary_points.length}个</p>
              </div>`,
              { width: 200, height: 100 }
            );

            const centerPoint = new BMap.Point(center.lng, center.lat);
            map.openInfoWindow(infoWindow, centerPoint);
          });
        }
      });
    } else if (isochroneData.boundary_points) {
      // 只有单层等时圈数据，绘制渐变效果
      const points = isochroneData.boundary_points.map(
        (p: any) => new BMap.Point(p.lng, p.lat)
      );

      // 绘制外层（15分钟）
      const outerPolygon = new BMap.Polygon(points, {
        strokeColor: '#1890ff',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#1890ff',
        fillOpacity: 0.10,
        enableClicking: true
      });

      map.addOverlay(outerPolygon);
      overlaysRef.current.push(outerPolygon);

      // 计算内层点（模拟10分钟和5分钟）
      const centerPoint = new BMap.Point(center.lng, center.lat);

      // 10分钟层（缩放0.66）
      const innerPoints10 = points.map((p: any) => {
        const dx = (p.lng - center.lng) * 0.66;
        const dy = (p.lat - center.lat) * 0.66;
        return new BMap.Point(center.lng + dx, center.lat + dy);
      });

      const innerPolygon10 = new BMap.Polygon(innerPoints10, {
        strokeColor: '#faad14',
        strokeWeight: 1,
        strokeOpacity: 0.6,
        fillColor: '#faad14',
        fillOpacity: 0.15
      });

      map.addOverlay(innerPolygon10);
      overlaysRef.current.push(innerPolygon10);

      // 5分钟层（缩放0.33）
      const innerPoints5 = points.map((p: any) => {
        const dx = (p.lng - center.lng) * 0.33;
        const dy = (p.lat - center.lat) * 0.33;
        return new BMap.Point(center.lng + dx, center.lat + dy);
      });

      const innerPolygon5 = new BMap.Polygon(innerPoints5, {
        strokeColor: '#52c41a',
        strokeWeight: 1,
        strokeOpacity: 0.6,
        fillColor: '#52c41a',
        fillOpacity: 0.20
      });

      map.addOverlay(innerPolygon5);
      overlaysRef.current.push(innerPolygon5);

      // 添加中心点标记
      const centerIcon = new BMap.Icon(
        `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="#1890ff" stroke="white" stroke-width="2"/>
          </svg>
        `)}`,
        new BMap.Size(20, 20),
        { anchor: new BMap.Size(10, 10) }
      );

      const centerMarker = new BMap.Marker(centerPoint, { icon: centerIcon });
      map.addOverlay(centerMarker);
      overlaysRef.current.push(centerMarker);
    }
  };

  useEffect(() => {
    drawHeatmapLayers();
  }, [isochroneData, visible]);

  useEffect(() => {
    return () => {
      clearOverlays();
    };
  }, []);

  if (!visible || !isochroneData) {
    return null;
  }

  return (
    <div className="heatmap-legend">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        等时圈图例
      </h4>
      <div className="legend-items">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#52c41a', opacity: 0.3 }}></span>
          <span>5分钟步行范围</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#faad14', opacity: 0.3 }}></span>
          <span>10分钟步行范围</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#1890ff', opacity: 0.3 }}></span>
          <span>15分钟步行范围</span>
        </div>
      </div>
    </div>
  );
};

export default IsochroneHeatmap;
