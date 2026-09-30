// 内置演示数据：3 个社区的合成体检结果，断网/未跑后端时一键填充对比区
// 只填对比区读取的字段（评分/设施/时间档/方式/盲区/风水），等时圈几何用不上就留空
import { FullAnalysisResult, POICoverage, TimeSlotData } from '../types';

const CATS = ['医疗', '教育', '购物', '养老', '文体', '餐饮', '交通'] as const;

const CAT_BASE: Record<string, number> = {
  医疗: 12, 教育: 15, 购物: 22, 养老: 6, 文体: 10, 餐饮: 30, 交通: 18,
};

const levelOf = (count: number) =>
  count >= 15 ? '充足' : count >= 8 ? '一般' : count >= 4 ? '较少' : '匮乏';

function demoCoverage(scale: number, timeFactor: number, name: string): POICoverage {
  const out: POICoverage = {};
  for (const cat of CATS) {
    const count = Math.max(1, Math.round(CAT_BASE[cat] * scale * timeFactor));
    out[cat] = {
      count,
      level: levelOf(count) as any,
      facilities: [
        {
          name: `${name}${cat}代表点`,
          category: cat,
          location: { lng: 118.78, lat: 32.06 },
          distance: Math.round(200 + Math.random() * 800),
        },
      ],
    };
  }
  return out;
}

function demoSlot(scale: number, timeFactor: number, baseScore: number, name: string, slot: number): TimeSlotData {
  const coverage = demoCoverage(scale, timeFactor, name);
  const categories: Record<string, number> = {};
  CATS.forEach((c) => {
    categories[c] = Math.min(100, Math.round(40 + coverage[c].count * 1.5));
  });
  return {
    time: slot,
    area: Math.round(1.2e6 * timeFactor * scale),
    boundary_points: [],
    polygon: null,
    poi_coverage: coverage,
    blind_spots: scale > 0.9 ? [] : [{ center: { lng: 118.78, lat: 32.06 }, radius: 200, category: '医疗', description: '演示盲区' }],
    accessibility_blind_spots: CATS.filter((c) => coverage[c].count < 8).map((c) => ({
      type: 'accessibility' as const,
      category: c,
      count: coverage[c].count,
      standard: 8,
      deficit: 8 - coverage[c].count,
      description: `${c}可达数量未达标`,
      suggestion: `建议增加${c}设施`,
    })),
    score: { total: baseScore, level: baseScore >= 80 ? '良好' : '一般', categories, blind_spot_penalty: scale > 0.9 ? 0 : 3 },
  };
}

function demoResult(name: string, lng: number, lat: number, scale: number, offset: number, daysAgo: number): FullAnalysisResult {
  const total = Math.round((72 + scale * 15 + offset) * 10) / 10;
  const dims = {
    facility_coverage: Math.round(60 + scale * 30 + offset),
    accessibility: Math.round(55 + scale * 32 + offset),
    mode_adaptability: Math.round(58 + scale * 28 + offset),
    blind_spot: Math.round(70 + scale * 20 - offset),
    fengshui: Math.round(65 + scale * 22 + offset / 2),
    total,
    level: total >= 80 ? '良好' : '一般',
    fengshui_detail: {
      terrain: Math.round(60 + scale * 25),
      orientation: Math.round(55 + scale * 30),
      water: Math.round(50 + scale * 35),
      road_form: Math.round(62 + scale * 22),
      sensitive_facilities: Math.round(58 + scale * 26),
      greenery: Math.round(55 + scale * 28),
      popularity: Math.round(65 + scale * 25),
      total: Math.round(60 + scale * 27),
      level: '良好',
    },
  };
  const modeScore = (m: number) => ({
    total: Math.round((62 + scale * 22 + offset + m) * 10) / 10,
    level: '良好' as const,
    categories: {},
    blind_spot_penalty: scale > 0.9 ? 0 : 2,
  });
  const timestamp = Date.now() - daysAgo * 86400e3;
  return {
    community_name: name,
    center: { lng, lat },
    timestamp,
    modes: {
      walking: { mode: 'walking', mode_name: '步行', speed: 5, score: modeScore(0), time_slots: { 300: demoSlot(scale, 0.45, 70 + offset, name, 300), 600: demoSlot(scale, 0.7, 75 + offset, name, 600), 900: demoSlot(scale, 1, 80 + offset, name, 900) }, suggestions: [] },
      cycling: { mode: 'cycling', mode_name: '骑行', speed: 15, score: modeScore(3), time_slots: { 300: demoSlot(scale, 0.6, 72 + offset, name, 300), 600: demoSlot(scale, 0.85, 78 + offset, name, 600), 900: demoSlot(scale, 1.2, 82 + offset, name, 900) }, suggestions: [] },
      transit: { mode: 'transit', mode_name: '公交', speed: 20, score: modeScore(2), time_slots: { 300: demoSlot(scale, 0.55, 71 + offset, name, 300), 600: demoSlot(scale, 0.8, 76 + offset, name, 600), 900: demoSlot(scale, 1.1, 81 + offset, name, 900) }, suggestions: [] },
      driving: { mode: 'driving', mode_name: '驾车', speed: 30, score: modeScore(1), time_slots: { 300: demoSlot(scale, 0.75, 74 + offset, name, 300), 600: demoSlot(scale, 1, 80 + offset, name, 600), 900: demoSlot(scale, 1.35, 84 + offset, name, 900) }, suggestions: [] },
    },
    comparison: [
      { mode: 'walking', mode_name: '步行', time_5: Math.round(1.2e6 * 0.45 * scale), time_10: Math.round(1.2e6 * 0.7 * scale), time_15: Math.round(1.2e6 * scale) },
      { mode: 'cycling', mode_name: '骑行', time_5: Math.round(1.2e6 * 0.6 * scale), time_10: Math.round(1.2e6 * 0.85 * scale), time_15: Math.round(1.2e6 * 1.2 * scale) },
      { mode: 'transit', mode_name: '公交', time_5: Math.round(1.2e6 * 0.55 * scale), time_10: Math.round(1.2e6 * 0.8 * scale), time_15: Math.round(1.2e6 * 1.1 * scale) },
      { mode: 'driving', mode_name: '驾车', time_5: Math.round(1.2e6 * 0.75 * scale), time_10: Math.round(1.2e6 * scale), time_15: Math.round(1.2e6 * 1.35 * scale) },
    ],
    comprehensive_score: dims,
    report: undefined,
  } as FullAnalysisResult;
}

export const DEMO_RESULTS: FullAnalysisResult[] = [
  demoResult('鼓楼区湖南路街道', 118.7784, 32.0663, 1.0, 2, 0),
  demoResult('玄武区新街口街道', 118.8034, 32.0683, 0.92, 0, 1),
  demoResult('秦淮区夫子庙街道', 118.7894, 32.0433, 0.8, -3, 2),
];
