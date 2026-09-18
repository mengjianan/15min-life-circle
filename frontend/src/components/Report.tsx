
interface ReportProps {
  communityName: string;
  fullResult: any;
  fengshuiResult?: any;
  activeMode?: string;
}

const Report: React.FC<ReportProps> = ({
  communityName,
  fullResult,
  
  activeMode = 'walking'
}) => {
  if (!fullResult) {
    return <div className="report-container">暂无数据</div>;
  }

  const modes = fullResult.modes || {};
  const comprehensiveScore = fullResult.comprehensive_score || {};
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

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return '#f6ffed';
    if (score >= 75) return '#e6f7ff';
    if (score >= 60) return '#fffbe6';
    return '#fff2f0';
  };

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

      {/* 第一部分：综合总分 */}
      <section className="report-section">
        <h3 className="section-title">📈 综合评分</h3>
        <div className="comprehensive-score">
          <div className="total-score-card">
            <div className="total-score-number" style={{ color: getScoreColor(comprehensiveScore.level) }}>
              {comprehensiveScore.total || 0}
            </div>
            <div className="total-score-level" style={{ backgroundColor: getScoreColor(comprehensiveScore.level) }}>
              {comprehensiveScore.level || '未知'}
            </div>
            <div className="total-score-label">综合得分</div>
          </div>

          <div className="score-breakdown">
            <h4>评分构成</h4>
            <div className="breakdown-items">
              <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.facility_coverage || 0) }}>
                <div className="breakdown-icon">🏢</div>
                <div className="breakdown-info">
                  <div className="breakdown-label">设施覆盖率</div>
                  <div className="breakdown-desc">已覆盖民生设施类别</div>
                </div>
                <div className="breakdown-score">
                  <span className="score-value">{comprehensiveScore.facility_coverage || 0}</span>
                  <span className="score-weight">权重35%</span>
                </div>
              </div>

              <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.accessibility || 0) }}>
                <div className="breakdown-icon">🚶</div>
                <div className="breakdown-info">
                  <div className="breakdown-label">可达性效率</div>
                  <div className="breakdown-desc">设施到达时间与距离</div>
                </div>
                <div className="breakdown-score">
                  <span className="score-value">{comprehensiveScore.accessibility || 0}</span>
                  <span className="score-weight">权重25%</span>
                </div>
              </div>

              <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.mode_adaptability || 0) }}>
                <div className="breakdown-icon">🚌</div>
                <div className="breakdown-info">
                  <div className="breakdown-label">出行方式适配度</div>
                  <div className="breakdown-desc">四种出行方式均衡性</div>
                </div>
                <div className="breakdown-score">
                  <span className="score-value">{comprehensiveScore.mode_adaptability || 0}</span>
                  <span className="score-weight">权重20%</span>
                </div>
              </div>

              <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.blind_spot || 0) }}>
                <div className="breakdown-icon">⚠️</div>
                <div className="breakdown-info">
                  <div className="breakdown-label">服务盲区识别</div>
                  <div className="breakdown-desc">未覆盖区域评估</div>
                </div>
                <div className="breakdown-score">
                  <span className="score-value">{comprehensiveScore.blind_spot || 0}</span>
                  <span className="score-weight">权重10%</span>
                </div>
              </div>

              <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.fengshui || 0) }}>
                <div className="breakdown-icon">🔮</div>
                <div className="breakdown-info">
                  <div className="breakdown-label">风水/居住适宜性</div>
                  <div className="breakdown-desc">环境与风水评估</div>
                </div>
                <div className="breakdown-score">
                  <span className="score-value">{comprehensiveScore.fengshui || 0}</span>
                  <span className="score-weight">权重10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第二部分：基础覆盖评分（四种出行方式） */}
      <section className="report-section">
        <h3 className="section-title">🏢 基础覆盖评分</h3>
        <div className="modes-coverage">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const modeScore = comprehensiveScore[`mode_${mode}`] || modeData.score || {};
            return (
              <div key={mode} className={`mode-coverage-card ${mode === activeMode ? 'active' : ''}`}>
                <div className="mode-header">
                  <span className="mode-icon">{modeIcons[mode]}</span>
                  <span className="mode-name">{modeNames[mode]}</span>
                  <span className="mode-total-score" style={{ color: getScoreColor(modeScore.level || '一般') }}>
                    {modeScore.total || 0}分
                  </span>
                </div>

                <div className="category-coverage">
                  {Object.entries(modeData.score?.categories || {}).map(([cat, score]: [string, any]) => (
                    <div key={cat} className="category-item">
                      <span className="category-name">{cat}</span>
                      <div className="category-bar">
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

                <div className="mode-stats">
                  <div className="stat">
                    <span className="stat-label">覆盖面积</span>
                    <span className="stat-value">{((modeData.time_slots?.['900']?.area || 0) / 1000000).toFixed(2)} km²</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">设施数量</span>
                    <span className="stat-value">
                      {Object.values(modeData.time_slots?.['900']?.poi_coverage || {}).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0)} 个
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">服务盲区</span>
                    <span className="stat-value">{(modeData.time_slots?.['900']?.blind_spots || []).length} 个</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 第三部分：可达性效率评分 */}
      <section className="report-section">
        <h3 className="section-title">🚶 可达性效率评分</h3>
        <div className="accessibility-section">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const coverage = modeData.time_slots?.['900']?.poi_coverage || {};
            // 计算平均可达时间
            let totalTime = 0;
            let count = 0;
            const nearestDistances: Record<string, number> = {};

            Object.entries(coverage).forEach(([cat, data]: [string, any]) => {
              const facilities = data.facilities || [];
              if (facilities.length > 0) {
                const nearest = Math.min(...facilities.map((f: any) => f.distance || 9999));
                nearestDistances[cat] = nearest;
                facilities.slice(0, 3).forEach((f: any) => {
                  totalTime += (f.distance || 0) / (modeData.speed || 1.2) / 60;
                  count++;
                });
              }
            });

            const avgTime = count > 0 ? totalTime / count : 0;

            return (
              <div key={mode} className="accessibility-card">
                <h4>{modeIcons[mode]} {modeNames[mode]}可达性</h4>
                <div className="accessibility-metrics">
                  <div className="metric">
                    <div className="metric-value">{avgTime.toFixed(1)}</div>
                    <div className="metric-label">平均可达时间(分钟)</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">
                      {Object.keys(nearestDistances).length > 0
                        ? (Object.values(nearestDistances).reduce((a, b) => a + b, 0) / Object.keys(nearestDistances).length).toFixed(0)
                        : '--'}
                    </div>
                    <div className="metric-label">平均最近距离(米)</div>
                  </div>
                </div>
                <div className="nearest-facilities">
                  {Object.entries(nearestDistances).map(([cat, dist]) => (
                    <div key={cat} className="nearest-item">
                      <span className="nearest-cat">最近{cat}</span>
                      <span className="nearest-dist">{dist}米</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 第四部分：出行方式对比评分 */}
      <section className="report-section">
        <h3 className="section-title">📊 出行方式对比评分</h3>
        <div className="mode-comparison">
          <div className="comparison-radar">
            <h4>四维雷达图</h4>
            <div className="radar-placeholder">
              {/* 这里可以集成雷达图组件 */}
              <div className="radar-items">
                {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
                  const score = modeData.score?.total || 0;
                  return (
                    <div key={mode} className="radar-item">
                      <span className="radar-mode">{modeIcons[mode]} {modeNames[mode]}</span>
                      <div className="radar-bar">
                        <div className="radar-bar-fill" style={{ width: `${score}%` }} />
                      </div>
                      <span className="radar-score">{score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="comparison-summary">
            <h4>出行方式适配度</h4>
            <p className="summary-text">
              该社区{modeNames[activeMode]}出行覆盖最好，
              综合适配度评分 <strong>{comprehensiveScore.mode_adaptability || 0}</strong> 分。
            </p>
          </div>
        </div>
      </section>

      {/* 第五部分：服务盲区识别 */}
      <section className="report-section">
        <h3 className="section-title">⚠️ 服务盲区识别</h3>
        <div className="blind-spots-section">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const spots = modeData.time_slots?.['900']?.blind_spots || [];
            return (
              <div key={mode} className="blind-spot-card">
                <h4>{modeIcons[mode]} {modeNames[mode]}盲区</h4>
                {spots.length === 0 ? (
                  <div className="no-blind-spot">✅ 无服务盲区</div>
                ) : (
                  <div className="blind-spot-list">
                    {spots.map((spot: any, idx: number) => (
                      <div key={idx} className="blind-spot-item">
                        <span className="spot-icon">📍</span>
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

      {/* 第六部分：风水/居住适宜性 */}
      {comprehensiveScore.fengshui_detail && (
        <section className="report-section">
          <h3 className="section-title">🔮 风水/居住适宜性评分</h3>
          <div className="fengshui-section">
            <div className="fengshui-total">
              <div className="fengshui-score-circle" style={{ borderColor: getScoreColor(comprehensiveScore.fengshui_detail.level) }}>
                <span className="fengshui-score-number">{comprehensiveScore.fengshui_detail.total}</span>
                <span className="fengshui-score-level">{comprehensiveScore.fengshui_detail.level}</span>
              </div>
            </div>

            <div className="fengshui-details">
              <h4>风水维度详解</h4>
              <div className="fengshui-items">
                <div className="fengshui-item">
                  <span className="fengshui-icon">⛰️</span>
                  <span className="fengshui-label">地势</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.terrain}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.terrain}</span>
                  <span className="fengshui-desc">地势平坦，适宜居住</span>
                </div>

                <div className="fengshui-item">
                  <span className="fengshui-icon">🧭</span>
                  <span className="fengshui-label">朝向</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.orientation}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.orientation}</span>
                  <span className="fengshui-desc">坐北朝南，采光通风</span>
                </div>

                <div className="fengshui-item">
                  <span className="fengshui-icon">💧</span>
                  <span className="fengshui-label">水系</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.water}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.water}</span>
                  <span className="fengshui-desc">水气适中，风水良好</span>
                </div>

                <div className="fengshui-item">
                  <span className="fengshui-icon">🛤️</span>
                  <span className="fengshui-label">道路形态</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.road_form}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.road_form}</span>
                  <span className="fengshui-desc">道路通畅，无冲煞</span>
                </div>

                <div className="fengshui-item">
                  <span className="fengshui-icon">🏥</span>
                  <span className="fengshui-label">敏感设施</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.sensitive_facilities}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.sensitive_facilities}</span>
                  <span className="fengshui-desc">敏感设施距离适中</span>
                </div>

                <div className="fengshui-item">
                  <span className="fengshui-icon">🌳</span>
                  <span className="fengshui-label">绿化</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.greenery}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.greenery}</span>
                  <span className="fengshui-desc">绿化覆盖率良好</span>
                </div>

                <div className="fengshui-item">
                  <span className="fengshui-icon">👥</span>
                  <span className="fengshui-label">人气</span>
                  <div className="fengshui-bar">
                    <div className="fengshui-bar-fill" style={{ width: `${comprehensiveScore.fengshui_detail.popularity}%` }} />
                  </div>
                  <span className="fengshui-score">{comprehensiveScore.fengshui_detail.popularity}</span>
                  <span className="fengshui-desc">商业活跃，人气旺盛</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 第七部分：体检总结 */}
      <section className="report-section conclusion">
        <h3 className="section-title">📊 体检总结</h3>
        <div className="conclusion-content">
          <p>
            <strong>{communityName}</strong> 15分钟生活圈综合评分
            <strong style={{ color: getScoreColor(comprehensiveScore.level) }}> {comprehensiveScore.total || 0}分</strong>，
            处于<strong style={{ color: getScoreColor(comprehensiveScore.level) }}>{comprehensiveScore.level || '未知'}</strong>水平。
          </p>
          <ul className="conclusion-list">
            <li>设施覆盖率得分 <strong>{comprehensiveScore.facility_coverage || 0}</strong> 分，权重35%</li>
            <li>可达性效率得分 <strong>{comprehensiveScore.accessibility || 0}</strong> 分，权重25%</li>
            <li>出行方式适配度得分 <strong>{comprehensiveScore.mode_adaptability || 0}</strong> 分，权重20%</li>
            <li>服务盲区识别得分 <strong>{comprehensiveScore.blind_spot || 0}</strong> 分，权重10%</li>
            <li>风水/居住适宜性得分 <strong>{comprehensiveScore.fengshui || 0}</strong> 分，权重10%</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Report;
