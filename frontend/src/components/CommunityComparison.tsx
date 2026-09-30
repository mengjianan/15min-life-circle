import React, { useRef, useState } from 'react';
import { GroupedBarChart, MultiScoreRadar } from './ReportCharts';
import { HistoryEntry } from '../services/communityHistory';

// 最近三次体检对比：历史 3 条全量结果按六类维度横向比
// 口径：设施/时间维度跟随 5·10·15 切换（步行档），综合/方式/风水用全量口径

// 3 社区固定色（dataviz 分类槽 1-3，light 模式已过校验；按 id 绑定，删除不重排）
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a'];

const CATS = ['医疗', '教育', '购物', '养老', '文体', '餐饮', '交通'];
const DIMS = [
  ['设施覆盖', 'facility_coverage'],
  ['可达性', 'accessibility'],
  ['方式适配', 'mode_adaptability'],
  ['盲区', 'blind_spot'],
  ['风水', 'fengshui'],
] as const;
const MODES = [
  ['walking', '步行'],
  ['cycling', '骑行'],
  ['transit', '公交'],
  ['driving', '驾车'],
] as const;
const FS_ITEMS = [
  ['地形', 'terrain'],
  ['朝向', 'orientation'],
  ['水系', 'water'],
  ['道路形态', 'road_form'],
  ['敏感设施', 'sensitive_facilities'],
  ['绿化', 'greenery'],
  ['人气', 'popularity'],
] as const;
const SLOTS = [
  [300, '5分钟'],
  [600, '10分钟'],
  [900, '15分钟'],
] as const;

interface Props {
  entries: HistoryEntry[];
  onDelete: (id: string) => void;
  onLoadDemo: () => void;
}

// —— 取数（全部容错，坏数据降级为 0/未知，不让整块崩掉）——
const slotOf = (e: HistoryEntry, slot: number) =>
  (e.fullResult.modes?.walking?.time_slots as Record<string, any>)?.[String(slot)] || {};

const num = (v: any) => (typeof v === 'number' && !isNaN(v) ? v : 0);
const round1 = (v: number) => Math.round(v * 10) / 10;

const nearestOf = (e: HistoryEntry, slot: number, cat: string): { name: string; distance: number } | null => {
  const list: any[] = slotOf(e, slot).poi_coverage?.[cat]?.facilities || [];
  const best = list.reduce<null | { name: string; distance: number }>(
    (acc, f) => (f && f.distance != null && (!acc || f.distance < acc.distance) ? { name: f.name || '', distance: num(f.distance) } : acc),
    null
  );
  return best;
};

const countOf = (e: HistoryEntry, slot: number, cat: string) => num(slotOf(e, slot).poi_coverage?.[cat]?.count);

const gapOf = (e: HistoryEntry, slot: number, cat: string) => {
  const list: any[] = slotOf(e, slot).accessibility_blind_spots || [];
  const hit = list.find((g) => g && g.category === cat);
  return hit
    ? { count: num(hit.count), standard: num(hit.standard), deficit: num(hit.deficit) }
    : { count: countOf(e, slot, cat), standard: 0, deficit: 0 };
};

const modeScoreOf = (e: HistoryEntry, mode: string) => num(e.fullResult.modes?.[mode as 'walking']?.score?.total);

const catScoreOf = (e: HistoryEntry, slot: number, cat: string) => {
  const slotScore = slotOf(e, slot).score?.categories?.[cat];
  if (typeof slotScore === 'number') return slotScore;
  const modeScore = e.fullResult.modes?.walking?.score?.categories?.[cat];
  return typeof modeScore === 'number' ? modeScore : 0;
};

