import React from 'react';
import { Ico } from '../icons';
import FengShuiRadar from './FengShuiRadar';
import { GroupedBarChart, ScoreRadar } from './ReportCharts';

interface ComprehensiveReportProps {
  report: any;
  communityName: string;
  fullResult?: any; // 完整体检响应：四维综合分、各档得分、最近设施等从这里派生
}

const SLOT_SERIES = [
  { key: '5分钟', color: '#52c41a' },
  { key: '10分钟', color: '#faad14' },
  { key: '15分钟', color: '#1890ff' },
];

const ComprehensiveReport: React.FC<ComprehensiveReportProps> = ({
  report,
  communityName,
  fullResult
}) => {
  if (!report) {
    return <div className="report-container">暂无报告数据</div>;
  }

  const { meta, conclusion, facility_stats, mode_comparisons, blind_spots, accessibility_blind_spots, fengshui, suggestions, technical_notes } = report;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '达标': return '#52c41a';
      case '不足': return '#faad14';
      case '严重不足': return '#ff4d4f';
      default: return '#666';
    }
  };

  // —— 从 fullResult 派生图表数据（老响应缺字段时静默降级） ——
  const compScore = fullResult?.comprehensive_score || {};
  const modesData: Record<string, any> = fullResult?.modes || {};

  // ① 综合五维雷达
  const fiveDim = [
    { name: '设施覆盖', value: compScore.facility_coverage ?? 0 },
    { name: '可达性', value: compScore.accessibility ?? 0 },
    { name: '出行适配', value: compScore.mode_adaptability ?? 0 },
    { name: '盲区识别', value: compScore.blind_spot ?? 0 },
    { name: '风水评分', value: compScore.fengshui ?? 0 },
  ];

  // ② 各出行方式 × 各时间档得分（per-slot score，老响应回落 15 分钟档=模式分）
  const modeOrder = ['walking', 'cycling', 'transit', 'driving'];
  const modeNames: Record<string, string> = { walking: '步行', cycling: '骑行', transit: '公共交通', driving: '驾车' };
  const slotScore = (m: string, key: string) =>
    modesData[m]?.time_slots?.[key]?.score?.total ?? modesData[m]?.score?.total ?? 0;
  const modeScoreData = modeOrder.map((m) => ({
    name: modeNames[m],
    '5分钟': slotScore(m, '300'),
    '10分钟': slotScore(m, '600'),
    '15分钟': slotScore(m, '900'),
  }));

  // ③ 各出行方式等时圈面积（km²）
  const modeAreaData = modeOrder.map((m) => {
    const slots = modesData[m]?.time_slots || {};
    const km2 = (k: string) => Math.round(((slots[k]?.area || 0) / 1000000) * 100) / 100;
    return { name: modeNames[m], '5分钟': km2('300'), '10分钟': km2('600'), '15分钟': km2('900') };
  });

  // ④ 设施覆盖分组条形（来自报告统计表）
  const facilityBarData = (facility_stats || []).map((s: any) => ({
    name: s.category,
    '5分钟': s.count_5min,
    '10分钟': s.count_10min,
    '15分钟': s.count_15min,
  }));

  // ⑤ 最近设施速查：步行 15 分钟档覆盖数据里每类取最近 2 个
  const walkingCov: Record<string, any> = modesData.walking?.time_slots?.['900']?.poi_coverage || {};
  const nearestList = Object.entries(walkingCov)
    .map(([cat, data]: [string, any]) => {
      const facs = [...(data.facilities || [])]
        .sort((a: any, b: any) => (a.distance || 99999) - (b.distance || 99999))
        .slice(0, 2);
      return { cat, facs };
    })
    .filter((r) => r.facs.length > 0);

  return (
    <div className="comprehensive-report">
      <div className="cr-pages">

        {/* ================= 左页 · 现状与评价 ================= */}
        <div className="cr-page">
          {/* ① 页眉 */}
          <header className="cr-header">
            <h1><Ico n="building" /> 15分钟生活圈智能体检报告</h1>
            <div className="cr-meta">
              <span><b>社区：</b>{meta?.community_name || communityName}</span>
              <span><b>坐标：</b>({meta?.center?.lng?.toFixed(4)}, {meta?.center?.lat?.toFixed(4)})</span>
              <span><b>分析时间：</b>{meta?.analysis_time}</span>
              <span><b>数据来源：</b>{meta?.data_source}</span>
            </div>
          </header>

          {/* ② 核心结论 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="clipboard" /> 核心结论</h2>
            <div className="cr-stat-grid">
              <div className="cr-stat-card">
                <div className="cr-stat-label">整体水平</div>
                <div className="cr-stat-big" style={{ color: getScoreColor(conclusion?.overall_score) }}>
                  {conclusion?.overall_score}<i>分</i>
                </div>
                <div className="cr-stat-sub">{conclusion?.overall_level}</div>
              </div>
              <div className="cr-stat-card">
                <div className="cr-stat-label">最佳出行方式</div>
                <div className="cr-stat-mid">{conclusion?.best_mode}</div>
                <div className="cr-stat-sub">{conclusion?.best_mode_score} 分</div>
              </div>
              <div className="cr-stat-card">
                <div className="cr-stat-label">可达性盲区</div>
                <div className="cr-stat-mid">{conclusion?.blind_spot_count}<i> 个</i></div>
                <div className="cr-stat-sub">未达推荐标准的类别</div>
              </div>
              <div className="cr-stat-card">
                <div className="cr-stat-label">风水/居住适宜性</div>
                <div className="cr-stat-mid">{conclusion?.fengshui_level}</div>
                <div className="cr-stat-sub">七项加权综合</div>
              </div>
            </div>
            <div className="cr-tags-row">
              <span className="cr-tag-label"><Ico n="check" /> 设施充足</span>
              {conclusion?.sufficient_facilities?.length > 0
                ? conclusion.sufficient_facilities.map((t: string, i: number) => <span key={i} className="cr-tag ok">{t}</span>)
                : <span className="cr-tag ok">无</span>}
            </div>
            <div className="cr-tags-row">
              <span className="cr-tag-label"><Ico n="warning" /> 设施匮乏</span>
              {conclusion?.insufficient_facilities?.length > 0
                ? conclusion.insufficient_facilities.map((t: string, i: number) => <span key={i} className="cr-tag warn">{t}</span>)
                : <span className="cr-tag ok">无</span>}
            </div>
            <div className="cr-improve">
              <span className="cr-tag-label"><Ico n="target" /> 最需要改进</span>
              <ol>
                {conclusion?.top3_improvements?.map((t: string, i: number) => <li key={i}>{t}</li>)}
              </ol>
            </div>
          </section>

          {/* ③ 综合评分五维 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="chart" /> 综合评分五维</h2>
            <p className="cr-note">
              五维加权：<b>设施覆盖 35% + 可达性 25% + 出行适配 20% + 盲区识别 10% + 风水 10%</b>。
              盲区识别是「越少越高」：每个盲区扣分，医疗/教育/养老类扣得更重。
            </p>
            <div className="cr-radar-row">
              <div className="cr-radar"><ScoreRadar data={fiveDim} /></div>
              <table className="cr-mini-table">
                <tbody>
                  {fiveDim.map((d) => (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td>
                        <div className="cr-bar"><div className="cr-bar-fill" style={{ width: `${d.value}%`, background: getScoreColor(d.value) }} /></div>
                      </td>
                      <td className="cr-num" style={{ color: getScoreColor(d.value) }}>{d.value}</td>
                    </tr>
                  ))}
                  <tr className="cr-total-row">
                    <td>综合总分</td>
                    <td>{compScore.level || conclusion?.overall_level}</td>
                    <td className="cr-num" style={{ color: getScoreColor(compScore.total || 0) }}>{compScore.total ?? conclusion?.overall_score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ④ 设施覆盖统计 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="building" /> 设施覆盖统计</h2>
            <p className="cr-note">
              按<b>推荐标准数量</b>判定达标（医疗 3、教育 3、购物 5、养老 2、文体 3、餐饮 5、交通 3 个）。
              三列为各等时圈内实际数量，<b>圈越大数量越多</b>属正常。
            </p>
            <table className="cr-table">
              <thead>
                <tr><th>类别</th><th>5分钟</th><th>10分钟</th><th>15分钟</th><th>标准</th><th>达标</th></tr>
              </thead>
              <tbody>
                {facility_stats?.map((stat: any, idx: number) => (
                  <tr key={idx}>
                    <td className="cr-cat">{stat.category}</td>
                    <td>{stat.count_5min}</td>
                    <td>{stat.count_10min}</td>
                    <td>{stat.count_15min}</td>
                    <td>{stat.standard}</td>
                    <td><span className="cr-badge" style={{ background: getStatusColor(stat.status) }}>{stat.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {facilityBarData.length > 0 && (
              <GroupedBarChart data={facilityBarData} series={SLOT_SERIES} unit=" 个" />
            )}
          </section>

          {/* ④' 最近设施速查 */}
          {nearestList.length > 0 && (
            <section className="cr-sec">
              <h2 className="cr-sec-title"><Ico n="pin" /> 最近设施速查</h2>
              <p className="cr-note">步行 15 分钟圈内每类最近 2 个设施（直线距离）。</p>
              <div className="cr-nearest">
                {nearestList.map(({ cat, facs }) => (
                  <div key={cat} className="cr-nearest-row">
                    <span className="cr-nearest-cat">{cat}</span>
                    {facs.map((f: any, i: number) => (
                      <span key={i} className="cr-nearest-item">
                        {f.name}
                        <i>{f.distance != null ? `${Math.round(f.distance)}m` : '—'}</i>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="cr-page-foot"><span>现状与评价</span><span>第 1 页 / 共 2 页</span></footer>
        </div>

        {/* ================= 右页 · 对比与改善 ================= */}
        <div className="cr-page">
          {/* ⑤ 出行方式对比 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="car" /> 出行方式对比</h2>
            <p className="cr-note">
              得分 = <b>设施覆盖 50% + 可达性 30% + 盲区 20%</b>（15 分钟档口径）。
              圈越大能到的设施越多，<b>骑行/驾车通常高于步行</b>；步行分高说明家门口配套齐全，更宜居。
            </p>
            <div className="cr-mode-grid">
              {mode_comparisons?.map((mode: any, idx: number) => (
                <div key={idx} className="cr-mode-card">
                  <div className="cr-mode-head">
                    <Ico n={mode.mode === 'walking' ? 'walk' : mode.mode === 'cycling' ? 'bike' : mode.mode === 'transit' ? 'bus' : 'car'} />
                    <span>{mode.mode_name}</span>
                    <b style={{ color: getScoreColor(mode.score) }}>{mode.score}分</b>
                  </div>
                  <div className="cr-mode-detail">
                    <span>15分钟面积 <b>{(mode.area_15min / 1000000).toFixed(2)} km²</b></span>
                    <span>覆盖设施 <b>{mode.facility_count} 个</b></span>
                    <span>平均可达 <b>{mode.avg_time} 分钟</b></span>
                  </div>
                </div>
              ))}
            </div>
            <div className="cr-chart-2col">
              <div>
                <div className="cr-chart-title">各档得分对比</div>
                <GroupedBarChart data={modeScoreData} series={SLOT_SERIES} unit=" 分" />
              </div>
              <div>
                <div className="cr-chart-title">等时圈面积对比（km²）</div>
                <GroupedBarChart data={modeAreaData} series={SLOT_SERIES} unit=" km²" />
              </div>
            </div>
          </section>

          {/* ⑥ 服务盲区 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="search" /> 服务盲区识别</h2>
            <div className="cr-blind-head">
              <Ico n="pin" /> 空间盲区 <b>{blind_spots?.length || 0}</b> 个
              <span className="cr-note-inline">等时圈内连续设施空白地带，有坐标、画在地图红圈；圈越大查到的空白越多。</span>
            </div>
            {blind_spots?.length > 0 ? (
              <table className="cr-table">
                <thead><tr><th>#</th><th>缺失设施</th><th>位置</th><th>建议</th></tr></thead>
                <tbody>
                  {blind_spots.map((spot: any, idx: number) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{(spot.missing_facilities || []).join('、') || '综合'}</td>
                      <td className="cr-mono">({spot.location?.lng?.toFixed(4)}, {spot.location?.lat?.toFixed(4)})</td>
                      <td>{spot.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="cr-empty"><Ico n="check" /> 等时圈内无连续空白地带</div>
            )}

            <div className="cr-blind-head">
              <Ico n="search" /> 可达性盲区 <b>{accessibility_blind_spots?.length || 0}</b> 个
              <span className="cr-note-inline">15 分钟内能到达的数量未达推荐标准，按类别判定、与位置无关。</span>
            </div>
            {accessibility_blind_spots?.length > 0 ? (
              <table className="cr-table">
                <thead><tr><th>类别</th><th>到达/标准</th><th>缺口</th><th>说明与建议</th></tr></thead>
                <tbody>
                  {accessibility_blind_spots.map((spot: any, idx: number) => (
                    <tr key={idx}>
                      <td className="cr-cat">{spot.category}</td>
                      <td>{spot.count} / {spot.standard} 个</td>
                      <td>缺 {spot.deficit}</td>
                      <td>{spot.description}　<b className="cr-amber">{spot.suggestion}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="cr-empty"><Ico n="check" /> 各类设施均达标</div>
            )}
          </section>

          {/* ⑦ 风水/居住适宜性 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="waves" /> 风水 / 居住适宜性</h2>
            <p className="cr-note">
              七项加权：<b>水系 20%</b> 最高，地势/朝向/道路形态/敏感设施各 15%，绿化/人气各 10%。
              道路形态与人气目前为简化估算，一并计入总分。
            </p>
            <div className="cr-radar-row">
              <div className="cr-radar">
                {fullResult?.fengshui
                  ? <FengShuiRadar data={fullResult.fengshui} showLabels={false} detailScore={compScore.fengshui_detail} />
                  : <ScoreRadar data={[
                      { name: '地势', value: fengshui?.terrain || 0 },
                      { name: '朝向', value: fengshui?.orientation || 0 },
                      { name: '水系', value: fengshui?.water || 0 },
                      { name: '道路', value: fengshui?.road_form || 0 },
                      { name: '敏感', value: fengshui?.sensitive_facilities || 0 },
                      { name: '绿化', value: fengshui?.greenery || 0 },
                      { name: '人气', value: fengshui?.popularity || 0 },
                    ]} color="#1890ff" />}
              </div>
              <div className="cr-fs-side">
                <div className="cr-stat-big" style={{ color: getScoreColor(fengshui?.total_score) }}>
                  {fengshui?.total_score}<i>分</i>
                </div>
                <div className="cr-stat-sub">{fengshui?.level} · {fengshui?.description}</div>
                <table className="cr-mini-table">
                  <tbody>
                    {[
                      ['地势', fengshui?.terrain], ['朝向', fengshui?.orientation], ['水系', fengshui?.water],
                      ['道路形态', fengshui?.road_form], ['敏感设施', fengshui?.sensitive_facilities],
                      ['绿化', fengshui?.greenery], ['人气', fengshui?.popularity],
                    ].map(([label, val]: any) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td><div className="cr-bar"><div className="cr-bar-fill" style={{ width: `${val || 0}%`, background: getScoreColor(val || 0) }} /></div></td>
                        <td className="cr-num">{val ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* ⑧ 规划建议 */}
          <section className="cr-sec">
            <h2 className="cr-sec-title"><Ico n="edit" /> 规划建议</h2>
            {suggestions?.priority_facilities?.length > 0 && (
              <>
                <div className="cr-sub-title"><Ico n="hospital" /> 优先补齐的设施</div>
                <table className="cr-table">
                  <tbody>
                    {suggestions.priority_facilities.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td><span className="cr-badge" style={{ background: item.优先级 === '高' ? '#ff4d4f' : '#faad14' }}>{item.优先级}</span></td>
                        <td className="cr-cat">{item.设施}</td>
                        <td>{item.原因}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {suggestions?.new_locations?.length > 0 && (
              <>
                <div className="cr-sub-title"><Ico n="pin" /> 建议新增点位</div>
                <table className="cr-table">
                  <tbody>
                    {suggestions.new_locations.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="cr-cat">{item.设施}</td>
                        <td className="cr-mono">{item.位置}</td>
                        <td>{item.原因}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {(suggestions?.mode_optimization?.length > 0 || suggestions?.fengshui_improvements?.length > 0) && (
              <div className="cr-chart-2col">
                {suggestions?.mode_optimization?.length > 0 && (
                  <div>
                    <div className="cr-sub-title"><Ico n="car" /> 出行方式优化</div>
                    <ul className="cr-list">{suggestions.mode_optimization.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
                {suggestions?.fengshui_improvements?.length > 0 && (
                  <div>
                    <div className="cr-sub-title"><Ico n="waves" /> 风水改善</div>
                    <ul className="cr-list">{suggestions.fengshui_improvements.map((t: string, i: number) => <li key={i}>{t}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 页脚：技术说明 + 页码 */}
          <footer className="cr-page-foot cr-foot-notes">
            <div>
              {technical_notes?.slice(0, 4).map((n: string, i: number) => <div key={i} className="cr-tech-note">{n}</div>)}
              <div className="cr-tech-note">报告生成：{meta?.report_generate_time} · 本报告由15分钟生活圈智能体检与规划助手自动生成</div>
            </div>
            <span>第 2 页 / 共 2 页</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveReport;
