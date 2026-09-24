// 前端配置

// 百度地图配置
export const BAIDU_MAP_AK = '2bYD1EE33okcac0OpFT7ojWmTYXPKCCs';

// API基础路径 - 指向实际运行的后端服务
export const API_BASE_URL = 'http://100.126.142.87:8081/api';

// 社区坐标接口
export interface Community {
  lng: number;
  lat: number;
  name: string;
}

// 示例社区坐标（南京市）
export const SAMPLE_COMMUNITIES: Community[] = [
  { lng: 118.7784, lat: 32.0663, name: '鼓楼区湖南路街道' },
  { lng: 118.7854, lat: 32.0553, name: '鼓楼区中央门街道' },
  { lng: 118.8034, lat: 32.0683, name: '玄武区新街口街道' },
  { lng: 118.7894, lat: 32.0433, name: '秦淮区夫子庙街道' },
];

// POI分类配置
export const POI_CATEGORIES: Record<string, string[]> = {
  '医疗': ['诊所', '药店', '医院'],
  '教育': ['小学', '幼儿园', '培训机构'],
  '购物': ['菜市场', '超市', '便利店'],
  '养老': ['养老院', '老年活动中心'],
  '文体': ['公园', '图书馆', '体育场馆'],
  '餐饮': ['餐厅', '早餐店'],
};

// 等时圈配置
export const ISOCHRONE_CONFIG = {
  maxTime: 900,  // 15分钟（秒）
  directions: 36,  // 采样方向数
};

// 图表颜色配置
export const CHART_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
};

// 设施图标配置
export const FACILITY_ICONS: Record<string, string> = {
  '医疗': 'hospital',
  '教育': 'school',
  '购物': 'cart',
  '养老': 'elder',
  '文体': 'walk',
  '餐饮': 'utensils',
};
