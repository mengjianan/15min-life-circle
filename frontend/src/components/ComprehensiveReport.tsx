import React from 'react';
import { Ico } from '../icons';

interface ComprehensiveReportProps {
  report: any;
  communityName: string;
}

const ComprehensiveReport: React.FC<ComprehensiveReportProps> = ({
  report,
  communityName
}) => {
  if (!report) {
    return <div className="report-container">暂无报告数据</div>;
  }

  const { meta, conclusion, facility_stats, mode_comparisons, blind_spots, fengshui, suggestions, technical_notes } = report;

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

  return (
    <div className="comprehensive-report">
      {/* 1. 报告封面与基本信息 */}
      <section className="report-cover">
        <h1><Ico n="building" /> 15分钟生活圈智能体检报告</h1>
        <div className="meta-info">
          <div className="meta-item">
            <span className="meta-label">社区/街道：</span>
            <span className="meta-value">{meta?.community_name || communityName}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">中心点坐标：</span>
            <span className="meta-value">
              ({meta?.center?.lng?.toFixed(4)}, {meta?.center?.lat?.toFixed(4)})
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">分析时间：</span>
            <span className="meta-value">{meta?.analysis_time}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">出行方式：</span>
            <span className="meta-value">{meta?.travel_modes?.join(' / ')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">时间档：</span>
            <span className="meta-value">{meta?.time_slots?.join(' / ')} 分钟</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">数据来源：</span>
            <span className="meta-value">{meta?.data_source}</span>
          </div>
        </div>
      </section>

      {/* 2. 核心结论摘要 */}
      <section className="report-section conclusion-section">
        <h2><Ico n="clipboard" /> 核心结论摘要</h2>
        <div className="conclusion-grid">
          <div className="conclusion-card overall">
            <div className="conclusion-icon"><Ico n="trophy" /></div>
            <div className="conclusion-content">
              <div className="conclusion-label">整体水平</div>
              <div className="conclusion-value" style={{ color: getScoreColor(conclusion?.overall_score) }}>
                {conclusion?.overall_level} ({conclusion?.overall_score}分)
              </div>
            </div>
          </div>

          <div className="conclusion-card best-mode">
            <div className="conclusion-icon"><Ico n="rocket" /></div>
            <div className="conclusion-content">
              <div className="conclusion-label">最佳出行方式</div>
              <div className="conclusion-value">
                {conclusion?.best_mode} ({conclusion?.best_mode_score}分)
              </div>
            </div>
          </div>

          <div className="conclusion-card blind-spots">
            <div className="conclusion-icon"><Ico n="search" /></div>
            <div className="conclusion-content">
              <div className="conclusion-label">服务盲区</div>
              <div className="conclusion-value">
                {conclusion?.blind_spot_count} 个
              </div>
            </div>
          </div>

          <div className="conclusion-card fengshui">
            <div className="conclusion-icon"><Ico n="waves" /></div>
            <div className="conclusion-content">
              <div className="conclusion-label">风水评分</div>
              <div className="conclusion-value">{conclusion?.fengshui_level}</div>
            </div>
          </div>
        </div>

        <div className="conclusion-details">
          <div className="detail-item">
            <h4><Ico n="check" /> 设施充足</h4>
            <div className="tag-list">
              {conclusion?.sufficient_facilities?.map((item: string, idx: number) => (
                <span key={idx} className="tag success">{item}</span>
              ))}
            </div>
          </div>

          <div className="detail-item">
            <h4><Ico n="warning" /> 设施匮乏</h4>
            <div className="tag-list">
              {conclusion?.insufficient_facilities?.length > 0 ? (
                conclusion.insufficient_facilities.map((item: string, idx: number) => (
                  <span key={idx} className="tag warning">{item}</span>
                ))
              ) : (
                <span className="tag success">无</span>
              )}
            </div>
          </div>

          <div className="detail-item">
            <h4><Ico n="target" /> 最需要改进</h4>
            <ul className="improvement-list">
              {conclusion?.top3_improvements?.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3. 设施覆盖统计 */}
      <section className="report-section">
        <h2><Ico n="chart" /> 设施覆盖统计</h2>
        <table className="facility-table">
          <thead>
            <tr>
              <th>设施类别</th>
              <th>5分钟</th>
              <th>10分钟</th>
              <th>15分钟</th>
              <th>标准数量</th>
              <th>达标情况</th>
            </tr>
          </thead>
          <tbody>
            {facility_stats?.map((stat: any, idx: number) => (
              <tr key={idx}>
                <td className="category-name">{stat.category}</td>
                <td>{stat.count_5min}</td>
                <td>{stat.count_10min}</td>
                <td>{stat.count_15min}</td>
                <td>{stat.standard}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(stat.status) }}>
                    {stat.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 4. 出行方式对比 */}
      <section className="report-section">
        <h2><Ico n="car" /> 出行方式对比</h2>
        <div className="mode-comparison-grid">
          {mode_comparisons?.map((mode: any, idx: number) => (
            <div key={idx} className="mode-card">
              <div className="mode-header">
                <span className="mode-icon">
                  {mode.mode === 'walking' ? <Ico n="walk" /> : mode.mode === 'cycling' ? <Ico n="bike" /> : mode.mode === 'transit' ? <Ico n="bus" /> : <Ico n="car" />}
                </span>
                <span className="mode-name">{mode.mode_name}</span>
                <span className="mode-score" style={{ color: getScoreColor(mode.score) }}>
                  {mode.score}分
                </span>
              </div>
              <div className="mode-details">
                <div className="mode-detail-item">
                  <span className="detail-label">等时圈面积：</span>
                  <span className="detail-value">{(mode.area_15min / 1000000).toFixed(2)} km²</span>
                </div>
                <div className="mode-detail-item">
                  <span className="detail-label">覆盖设施：</span>
                  <span className="detail-value">{mode.facility_count} 个</span>
                </div>
                <div className="mode-detail-item">
                  <span className="detail-label">平均可达时间：</span>
                  <span className="detail-value">{mode.avg_time} 分钟</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 服务盲区识别 */}
      <section className="report-section">
        <h2><Ico n="search" /> 服务盲区识别</h2>
        {blind_spots?.length > 0 ? (
          <div className="blind-spot-list">
            {blind_spots.map((spot: any, idx: number) => (
              <div key={idx} className="blind-spot-item">
                <div className="spot-header">
                  <span className="spot-number">盲区 #{idx + 1}</span>
                  <span className="spot-location">
                    位置: ({spot.location?.lng?.toFixed(4)}, {spot.location?.lat?.toFixed(4)})
                  </span>
                </div>
                <div className="spot-content">
                  <div className="missing-facilities">
                    <span className="label">缺失设施：</span>
                    {spot.missing_facilities?.map((f: string, i: number) => (
                      <span key={i} className="tag warning">{f}</span>
                    ))}
                  </div>
                  <div className="suggestion">
                    <span className="label">建议：</span>
                    <span className="value">{spot.suggestion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-blind-spots">
            <span className="icon"><Ico n="check" /></span>
            <span>未发现明显服务盲区</span>
          </div>
        )}
      </section>

      {/* 6. 风水评分报告 */}
      <section className="report-section">
        <h2><Ico n="waves" /> 风水评分报告</h2>
        <div className="fengshui-report">
          <div className="fengshui-total">
            <div className="fengshui-score" style={{ color: getScoreColor(fengshui?.total_score) }}>
              {fengshui?.total_score}
            </div>
            <div className="fengshui-level">{fengshui?.level}</div>
            <div className="fengshui-desc">{fengshui?.description}</div>
          </div>

          <div className="fengshui-breakdown">
            <div className="fengshui-item">
              <span className="item-label"><Ico n="mountain" /> 地势</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.terrain}%`, backgroundColor: getScoreColor(fengshui?.terrain) }}></div>
              </div>
              <span className="item-score">{fengshui?.terrain}</span>
            </div>
            <div className="fengshui-item">
              <span className="item-label"><Ico n="compass" /> 朝向</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.orientation}%`, backgroundColor: getScoreColor(fengshui?.orientation) }}></div>
              </div>
              <span className="item-score">{fengshui?.orientation}</span>
            </div>
            <div className="fengshui-item">
              <span className="item-label"><Ico n="droplet" /> 水系</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.water}%`, backgroundColor: getScoreColor(fengshui?.water) }}></div>
              </div>
              <span className="item-score">{fengshui?.water}</span>
            </div>
            <div className="fengshui-item">
              <span className="item-label"><Ico n="road" /> 道路形态</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.road_form}%`, backgroundColor: getScoreColor(fengshui?.road_form) }}></div>
              </div>
              <span className="item-score">{fengshui?.road_form}</span>
            </div>
            <div className="fengshui-item">
              <span className="item-label"><Ico n="warning" /> 敏感设施</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.sensitive_facilities}%`, backgroundColor: getScoreColor(fengshui?.sensitive_facilities) }}></div>
              </div>
              <span className="item-score">{fengshui?.sensitive_facilities}</span>
            </div>
            <div className="fengshui-item">
              <span className="item-label"><Ico n="tree" /> 绿化</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.greenery}%`, backgroundColor: getScoreColor(fengshui?.greenery) }}></div>
              </div>
              <span className="item-score">{fengshui?.greenery}</span>
            </div>
            <div className="fengshui-item">
              <span className="item-label"><Ico n="users" /> 人气</span>
              <div className="item-bar">
                <div className="bar-fill" style={{ width: `${fengshui?.popularity}%`, backgroundColor: getScoreColor(fengshui?.popularity) }}></div>
              </div>
              <span className="item-score">{fengshui?.popularity}</span>
            </div>
          </div>

          {fengshui?.suggestions?.length > 0 && (
            <div className="fengshui-suggestions">
              <h4>风水改善建议</h4>
              <ul>
                {fengshui.suggestions.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 7. 规划建议 */}
      <section className="report-section">
        <h2><Ico n="edit" /> 规划建议</h2>
        <div className="suggestions-container">
          {suggestions?.priority_facilities?.length > 0 && (
            <div className="suggestion-group">
              <h4><Ico n="hospital" /> 优先补齐的设施</h4>
              <div className="suggestion-list">
                {suggestions.priority_facilities.map((item: any, idx: number) => (
                  <div key={idx} className="suggestion-item">
                    <span className="priority-badge" style={{ backgroundColor: item.优先级 === '高' ? '#ff4d4f' : '#faad14' }}>
                      {item.优先级}
                    </span>
                    <span className="facility-name">{item.设施}</span>
                    <span className="reason">{item.原因}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions?.new_locations?.length > 0 && (
            <div className="suggestion-group">
              <h4><Ico n="pin" /> 建议新增点位</h4>
              <div className="suggestion-list">
                {suggestions.new_locations.map((item: any, idx: number) => (
                  <div key={idx} className="suggestion-item">
                    <span className="facility-name">{item.设施}</span>
                    <span className="location">{item.位置}</span>
                    <span className="reason">{item.原因}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions?.mode_optimization?.length > 0 && (
            <div className="suggestion-group">
              <h4><Ico n="car" /> 出行方式优化</h4>
              <ul className="optimization-list">
                {suggestions.mode_optimization.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {suggestions?.fengshui_improvements?.length > 0 && (
            <div className="suggestion-group">
              <h4><Ico n="waves" /> 风水改善建议</h4>
              <ul className="optimization-list">
                {suggestions.fengshui_improvements.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 8. 技术说明与局限性 */}
      <section className="report-section">
        <h2><Ico n="book" /> 技术说明与局限性</h2>
        <ul className="technical-notes">
          {technical_notes?.map((note: string, idx: number) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </section>

      {/* 报告页脚 */}
      <footer className="report-footer">
        <p>报告生成时间：{meta?.report_generate_time}</p>
        <p>本报告由15分钟生活圈智能体检与规划助手自动生成</p>
      </footer>
    </div>
  );
};

export default ComprehensiveReport;
