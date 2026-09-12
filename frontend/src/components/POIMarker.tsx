import React, { useEffect, useRef } from 'react';
import { FacilityIcons, getFacilityColor, getFacilityBgColor } from '../icons';

interface POIMarkerProps {
  map: any;  // 百度地图实例
  poiData: Record<string, any>;
  visible: boolean;
}

const POIMarker: React.FC<POIMarkerProps> = ({ map, poiData, visible }) => {
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

  // 绘制POI标注
  const drawPOIMarkers = () => {
    if (!map || !poiData || !visible) return;

    clearOverlays();

    const BMap = (window as any).BMap;

    Object.entries(poiData).forEach(([category, data]) => {
      const color = getFacilityColor(category);
      const facilities = data.facilities || [];

      facilities.forEach((poi: any) => {
        if (poi.location) {
          const point = new BMap.Point(poi.location.lng, poi.location.lat);

          // 创建自定义图标 - 使用纯色圆形
          const icon = new BMap.Icon(
            `data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="14" fill="${color}" opacity="0.9"/>
                <circle cx="15" cy="15" r="6" fill="white"/>
              </svg>
            `)}`,
            new BMap.Size(30, 30),
            {
              anchor: new BMap.Size(15, 15)
            }
          );

          const marker = new BMap.Marker(point, { icon });
          map.addOverlay(marker);
          overlaysRef.current.push(marker);

          // 添加点击事件
          marker.addEventListener('click', () => {
            const infoWindow = new BMap.InfoWindow(
              `<div style="padding: 10px;">
                <h4 style="margin: 0 0 8px 0; color: ${color};">
                  ${poi.name}
                </h4>
                <p style="margin: 4px 0;"><strong>类别：</strong>${category}</p>
                <p style="margin: 4px 0;"><strong>地址：</strong>${poi.address || '暂无'}</p>
                ${poi.distance ? `<p style="margin: 4px 0;"><strong>距离：</strong>${poi.distance}米</p>` : ''}
                ${poi.tag ? `<p style="margin: 4px 0;"><strong>标签：</strong>${poi.tag}</p>` : ''}
              </div>`,
              {
                width: 250,
                height: 120,
                title: '设施详情'
              }
            );

            map.openInfoWindow(infoWindow, point);
          });
        }
      });
    });
  };

  useEffect(() => {
    drawPOIMarkers();
  }, [poiData, visible]);

  useEffect(() => {
    return () => {
      clearOverlays();
    };
  }, []);

  if (!visible || !poiData) {
    return null;
  }

  // 统计各类设施数量
  const stats = Object.entries(poiData).map(([category, data]) => ({
    category,
    count: data.count || 0,
    level: data.level || '匮乏'
  }));

  return (
    <div className="poi-info">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
        </svg>
        周边设施
      </h4>
      <div className="poi-stats">
        {stats.map(({ category, count, level }) => {
          const color = getFacilityColor(category);
          const bgColor = getFacilityBgColor(category);
          const IconComponent = FacilityIcons[category] || FacilityIcons['综合'];
          return (
            <div key={category} className="poi-stat-item">
              <span className="poi-icon" style={{ backgroundColor: bgColor, color }}>
                <IconComponent size={16} />
              </span>
              <span className="poi-category">{category}</span>
              <span className="poi-count">{count}个</span>
              <span className={`poi-level poi-level-${level}`}>
                {level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default POIMarker;
