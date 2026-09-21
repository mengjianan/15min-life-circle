import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { API_BASE_URL } from '../config';

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
  fengshuiData?: any;
  activeMode?: string;
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
  activeTimeSlot = 900,
  fengshuiData,
  activeMode = 'walking'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(true);
  const [showPOI, setShowPOI] = useState(true);
  const [showBlindSpots, setShowBlindSpots] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showFengshui, setShowFengshui] = useState(true);
  const [clickMode, setClickMode] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);

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

  // 获取路线数据
  const fetchRouteData = useCallback(async () => {
    if (!center) return;

    try {
      // 获取8个方向的路线
      const directions = [
        { lng: center.lng + 0.01, lat: center.lat },
        { lng: center.lng - 0.01, lat: center.lat },
        { lng: center.lng, lat: center.lat + 0.01 },
        { lng: center.lng, lat: center.lat - 0.01 },
        { lng: center.lng + 0.007, lat: center.lat + 0.007 },
        { lng: center.lng - 0.007, lat: center.lat + 0.007 },
        { lng: center.lng + 0.007, lat: center.lat - 0.007 },
        { lng: center.lng - 0.007, lat: center.lat - 0.007 },
      ];

      const routes = [];
      for (const dir of directions) {
        try {
          const response = await fetch(`${API_BASE_URL}/graph/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin_lng: center.lng,
              origin_lat: center.lat,
              dest_lng: dir.lng,
              dest_lat: dir.lat,
              travel_mode: activeMode === 'cycling' ? 'cycling' :
                          activeMode === 'driving' ? 'driving' : 'walking'
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              routes.push(data);
            }
          }
        } catch (e) {
          // 忽略单个路线请求失败
        }
      }

      setRouteData(routes.length > 0 ? routes : null);
    } catch (error) {
      console.error('获取路线数据失败:', error);
    }
  }, [center, activeMode]);

  // 获取风水数据
  useEffect(() => {
    if (center && showFengshui) {
      fetchRouteData();
    }
  }, [center, activeMode, showFengshui, fetchRouteData]);

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

      // 绘制路线
      if (showRoutes && routeData && routeData.length > 0) {
        routeData.forEach((route: any, index: number) => {
          if (route.features) {
            route.features.forEach((feature: any) => {
              if (feature.geometry && feature.geometry.type === 'LineString') {
                const coordinates = feature.geometry.coordinates;
                const points = coordinates.map((coord: number[]) =>
                  new BMap.Point(coord[0], coord[1])
                );

                const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa', '#f783ac', '#868e96'];
                const color = colors[index % colors.length];

                const polyline = new BMap.Polyline(points, {
                  strokeColor: color,
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                });
                map.addOverlay(polyline);
              }
            });
          }
        });
      }

      // 绘制POI设施（累积显示：15分钟包含10分钟和5分钟的所有设施）
      if (showPOI && poiCoverage) {
        // 获取当前选中时间及更小时间的等时圈边界点
        let currentPolygon: {lng: number, lat: number}[] = [];
        if (multiTimeData && multiTimeData.layers) {
          // 获取所有小于等于当前选中时间的层
          const validLayers = multiTimeData.layers.filter((l: any) => l.time <= activeTimeSlot);
          // 使用最大的时间层作为过滤边界（这样15分钟会包含所有设施）
          const selectedLayer = validLayers.sort((a: any, b: any) => b.time - a.time)[0];
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
                    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="' + color + '"/><circle cx="12" cy="12" r="5" fill="white"/></svg>'
                  ),
                  new BMap.Size(24, 32),
                  { anchor: new BMap.Size(12, 32) }
                );

                const marker = new BMap.Marker(point, { icon });
                map.addOverlay(marker);

                // 计算距离
                const centerLng = center?.lng || 118.7969;
                const centerLat = center?.lat || 32.0603;
                const distance = facility.distance || Math.round(
                  Math.sqrt(
                    Math.pow((facility.location.lng - centerLng) * 111000 * Math.cos(centerLat * Math.PI / 180), 2) +
                    Math.pow((facility.location.lat - centerLat) * 111000, 2)
                  )
                );

                // 估算出行时间
                const walkingTime = Math.round(distance / 1.2 / 60);
                const cyclingTime = Math.round(distance / 3.5 / 60);
                const drivingTime = Math.round(distance / 8 / 60);

                const infoWindow = new BMap.InfoWindow(
                  '<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif; min-width: 200px;">' +
                    '<div style="font-weight: 600; color: #333; font-size: 14px; margin-bottom: 8px;">' + facility.name + '</div>' +
                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">' +
                      '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ' + color + ';"></span>' +
                      '<span style="font-size: 13px; color: ' + color + ';">' + category + '</span>' +
                    '</div>' +
                    '<div style="display: grid; grid-template-columns: repeat(2, gap: 8px; font-size: 12px; color: #666;">' +
                      '<div>📍 距离: ' + distance + '米</div>' +
                      '<div>🚶 步行: ' + walkingTime + '分钟</div>' +
                      '<div>🚲 骑行: ' + cyclingTime + '分钟</div>' +
                      '<div>🚗 驾车: ' + drivingTime + '分钟</div>' +
                    '</div>' +
                    (facility.address ? '<div style="margin-top: 8px; font-size: 12px; color: #999;">' + facility.address + '</div>' : '') +
                  '</div>',
                  { width: 280, height: 120 }
                );
                marker.addEventListener('click', () => {
                  map.openInfoWindow(infoWindow, point);
                });
              }
            });
          }
        });
      }

      // 绘制风水数据
      if (showFengshui && fengshuiData) {
        // 绘制水系
        if (fengshuiData.water && fengshuiData.water.has_water && fengshuiData.water.water_names) {
          fengshuiData.water.water_names.forEach((waterName: string) => {
            // 水系标记
            const waterIcon = new BMap.Icon(
              'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" fill="#1890ff" stroke="white" stroke-width="1"/></svg>'
              ),
              new BMap.Size(24, 24),
              { anchor: new BMap.Size(12, 24) }
            );

            // 在中心点附近添加水系标记
            if (center) {
              const waterPoint = new BMap.Point(center.lng + 0.005, center.lat + 0.005);
              const waterMarker = new BMap.Marker(waterPoint, { icon: waterIcon });
              map.addOverlay(waterMarker);

              const waterInfoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #1890ff;">💧 ' + waterName + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' + fengshuiData.water.description + '</div>' +
                '</div>',
                { width: 200, height: 60 }
              );
              waterMarker.addEventListener('click', () => {
                map.openInfoWindow(waterInfoWindow, waterPoint);
              });
            }
          });
        }

        // 绘制地形信息
        if (fengshuiData.terrain && center) {
          const terrainIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" fill="#52c41a" stroke="white" stroke-width="1"/></svg>'
            ),
            new BMap.Size(24, 24),
            { anchor: new BMap.Size(12, 24) }
          );

          const terrainPoint = new BMap.Point(center.lng - 0.005, center.lat - 0.005);
          const terrainMarker = new BMap.Marker(terrainPoint, { icon: terrainIcon });
          map.addOverlay(terrainMarker);

          const terrainInfoWindow = new BMap.InfoWindow(
            '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
              '<div style="font-weight: 600; color: #52c41a;">⛰️ 地形信息</div>' +
              '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
              '类型: ' + fengshuiData.terrain.terrain_type + '<br>' +
              '海拔: ' + fengshuiData.terrain.elevation + '米<br>' +
              '坡度: ' + fengshuiData.terrain.slope.toFixed(1) + '°<br>' +
              fengshuiData.terrain.description + '</div>' +
            '</div>',
            { width: 220, height: 80 }
          );
          terrainMarker.addEventListener('click', () => {
            map.openInfoWindow(terrainInfoWindow, terrainPoint);
          });
        }

        // 绘制朝向信息
        if (fengshuiData.orientation && center) {
          const orientationIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="#faad14" stroke="white" stroke-width="1"/></svg>'
            ),
            new BMap.Size(24, 24),
            { anchor: new BMap.Size(12, 24) }
          );

          const orientationPoint = new BMap.Point(center.lng + 0.005, center.lat - 0.005);
          const orientationMarker = new BMap.Marker(orientationPoint, { icon: orientationIcon });
          map.addOverlay(orientationMarker);

          const orientationInfoWindow = new BMap.InfoWindow(
            '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
              '<div style="font-weight: 600; color: #faad14;">🧭 朝向分析</div>' +
              '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
              '朝向: ' + fengshuiData.orientation.facing_direction + '<br>' +
              '吉利方位: ' + fengshuiData.orientation.auspicious_directions.join(', ') + '<br>' +
              fengshuiData.orientation.description + '</div>' +
            '</div>',
            { width: 220, height: 70 }
          );
          orientationMarker.addEventListener('click', () => {
            map.openInfoWindow(orientationInfoWindow, orientationPoint);
          });
        }
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
  }, [mapReady, center, isochrone, poiCoverage, blindSpots, multiTimeData, showPOI, showBlindSpots, showRoutes, showFengshui, routeData, fengshuiData, activeTimeSlot]);

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
          className={`map-control-btn ${showRoutes ? 'active' : ''}`}
          onClick={() => setShowRoutes(!showRoutes)}
          title="显示/隐藏路线"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17h18M3 17l4-4m-4 4l4 4m14-8l-4-4m4 4l-4 4"/>
          </svg>
        </button>
        <button
          className={`map-control-btn ${showFengshui ? 'active' : ''}`}
          onClick={() => setShowFengshui(!showFengshui)}
          title="显示/隐藏风水"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
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
        {showRoutes && (
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></span>
            <span>路线</span>
          </div>
        )}
        {showFengshui && (
          <>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#1890ff' }}></span>
              <span>水系</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#52c41a' }}></span>
              <span>地形</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#faad14' }}></span>
              <span>朝向</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapView;
