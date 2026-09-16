import React from 'react';
import RadarChart from './RadarChart';
import ModeComparisonChart from './ModeComparisonChart';
import FengShuiRadar from './FengShuiRadar';
import FacilityPieChart from './FacilityPieChart';
import TimeSlotChart from './TimeSlotChart';

interface ReportProps {
  communityName: string;
  score: {
    total: number;
    level: string;
    categories: Record<string, number>;
    blind_spot_penalty: number;
  };
  fengshuiScore?: {
    total: number;
    level: string;
    terrain: number;
    water: number;
    environment: number;
    orientation: number;
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
  activeMode?: string;
  activeTimeSlot?: number;
}

const Report: React.FC<ReportProps> = ({
  communityName,
  score,
  fengshuiScore,
  suggestions,
  blindSpots,
  poiCoverage,
  isochrone,
  fullModeData,
  activeMode = 'walking',
  activeTimeSlot = 900
}) => {
  const getCurrentModeData = () => {
    if (!fullModeData) return null;
    return (fullModeData as any)[activeMode] || null;
  };

  const getDynamicCategories = () => {
    let categories: Record<string, number> = {};

    if (fullModeData && activeMode && activeTimeSlot) {
      const modeData = (fullModeData as any)[activeMode];
      if (modeData && modeData.time_slots) {
        const slotData = modeData.time_slots[String(activeTimeSlot)];
        if (slotData && slotData.poi_coverage) {
          Object.entries(slotData.poi_coverage).forEach(([category, data]: [string, any]) => {
            const count = data.count || 0;
            if (count >= 8) categories[category] = 100;
            else if (count >= 5) categories[category] = 90;
            else if (count >= 3) categories[category] = 80;
            else if (count >= 2) categories[category] = 70;
            else if (count >= 1) categories[category] = 60;
            else categories[category] = 40;
          });
        }
      }
    }

    if (Object.keys(categories).length === 0) {
      categories = score.categories;
    }

    return categories;
  };

  const dynamicCategories = getDynamicCategories();

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

  const totalFacilities = Object.values(poiCoverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0);
  const modeData = getCurrentModeData();

  return (
    <div className="report-container">
      {/* Report Title */}
      <div className="report-main-title">
        <h2>15分钟生活圈体检报告</h2>
        <div className="report-meta">
          <span className="meta-item">📍 社区：{communityName}</span>
          <span className="meta-item">📅 时间：{new Date().toLocaleDateString('zh-CN')}</span>
          <span className="meta-item">🚶 出行方式：{activeMode === 'walking' ? '步行' : activeMode === 'cycling' ? '骑行' : activeMode === 'transit' ? '公交' : '驾车'}</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="report-charts-grid">
        <div className="chart-card">
          <ModeComparisonChart data={fullModeData || {}} activeMode={activeMode} />
        </div>
        <div className="chart-card">
          {modeData && modeData.time_slots && (
            <TimeSlotChart data={modeData.time_slots} activeTimeSlot={activeTimeSlot} />
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="report-charts-grid">
        <div className="chart-card">
          <div className="chart-title">设施覆盖评分</div>
          <div className="radar-chart-wrapper">
            <RadarChart categories={dynamicCategories} />
          </div>
          <div className="radar-legend">
            {Object.entries(dynamicCategories).map(([category, categoryScore]) => (
              <div key={category} className="radar-legend-item">
                <span className="legend-name">{category}</span>
                <span className="legend-score" style={{ color: getCategoryScoreColor(categoryScore as number) }}>
                  {categoryScore}分
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          {fengshuiScore ? (
            <FengShuiRadar data={fengshuiScore} showLabels={true} />
          ) : (
            <div className="empty-chart">
              <div className="chart-title">风水评分</div>
              <div className="no-data">风水数据加载中...</div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="report-charts-grid">
        <div className="chart-card">
          <FacilityPieChart data={poiCoverage || {}} />
        </div>
        <div className="chart-card score-summary-card">
          <div className="chart-title">综合评分</div>
          <div className="score-summary">
            <div className="score-big-number" style={{ color: getScoreColor(score.level) }}>
              {score.total}
            </div>
            <div className="score-unit">分</div>
            <div className="score-level-badge" style={{ backgroundColor: getScoreColor(score.level) }}>
              {score.level}
            </div>
          </div>
          <div className="key-metrics-summary">
            <div className="metric-item">
              <span className="metric-icon">📐</span>
              <span className="metric-label">覆盖面积</span>
              <span className="metric-value">{isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'} km²</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">🏢</span>
              <span className="metric-label">周边设施</span>
              <span className="metric-value">{totalFacilities} 个</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">⚠️</span>
              <span className="metric-label">服务盲区</span>
              <span className="metric-value">{blindSpots.length} 个</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blind Spots */}
      <div className="report-section-card">
        <div className="section-title">
          <span className="section-icon">⚠️</span>
          服务盲区分析
        </div>
        {blindSpots.length > 0 ? (
          <div className="blind-spots-grid">
            {blindSpots.map((spot, index) => (
              <div key={index} className="blind-spot-card">
                <div className="spot-number">{index + 1}</div>
                <div className="spot-content">
                  <div className="spot-category">{spot.category}</div>
                  <div className="spot-desc">{spot.description || '该区域' + spot.category + '设施覆盖不足'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-blind-spots">
            <span className="check-icon">✅</span>
            未发现明显服务盲区，覆盖良好
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="report-section-card">
        <div className="section-title">
          <span className="section-icon">💡</span>
          规划建议
        </div>
        <div className="suggestions-list">
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
              <span className="check-icon">✅</span>
              当前配置良好，暂无改善建议
            </div>
          )}
        </div>
      </div>

      {/* Conclusion */}
      <div className="report-conclusion">
        <div className="conclusion-title">📊 总结</div>
        <div className="conclusion-text">
          <p><strong>{communityName}</strong> 15分钟生活圈综合评分为<strong style={{ color: getScoreColor(score.level) }}>{score.total}分</strong>，处于<strong style={{ color: getScoreColor(score.level) }}>{score.level}</strong>水平。</p>
          <p>{activeMode === 'walking' ? '步行' : activeMode === 'cycling' ? '骑行' : activeMode === 'transit' ? '公交' : '驾车'}15分钟覆盖面积 {isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'} 平方公里，周边共有 {totalFacilities} 处设施。</p>
          <p>{blindSpots.length > 0 ? '发现 ' + blindSpots.length + ' 个服务盲区，建议优先完善相关设施。' : '未发现明显服务盲区，生活圈配置良好。'}</p>
          {fengshuiScore && <p>风水评分为 {fengshuiScore.total}分（{fengshuiScore.level}）。</p>}
        </div>
      </div>
    </div>
  );
};

export default Report;