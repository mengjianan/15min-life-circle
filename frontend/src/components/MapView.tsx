import React, { useEffect, useRef, useState, useCallback } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { API_BASE_URL } from '../config';

interface MapViewProps {
  center: { lng: number; lat: number; name: string } | null;
  isochrone?: any;
  poiCoverage?: any;
  blindSpots?: any[];
  multiTimeData?: any;
  loading?: boolean;
  onCenterChange?: (lng: number, lat: number) => void;
  selectedFacility?: {name: string; category: string; location: {lng: number; lat: number}} | null;
  onFacilityClose?: () => void;
  travelMode?: string;
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
  onFacilityClose,
  travelMode = 'walking'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeOverlaysRef = useRef<any[]>([]);
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

  // 根据出行方式获取速度倍率
  const getSpeedMultiplier = (mode: string) => {
    switch (mode) {
      case 'cycling': return 2.9;
      case 'ebike': return 4.2;
      case 'driving': return 6.7;
      default: return 1;
    }
  };

  // 缩放等时圈边界点
  const scaleBoundaryPoints = (points: any[], center: any, multiplier: number) => {
    if (multiplier === 1) return points;
    return points.map((p: any) => {
      const dLng = p.lng - center.lng;
      const dLat = p.lat - center.lat;
      return {
        lng: center.lng + dLng * multiplier,
        lat: center.lat + dLat * multiplier
      };
    });
  };

  useEffect(() => {
    if (mapReady && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const BMap = (window as any).BMap;
      const speedMultiplier = getSpeedMultiplier(travelMode);

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
            // 根据出行方式缩放边界点
            const scaledPoints = center
              ? scaleBoundaryPoints(layer.boundary_points, center, speedMultiplier)
              : layer.boundary_points;

            const points = scaledPoints.map(
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
        const scaledPoints = center
          ? scaleBoundaryPoints(isochrone.boundary_points, center, speedMultiplier)
          : isochrone.boundary_points;

        const points = scaledPoints.map(
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

      // 绘制从中心点到各设施的连线
      if (showPOI && center && poiCoverage) {
        const centerPoint = new BMap.Point(center.lng, center.lat);

        Object.entries(poiCoverage).forEach(([category, data]: [string, any]) => {
          if (data.facilities && data.facilities.length > 0) {
            data.facilities.forEach((facility: any) => {
              if (facility.location) {
                const facilityPoint = new BMap.Point(facility.location.lng, facility.location.lat);

                // 绘制连线（蓝色虚线）
                const polyline = new BMap.Polyline([centerPoint, facilityPoint], {
                  strokeColor: '#1890ff',
                  strokeWeight: 2,
                  strokeStyle: 'dashed',
                  strokeOpacity: 0.6,
                  enableClicking: true
                });

                map.addOverlay(polyline);

                // 点击连线显示信息
                polyline.addEventListener('click', () => {
                  const midLng = (center.lng + facility.location.lng) / 2;
                  const midLat = (center.lat + facility.location.lat) / 2;
                  const midPoint = new BMap.Point(midLng, midLat);

                  const distance = facility.distance || '未知';
                  const walkTime = facility.walkTime || '未知';

                  const infoWindow = new BMap.InfoWindow(
                    '<div style="padding: 10px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">' +
                      '<h4 style="margin: 0 0 8px 0; color: #1890ff;">路线信息</h4>' +
                      '<p style="margin: 4px 0;"><strong>目的地：</strong>' + facility.name + '</p>' +
                      '<p style="margin: 4px 0;"><strong>类别：</strong>' + category + '</p>' +
                      '<p style="margin: 4px 0;"><strong>距离：</strong>' + distance + '米</p>' +
                      '<p style="margin: 4px 0;"><strong>步行时间：</strong>' + walkTime + '分钟</p>' +
                    '</div>',
                    { width: 220, height: 120 }
                  );

                  map.openInfoWindow(infoWindow, midPoint);
                });
              }
            });
          }
        });
      }
    }
  }, [mapReady, isochrone, center, poiCoverage, blindSpots, multiTimeData, showPOI, showBlindSpots]);

  // 处理选中设施 - 高亮标记、画步行路线、弹出信息窗
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedFacility || !center) return;

    const map = mapInstanceRef.current;
    const BMap = (window as any).BMap;

    // 清除之前的路线覆盖物
    routeOverlaysRef.current.forEach(overlay => {
      try {
        map.removeOverlay(overlay);
      } catch (e) {
        // 忽略
      }
    });
    routeOverlaysRef.current = [];

    const facilityPoint = new BMap.Point(selectedFacility.location.lng, selectedFacility.location.lat);
    const centerPoint = new BMap.Point(center.lng, center.lat);

    // 1. 高亮标记 - 大图标
    const highlightIcon = new BMap.Icon(
      'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#ff4d4f" stroke="white" stroke-width="3"/><circle cx="20" cy="20" r="8" fill="white"/></svg>'
      ),
      new BMap.Size(40, 40),
      { anchor: new BMap.Size(20, 20) }
    );

