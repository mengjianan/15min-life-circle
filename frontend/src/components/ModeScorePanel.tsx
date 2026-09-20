import React from 'react';

interface ModeScorePanelProps {
  fullResult: any;
  activeMode: string;
}

const ModeScorePanel: React.FC<ModeScorePanelProps> = ({ fullResult, activeMode }) => {
  if (!fullResult) return null;

  const modes = fullResult.modes || {};
  const comprehensiveScore = fullResult.comprehensive_score || {};
  const currentMode = modes[activeMode] || {};
  const currentScore = currentMode.score || {};
  const currentCategories = currentScore.categories || {};

  const modeNames: Record<string, string> = {
    walking: '步行',
    cycling: '骑行',
    transit: '公交',
    driving: '驾车'
  };

  const modeIcons: Record<string, string> = {
    walking: '🚶',
    cycling: '🚲',
    transit: '🚌',
    driving: '🚗'
  };

  const categoryIcons: Record<string, string> = {
    '医疗': '🏥',
    '教育': '📚',
    '购物': '🛒',
    '养老': '👴',
    '文体': '🎭',
    '餐饮': '🍽️',
    '交通': '🚌'
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getLevelText = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 75) return '良好';
    if (score >= 60) return '一般';
    return '需改善';
  };

  // 获取15分钟时间档的数据
  const slot15min = currentMode.time_slots?.['900'] || {};
  // const coverage = slot15min.poi_coverage || {};
  const blindSpots = slot15min.blind_spots || [];
  const area = slot15min.area || 0;

  return (
    <div className="mode-score-panel">
      {/* 当前出行方式总分 */}
      <div className="mode-total-score">
        <div className="mode-icon-large">{modeIcons[activeMode]}</div>
        <div className="mode-info">
          <div className="mode-name">{modeNames[activeMode]}</div>
          <div className="mode-score-value" style={{ color: getScoreColor(currentScore.total || 0) }}>
            {currentScore.total || 0}
            <span className="score-unit">分</span>
          </div>
          <div className="mode-level" style={{ backgroundColor: getScoreColor(currentScore.total || 0) }}>
            {currentScore.level || getLevelText(currentScore.total || 0)}
          </div>
        </div>
      </div>

      {/* 等时圈信息 */}
      <div className="isochrone-info">
        <div className="info-item">
          <span className="info-icon">📐</span>
          <span className="info-label">15分钟等时圈</span>
          <span className="info-value">{(area / 1000000).toFixed(2)} km²</span>
        </div>
        <div className="info-item">
          <span className="info-icon">🔍</span>
          <span className="info-label">服务盲区</span>
          <span className="info-value">{blindSpots.length} 个</span>
        </div>
      </div>

      {/* 设施覆盖评分 */}
      <div className="score-section">
        <h4 className="section-title">📊 设施覆盖评分</h4>
        <div className="category-scores">
          {Object.entries(currentCategories).map(([category, score]: [string, any]) => (
            <div key={category} className="category-item">
              <div className="category-header">
                <span className="category-icon">{categoryIcons[category] || '📍'}</span>
                <span className="category-name">{category}</span>
                <span className="category-score" style={{ color: getScoreColor(score) }}>
                  {score}分
                </span>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${score}%`,
                    backgroundColor: getScoreColor(score)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 综合评分构成 */}
      <div className="score-section">
        <h4 className="section-title">📈 综合评分构成</h4>
        <div className="score-composition">
          <div className="composition-item">
            <span className="composition-label">设施覆盖率</span>
            <span className="composition-weight">35%</span>
            <span className="composition-score">{comprehensiveScore.facility_coverage || 0}</span>
          </div>
          <div className="composition-item">
            <span className="composition-label">可达性效率</span>
            <span className="composition-weight">25%</span>
            <span className="composition-score">{comprehensiveScore.accessibility || 0}</span>
          </div>
          <div className="composition-item">
            <span className="composition-label">出行方式适配</span>
            <span className="composition-weight">20%</span>
            <span className="composition-score">{comprehensiveScore.mode_adaptability || 0}</span>
          </div>
          <div className="composition-item">
            <span className="composition-label">服务盲区</span>
            <span className="composition-weight">10%</span>
            <span className="composition-score">{comprehensiveScore.blind_spot || 0}</span>
          </div>
          <div className="composition-item">
            <span className="composition-label">风水评分</span>
            <span className="composition-weight">10%</span>
            <span className="composition-score">{comprehensiveScore.fengshui || 0}</span>
          </div>
        </div>
        <div className="total-score-bar">
          <div className="total-label">综合总分</div>
          <div className="total-value" style={{ color: getScoreColor(comprehensiveScore.total || 0) }}>
            {comprehensiveScore.total || 0}分
          </div>
          <div className="total-level" style={{ backgroundColor: getScoreColor(comprehensiveScore.total || 0) }}>
            {comprehensiveScore.level || '未知'}
          </div>
        </div>
      </div>

      {/* 四种出行方式对比 */}
      <div className="score-section">
        <h4 className="section-title">🚗 出行方式对比</h4>
        <div className="mode-comparison">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const score = modeData.score?.total || 0;
            const isActive = mode === activeMode;
            return (
              <div
                key={mode}
                className={`comparison-item ${isActive ? 'active' : ''}`}
              >
                <span className="comparison-icon">{modeIcons[mode]}</span>
                <span className="comparison-name">{modeNames[mode]}</span>
                <div className="comparison-bar">
                  <div
                    className="comparison-bar-fill"
                    style={{
                      width: `${score}%`,
                      backgroundColor: isActive ? getScoreColor(score) : '#d9d9d9'
                    }}
                  ></div>
                </div>
                <span className="comparison-score" style={{ color: isActive ? getScoreColor(score) : '#999' }}>
                  {score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 风水评分摘要 */}
      {comprehensiveScore.fengshui_detail && (
        <div className="score-section">
          <h4 className="section-title">🌊 风水评分</h4>
          <div className="fengshui-summary">
            <div className="fengshui-total">
              <span className="fengshui-score" style={{ color: getScoreColor(comprehensiveScore.fengshui_detail.total || 0) }}>
                {comprehensiveScore.fengshui_detail.total || 0}
              </span>
              <span className="fengshui-level">{comprehensiveScore.fengshui_detail.level || '未知'}</span>
            </div>
            <div className="fengshui-items">
              <div className="fengshui-mini-item">
                <span>🏔️ 地势</span>
                <span>{comprehensiveScore.fengshui_detail.terrain || 0}</span>
              </div>
              <div className="fengshui-mini-item">
                <span>🧭 朝向</span>
                <span>{comprehensiveScore.fengshui_detail.orientation || 0}</span>
              </div>
              <div className="fengshui-mini-item">
                <span>💧 水系</span>
                <span>{comprehensiveScore.fengshui_detail.water || 0}</span>
              </div>
              <div className="fengshui-mini-item">
                <span>🌳 绿化</span>
                <span>{comprehensiveScore.fengshui_detail.greenery || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeScorePanel;
