import React from 'react';
import RadarChart from './RadarChart';
import FengShuiRadar from './FengShuiRadar';
import FacilityPieChart from './FacilityPieChart';

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
    [key: string]: any;
    walking?: any;
    cycling?: any;
    transit?: any;
    driving?: any;
  };
  activeMode?: string;
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
  activeMode = 'walking'
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

  const getCategoryScoreColor = (val: number) => {
    if (val >= 90) return '#52c41a';
    if (val >= 75) return '#1890ff';
    if (val >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = { '高': '#ff4d4f', '中': '#faad14', '低': '#52c41a' };
    return <span className="priority-tag" style={{ backgroundColor: colors[priority] || '#666' }}>{priority}</span>;
  };

  const totalFacilities = Object.values(poiCoverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0);

  const modeName = activeMode === 'walking' ? '步行' : activeMode === 'cycling' ? '骑行' : activeMode === 'transit' ? '公交' : '驾车';

  // 计算9维度得分
  const dimensionScores = {
    '医疗': score.categories?.['医疗'] || 0,
    '教育': score.categories?.['教育'] || 0,
    '购物': score.categories?.['购物'] || 0,
    '养老': score.categories?.['养老'] || 0,
    '文体': score.categories?.['文体'] || 0,
    '餐饮': score.categories?.['餐饮'] || 0,
    '交通': Math.min(100, Math.round((isochrone?.area || 0) / 1000000 * 40)),
    '盲区': Math.max(0, 100 - blindSpots.length * 10),
    '空间': Math.min(100, Math.round((isochrone?.area || 0) / 500000 * 100))
  };

  // 计算各出行方式的覆盖面积
  const modeAreas = {
    '步行': fullModeData?.walking?.time_slots?.['900']?.area || 0,
    '骑行': fullModeData?.cycling?.time_slots?.['900']?.area || 0,
    '公交': fullModeData?.transit?.time_slots?.['900']?.area || 0,
    '驾车': fullModeData?.driving?.time_slots?.['900']?.area || 0
  };

  return (
    <div className="report-container">
      {/* 标题 */}
      <div className="report-header">
        <h2>📊 15分钟生活圈体检报告</h2>
        <div className="report-meta">
          <span>📍 {communityName}</span>
          <span>📅 {new Date().toLocaleDateString('zh-CN')}</span>
          <span>🚶 {modeName}模式</span>
        </div>
      </div>

      {/* 第一行：综合评分 + 风水评分 */}
      <div className="report-row">
        <div className="report-card score-card">
          <h3>综合评分</h3>
          <div className="score-display">
            <div className="score-number" style={{ color: getScoreColor(score.level) }}>{score.total}</div>
            <div className="score-level" style={{ backgroundColor: getScoreColor(score.level) }}>{score.level}</div>
          </div>
          <div className="score-desc">
            {score.total >= 90 ? '生活圈配置优秀' : score.total >= 75 ? '生活圈配置良好' : score.total >= 60 ? '生活圈配置一般' : '生活圈需要改善'}
          </div>
        </div>

        <div className="report-card fengshui-card">
          <h3>🔮 风水评分</h3>
          {fengshuiScore ? (
            <FengShuiRadar data={fengshuiScore} showLabels={true} />
          ) : (
            <div className="loading">风水分析中...</div>
          )}
        </div>
      </div>

      {/* 第二行：9维度雷达图 */}
      <div className="report-row full-width">
        <div className="report-card">
          <h3>🎯 9维度设施覆盖雷达图</h3>
          <div className="radar-container">
            <RadarChart categories={dimensionScores} />
          </div>
          <div className="category-legend">
            {Object.entries(dimensionScores).map(([cat, val]) => (
              <div key={cat} className="legend-item">
                <span className="legend-name">{cat}</span>
                <span className="legend-score" style={{ color: getCategoryScoreColor(val as number) }}>{val}分</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 第三行：4种出行方式对比 */}
      <div className="report-row full-width">
        <div className="report-card">
          <h3>🚗 4种出行方式覆盖对比</h3>
          <div className="mode-comparison-grid">
            {Object.entries(modeAreas).map(([mode, area]) => (
              <div key={mode} className={`mode-card ${mode === modeName ? 'active' : ''}`}>
                <div className="mode-icon">
                  {mode === '步行' ? '🚶' : mode === '骑行' ? '🚲' : mode === '公交' ? '🚌' : '🚗'}
                </div>
                <div className="mode-name">{mode}</div>
                <div className="mode-area">{(area as number / 1000000).toFixed(2)} km²</div>
                <div className="mode-label">15分钟覆盖</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 第四行：时间维度 + 设施分布 */}
      <div className="report-row">
        <div className="report-card">
          <h3>⏱️ 时间维度覆盖</h3>
          <div className="time-slots">
            {[5, 10, 15].map(minutes => {
              const slotKey = String(minutes * 60);
              const area = fullModeData?.[activeMode]?.time_slots?.[slotKey]?.area || 0;
              return (
                <div key={minutes} className="time-slot-item">
                  <div className="time-label">{minutes}分钟</div>
                  <div className="time-area">{(area / 1000000).toFixed(2)} km²</div>
                  <div className="time-bar">
                    <div className="time-bar-fill" style={{ width: `${Math.min(100, area / 50000)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="report-card">
          <h3>🏢 设施分布</h3>
          <FacilityPieChart data={poiCoverage || {}} />
        </div>
      </div>

      {/* 第五行：关键指标 */}
      <div className="report-row full-width">
        <div className="report-card">
          <h3>📈 关键指标</h3>
          <div className="metrics-grid">
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
            <div className="metric-item">
              <span className="metric-icon">🔮</span>
              <span className="metric-label">风水评分</span>
              <span className="metric-value">{fengshuiScore?.total || '--'} 分</span>
            </div>
          </div>
        </div>
      </div>

      {/* 第六行：盲区分析 */}
      {blindSpots.length > 0 && (
        <div className="report-row full-width">
          <div className="report-card warning-card">
            <h3>⚠️ 服务盲区分析</h3>
            <div className="blind-spots-list">
              {blindSpots.map((spot, index) => (
                <div key={index} className="blind-spot-item">
                  <span className="spot-index">{index + 1}</span>
                  <span className="spot-category">{spot.category}</span>
                  <span className="spot-desc">{spot.description || `${spot.category}设施覆盖不足`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 第七行：规划建议 */}
      {suggestions.length > 0 && (
        <div className="report-row full-width">
          <div className="report-card">
            <h3>💡 规划建议</h3>
            <div className="suggestions-list">
              {suggestions.map((s, i) => (
                <div key={i} className="suggestion-item">
                  {getPriorityTag(s.priority)}
                  <span className="suggestion-category">{s.category}</span>
                  <span className="suggestion-text">{s.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 总结 */}
      <div className="report-conclusion">
        <h3>📊 体检总结</h3>
        <p>
          <strong>{communityName}</strong> 15分钟生活圈综合评分
          <strong style={{ color: getScoreColor(score.level) }}> {score.total}分</strong>，
          处于<strong style={{ color: getScoreColor(score.level) }}>{score.level}</strong>水平。
          {modeName}15分钟覆盖面积 {isochrone?.area ? (isochrone.area / 1000000).toFixed(2) : '0'} 平方公里，
          周边共有 {totalFacilities} 处设施。
          {blindSpots.length > 0 ? `发现 ${blindSpots.length} 个服务盲区。` : '覆盖良好。'}
          {fengshuiScore && `风水评分 ${fengshuiScore.total}分（${fengshuiScore.level}）。`}
        </p>
      </div>
    </div>
  );
};

export default Report;