// 自动结论：规则拼句，覆盖综合/设施/方式/盲区四个口
function buildConclusions(entries: HistoryEntry[], slot: number): string[] {
  if (entries.length < 2) return [];
  const out: string[] = [];
  const total = (e: HistoryEntry) => num(e.fullResult.comprehensive_score?.total);
  const best = entries.reduce((a, b) => (total(b) > total(a) ? b : a));
  const worst = entries.reduce((a, b) => (total(b) < total(a) ? b : a));
  out.push(
    `综合来看${best.communityName}得分最高（${round1(total(best))}），${worst.communityName}暂列末位（${round1(total(worst))}）。`
  );

  const dimGap = DIMS.map(([label, key]) => {
    const vals = entries.map((e) => num((e.fullResult.comprehensive_score as any)?.[key]));
    return { label, gap: Math.max(...vals) - Math.min(...vals) };
  }).reduce((a, b) => (b.gap > a.gap ? b : a));
  out.push(`五维中差距最大的是${dimGap.label}（相差 ${round1(dimGap.gap)} 分）。`);

  const catGap = CATS.map((cat) => {
    const vals = entries.map((e) => countOf(e, slot, cat));
    return { cat, gap: Math.max(...vals) - Math.min(...vals) };
  }).reduce((a, b) => (b.gap > a.gap ? b : a));
  out.push(`设施差距最大的类别是${catGap.cat}（圈内数量相差 ${catGap.gap} 处）。`);

  const modeWeak = MODES.map(([m, label]) => {
    const vals = entries.map((e) => modeScoreOf(e, m));
    return { label, gap: Math.max(...vals) - Math.min(...vals), min: Math.min(...vals) };
  }).reduce((a, b) => (b.gap > a.gap ? b : a));
  out.push(`出行方式上${modeWeak.label}差异最明显（最低 ${round1(modeWeak.min)} 分）。`);

  const blind = entries
    .map((e) => ({ name: e.communityName, n: (slotOf(e, slot).blind_spots || []).length + (slotOf(e, slot).accessibility_blind_spots || []).length }))
    .sort((a, b) => b.n - a.n)[0];
  out.push(`${blind.name}的盲区数量最多（${blind.n} 处），是后续优化重点。`);
  return out;
}

