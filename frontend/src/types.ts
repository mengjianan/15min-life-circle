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

// 出行方式类型
export type TravelMode = 'walking' | 'cycling' | 'transit' | 'driving';

// 出行方式配置
export interface TravelModeConfig {
  mode: TravelMode;
  name: string;
  speed: number;  // m/s
  icon: string;
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

// 空间盲区：等时圈内连续的设施空白地带（有坐标，画在地图上）
export interface BlindSpot {
  center: GeoPoint;
  radius: number;
  category: string;
  description: string;
}

// 可达性盲区：该出行方式能到达的设施数量未达15分钟生活圈标准（按类别，无坐标）
// 报告正文展示的是这个口径 —— 它能直接体现出行方式差异
export interface AccessibilityBlindSpot {
  type: 'accessibility';
  category: string;
  count: number;      // 实际能到达的数量
  standard: number;   // 推荐标准数量
  deficit: number;    // 缺口
  weight?: number;
  description: string;
  suggestion: string;
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

// 单个出行方式的分析数据
export interface TravelModeData {
  mode: TravelMode;
  mode_name: string;
  speed: number;
  score: ScoreData;
  time_slots: {
    300: TimeSlotData;
    600: TimeSlotData;
    900: TimeSlotData;
  };
  suggestions: Suggestion[];
}

// 中心 -> 设施的真实路线（由 POST /api/graph/facility-routes 按出行方式提供）
// 不再塞进 full-analysis：directionlite 必须串行限速，全量预取会拖慢体检 30 秒以上
export interface FacilityRoute {
  facility_name: string;
  category: string;
  location: GeoPoint;
  route: {
    distance: number;
    duration: number;
    steps: Array<{
      path: string;              // "lng,lat;lng,lat;..."
      distance?: number;
      duration?: number;
      instruction?: string;
    }>;
  };
}

// 时段数据
export interface TimeSlotData {
  time: number;
  area: number;
  boundary_points: GeoPoint[];
  polygon: any;
  poi_coverage: POICoverage;
  blind_spots: BlindSpot[];
  accessibility_blind_spots?: AccessibilityBlindSpot[];
}

// 面积对比数据
export interface AreaComparison {
  mode: string;
  mode_name: string;
  time_5: number;
  time_10: number;
  time_15: number;
}

// 完整体检结果
export interface FullAnalysisResult {
  community_name: string;
  center: GeoPoint;
  timestamp: number;
  modes: {
    walking: TravelModeData;
    cycling: TravelModeData;
    transit: TravelModeData;
    driving: TravelModeData;
  };
  comparison: AreaComparison[];
  fengshui?: {
    terrain: {
      score: number;
      terrain_type?: string;
      elevation?: number;
      slope?: number;
      description?: string;
      terrain_features?: Array<{
        name: string;
        location: GeoPoint;
        distance: number;
        type: string;
      }>;
    };
    water: {
      score: number;
      has_water?: boolean;
      distance?: number;
      description?: string;
      water_features?: Array<{
        name: string;
        location: GeoPoint;
        distance: number;
        type: string;
      }>;
    };
    environment: {
      score: number;
      description?: string;
    };
    orientation: {
      score: number;
      facing_direction?: string;
      description?: string;
    };
    greenery: {
      score: number;
      has_greenery?: boolean;
      count?: number;
      description?: string;
      greenery_features?: Array<{
        name: string;
        location: GeoPoint;
        distance: number;
        type: string;
      }>;
    };
  };
  comprehensive_score?: {
    facility_coverage: number;
    accessibility: number;
    mode_adaptability: number;
    blind_spot: number;
    fengshui: number;
    total: number;
    level: string;
    fengshui_detail: {
      terrain: number;
      orientation: number;
      water: number;
      road_form: number;
      sensitive_facilities: number;
      greenery: number;
      popularity: number;
      total: number;
      level: string;
    };
  };
  report?: any;
}

// 分析报告（单出行方式，保持兼容）
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
