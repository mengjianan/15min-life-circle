interface ReportProps {
  communityName: string;
  fullResult: any;
  fengshuiResult?: any;
  activeMode?: string;
  activeTimeSlot?: number;
}

const Report: React.FC<ReportProps> = ({
  // communityName,
  fullResult,
  activeMode = 'walking',
  activeTimeSlot = 900
}) => {
  if (!fullResult) {
    return <div className="report-container">暂无数据</div>;
  }

  const modes = fullResult.modes || {};
  const comprehensiveScore = fullResult.comprehensive_score || {};
  const currentMode = modes[activeMode] || {};
  const currentScore = currentMode.score || {};
  const currentCategories = currentScore.categories || {};

  // 根据时间档获取数据
  const timeSlotKey = String(activeTimeSlot);
  const currentSlot = currentMode.time_slots?.[timeSlotKey] || {};
  const coverage = currentSlot.poi_coverage || {};
  const blindSpots = currentSlot.blind_spots || [];

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

  // 计算可达性数据
  let totalTime = 0;
  let count = 0;
  const nearestDistances: Record<string, number> = {};

  Object.entries(coverage).forEach(([cat, data]: [string, any]) => {
    const facilities = data.facilities || [];
    if (facilities.length > 0) {
      const nearest = Math.min(...facilities.map((f: any) => f.distance || 9999));
      nearestDistances[cat] = nearest;
      facilities.slice(0, 3).forEach((f: any) => {
        totalTime += (f.distance || 0) / (currentMode.speed || 1.2) / 60;
        count++;
      });
    }
  });

  const avgTime = count > 0 ? totalTime / count : 0;
  const avgNearest = Object.keys(nearestDistances).length > 0
    ? Object.values(nearestDistances).reduce((a, b) => a + b, 0) / Object.keys(nearestDistances).length
    : 0;

  const timeLabel = activeTimeSlot === 300 ? '5分钟' : activeTimeSlot === 600 ? '10分钟' : '15分钟';

  return (
    <div className="report-container">
      {/* 基础覆盖评分 - 根据出行方式和时间切换 */}
      <section className="report-section compact">
        <h3 className="section-title">🏢 {timeLabel}覆盖评分</h3>
        <div className="category-coverage-compact">
          {Object.entries(currentCategories).map(([cat, score]: [string, any]) => (
            <div key={cat} className="category-item-compact">
              <span className="category-icon-small">{categoryIcons[cat] || '📍'}</span>
              <span className="category-name-small">{cat}</span>
              <div className="category-bar-small">
                <div
                  className="category-bar-fill-small"
                  style={{
                    width: `${score}%`,
                    backgroundColor: getScoreColor(score)
                  }}
                />
              </div>
              <span className="category-score-small">{score}</span>
            </div>
          ))}
        </div>
        <div className="mode-stats-compact">
          <span>面积: {((currentSlot.area || 0) / 1000000).toFixed(2)} km²</span>
          <span>设施: {Object.values(coverage).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0)} 个</span>
          <span>盲区: {blindSpots.length} 个</span>
        </div>
      </section>

      {/* 可达性效率 - 根据出行方式和时间切换 */}
      <section className="report-section compact">
        <h3 className="section-title">🚶 {timeLabel}可达性</h3>
        <div className="accessibility-compact">
          <div className="metric-compact">
            <span className="metric-value-compact">{avgTime.toFixed(1)}</span>
            <span className="metric-label-compact">平均时间(分钟)</span>
          </div>
          <div className="metric-compact">
            <span className="metric-value-compact">{avgNearest.toFixed(0)}</span>
            <span className="metric-label-compact">平均距离(米)</span>
          </div>
        </div>
        <div className="nearest-facilities-compact">
          {Object.entries(nearestDistances).slice(0, 4).map(([cat, dist]) => (
            <div key={cat} className="nearest-item-compact">
              <span className="nearest-cat-compact">{cat}</span>
              <span className="nearest-dist-compact">{dist}米</span>
            </div>
          ))}
        </div>
      </section>

      {/* 服务盲区 - 根据出行方式和时间切换 */}
      <section className="report-section compact">
        <h3 className="section-title">⚠️ {timeLabel}盲区</h3>
        {blindSpots.length === 0 ? (
          <div className="no-blind-spot-compact">✅ 无服务盲区</div>
        ) : (
          <div className="blind-spots-compact">
            {blindSpots.slice(0, 3).map((spot: any, idx: number) => (
              <div key={idx} className="blind-spot-item-compact">
                <span className="spot-icon-small">📍</span>
                <span className="spot-category-small">{spot.category}</span>
                <span className="spot-desc-small">{spot.description || `${spot.category}覆盖不足`}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 风水/居住适宜性 - 不随时间切换 */}
      {comprehensiveScore.fengshui_detail && (
        <section className="report-section compact">
          <h3 className="section-title">🔮 风水/居住适宜性</h3>
          <div className="fengshui-compact">
            <div className="fengshui-total-compact">
              <span className="fengshui-score-compact" style={{ color: getScoreColor(comprehensiveScore.fengshui_detail.total || 0) }}>
                {comprehensiveScore.fengshui_detail.total || 0}
              </span>
              <span className="fengshui-level-compact">{comprehensiveScore.fengshui_detail.level || '未知'}</span>
            </div>
            <div className="fengshui-items-compact">
              <div className="fengshui-item-compact">
                <span>⛰️ 地势</span>
                <span>{comprehensiveScore.fengshui_detail.terrain || 0}</span>
              </div>
              <div className="fengshui-item-compact">
                <span>🧭 朝向</span>
                <span>{comprehensiveScore.fengshui_detail.orientation || 0}</span>
              </div>
              <div className="fengshui-item-compact">
                <span>💧 水系</span>
                <span>{comprehensiveScore.fengshui_detail.water || 0}</span>
              </div>
              <div className="fengshui-item-compact">
                <span>🌳 绿化</span>
                <span>{comprehensiveScore.fengshui_detail.greenery || 0}</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Report;
