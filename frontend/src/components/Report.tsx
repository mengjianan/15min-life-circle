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
  // 新增：全出行方式数据
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

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = {
      '高': '#ff4d4f',
      '中': '#faad14',
      '低': '#52c41a'
    };
    return (
      <span
        className="priority-tag"
        style={{ backgroundColor: colors[priority] || '#666' }}
      >
        {priority}
      </span>
    );
  };

  const getFacilityCount = (category: string) => {
    if (!poiCoverage || !poiCoverage[category]) return 0;
    return poiCoverage[category].count || 0;
  };

  // 获取各类设施的评分颜色
  const getCategoryScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div className="report-container">
      {/* 报告标题 */}
      <div className="report-title-section">
        <h2>15分钟生活圈体检报告</h2>
        <p className="report-subtitle">{communityName}</p>
      </div>

      {/* 导航目录 */}
      <div className="report-nav">
        <a href="#overview">一、体检概览</a>
        <a href="#isochrone">二、等时圈分析</a>
        <a href="#facilities">三、设施覆盖</a>
        <a href="#blindspots">四、盲区分析</a>
        <a href="#suggestions">五、规划建议</a>
        <a href="#comparison">六、出行方式对比</a>
      </div>

      {/* 一、体检概览 */}
      <div id="overview" className="report-chapter">
        <h3>一、体检概览</h3>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="overview-label">社区名称</span>
            <span className="overview-value">{communityName}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">体检时间</span>
            <span className="overview-value">{new Date().toLocaleString('zh-CN')}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">中心坐标</span>
            <span className="overview-value">
              {isochrone?.boundary_points?.[0] ?
                `${isochrone.boundary_points[0].lng?.toFixed(4) || '-'}, ${isochrone.boundary_points[0].lat?.toFixed(4) || '-'}` :
                '-'
              }
            </span>
          </div>
          <div className="overview-item">
            <span className="overview-label">综合评分</span>
            <span className="overview-value" style={{ color: getScoreColor(score.level), fontWeight: 'bold' }}>
              {score.total}分（{score.level}）
            </span>
          </div>
        </div>
      </div>

      {/* 二、等时圈范围分析 */}
      <div id="isochrone" className="report-chapter">
        <h3>二、等时圈范围分析</h3>

        {/* 面积对比表格 */}
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>时段</th>
                <th>步行</th>
                <th>骑行</th>
                <th>公交</th>
                <th>驾车</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">5分钟</td>
                <td>{comparison?.find(c => c.mode === 'walking')?.time_5?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'cycling')?.time_5?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'transit')?.time_5?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'driving')?.time_5?.toFixed(2) || '0.00'} km²</td>
              </tr>
              <tr>
                <td className="label">10分钟</td>
                <td>{comparison?.find(c => c.mode === 'walking')?.time_10?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'cycling')?.time_10?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'transit')?.time_10?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'driving')?.time_10?.toFixed(2) || '0.00'} km²</td>
              </tr>
              <tr>
                <td className="label">15分钟</td>
                <td>{comparison?.find(c => c.mode === 'walking')?.time_15?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'cycling')?.time_15?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'transit')?.time_15?.toFixed(2) || '0.00'} km²</td>
                <td>{comparison?.find(c => c.mode === 'driving')?.time_15?.toFixed(2) || '0.00'} km²</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 15分钟覆盖面积柱状图 */}
        <div className="chart-section">
          <h4>15分钟覆盖面积对比</h4>
          <div className="bar-chart">
            {comparison?.map(item => (
              <div key={item.mode} className="bar-item">
                <span className="bar-label">{item.mode_name}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min((item.time_15 / 200) * 100, 100)}%`,
                      backgroundColor: '#667eea'
                    }}
                  />
                </div>
                <span className="bar-value">{item.time_15} km²</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 三、设施覆盖分析 */}
      <div id="facilities" className="report-chapter">
        <h3>三、设施覆盖分析</h3>

        {/* 各类设施数量统计 */}
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>设施类别</th>
                <th>步行范围</th>
                <th>覆盖情况</th>
                <th>评分</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(score.categories).map(([category, categoryScore]) => (
                <tr key={category}>
                  <td className="label">{category}</td>
                  <td>{getFacilityCount(category)} 个</td>
                  <td>
                    <span className="coverage-badge" style={{ backgroundColor: getCategoryScoreColor(categoryScore as number) }}>
                      {(categoryScore as number) >= 80 ? '充足' : (categoryScore as number) >= 60 ? '一般' : '较少'}
                    </span>
                  </td>
                  <td>
                    <div className="score-indicator">
                      <div className="score-bar-bg">
                        <div
                          className="score-bar-fill"
                          style={{
                            width: `${categoryScore}%`,
                            backgroundColor: getCategoryScoreColor(categoryScore as number)
                          }}
                        />
                      </div>
                      <span>{categoryScore}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 评分雷达图说明 */}
        <div className="radar-description">
          <p>评分基于设施数量、覆盖范围、服务盲区等因素综合计算，满分100分。</p>
          <ul>
            <li>90分及以上：优秀</li>
            <li>75-89分：良好</li>
            <li>60-74分：一般</li>
            <li>60分以下：需改善</li>
          </ul>
        </div>
      </div>

      {/* 四、服务盲区分析 */}
      <div id="blindspots" className="report-chapter">
        <h3>四、服务盲区分析</h3>

        {blindSpots.length > 0 ? (
          <>
            <div className="blind-spot-summary">
              <p>共发现 <strong>{blindSpots.length}</strong> 个服务盲区：</p>
            </div>
            <div className="blind-spot-list">
              {blindSpots.map((spot, index) => (
                <div key={index} className="blind-spot-item">
                  <div className="blind-spot-header">
                    <span className="blind-spot-number">#{index + 1}</span>
                    <span className="blind-spot-category">{spot.category}</span>
                  </div>
                  <p className="blind-spot-desc">{spot.description || `该区域${spot.category}设施覆盖不足`}</p>
                  <p className="blind-spot-location">
                    位置：{spot.center?.lng?.toFixed(4)}, {spot.center?.lat?.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-blind-spots">
            <p style={{ color: '#52c41a', fontWeight: 500 }}>未发现明显服务盲区，生活圈覆盖良好。</p>
          </div>
        )}
      </div>

      {/* 五、规划建议 */}
      <div id="suggestions" className="report-chapter">
        <h3>五、规划建议</h3>

        {suggestions.length > 0 ? (
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-item">
                <div className="suggestion-header">
                  {getPriorityTag(suggestion.priority)}
                  <span className="suggestion-category">{suggestion.category}</span>
                </div>
                <p className="suggestion-message">{suggestion.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-suggestions">
            <p style={{ color: '#52c41a', fontWeight: 500 }}>当前生活圈配置良好，暂无需要改善的问题。</p>
          </div>
        )}
      </div>

      {/* 六、出行方式对比总结 */}
      <div id="comparison" className="report-chapter">
        <h3>六、出行方式对比总结</h3>

        <div className="report-table-wrapper">
          <table className="report-table comparison-table">
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
                  <td className="label">{data.mode_name}</td>
                  <td>
                    <span style={{ color: getScoreColor(data.score?.level), fontWeight: 'bold' }}>
                      {data.score?.total || 0}
                    </span>
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

        {/* 结论 */}
        <div className="conclusion-section">
          <h4>结论</h4>
          <p>
            {communityName}15分钟生活圈整体得分为{score.total}分，处于{score.level}水平。
            共识别服务盲区{blindSpots.length}处，
            {blindSpots.length > 0 && `主要涉及${[...new Set(blindSpots.map(s => s.category))].join('、')}等设施。`}
            建议根据实际情况优化设施配置，提升生活圈服务品质。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;