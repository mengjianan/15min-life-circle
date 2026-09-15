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

  return (
    <div className="report-container">
      {/* 报告标题 */}
      <div className="report-title">
        <h3>15分钟生活圈体检报告</h3>
        <span className="report-community">{communityName}</span>
      </div>

      {/* 左右两页布局 */}
      <div className="report-two-pages">
        {/* 左页：概览与数据 */}
        <div className="report-left-page">
          {/* 评分概览卡片 */}
          <div className="report-card score-card">
            <div className="card-header">综合评分</div>
            <div className="score-display">
              <div className="score-circle" style={{ borderColor: getScoreColor(score.level) }}>
                <span className="score-num">{score.total}</span>
                <span className="score-text">分</span>
              </div>
              <div className="score-level" style={{ color: getScoreColor(score.level) }}>
                {score.level}
              </div>
            </div>
          </div>

          {/* 关键指标 */}
          <div className="report-card">
            <div className="card-header">关键指标</div>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-icon">...</span>
                <span className="metric-val">{isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'} km²</span>
                <span className="metric-label">覆盖面积</span>
              </div>
              <div className="metric-item">
                <span className="metric-icon">...</span>
                <span className="metric-val">
                  {Object.values(poiCoverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0)}
                </span>
                <span className="metric-label">周边设施</span>
              </div>
              <div className="metric-item">
                <span className="metric-icon">...</span>
                <span className="metric-val">{blindSpots.length}</span>
                <span className="metric-label">服务盲区</span>
              </div>
              <div className="metric-item">
                <span className="metric-icon">...</span>
                <span className="metric-val">{Object.keys(score.categories).length}</span>
                <span className="metric-label">评估维度</span>
              </div>
            </div>
          </div>

          {/* 各类设施评分 */}
          <div className="report-card">
            <div className="card-header">各类设施评分</div>
            <div className="category-scores-list">
              {Object.entries(score.categories).map(([category, categoryScore]) => (
                <div key={category} className="category-score-item">
                  <span className="category-name">{category}</span>
                  <div className="score-bar">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${categoryScore}%`,
                        backgroundColor: getCategoryScoreColor(categoryScore as number)
                      }}
                    />
                  </div>
                  <span className="category-score" style={{ color: getCategoryScoreColor(categoryScore as number) }}>
                    {categoryScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右页：分析与建议 */}
        <div className="report-right-page">
          {/* 出行方式对比 */}
          <div className="report-card">
            <div className="card-header">出行方式覆盖面积对比</div>
            <div className="area-comparison-chart">
              {comparison?.map(item => (
                <div key={item.mode} className="area-row">
                  <span className="area-label">{item.mode_name}</span>
                  <div className="area-bars-container">
                    <div className="area-bar-item">
                      <div className="area-bar-track">
                        <div className="area-bar-fill" style={{ width: `${(item.time_5 / 200) * 100}%`, backgroundColor: '#95de64' }} />
                      </div>
                      <span className="area-val">{item.time_5} km²</span>
                    </div>
                    <div className="area-bar-item">
                      <div className="area-bar-track">
                        <div className="area-bar-fill" style={{ width: `${(item.time_10 / 200) * 100}%`, backgroundColor: '#69b1ff' }} />
                      </div>
                      <span className="area-val">{item.time_10} km²</span>
                    </div>
                    <div className="area-bar-item">
                      <div className="area-bar-track">
                        <div className="area-bar-fill" style={{ width: `${(item.time_15 / 200) * 100}%`, backgroundColor: '#667eea' }} />
                      </div>
                      <span className="area-val">{item.time_15} km²</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="chart-legend">
                <span><i style={{ backgroundColor: '#95de64' }}></i>5min</span>
                <span><i style={{ backgroundColor: '#69b1ff' }}></i>10min</span>
                <span><i style={{ backgroundColor: '#667eea' }}></i>15min</span>
              </div>
            </div>
          </div>

          {/* 盲区分析 */}
          <div className="report-card">
            <div className="card-header">服务盲区分析</div>
            {blindSpots.length > 0 ? (
              <div className="blind-spots-list">
                {blindSpots.map((spot, index) => (
                  <div key={index} className="blind-spot-item">
                    <span className="spot-icon">!</span>
                    <div className="spot-info">
                      <span className="spot-cat">{spot.category}</span>
                      <span className="spot-desc">{spot.description || `该区域${spot.category}设施覆盖不足`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">未发现明显服务盲区</div>
            )}
          </div>

          {/* 规划建议 */}
          <div className="report-card">
            <div className="card-header">规划建议</div>
            {suggestions.length > 0 ? (
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    {getPriorityTag(suggestion.priority)}
                    <span className="suggestion-cat">[{suggestion.category}]</span>
                    <span className="suggestion-text">{suggestion.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">当前配置良好，暂无改善建议</div>
            )}
          </div>

          {/* 出行方式评分 */}
          <div className="report-card">
            <div className="card-header">出行方式评分对比</div>
            <div className="mode-scores">
              {fullModeData && Object.entries(fullModeData).map(([mode, data]: [string, any]) => (
                <div key={mode} className="mode-score-item">
                  <span className="mode-name">{data.mode_name}</span>
                  <div className="mode-score-bar">
                    <div
                      className="mode-score-fill"
                      style={{
                        width: `${data.score?.total || 0}%`,
                        backgroundColor: getScoreColor(data.score?.level)
                      }}
                    />
                  </div>
                  <span className="mode-score-val" style={{ color: getScoreColor(data.score?.level) }}>
                    {data.score?.total || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;