import React from 'react';

interface ReportProps {
  communityName: string;
  score: {
    total: number;
    level: string;
    categories: Record<string, number>;
    blind_spot_penalty: number;
  };
  suggestions: Array<{
    category: string;
    priority: string;
    message: string;
  }>;
  blindSpots: Array<{
    center: { lng: number; lat: number };
    category: string;
    description: string;
  }>;
  poiCoverage?: Record<string, any>;
  isochrone?: {
    area: number;
    boundary_points: any[];
  };
  fullModeData?: {
    walking?: any;
    cycling?: any;
    transit?: any;
    driving?: any;
  };
  comparison?: Array<{
    mode: string;
    mode_name: string;
    time_5: number;
    time_10: number;
    time_15: number;
  }>;
}

const Report: React.FC<ReportProps> = ({
  communityName,
  score,
  suggestions,
  blindSpots,
  poiCoverage,
  isochrone,
  fullModeData,
  comparison
}) => {
  const getScoreColor = (level: string) => {
    switch (level) {
      case '优秀': return '#52c41a';
      case '良好': return '#1890ff';
      case '一般': return '#faad14';
      case '需改善': return '#ff4d4f';
      default: return '#666';
    }
  };

  const getCategoryScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = {
      '高': '#ff4d4f',
      '中': '#faad14',
      '低': '#52c41a'
    };
    return (
      <span className="priority-tag" style={{ backgroundColor: colors[priority] || '#666' }}>
        {priority}
      </span>
    );
  };

  // 计算总设施数
  const totalFacilities = Object.values(poiCoverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0);

  return (
    <div className="report-container">
      {/* 报告标题 */}
      <div className="report-main-title">
        <h2>15分钟生活圈体检报告</h2>
        <div className="report-meta">
          <span className="meta-item">社区：{communityName}</span>
          <span className="meta-item">时间：{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 左右两页布局 */}
      <div className="report-two-pages">
        {/* 左页 */}
        <div className="report-page left-page">
          {/* 评分概览 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#667eea' }}>1</span>
              综合评分概览
            </div>
            <div className="score-overview">
              <div className="score-big-circle" style={{ borderColor: getScoreColor(score.level) }}>
                <span className="score-number">{score.total}</span>
                <span className="score-unit">分</span>
              </div>
              <div className="score-info">
                <div className="score-level" style={{ color: getScoreColor(score.level) }}>
                  {score.level}
                </div>
                <div className="score-desc">
                  {score.total >= 90 ? '生活圈配置优秀，设施完善' :
                   score.total >= 75 ? '生活圈配置良好，基本满足需求' :
                   score.total >= 60 ? '生活圈配置一般，有待改善' :
                   '生活圈配置不足，需要重点改善'}
                </div>
              </div>
            </div>
          </div>

          {/* 关键指标 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#1890ff' }}>2</span>
              关键指标
            </div>
            <div className="metrics-row">
              <div className="metric-box">
                <div className="metric-value">{isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'}</div>
                <div className="metric-name">覆盖面积(km²)</div>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: '75%', backgroundColor: '#667eea' }}></div>
                </div>
              </div>
              <div className="metric-box">
                <div className="metric-value">{totalFacilities}</div>
                <div className="metric-name">周边设施(个)</div>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: '85%', backgroundColor: '#52c41a' }}></div>
                </div>
              </div>
              <div className="metric-box">
                <div className="metric-value">{blindSpots.length}</div>
                <div className="metric-name">服务盲区(个)</div>
                <div className="metric-bar">
                  <div className="metric-bar-fill" style={{ width: `${Math.max(10, 100 - blindSpots.length * 20)}%`, backgroundColor: blindSpots.length > 0 ? '#faad14' : '#52c41a' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 各类设施评分 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#52c41a' }}>3</span>
              各类设施评分
            </div>
            <div className="category-chart">
              {Object.entries(score.categories).map(([category, categoryScore]) => (
                <div key={category} className="category-row">
                  <span className="category-label">{category}</span>
                  <div className="category-bar-bg">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${categoryScore}%`,
                        backgroundColor: getCategoryScoreColor(categoryScore as number)
                      }}
                    ></div>
                  </div>
                  <span className="category-value" style={{ color: getCategoryScoreColor(categoryScore as number) }}>
                    {categoryScore}
                  </span>
                </div>
              ))}
            </div>
            <div className="chart-note">
              <span className="note-dot" style={{ backgroundColor: '#52c41a' }}></span> 优秀(90+)
              <span className="note-dot" style={{ backgroundColor: '#1890ff' }}></span> 良好(75-89)
              <span className="note-dot" style={{ backgroundColor: '#faad14' }}></span> 一般(60-74)
              <span className="note-dot" style={{ backgroundColor: '#ff4d4f' }}></span> 需改善(&lt;60)
            </div>
          </div>
        </div>

        {/* 右页 */}
        <div className="report-page right-page">
          {/* 出行方式覆盖面积对比 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#722ed1' }}>4</span>
              出行方式覆盖面积对比
            </div>
            <div className="area-comparison">
              {/* 表头 */}
              <div className="area-header">
                <span className="area-mode">出行方式</span>
                <span className="area-time">5min</span>
                <span className="area-time">10min</span>
                <span className="area-time">15min</span>
              </div>
              {/* 数据行 */}
              {comparison?.map(item => (
                <div key={item.mode} className="area-row">
                  <span className="area-mode">{item.mode_name}</span>
                  <div className="area-bar-cell">
                    <div className="mini-bar">
                      <div className="mini-bar-fill" style={{ width: `${(item.time_5 / 100) * 100}%`, backgroundColor: '#95de64' }}></div>
                    </div>
                    <span className="area-num">{item.time_5}</span>
                  </div>
                  <div className="area-bar-cell">
                    <div className="mini-bar">
                      <div className="mini-bar-fill" style={{ width: `${(item.time_10 / 200) * 100}%`, backgroundColor: '#69b1ff' }}></div>
                    </div>
                    <span className="area-num">{item.time_10}</span>
                  </div>
                  <div className="area-bar-cell">
                    <div className="mini-bar">
                      <div className="mini-bar-fill" style={{ width: `${(item.time_15 / 200) * 100}%`, backgroundColor: '#667eea' }}></div>
                    </div>
                    <span className="area-num">{item.time_15}</span>
                  </div>
                </div>
              ))}
              <div className="area-unit">单位：km²</div>
            </div>
          </div>

          {/* 盲区分析 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#faad14' }}>5</span>
              服务盲区分析
            </div>
            {blindSpots.length > 0 ? (
              <div className="blind-spots">
                {blindSpots.map((spot, index) => (
                  <div key={index} className="blind-spot-card">
                    <div className="spot-badge">{index + 1}</div>
                    <div className="spot-content">
                      <div className="spot-category">{spot.category}</div>
                      <div className="spot-desc">{spot.description || `该区域${spot.category}设施覆盖不足`}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-blind-spots">
                <span className="check-icon">✓</span>
                未发现明显服务盲区，覆盖良好
              </div>
            )}
          </div>

          {/* 规划建议 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#eb2f96' }}>6</span>
              规划建议
            </div>
            <div className="suggestions">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-header">
                      {getPriorityTag(suggestion.priority)}
                      <span className="suggestion-cat">{suggestion.category}</span>
                    </div>
                    <div className="suggestion-text">{suggestion.message}</div>
                  </div>
                ))
              ) : (
                <div className="no-suggestions">
                  <span className="check-icon">✓</span>
                  当前配置良好，暂无改善建议
                </div>
              )}
            </div>
          </div>

          {/* 出行方式评分对比 */}
          <div className="report-section-card">
            <div className="section-title">
              <span className="section-icon" style={{ backgroundColor: '#13c2c2' }}>7</span>
              出行方式评分对比
            </div>
            <div className="mode-comparison">
              {fullModeData && Object.entries(fullModeData).map(([mode, data]: [string, any]) => (
                <div key={mode} className="mode-row">
                  <span className="mode-label">{data.mode_name}</span>
                  <div className="mode-bar-bg">
                    <div
                      className="mode-bar-fill"
                      style={{
                        width: `${data.score?.total || 0}%`,
                        backgroundColor: getScoreColor(data.score?.level)
                      }}
                    ></div>
                  </div>
                  <span className="mode-score" style={{ color: getScoreColor(data.score?.level) }}>
                    {data.score?.total || 0}
                  </span>
                  <span className="mode-level" style={{ backgroundColor: getScoreColor(data.score?.level) }}>
                    {data.score?.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 结论 */}
      <div className="report-conclusion">
        <div className="conclusion-title">总结</div>
        <div className="conclusion-text">
          {communityName}15分钟生活圈综合评分为<strong>{score.total}分</strong>，处于<strong style={{ color: getScoreColor(score.level) }}>{score.level}</strong>水平。
          步行15分钟覆盖面积{isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'}平方公里，
          周边共有{totalFacilities}处设施。
          {blindSpots.length > 0 && `发现${blindSpots.length}个服务盲区，建议优先完善相关设施。`}
          {blindSpots.length === 0 && '未发现明显服务盲区，生活圈配置良好。'}
        </div>
      </div>
    </div>
  );
};

export default Report;