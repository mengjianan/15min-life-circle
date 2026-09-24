// 通用SVG图标配置 - 替换所有emoji
import React from 'react';

// ---------- 通用图标（emoji -> SVG） ----------
// 每个图标只描述几何形状，JSX 与纯 HTML 字符串（infoWindow / PDF）共用同一份数据
export type IconShape =
  | { t: 'path'; d: string }
  | { t: 'circle'; cx: number; cy: number; r: number }
  | { t: 'rect'; x: number; y: number; width: number; height: number; rx?: number }
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { t: 'polyline'; points: string }
  | { t: 'polygon'; points: string };

const WAVE = 'M2 8q2-3 4 0t4 0t4 0t4 0t4 0';

export const ICONS: Record<string, IconShape[]> = {
  walk: [
    { t: 'circle', cx: 12, cy: 4, r: 2 },
    { t: 'path', d: 'M12 6v6' },
    { t: 'path', d: 'M12 8l-3 2' },
    { t: 'path', d: 'M12 8l3 2' },
    { t: 'path', d: 'M12 12l-2.5 4.5L8 21' },
    { t: 'path', d: 'M12 12l2.5 4.5L17 21' },
  ],
  bike: [
    { t: 'circle', cx: 5.5, cy: 17.5, r: 3.5 },
    { t: 'circle', cx: 18.5, cy: 17.5, r: 3.5 },
    { t: 'circle', cx: 15, cy: 5, r: 1.5 },
    { t: 'path', d: 'M12 17.5V14l-3-3 4-3 2 3h3' },
  ],
  bus: [
    { t: 'rect', x: 3, y: 3, width: 18, height: 14, rx: 2 },
    { t: 'line', x1: 3, y1: 10, x2: 21, y2: 10 },
    { t: 'circle', cx: 7, cy: 20, r: 1.5 },
    { t: 'circle', cx: 17, cy: 20, r: 1.5 },
    { t: 'line', x1: 7, y1: 17, x2: 7, y2: 18.5 },
    { t: 'line', x1: 17, y1: 17, x2: 17, y2: 18.5 },
  ],
  car: [
    { t: 'rect', x: 3, y: 10, width: 18, height: 6, rx: 2 },
    { t: 'path', d: 'M6 10l1.6-4.2A2 2 0 0 1 9.5 4.5h5a2 2 0 0 1 1.9 1.3L18 10' },
    { t: 'circle', cx: 7.5, cy: 17.5, r: 2 },
    { t: 'circle', cx: 16.5, cy: 17.5, r: 2 },
  ],
  search: [
    { t: 'circle', cx: 11, cy: 11, r: 8 },
    { t: 'path', d: 'M21 21l-4.35-4.35' },
  ],
  check: [
    { t: 'path', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
    { t: 'polyline', points: '22 4 12 14.01 9 11.01' },
  ],
  info: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'line', x1: 12, y1: 16, x2: 12, y2: 12 },
    { t: 'line', x1: 12, y1: 8, x2: 12.01, y2: 8 },
  ],
  warning: [
    { t: 'path', d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
    { t: 'line', x1: 12, y1: 9, x2: 12, y2: 13 },
    { t: 'line', x1: 12, y1: 17, x2: 12.01, y2: 17 },
  ],
  clipboard: [
    { t: 'path', d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' },
    { t: 'rect', x: 8, y: 2, width: 8, height: 4, rx: 1 },
  ],
  trophy: [
    { t: 'circle', cx: 12, cy: 8, r: 7 },
    { t: 'polyline', points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' },
  ],
  rocket: [{ t: 'polygon', points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }],
  waves: [
    { t: 'path', d: WAVE },
    { t: 'path', d: WAVE.replace(/M2 8/g, 'M2 13') },
    { t: 'path', d: WAVE.replace(/M2 8/g, 'M2 18') },
  ],
  target: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'circle', cx: 12, cy: 12, r: 6 },
    { t: 'circle', cx: 12, cy: 12, r: 2 },
  ],
  chart: [
    { t: 'line', x1: 18, y1: 20, x2: 18, y2: 10 },
    { t: 'line', x1: 12, y1: 20, x2: 12, y2: 4 },
    { t: 'line', x1: 6, y1: 20, x2: 6, y2: 14 },
  ],
  trend: [
    { t: 'polyline', points: '23 6 13.5 15.5 8.5 10.5 1 18' },
    { t: 'polyline', points: '17 6 23 6 23 12' },
  ],
  mountain: [{ t: 'path', d: 'M2 20l6.5-11 4 6.5 2.5-3.5L21 20z' }],
  compass: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'polygon', points: '16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' },
  ],
  droplet: [{ t: 'path', d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' }],
  road: [
    { t: 'path', d: 'M4 21L8 3' },
    { t: 'path', d: 'M20 21L16 3' },
    { t: 'path', d: 'M12 4v3M12 11v3M12 18v3' },
  ],
  tree: [
    { t: 'path', d: 'M12 3l4.5 7h-3L18 16H6l4.5-6h-3z' },
    { t: 'path', d: 'M12 16v5' },
  ],
  users: [
    { t: 'path', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { t: 'circle', cx: 9, cy: 7, r: 4 },
    { t: 'path', d: 'M23 21v-2a4 4 0 0 0-3-3.87' },
    { t: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  building: [
    { t: 'rect', x: 4, y: 3, width: 16, height: 18, rx: 1 },
    { t: 'path', d: 'M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2' },
    { t: 'path', d: 'M10 21v-3h4v3' },
  ],
  pin: [
    { t: 'circle', cx: 12, cy: 10, r: 3 },
    { t: 'path', d: 'M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z' },
  ],
  book: [
    { t: 'path', d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' },
    { t: 'path', d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
  ],
  hospital: [{ t: 'path', d: 'M22 12h-4l-3 9L9 3l-3 9H2' }],
  cart: [
    { t: 'circle', cx: 9, cy: 21, r: 1 },
    { t: 'circle', cx: 20, cy: 21, r: 1 },
    { t: 'path', d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' },
  ],
  elder: [
    { t: 'path', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
    { t: 'circle', cx: 12, cy: 7, r: 4 },
  ],
  star: [
    { t: 'polygon', points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' },
  ],
  utensils: [
    { t: 'path', d: 'M6 3v6a3 3 0 0 0 3 3v9' },
    { t: 'path', d: 'M9 3v6' },
    { t: 'path', d: 'M17 3c-1.7 1.7-2.5 3.5-2.5 6S15.3 13 17 13v8' },
  ],
  school: [
    { t: 'path', d: 'M22 10L12 5 2 10l10 5z' },
    { t: 'path', d: 'M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5' },
  ],
  ruler: [
    { t: 'polyline', points: '15 3 21 3 21 9' },
    { t: 'polyline', points: '9 21 3 21 3 15' },
    { t: 'line', x1: 21, y1: 3, x2: 14, y2: 10 },
    { t: 'line', x1: 3, y1: 21, x2: 10, y2: 14 },
  ],
  clock: [
    { t: 'circle', cx: 12, cy: 12, r: 10 },
    { t: 'polyline', points: '12 6 12 12 16 14' },
  ],
  crystal: [
    { t: 'circle', cx: 11, cy: 13, r: 7 },
    { t: 'path', d: 'M18 4l1.2 2.3L21.5 7.5l-2.3 1.2L18 11l-1.2-2.3L14.5 7.5l2.3-1.2z' },
  ],
  edit: [
    { t: 'path', d: 'M12 20h9' },
    { t: 'path', d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z' },
  ],
  bulb: [
    { t: 'path', d: 'M9 18h6' },
    { t: 'path', d: 'M10 22h4' },
    { t: 'path', d: 'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z' },
  ],
};

const SVG_BASE = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

function attrsOf(shape: IconShape): string {
  return Object.entries(shape as unknown as Record<string, unknown>)
    .filter(([k, v]) => k !== 't' && v !== undefined)
    .map(([k, v]) => `${k}="${String(v)}"`)
    .join(' ');
}

/** 生成内联 SVG 字符串，供 infoWindow / PDF 等非 JSX 场景使用 */
export function iconSvg(name: string, size: number | string = 14): string {
  const shapes = ICONS[name] || ICONS.pin;
  const body = shapes.map((s) => `<${s.t} ${attrsOf(s)}></${s.t}>`).join('');
  return `<svg ${SVG_BASE} width="${size}" height="${size}" class="ico" aria-hidden="true" style="vertical-align:-0.15em">${body}</svg>`;
}

/** JSX 图标组件：`<Ico n="chart" />` */
export const Ico: React.FC<{ n: string; s?: number | string; className?: string }> = ({ n, s = '1em', className }) => {
  const shapes = ICONS[n] || ICONS.pin;
  return (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes.map((shape, i) => {
        const rec = shape as unknown as Record<string, unknown>;
        const type = String(rec.t);
        const props: Record<string, unknown> = { key: i };
        Object.keys(rec).forEach((k) => {
          if (k !== 't' && rec[k] !== undefined) props[k] = rec[k];
        });
        return React.createElement(type as never, props as never);
      })}
    </svg>
  );
};

// 设施图标组件
export const FacilityIcons: Record<string, React.FC<{ size?: number }>> = {
  '医疗': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
  ),
  '教育': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  ),
  '购物': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  '养老': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  '文体': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  '餐饮': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  ),
  '综合': ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
  ),
};

// 功能图标组件
export const FeatureIcons = {
  Score: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
  ),
  Area: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  ),
  Facility: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  BlindSpot: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Chart: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Time: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  Location: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"></circle>
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
    </svg>
  ),
  Compare: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Warning: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  Report: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Suggestion: ({ size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
};

// 获取设施图标颜色
export const getFacilityColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    '医疗': '#ef4444',
    '教育': '#3b82f6',
    '购物': '#22c55e',
    '养老': '#8b5cf6',
    '文体': '#06b6d4',
    '餐饮': '#f59e0b',
    '综合': '#6b7280',
  };
  return colorMap[category] || '#6b7280';
};

// 获取设施图标背景色
export const getFacilityBgColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    '医疗': '#fef2f2',
    '教育': '#eff6ff',
    '购物': '#f0fdf4',
    '养老': '#f5f3ff',
    '文体': '#ecfeff',
    '餐饮': '#fffbeb',
    '综合': '#f9fafb',
  };
  return colorMap[category] || '#f9fafb';
};
