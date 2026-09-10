/**
 * 前端类型定义
 */

// 地理坐标点
export interface GeoPoint {
  lng: number;
  lat: number;
}

// 社区信息
export interface Community extends GeoPoint {
  name: string;
}

// 等时圈数据
export interface IsochroneData {
  polygon: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: Record<string, any>;
  };
  boundary_points: GeoPoint[];
  area: number;
  max_time: number;
}

// 多时间维度等时圈数据
export interface MultiTimeData {
  center: GeoPoint;
  layers: IsochroneLayer[];
  selected_time: number;
}

export interface IsochroneLayer {
  time: number;
  time_text: string;
  boundary_points: GeoPoint[];
  polygon: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: Record<string, any>;
  };
  area: number;
}

// POI数据
export interface POIItem {
  name: string;
  address?: string;
  location: GeoPoint;
  type?: string;
  tag?: string;
  distance?: number;
  category: string;
}

export interface POICategoryData {
  count: number;
  level: '充足' | '一般' | '较少' | '匮乏';
  facilities: POIItem[];
}

export interface POICoverage {
  [category: string]: POICategoryData;
}

// 盲区数据
export interface BlindSpot {
  center: GeoPoint;
  radius: number;
  category: string;
  description: string;
}

// 评分数据
export interface ScoreData {
  total: number;
  level: '优秀' | '良好' | '一般' | '需改善';
  categories: Record<string, number>;
  blind_spot_penalty: number;
}

// 改善建议
export interface Suggestion {
  category: string;
  priority: '高' | '中' | '低';
  message: string;
}

// 分析报告
export interface AnalysisResult {
  community_name: string;
  center: GeoPoint;
  isochrone: IsochroneData;
  poi_coverage: POICoverage;
  blind_spots: BlindSpot[];
  score: ScoreData;
  suggestions: Suggestion[];
}

// 路线数据
export interface RouteFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
  properties: {
    distance: number;
    duration: number;
    road_name: string;
    distance_text: string;
    duration_text: string;
  };
}

export interface RouteData {
  type: 'FeatureCollection';
  features: RouteFeature[];
  node_count: number;
  edge_count: number;
  total_distance: number;
  total_duration: number;
}

// Graph图数据
export interface GraphData {
  type: 'FeatureCollection';
  features: RouteFeature[];
  isochrone?: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: Record<string, any>;
  };
  node_count: number;
  edge_count: number;
}

// API响应
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 分析历史
export interface AnalysisHistoryItem {
  community_name: string;
  center: GeoPoint;
  score: ScoreData;
  created_at: string;
}

// 图层控制
export interface LayerVisibility {
  graph: boolean;
  poi: boolean;
  blindSpots: boolean;
  heatmap: boolean;
}

// 时间维度
export type TimeDimension = 5 | 10 | 15;

// 设施类别
export type FacilityCategory = '医疗' | '教育' | '购物' | '养老' | '文体' | '餐饮';

// 设施图标配置
export interface FacilityIconConfig {
  emoji: string;
  color: string;
}

// 地图配置
export interface MapConfig {
  center: GeoPoint;
  zoom: number;
  enableScrollWheelZoom: boolean;
}

// 百度地图API响应
export interface BaiduMapResponse {
  status: number;
  result?: any;
  message?: string;
}

// 步行路线响应
export interface WalkingRouteResponse extends BaiduMapResponse {
  result?: {
    routes: Array<{
      distance: { value: number; text: string };
      duration: { value: number; text: string };
      steps: Array<{
        instruction: string;
        path: string;
        distance: { value: number; text: string };
        duration: { value: number; text: string };
      }>;
    }>;
  };
}

// POI搜索响应
export interface POISearchResponse extends BaiduMapResponse {
  result?: Array<{
    name: string;
    address: string;
    location: { lng: number; lat: number };
    detail_info?: {
      type: string;
      tag: string;
      distance: number;
    };
  }>;
}

// 地理编码响应
export interface GeocodeResponse extends BaiduMapResponse {
  result?: {
    location: GeoPoint;
    formatted_address: string;
  };
}
