// 前端配置

// 百度地图配置
export const BAIDU_MAP_AK = '2bYD1EE33okcac0OpFT7ojWmTYXPKCCs';

// API基础路径：
// - Docker/本地一键起 = 同源 /api（vite dev 与 nginx 均已代理）
// - GitHub Pages 展示版（*.github.io）没有后端，回落到直连后端——
//   历史上 Pages 就是这么通的（见 git: 357edb4→9fed810），IP 变更时同步这里
export const API_BASE_URL = typeof location !== 'undefined' && location.hostname.endsWith('.github.io')
  ? 'http://100.126.142.87:8081/api'
  : '/api';

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

// 自定义选点密码：防止开源部署后任意坐标刷地图 API 配额（会话内通过一次即可）
// 部署方可在 config.ts 自行改；预设四社区不限制
export const CUSTOM_POINT_PASSWORD = '15min2026';

// 预设社区内置体检快照（frontend/public/snapshots/，构建后随静态资源分发），
// 地图 API 调用失败时前端降级展示，四个街道始终有内容
export const PRESET_SNAPSHOT_PATHS: Record<string, string> = {
  鼓楼区湖南路街道: 'snapshots/hunanlu.json',
  鼓楼区中央门街道: 'snapshots/zhongyangmen.json',
  玄武区新街口街道: 'snapshots/xinjiekou.json',
  秦淮区夫子庙街道: 'snapshots/fuzimiao.json',
};

// POI分类配置
export const POI_CATEGORIES: Record<string, string[]> = {
  '医疗': ['诊所', '药店', '医院'],
  '教育': ['小学', '幼儿园', '培训机构'],
  '购物': ['菜市场', '超市', '便利店', '商场'],
  '养老': ['养老院', '老年活动中心'],
  '文体': ['公园', '图书馆', '体育场馆', '景点'],
  '餐饮': ['餐厅', '早餐店'],
  '交通': ['地铁站', '公交站'],
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
  '交通': 'bus',
};