    const highlightMarker = new BMap.Marker(facilityPoint, { icon: highlightIcon });
    map.addOverlay(highlightMarker);
    routeOverlaysRef.current.push(highlightMarker);

    // 2. 画路线（调用后端API获取实际路线）
    const drawWalkingRoute = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/graph/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin_lng: center.lng,
            origin_lat: center.lat,
            dest_lng: selectedFacility.location.lng,
            dest_lat: selectedFacility.location.lat,
            travel_mode: travelMode
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            if (feature.geometry.type === 'LineString') {
              const points = feature.geometry.coordinates.map(
                (coord: number[]) => new BMap.Point(coord[0], coord[1])
              );

              const polyline = new BMap.Polyline(points, {
                strokeColor: '#ff4d4f',
                strokeWeight: 4,
                strokeOpacity: 0.8,
                enableClicking: true
              });

              map.addOverlay(polyline);
              routeOverlaysRef.current.push(polyline);

              // 路线信息
              const properties = feature.properties;
              const distance = properties.distance_text || '未知';
              const duration = properties.duration_text || '未知';

              // 3. 弹出信息窗
              const infoWindow = new BMap.InfoWindow(
                `<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif; min-width: 200px;">
                  <h4 style="margin: 0 0 10px 0; color: #ff4d4f; font-size: 16px;">${selectedFacility.name}</h4>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>类别：</strong>${selectedFacility.category}</p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>步行距离：</strong>${distance}</p>
                  <p style="margin: 6px 0; font-size: 13px;"><strong>预计时间：</strong>${duration}</p>
                  <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; font-size: 11px; color: #999;">
                    点击地图其他区域关闭此窗口
                  </div>
                </div>`,
                { width: 280, height: 150 }
              );

              map.openInfoWindow(infoWindow, facilityPoint);

              // 地图平移到设施位置
              map.panTo(facilityPoint);
            }
          }
        } else {
          // API失败时显示简单连线
          const polyline = new BMap.Polyline([centerPoint, facilityPoint], {
            strokeColor: '#ff4d4f',
            strokeWeight: 4,
            strokeOpacity: 0.8,
            strokeStyle: 'dashed'
          });
          map.addOverlay(polyline);
          routeOverlaysRef.current.push(polyline);

          // 计算直线距离
          const distance = Math.round(BMap.getDistance(centerPoint, facilityPoint));

          const infoWindow = new BMap.InfoWindow(
            `<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 10px 0; color: #ff4d4f; font-size: 16px;">${selectedFacility.name}</h4>
              <p style="margin: 6px 0; font-size: 13px;"><strong>类别：</strong>${selectedFacility.category}</p>
              <p style="margin: 6px 0; font-size: 13px;"><strong>直线距离：</strong>${distance}米</p>
              <p style="margin: 6px 0; font-size: 13px;"><strong>预计步行：</strong>${Math.round(distance / 80)}分钟</p>
            </div>`,
            { width: 280, height: 130 }
          );

          map.openInfoWindow(infoWindow, facilityPoint);
          map.panTo(facilityPoint);
        }
      } catch (e) {
        console.error('获取步行路线失败:', e);
        // 出错时显示简单连线
        const polyline = new BMap.Polyline([centerPoint, facilityPoint], {
          strokeColor: '#ff4d4f',
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: 'dashed'
        });
        map.addOverlay(polyline);
        routeOverlaysRef.current.push(polyline);

        const distance = Math.round(BMap.getDistance(centerPoint, facilityPoint));
        const infoWindow = new BMap.InfoWindow(
          `<div style="padding: 12px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">
            <h4 style="margin: 0 0 10px 0; color: #ff4d4f;">${selectedFacility.name}</h4>
            <p><strong>类别：</strong>${selectedFacility.category}</p>
            <p><strong>距离：</strong>${distance}米</p>
          </div>`,
          { width: 250, height: 100 }
        );
        map.openInfoWindow(infoWindow, facilityPoint);
        map.panTo(facilityPoint);
      }
    };

    drawWalkingRoute();

    // 监听地图点击事件，清除高亮
    const clearHighlight = () => {
      routeOverlaysRef.current.forEach(overlay => {
        try {
          map.removeOverlay(overlay);
        } catch (e) {
          // 忽略
        }
      });
      routeOverlaysRef.current = [];
      if (onFacilityClose) {
        onFacilityClose();
      }
    };

    map.addEventListener('click', clearHighlight);

    return () => {
      map.removeEventListener('click', clearHighlight);
    };
  }, [mapReady, center, selectedFacility, onFacilityClose, travelMode]);

  // 绘制路线图（Graph连线）
  useEffect(() => {
    if (!mapReady || !center || !showGraph) {
      // 清除路线覆盖物
      if (routeOverlaysRef.current.length > 0) {
        const map = mapInstanceRef.current;
        if (map) {
          routeOverlaysRef.current.forEach(overlay => {
            try {
              map.removeOverlay(overlay);
            } catch (e) {
              // 忽略
            }
          });
        }
        routeOverlaysRef.current = [];
      }
      return;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    const BMap = (window as any).BMap;

    // 获取路线数据
    const fetchAndDrawRoutes = async () => {
      try {
        // 获取8个方向的路线
        const directions = [0, 45, 90, 135, 180, 225, 270, 315];
        const radius = 0.015; // 约1.5km

        const routePromises = directions.map(async (angle) => {
          const rad = (angle * Math.PI) / 180;
          const destLng = center.lng + radius * Math.sin(rad);
          const destLat = center.lat + radius * Math.cos(rad);

          try {
            const response = await fetch(`${API_BASE_URL}/graph/route`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                origin_lng: center.lng,
                origin_lat: center.lat,
                dest_lng: destLng,
                dest_lat: destLat,
                travel_mode: travelMode
              })
            });

            if (response.ok) {
              const data = await response.json();
              return data.features || [];
            }
          } catch (e) {
            console.error('获取路线失败:', e);
          }
          return [];
        });

        const results = await Promise.all(routePromises);
        const allFeatures = results.flat();

        // 绘制路线
        // 生成贝塞尔曲线点（模拟道路曲线）
        const generateBezierPoints = (start: any, end: any, numPoints: number = 10) => {
          const points = [];
          // 计算控制点（添加一些随机偏移使曲线更自然）
          const midLng = (start.lng + end.lng) / 2;
          const midLat = (start.lat + end.lat) / 2;
          const dLng = end.lng - start.lng;
          const dLat = end.lat - start.lat;

          // 添加垂直于直线的偏移
          const offsetScale = 0.15;
          const controlLng = midLng + (-dLat * offsetScale);
          const controlLat = midLat + (dLng * offsetScale);

          for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const t2 = t * t;
            const mt = 1 - t;
            const mt2 = mt * mt;

            // 二次贝塞尔曲线公式
            const lng = mt2 * start.lng + 2 * mt * t * controlLng + t2 * end.lng;
            const lat = mt2 * start.lat + 2 * mt * t * controlLat + t2 * end.lat;

            points.push(new BMap.Point(lng, lat));
          }
          return points;
        };

        allFeatures.forEach((feature: any) => {
          const geometry = feature.geometry;
          const properties = feature.properties;

          if (geometry.type === 'LineString') {
            let points;

            // 如果只有2个点（直线），使用贝塞尔曲线生成平滑路径
            if (geometry.coordinates.length === 2) {
              const start = { lng: geometry.coordinates[0][0], lat: geometry.coordinates[0][1] };
              const end = { lng: geometry.coordinates[1][0], lat: geometry.coordinates[1][1] };
              points = generateBezierPoints(start, end, 15);
            } else {
              points = geometry.coordinates.map(
                (coord: number[]) => new BMap.Point(coord[0], coord[1])
              );
            }

            // 根据路况选择颜色
            let color = '#1890ff'; // 默认蓝色
            if (properties.traffic_status === '畅通') {
              color = '#52c41a'; // 绿色
            } else if (properties.traffic_status === '缓慢') {
              color = '#faad14'; // 橙色
            } else if (properties.traffic_status === '拥堵') {
              color = '#ff4d4f'; // 红色
            }

            const polyline = new BMap.Polyline(points, {
              strokeColor: color,
              strokeWeight: 3,
              strokeOpacity: 0.7,
              enableClicking: true
            });

            map.addOverlay(polyline);
            routeOverlaysRef.current.push(polyline);

            // 点击显示信息
            polyline.addEventListener('click', () => {
              const midIndex = Math.floor(points.length / 2);
              const midPoint = points[midIndex];

              const infoWindow = new BMap.InfoWindow(
                `<div style="padding: 10px; font-family: PingFang SC, Microsoft YaHei, sans-serif;">
                  <h4 style="margin: 0 0 8px 0; color: #1890ff;">路段信息</h4>
                  <p style="margin: 4px 0;"><strong>距离：</strong>${properties.distance_text || '未知'}</p>
                  <p style="margin: 4px 0;"><strong>时间：</strong>${properties.duration_text || '未知'}</p>
                  <p style="margin: 4px 0;"><strong>道路：</strong>${properties.road_name || '未知'}</p>
                </div>`,
                { width: 200, height: 100 }
              );

              map.openInfoWindow(infoWindow, midPoint);
            });
          }
        });
      } catch (err) {
        console.error('绘制路线失败:', err);
      }
    };

    fetchAndDrawRoutes();
  }, [mapReady, center, showGraph, travelMode]);

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
