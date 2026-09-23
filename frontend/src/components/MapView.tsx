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
  fengshuiData?: any;
  activeMode?: string;
  routesData?: any[];  // 从中心到设施的路线数据
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
  activeMode = 'walking',
  routesData = []
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
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);

  // 切换出行方式时重置选中的路线
  useEffect(() => {
    setSelectedRouteIndex(null);
  }, [activeMode]);

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

      // 绘制路线（从中心到设施的路线，按出行方式）
      // 默认显示所有路线（半透明），点击设施时高亮对应路线
      if (showRoutes && routesData && routesData.length > 0) {
        const modeColors: Record<string, string> = {
          'walking': '#52c41a',    // 绿色
          'cycling': '#1890ff',    // 蓝色
          'transit': '#faad14',    // 橙色
          'driving': '#ff4d4f'     // 红色
        };
        const routeColor = modeColors[activeMode] || '#667eea';

        routesData.forEach((routeInfo: any, index: number) => {
          const route = routeInfo.route;
          if (route && route.steps) {
            const allPoints: any[] = [];
            route.steps.forEach((step: any) => {
              if (step.path) {
                const pathPoints = step.path.split(';').map((p: string) => {
                  const [lng, lat] = p.split(',').map(Number);
                  return new BMap.Point(lng, lat);
                });
                allPoints.push(...pathPoints);
              }
            });

            if (allPoints.length > 1) {
              // 判断是否是选中的路线
              const isSelected = selectedRouteIndex === index;

              const polyline = new BMap.Polyline(allPoints, {
                strokeColor: routeColor,
                strokeWeight: isSelected ? 6 : 3,
                strokeOpacity: isSelected ? 1.0 : 0.3,
              });
              map.addOverlay(polyline);

              // 存储路线信息到polyline对象
              (polyline as any)._routeIndex = index;
              (polyline as any)._routeInfo = routeInfo;

              // 点击路线时高亮
              polyline.addEventListener('click', () => {
                setSelectedRouteIndex(index);
              });

              // 添加设施标记
              const lastPoint = allPoints[allPoints.length - 1];
              const facilityIcon = new BMap.Icon(
                'data:image/svg+xml,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="' + routeColor + '" stroke="white" stroke-width="2" opacity="' + (isSelected ? '1' : '0.6') + '"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="11">' + (index + 1) + '</text></svg>'
                ),
                new BMap.Size(24, 24),
                { anchor: new BMap.Size(12, 12) }
              );
              const marker = new BMap.Marker(lastPoint, { icon: facilityIcon });
              map.addOverlay(marker);

              // 点击设施标记时高亮对应路线
              marker.addEventListener('click', () => {
                setSelectedRouteIndex(index);
                const infoWindow = new BMap.InfoWindow(
                  '<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif; min-width: 180px;">' +
                    '<div style="font-weight: 600; color: #333; font-size: 14px; margin-bottom: 8px;">' + (routeInfo.facility_name || '设施') + '</div>' +
                    '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">' +
                      '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ' + routeColor + ';"></span>' +
                      '<span style="font-size: 13px; color: ' + routeColor + ';">' + (routeInfo.category || '') + '</span>' +
                    '</div>' +
                    '<div style="font-size: 12px; color: #666;">' +
                      '📍 距离: ' + (route.distance ? (route.distance / 1000).toFixed(1) + 'km' : '未知') + '<br>' +
                      '⏱️ 时间: ' + (route.duration ? Math.round(route.duration / 60) + '分钟' : '未知') +
                    '</div>' +
                  '</div>',
                  { width: 220, height: 100 }
                );
                map.openInfoWindow(infoWindow, lastPoint);
              });
            }
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

      // 绘制风水数据（水系、地形、绿化）- 使用实际坐标，按时间过滤
      if (showFengshui && fengshuiData) {
        console.log('[MapView] fengshuiData:', fengshuiData);
        console.log('[MapView] water:', fengshuiData.water);
        console.log('[MapView] water_features:', fengshuiData.water?.water_features);
        console.log('[MapView] terrain_features:', fengshuiData.terrain?.terrain_features);
        console.log('[MapView] greenery_features:', fengshuiData.greenery?.greenery_features);

        // 获取当前等时圈边界用于过滤
        let currentPolygon: {lng: number, lat: number}[] = [];
        if (multiTimeData && multiTimeData.layers) {
          const validLayers = multiTimeData.layers.filter((l: any) => l.time <= activeTimeSlot);
          const selectedLayer = validLayers.sort((a: any, b: any) => b.time - a.time)[0];
          if (selectedLayer && selectedLayer.boundary_points) {
            currentPolygon = selectedLayer.boundary_points;
          }
        }
        console.log('[MapView] currentPolygon length:', currentPolygon.length);

        // 绘制水系（蓝色水滴图标）
        if (fengshuiData.water && fengshuiData.water.water_features) {
          const waterIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#1890ff" stroke="white" stroke-width="2" opacity="0.9"/><path d="M14 6c-3 4-5 7-5 9.5 0 3.5 2.5 5.5 5 5.5s5-2 5-5.5c0-2.5-2-5.5-5-9.5z" fill="white"/></svg>'
            ),
            new BMap.Size(28, 28),
            { anchor: new BMap.Size(14, 28) }
          );

          fengshuiData.water.water_features.forEach((feature: any) => {
            if (feature.location) {
              // 按时间过滤：只显示在当前等时圈内的水系
              if (currentPolygon.length > 0 && !isPointInPolygon(feature.location, currentPolygon)) {
                return;
              }
              const point = new BMap.Point(feature.location.lng, feature.location.lat);
              const marker = new BMap.Marker(point, { icon: waterIcon });
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #1890ff;">💧 ' + feature.name + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
                    '类型: ' + (feature.type || '水系') + '<br>' +
                    '距离: ' + (feature.distance ? Math.round(feature.distance) + '米' : '未知') +
                  '</div>' +
                '</div>',
                { width: 200, height: 70 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            }
          });
        }

        // 绘制地形（绿色三角形图标）
        if (fengshuiData.terrain && fengshuiData.terrain.terrain_features) {
          const terrainIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><polygon points="14,4 24,24 4,24" fill="#52c41a" stroke="white" stroke-width="2" opacity="0.9"/></svg>'
            ),
            new BMap.Size(28, 28),
            { anchor: new BMap.Size(14, 28) }
          );

          fengshuiData.terrain.terrain_features.forEach((feature: any) => {
            if (feature.location) {
              if (currentPolygon.length > 0 && !isPointInPolygon(feature.location, currentPolygon)) {
                return;
              }
              const point = new BMap.Point(feature.location.lng, feature.location.lat);
              const marker = new BMap.Marker(point, { icon: terrainIcon });
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #52c41a;">⛰️ ' + feature.name + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
                    '类型: ' + (feature.type || '地形') + '<br>' +
                    '距离: ' + (feature.distance ? Math.round(feature.distance) + '米' : '未知') +
                  '</div>' +
                '</div>',
                { width: 200, height: 70 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            }
          });
        }

        // 绘制绿化（绿色方形图标）
        if (fengshuiData.greenery && fengshuiData.greenery.greenery_features) {
          const greeneryIcon = new BMap.Icon(
            'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><rect x="4" y="4" width="20" height="20" rx="4" fill="#389e0d" stroke="white" stroke-width="2" opacity="0.9"/><path d="M14 8c-2 2-4 4-4 6 0 3 2 4 4 4s4-1 4-4c0-2-2-4-4-6z" fill="white"/></svg>'
            ),
            new BMap.Size(28, 28),
            { anchor: new BMap.Size(14, 28) }
          );

          fengshuiData.greenery.greenery_features.forEach((feature: any) => {
            if (feature.location) {
              if (currentPolygon.length > 0 && !isPointInPolygon(feature.location, currentPolygon)) {
                return;
              }
              const point = new BMap.Point(feature.location.lng, feature.location.lat);
              const marker = new BMap.Marker(point, { icon: greeneryIcon });
              map.addOverlay(marker);

              const infoWindow = new BMap.InfoWindow(
                '<div style="padding: 8px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                  '<div style="font-weight: 600; color: #389e0d;">🌳 ' + feature.name + '</div>' +
                  '<div style="font-size: 12px; color: #666; margin-top: 4px;">' +
                    '类型: ' + (feature.type || '绿化') + '<br>' +
                    '距离: ' + (feature.distance ? Math.round(feature.distance) + '米' : '未知') +
                  '</div>' +
                '</div>',
                { width: 200, height: 70 }
              );
              marker.addEventListener('click', () => {
                map.openInfoWindow(infoWindow, point);
              });
            }
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
  }, [mapReady, center, isochrone, poiCoverage, blindSpots, multiTimeData, showPOI, showBlindSpots, showRoutes, showFengshui, routesData, fengshuiData, activeTimeSlot, activeMode, selectedRouteIndex]);

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
            <span className="legend-color" style={{ backgroundColor: activeMode === 'walking' ? '#52c41a' : activeMode === 'cycling' ? '#1890ff' : activeMode === 'transit' ? '#faad14' : '#ff4d4f' }}></span>
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
              <span className="legend-color" style={{ backgroundColor: '#389e0d' }}></span>
              <span>绿化</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapView;
