import React, { useState } from 'react';

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const getFacilityCount = (category: string) => {
    if (!poiCoverage || !poiCoverage[category]) return 0;
    return poiCoverage[category].count || 0;
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

  // 计算雷达图数据
  const radarData = Object.entries(score.categories).map(([name, value]) => ({
    name,
    value: value as number
  }));

  return (
    <div className="report-container">
      {/* 报告标题 */}
      <div className="report-header-bar">
        <h2>15分钟生活圈体检报告</h2>
        <div className="report-nav-buttons">
          <button
            className={`page-btn ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            第一页：概览与分析
          </button>
          <button
            className={`page-btn ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            第二页：建议与总结
          </button>
        </div>
      </div>

      {/* 第一页：概览与分析 */}
      {currentPage === 1 && (
        <div className="report-page">
          {/* 社区信息卡片 */}
          <div className="info-card">
            <div className="info-card-header">
              <h3>{communityName}</h3>
              <span className="report-date">{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">综合评分</span>
                <span className="info-value score-value" style={{ color: getScoreColor(score.level) }}>
                  {score.total}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">评级</span>
                <span className="info-value level-badge" style={{ backgroundColor: getScoreColor(score.level) }}>
                  {score.level}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">覆盖面积</span>
                <span className="info-value">{isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0.00'} km²</span>
              </div>
              <div className="info-item">
                <span className="info-label">服务盲区</span>
                <span className="info-value">{blindSpots.length} 个</span>
              </div>
            </div>
          </div>

          {/* 双栏布局 */}
          <div className="report-two-columns">
            {/* 左栏：等时圈分析 */}
            <div className="report-column">
              <div className="column-card">
                <h4>等时圈覆盖面积</h4>
                <div className="area-chart">
                  {comparison?.map(item => (
                    <div key={item.mode} className="area-bar-group">
                      <div className="area-bar-label">{item.mode_name}</div>
                      <div className="area-bars">
                        <div className="area-bar" title="5分钟">
                          <div className="area-bar-fill" style={{ width: `${(item.time_5 / 200) * 100}%`, backgroundColor: '#95de64' }} />
                          <span>{item.time_5}</span>
                        </div>
                        <div className="area-bar" title="10分钟">
                          <div className="area-bar-fill" style={{ width: `${(item.time_10 / 200) * 100}%`, backgroundColor: '#69b1ff' }} />
                          <span>{item.time_10}</span>
                        </div>
                        <div className="area-bar" title="15分钟">
                          <div className="area-bar-fill" style={{ width: `${(item.time_15 / 200) * 100}%`, backgroundColor: '#667eea' }} />
                          <span>{item.time_15}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <span><i style={{ backgroundColor: '#95de64' }}></i>5min</span>
                  <span><i style={{ backgroundColor: '#69b1ff' }}></i>10min</span>
                  <span><i style={{ backgroundColor: '#667eea' }}></i>15min</span>
                </div>
              </div>
            </div>

            {/* 右栏：设施评分 */}
            <div className="report-column">
              <div className="column-card">
                <h4>各类设施评分</h4>
                <div className="score-radar">
                  {/* 简化的雷达图 - 使用环形进度条 */}
                  <div className="radar-grid">
                    {radarData.map((item, index) => (
                      <div key={index} className="radar-item">
                        <div className="radar-circle" style={{
                          background: `conic-gradient(${getCategoryScoreColor(item.value)} ${item.value}%, #f0f0f0 ${item.value}%)`
                        }}>
                          <span className="radar-value">{item.value}</span>
                        </div>
                        <span className="radar-label">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 设施统计表格 */}
          <div className="table-card">
            <h4>各类设施统计</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>设施类别</th>
                  <th>数量</th>
                  <th>评分</th>
                  <th>覆盖情况</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(score.categories).map(([category, categoryScore]) => (
                  <tr key={category}>
                    <td>
                      <span className="category-dot" style={{ backgroundColor: getCategoryScoreColor(categoryScore as number) }}></span>
                      {category}
                    </td>
                    <td>{getFacilityCount(category)} 个</td>
                    <td>
                      <div className="table-score-bar">
                        <div className="table-score-fill" style={{ width: `${categoryScore}%`, backgroundColor: getCategoryScoreColor(categoryScore as number) }} />
                      </div>
                      <span>{categoryScore}</span>
                    </td>
                    <td>
                      <span className="status-tag" style={{ backgroundColor: getCategoryScoreColor(categoryScore as number) }}>
                        {(categoryScore as number) >= 80 ? '充足' : (categoryScore as number) >= 60 ? '一般' : '较少'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 盲区分析 */}
          <div className="table-card">
            <h4>服务盲区分析</h4>
            {blindSpots.length > 0 ? (
              <div className="blind-spots-grid">
                {blindSpots.map((spot, index) => (
                  <div key={index} className="blind-spot-card">
                    <div className="blind-spot-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#faad14" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                    <div className="blind-spot-info">
                      <span className="blind-spot-cat">{spot.category}</span>
                      <p>{spot.description || `该区域${spot.category}设施覆盖不足`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">未发现明显服务盲区</div>
            )}
          </div>
        </div>
      )}

      {/* 第二页：建议与总结 */}
      {currentPage === 2 && (
        <div className="report-page">
          {/* 出行方式对比 */}
          <div className="table-card">
            <h4>出行方式对比</h4>
            <table className="data-table comparison-table">
              <thead>
                <tr>
                  <th>出行方式</th>
                  <th>评分</th>
                  <th>等级</th>
                  <th>15min面积</th>
                  <th>设施数量</th>
                  <th>盲区数</th>
                </tr>
              </thead>
              <tbody>
                {fullModeData && Object.entries(fullModeData).map(([mode, data]: [string, any]) => (
                  <tr key={mode}>
                    <td><strong>{data.mode_name}</strong></td>
                    <td style={{ color: getScoreColor(data.score?.level), fontWeight: 'bold' }}>
                      {data.score?.total || 0}
                    </td>
                    <td>
                      <span className="level-badge" style={{ backgroundColor: getScoreColor(data.score?.level) }}>
                        {data.score?.level || '-'}
                      </span>
                    </td>
                    <td>{comparison?.find(c => c.mode === mode)?.time_15?.toFixed(2) || '0.00'} km²</td>
                    <td>
                      {data.time_slots?.['900']?.poi_coverage ?
                        Object.values(data.time_slots['900'].poi_coverage).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0) :
                        0
                      } 个
                    </td>
                    <td>{data.time_slots?.['900']?.blind_spots?.length || 0} 个</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 出行方式评分对比图 */}
          <div className="table-card">
            <h4>出行方式评分对比</h4>
            <div className="score-comparison-chart">
              {fullModeData && Object.entries(fullModeData).map(([mode, data]: [string, any]) => (
                <div key={mode} className="score-bar-item">
                  <span className="score-bar-label">{data.mode_name}</span>
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${data.score?.total || 0}%`,
                        backgroundColor: getScoreColor(data.score?.level)
                      }}
                    />
                  </div>
                  <span className="score-bar-value">{data.score?.total || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 规划建议 */}
          <div className="table-card">
            <h4>规划建议</h4>
            {suggestions.length > 0 ? (
              <div className="suggestions-grid">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-card">
                    <div className="suggestion-top">
                      {getPriorityTag(suggestion.priority)}
                      <span className="suggestion-cat">{suggestion.category}</span>
                    </div>
                    <p className="suggestion-text">{suggestion.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">当前配置良好，暂无改善建议</div>
            )}
          </div>

          {/* 结论 */}
          <div className="conclusion-card">
            <h4>总结</h4>
            <p>
              {communityName}15分钟生活圈综合评分为<strong>{score.total}分</strong>，处于<strong>{score.level}</strong>水平。
              步行15分钟覆盖面积{isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'}平方公里，
              周边共有{Object.values(poiCoverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0)}处设施。
              {blindSpots.length > 0 && `发现${blindSpots.length}个服务盲区，建议优先完善相关设施。`}
              {blindSpots.length === 0 && '未发现明显服务盲区，生活圈配置良好。'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;