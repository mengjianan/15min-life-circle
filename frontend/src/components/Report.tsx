import React from 'react';
import FengShuiRadar from './FengShuiRadar';

interface ReportProps {
  communityName: string;
  fullResult: any;
  fengshuiResult?: any;
  activeMode?: string;
}

const Report: React.FC<ReportProps> = ({
  communityName,
  fullResult,
  fengshuiResult,
  activeMode = 'walking'
}) => {
  if (!fullResult) {
    return <div className="report-container">暂无数据</div>;
  }

  const modes = fullResult.modes || {};
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

  const getScoreColor = (level: string) => {
    switch (level) {
      case '优秀': return '#52c41a';
      case '良好': return '#1890ff';
      case '一般': return '#faad14';
      case '需改善': return '#ff4d4f';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return '#ff4d4f';
      case '中': return '#faad14';
      case '低': return '#52c41a';
      default: return '#666';
    }
  };

  // 计算综合评分
  const totalScore = Math.round(
    Object.values(modes).reduce((sum: number, m: any) => sum + (m.score?.total || 0), 0) / 4
  );
  const totalLevel = totalScore >= 90 ? '优秀' : totalScore >= 75 ? '良好' : totalScore >= 60 ? '一般' : '需改善';

  return (
    <div className="report-container">
      {/* 报告标题 */}
      <div className="report-header">
        <h2>📊 15分钟生活圈体检报告</h2>
        <div className="report-meta">
          <span>📍 {communityName}</span>
          <span>📅 {new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* 第一部分：综合概览 */}
      <section className="report-section">
        <h3 className="section-title">📈 综合概览</h3>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-label">综合评分</div>
            <div className="overview-score" style={{ color: getScoreColor(totalLevel) }}>
              {totalScore}
            </div>
            <div className="overview-level" style={{ backgroundColor: getScoreColor(totalLevel) }}>
              {totalLevel}
            </div>
          </div>
          {fengshuiResult && (
            <div className="overview-card">
              <div className="overview-label">风水评分</div>
              <div className="overview-score" style={{ color: getScoreColor(fengshuiResult.level) }}>
                {fengshuiResult.total}
              </div>
              <div className="overview-level" style={{ backgroundColor: getScoreColor(fengshuiResult.level) }}>
                {fengshuiResult.level}
              </div>
            </div>
          )}
          <div className="overview-card">
            <div className="overview-label">最佳出行方式</div>
            <div className="overview-best-mode">
              {Object.entries(modes).sort((a: any, b: any) => (b[1].score?.total || 0) - (a[1].score?.total || 0))[0]?.[0] === 'walking' ? '🚶 步行' :
               Object.entries(modes).sort((a: any, b: any) => (b[1].score?.total || 0) - (a[1].score?.total || 0))[0]?.[0] === 'cycling' ? '🚲 骑行' :
               Object.entries(modes).sort((a: any, b: any) => (b[1].score?.total || 0) - (a[1].score?.total || 0))[0]?.[0] === 'transit' ? '🚌 公交' : '🚗 驾车'}
            </div>
          </div>
        </div>
      </section>

      {/* 第二部分：4种出行方式详细分析 */}
      <section className="report-section">
        <h3 className="section-title">🚶🚌🚗 出行方式详细分析</h3>

        {Object.entries(modes).map(([mode, modeData]: [string, any]) => (
          <div key={mode} className={`mode-section ${mode === activeMode ? 'active' : ''}`}>
            <h4 className="mode-title">
              {modeIcons[mode]} {modeNames[mode]}分析
            </h4>

            <div className="mode-stats-grid">
              <div className="stat-item">
                <span className="stat-label">覆盖面积</span>
                <span className="stat-value">{((modeData.time_slots?.['900']?.area || 0) / 1000000).toFixed(2)} km²</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">设施数量</span>
                <span className="stat-value">
                  {Object.values(modeData.time_slots?.['900']?.poi_coverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0)} 个
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">服务盲区</span>
                <span className="stat-value">{(modeData.time_slots?.['900']?.blind_spots || []).length} 个</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">评分</span>
                <span className="stat-value" style={{ color: getScoreColor(modeData.score?.level) }}>
                  {modeData.score?.total} 分
                </span>
              </div>
            </div>

            {/* 6维度雷达图 */}
            <div className="category-radar">
              <h5>设施覆盖评分</h5>
              <div className="category-bars">
                {Object.entries(modeData.score?.categories || {}).map(([cat, score]: [string, any]) => (
                  <div key={cat} className="category-bar-item">
                    <span className="category-name">{cat}</span>
                    <div className="category-bar-bg">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${score}%`,
                          backgroundColor: score >= 90 ? '#52c41a' : score >= 75 ? '#1890ff' : score >= 60 ? '#faad14' : '#ff4d4f'
                        }}
                      />
                    </div>
                    <span className="category-score">{score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 设施列表 */}
            <div className="facilities-list">
              <h5>主要设施</h5>
              <div className="facilities-grid">
                {Object.entries(modeData.time_slots?.['900']?.poi_coverage || {}).map(([category, data]: [string, any]) => (
                  <div key={category} className="facility-category">
                    <div className="facility-category-title">{category}</div>
                    {(data.facilities || []).slice(0, 3).map((fac: any, idx: number) => (
                      <div key={idx} className="facility-item">
                        <span className="facility-name">{fac.name}</span>
                        <span className="facility-distance">{fac.distance}m</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 路线信息 */}
            {modeData.routes && modeData.routes.length > 0 && (
              <div className="routes-info">
                <h5>路线规划</h5>
                <div className="routes-list">
                  {modeData.routes.slice(0, 5).map((route: any, idx: number) => (
                    <div key={idx} className="route-item">
                      <span className="route-facility">{route.facility_name}</span>
                      <span className="route-category">{route.category}</span>
                      <span className="route-distance">{route.route?.distance || 0}m</span>
                      <span className="route-duration">{Math.round((route.route?.duration || 0) / 60)}分钟</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 第三部分：风水分析 */}
      {fengshuiResult && (
        <section className="report-section">
          <h3 className="section-title">🔮 风水分析</h3>
          <div className="fengshui-detail">
            <FengShuiRadar data={fengshuiResult} showLabels={true} />
            <div className="fengshui-items">
              <div className="fengshui-item">
                <span className="fengshui-icon">⛰️</span>
                <span className="fengshui-label">地形</span>
                <span className="fengshui-score">{fengshuiResult.terrain}分</span>
                <span className="fengshui-desc">地势平坦，适宜居住</span>
              </div>
              <div className="fengshui-item">
                <span className="fengshui-icon">💧</span>
                <span className="fengshui-label">水系</span>
                <span className="fengshui-score">{fengshuiResult.water}分</span>
                <span className="fengshui-desc">水气适中，风水良好</span>
              </div>
              <div className="fengshui-item">
                <span className="fengshui-icon">🌳</span>
                <span className="fengshui-label">环境</span>
                <span className="fengshui-score">{fengshuiResult.environment}分</span>
                <span className="fengshui-desc">绿化良好，环境宜人</span>
              </div>
              <div className="fengshui-item">
                <span className="fengshui-icon">🧭</span>
                <span className="fengshui-label">方位</span>
                <span className="fengshui-score">{fengshuiResult.orientation}分</span>
                <span className="fengshui-desc">坐北朝南，采光通风</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 第四部分：服务盲区分析 */}
      <section className="report-section">
        <h3 className="section-title">⚠️ 服务盲区分析</h3>
        <div className="blind-spots-analysis">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const spots = modeData.time_slots?.['900']?.blind_spots || [];
            return (
              <div key={mode} className="blind-spot-mode">
                <h5>{modeIcons[mode]} {modeNames[mode]}盲区</h5>
                {spots.length === 0 ? (
                  <div className="no-blind-spot">✅ 无服务盲区</div>
                ) : (
                  <div className="blind-spot-list">
                    {spots.map((spot: any, idx: number) => (
                      <div key={idx} className="blind-spot-item">
                        <span className="spot-category">{spot.category}</span>
                        <span className="spot-desc">{spot.description || `${spot.category}设施覆盖不足`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 第五部分：规划建议 */}
      <section className="report-section">
        <h3 className="section-title">💡 规划建议</h3>
        <div className="suggestions-list">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const suggestions = modeData.suggestions || [];
            return suggestions.length > 0 ? (
              <div key={mode} className="suggestions-mode">
                <h5>{modeIcons[mode]} {modeNames[mode]}建议</h5>
                {suggestions.map((s: any, idx: number) => (
                  <div key={idx} className="suggestion-item">
                    <span className="priority-tag" style={{ backgroundColor: getPriorityColor(s.priority) }}>
                      {s.priority}
                    </span>
                    <span className="suggestion-category">{s.category}</span>
                    <span className="suggestion-text">{s.message}</span>
                  </div>
                ))}
              </div>
            ) : null;
          })}
        </div>
      </section>

      {/* 第六部分：体检总结 */}
      <section className="report-section conclusion">
        <h3 className="section-title">📊 体检总结</h3>
        <p>
          <strong>{communityName}</strong> 15分钟生活圈综合评分
          <strong style={{ color: getScoreColor(totalLevel) }}> {totalScore}分</strong>，
          处于<strong style={{ color: getScoreColor(totalLevel) }}>{totalLevel}</strong>水平。
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const area = ((modeData.time_slots?.['900']?.area || 0) / 1000000).toFixed(2);
            return `${modeNames[mode]}覆盖面积${area}平方公里，`;
          }).join('')}
          {fengshuiResult && `风水评分${fengshuiResult.total}分（${fengshuiResult.level}）。`}
        </p>
      </section>
    </div>
  );
};

export default Report;