const CommunityComparison: React.FC<Props> = ({ entries, onDelete, onLoadDemo }) => {
  const [slot, setSlot] = useState<number>(900);
  const [expanded, setExpanded] = useState(true);

  // 颜色按社区 id 绑定（不按列表下标）——删除一条时幸存者不换色
  const colorMap = useRef<Map<string, number>>(new Map());
  const colorOf = (id: string) => {
    const map = colorMap.current;
    if (!map.has(id)) {
      const used = new Set(map.values());
      const free = [0, 1, 2].find((i) => !used.has(i)) ?? 0;
      map.set(id, free);
    }
    return SERIES_COLORS[map.get(id)!];
  };
  const series = entries.map((e) => ({ key: e.communityName, color: colorOf(e.id) }));

  const slotLabel = SLOTS.find(([s]) => s === slot)?.[1] || '15分钟';
  const bar = (rows: { name: string; values: number[] }[], unit = '') => ({
    data: rows.map((r) => ({
      name: r.name,
      ...Object.fromEntries(entries.map((e, i) => [e.communityName, r.values[i]])),
    })),
    series,
    unit,
  });

  const conclusions = buildConclusions(entries, slot);

  return (
    <div className="compare-section">
      {/* 下拉条：与「15分钟生活圈体检报告」同款式（复用 report-dropdown 样式类） */}
      <div className="report-dropdown-bar" onClick={() => setExpanded(!expanded)}>
        <span className="report-dropdown-label">最近三次体检对比</span>
        <span className="report-toggle-btn">
          <span className="toggle-text">{expanded ? '收起对比' : '展开对比'}</span>
          <span className="toggle-arrow">{expanded ? '▲' : '▼'}</span>
        </span>
      </div>
      {expanded && (entries.length === 0 ? (
        <div className="compare-empty">
          <span>暂无体检历史，完成体检后自动记录；或</span>
          <button className="compare-demo-btn" onClick={onLoadDemo}>载入演示数据</button>
        </div>
      ) : (
        <>
      {/* ① 社区卡片行（纯展示 + 删除） */}
      <div className="compare-cards">
        {entries.map((e) => (
          <div key={e.id} className="compare-card" style={{ borderTopColor: colorOf(e.id) }}>
            <div className="compare-card-head">
              <span className="compare-card-dot" style={{ background: colorOf(e.id) }} />
              <span className="compare-card-name">{e.communityName}</span>
              <button className="compare-card-del" title="删除该记录" onClick={() => onDelete(e.id)}>
                ×
              </button>
            </div>
            <div className="compare-card-time">
              {new Date(e.savedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="compare-card-score">
              综合 <b>{round1(num(e.fullResult.comprehensive_score?.total))}</b>
              <span className="compare-card-level">{e.fullResult.comprehensive_score?.level || ''}</span>
            </div>
            <div className="compare-card-coord">
              ({e.lng.toFixed(4)}, {e.lat.toFixed(4)})
            </div>
          </div>
        ))}
        {entries.length < 3 && (
          <div className="compare-card compare-card-hint">
            再体检 {3 - entries.length} 个社区即可满配对比
            <button className="compare-demo-btn compare-demo-inline" onClick={onLoadDemo}>
              载入演示数据
            </button>
          </div>
        )}
      </div>

      {/* ② 时间口径切换 */}
      <div className="compare-slot-bar">
        <span className="compare-slot-label">时间口径</span>
        {SLOTS.map(([s, label]) => (
          <button
            key={s}
            className={`compare-slot-btn ${slot === s ? 'active' : ''}`}
            onClick={() => setSlot(s)}
          >
            {label}
          </button>
        ))}
        <span className="compare-slot-note">设施数量 / 缺口 / 时间维度随口径变化，综合与出行方式为全量口径</span>
      </div>

      {/* ③ 总览 */}
      <div className="compare-block">
        <h4 className="compare-block-title">总览</h4>
        <div className="compare-charts">
          <div className="compare-chart">
            <div className="compare-chart-title">综合评分</div>
            <GroupedBarChart
              {...bar([{ name: '综合评分', values: entries.map((e) => round1(num(e.fullResult.comprehensive_score?.total))) }], '分')}
              height={180}
            />
          </div>
          <div className="compare-chart">
            <div className="compare-chart-title">五维得分</div>
            <MultiScoreRadar
              data={DIMS.map(([label, key]) => ({
                name: label,
                ...Object.fromEntries(
                  entries.map((e) => [e.communityName, round1(num((e.fullResult.comprehensive_score as any)?.[key]))])
                ),
              }))}
              series={series}
            />
          </div>
        </div>
      </div>

      {/* ④ 设施对比 */}
      <div className="compare-block">
        <h4 className="compare-block-title">设施对比（{slotLabel}步行圈内）</h4>
        <div className="compare-charts">
          <div className="compare-chart">
            <div className="compare-chart-title">各类设施数量（处）</div>
            <GroupedBarChart
              {...bar(CATS.map((cat) => ({ name: cat, values: entries.map((e) => countOf(e, slot, cat)) })), '处')}
            />
          </div>
          <div className="compare-chart">
            <div className="compare-chart-title">各类设施得分</div>
            <GroupedBarChart
              {...bar(CATS.map((cat) => ({ name: cat, values: entries.map((e) => catScoreOf(e, slot, cat)) })), '分')}
            />
          </div>
        </div>
        <div className="compare-tables">
          <table className="compare-table">
            <thead>
              <tr>
                <th>最近设施</th>
                {entries.map((e) => (
                  <th key={e.id}>{e.communityName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATS.map((cat) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  {entries.map((e) => {
                    const n = nearestOf(e, slot, cat);
                    return (
                      <td key={e.id}>{n ? `${n.name} · ${n.distance}m` : '—'}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <table className="compare-table">
            <thead>
              <tr>
                <th>可达性缺口</th>
                {entries.map((e) => (
                  <th key={e.id}>{e.communityName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATS.map((cat) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  {entries.map((e) => {
                    const g = gapOf(e, slot, cat);
                    return (
                      <td key={e.id} className={g.deficit > 0 ? 'compare-gap-bad' : ''}>
                        {g.deficit > 0 ? `${g.count}/${g.standard} 缺${g.deficit}` : `${g.count}/${g.standard} 达标`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⑤ 时间维度 */}
      <div className="compare-block">
        <h4 className="compare-block-title">时间维度</h4>
        <div className="compare-charts">
          <div className="compare-chart">
            <div className="compare-chart-title">各时间档步行得分</div>
            <GroupedBarChart
              {...bar(
                SLOTS.map(([s, label]) => ({
                  name: label,
                  values: entries.map((e) => round1(num(slotOf(e, s).score?.total ?? e.fullResult.modes?.walking?.score?.total))),
                })),
                '分'
              )}
            />
          </div>
          <div className="compare-chart">
            <div className="compare-chart-title">各时间档等时圈面积（km²）</div>
            <GroupedBarChart
              {...bar(
                SLOTS.map(([s, label]) => ({
                  name: label,
                  values: entries.map((e) => round1(num(slotOf(e, s).area) / 1e6)),
                })),
                'km²'
              )}
            />
          </div>
        </div>
      </div>

      {/* ⑥ 出行方式 / 盲区 / 风水 */}
      <div className="compare-block">
        <h4 className="compare-block-title">出行方式 · 盲区 · 风水</h4>
        <div className="compare-charts">
          <div className="compare-chart">
            <div className="compare-chart-title">出行方式得分</div>
            <GroupedBarChart
              {...bar(
                MODES.map(([m, label]) => ({ name: label, values: entries.map((e) => round1(modeScoreOf(e, m))) })),
                '分'
              )}
            />
          </div>
          <div className="compare-chart">
            <div className="compare-chart-title">盲区数量（{slotLabel}步行圈）</div>
            <GroupedBarChart
              {...bar(
                [
                  {
                    name: '空间盲区',
                    values: entries.map((e) => (slotOf(e, slot).blind_spots || []).length),
                  },
                  {
                    name: '可达性盲区',
                    values: entries.map((e) => (slotOf(e, slot).accessibility_blind_spots || []).length),
                  },
                ],
                '处'
              )}
            />
          </div>
          <div className="compare-chart">
            <div className="compare-chart-title">风水七维得分</div>
            <GroupedBarChart
              {...bar(
                FS_ITEMS.map(([label, key]) => ({
                  name: label,
                  values: entries.map((e) => round1(num((e.fullResult.comprehensive_score as any)?.fengshui_detail?.[key]))),
                })),
                '分'
              )}
            />
          </div>
        </div>
      </div>

      {/* ⑦ 全维度总表 */}
      <div className="compare-block">
        <h4 className="compare-block-title">全维度总表</h4>
        <table className="compare-table compare-table-full">
          <thead>
            <tr>
              <th>指标</th>
              {entries.map((e) => (
                <th key={e.id}>{e.communityName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="compare-row-group">
              <td colSpan={entries.length + 1}>综合</td>
            </tr>
            <tr>
              <td>综合评分</td>
              {entries.map((e) => {
                const vals = entries.map((x) => num(x.fullResult.comprehensive_score?.total));
                const v = num(e.fullResult.comprehensive_score?.total);
                return (
                  <td key={e.id} className={v === Math.max(...vals) ? 'compare-best' : ''}>
                    {round1(v)}
                    {v === Math.max(...vals) ? ' ↑' : ''}
                  </td>
                );
              })}
            </tr>
            {DIMS.map(([label, key]) => (
              <tr key={key}>
                <td>{label}</td>
                {entries.map((e) => {
                  const vals = entries.map((x) => num((x.fullResult.comprehensive_score as any)?.[key]));
                  const v = num((e.fullResult.comprehensive_score as any)?.[key]);
                  return (
                    <td key={e.id} className={v === Math.max(...vals) ? 'compare-best' : ''}>
                      {round1(v)}
                      {v === Math.max(...vals) ? ' ↑' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="compare-row-group">
              <td colSpan={entries.length + 1}>设施（{slotLabel}）</td>
            </tr>
            {CATS.map((cat) => (
              <tr key={cat}>
                <td>{cat}数量/得分</td>
                {entries.map((e) => (
                  <td key={e.id}>
                    {countOf(e, slot, cat)}处 / {catScoreOf(e, slot, cat)}分
                  </td>
                ))}
              </tr>
            ))}
            <tr className="compare-row-group">
              <td colSpan={entries.length + 1}>时间 · 方式 · 盲区</td>
            </tr>
            {SLOTS.map(([s, label]) => (
              <tr key={s}>
                <td>{label}步行得分 / 面积</td>
                {entries.map((e) => (
                  <td key={e.id}>
                    {round1(num(slotOf(e, s).score?.total ?? e.fullResult.modes?.walking?.score?.total))}分 /{' '}
                    {round1(num(slotOf(e, s).area) / 1e6)}km²
                  </td>
                ))}
              </tr>
            ))}
            {MODES.map(([m, label]) => (
              <tr key={m}>
                <td>{label}得分</td>
                {entries.map((e) => (
                  <td key={e.id}>{round1(modeScoreOf(e, m))}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td>盲区数（空间/可达）</td>
              {entries.map((e) => (
                <td key={e.id}>
                  {(slotOf(e, slot).blind_spots || []).length} / {(slotOf(e, slot).accessibility_blind_spots || []).length}
                </td>
              ))}
            </tr>
            <tr>
              <td>盲区处罚分</td>
              {entries.map((e) => (
                <td key={e.id}>{round1(num(e.fullResult.modes?.walking?.score?.blind_spot_penalty))}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ⑧ 自动结论 */}
      {conclusions.length > 0 && (
        <div className="compare-block">
          <h4 className="compare-block-title">对比结论</h4>
          <ul className="compare-conclusions">
            {conclusions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
        </>
      ))}
    </div>
  );
};

export default CommunityComparison;
