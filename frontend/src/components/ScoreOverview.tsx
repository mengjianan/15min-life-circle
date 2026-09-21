interface ScoreOverviewProps {
  fullResult: any;
  communityName: string;
}

const ScoreOverview: React.FC<ScoreOverviewProps> = ({ fullResult, communityName }) => {
  if (!fullResult) return null;

  const comprehensiveScore = fullResult.comprehensive_score || {};
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div className="report-container">
      {/* 综合评分 */}
      <section className="report-section compact">
        <h3 className="section-title">📈 综合评分</h3>
        <div className="comprehensive-score-vertical">
          <div className="total-score-vertical">
            <span className="score-number" style={{ color: getScoreColor(comprehensiveScore.total || 0) }}>
              {comprehensiveScore.total || 0}
            </span>
            <span className="score-level" style={{ backgroundColor: getScoreColor(comprehensiveScore.total || 0) }}>
              {comprehensiveScore.level || '未知'}
            </span>
          </div>
          <div className="score-breakdown-vertical">
            <div className="breakdown-item-vertical">
              <span className="breakdown-icon">🏢</span>
              <span className="breakdown-label">设施覆盖</span>
              <div className="breakdown-bar">
                <div className="breakdown-bar-fill" style={{ width: `${comprehensiveScore.facility_coverage || 0}%`, backgroundColor: getScoreColor(comprehensiveScore.facility_coverage || 0) }} />
              </div>
              <span className="breakdown-score">{comprehensiveScore.facility_coverage || 0}</span>
              <span className="breakdown-weight">占总分35%</span>
            </div>
            <div className="breakdown-item-vertical">
              <span className="breakdown-icon">🚶</span>
              <span className="breakdown-label">可达性</span>
              <div className="breakdown-bar">
                <div className="breakdown-bar-fill" style={{ width: `${comprehensiveScore.facility_coverage || 0}%`, backgroundColor: getScoreColor(comprehensiveScore.accessibility || 0) }} />
              </div>
              <span className="breakdown-score">{comprehensiveScore.accessibility || 0}</span>
              <span className="breakdown-weight">占总分25%</span>
            </div>
            <div className="breakdown-item-vertical">
              <span className="breakdown-icon">🚌</span>
              <span className="breakdown-label">出行适配</span>
              <div className="breakdown-bar">
                <div className="breakdown-bar-fill" style={{ width: `${comprehensiveScore.facility_coverage || 0}%`, backgroundColor: getScoreColor(comprehensiveScore.mode_adaptability || 0) }} />
              </div>
              <span className="breakdown-score">{comprehensiveScore.mode_adaptability || 0}</span>
              <span className="breakdown-weight">占总分20%</span>
            </div>
            <div className="breakdown-item-vertical">
              <span className="breakdown-icon">⚠️</span>
              <span className="breakdown-label">盲区识别</span>
              <div className="breakdown-bar">
                <div className="breakdown-bar-fill" style={{ width: `${comprehensiveScore.facility_coverage || 0}%`, backgroundColor: getScoreColor(comprehensiveScore.blind_spot || 0) }} />
              </div>
              <span className="breakdown-score">{comprehensiveScore.blind_spot || 0}</span>
              <span className="breakdown-weight">占总分10%</span>
            </div>
            <div className="breakdown-item-vertical">
              <span className="breakdown-icon">🔮</span>
              <span className="breakdown-label">风水评分</span>
              <div className="breakdown-bar">
                <div className="breakdown-bar-fill" style={{ width: `${comprehensiveScore.facility_coverage || 0}%`, backgroundColor: getScoreColor(comprehensiveScore.fengshui || 0) }} />
              </div>
              <span className="breakdown-score">{comprehensiveScore.fengshui || 0}</span>
              <span className="breakdown-weight">占总分10%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 出行方式对比 */}
      <section className="report-section compact">
        <h3 className="section-title">📊 出行方式对比</h3>
        <div className="mode-comparison-vertical">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const score = modeData.score?.total || 0;
            return (
              <div key={mode} className="mode-item-vertical">
                <span className="mode-icon">{modeIcons[mode]}</span>
                <span className="mode-name">{modeNames[mode]}</span>
                <div className="mode-bar">
                  <div
                    className="mode-bar-fill"
                    style={{
                      width: `${comprehensiveScore.facility_coverage || 0}%`,
                      backgroundColor: getScoreColor(score)
                    }}
                  />
                </div>
                <span className="mode-score" style={{ color: getScoreColor(score) }}>{score}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 体检总结 */}
      <section className="report-section compact">
        <h3 className="section-title">📊 体检总结</h3>
        <div className="conclusion-vertical">
          <p className="conclusion-text">
            <strong>{communityName}</strong> 综合评分
            <strong style={{ color: getScoreColor(comprehensiveScore.total || 0) }}> {comprehensiveScore.total || 0}分</strong>，
            处于<strong style={{ color: getScoreColor(comprehensiveScore.total || 0) }}>{comprehensiveScore.level || '未知'}</strong>水平。
          </p>
        </div>
      </section>
    </div>
  );
};

export default ScoreOverview;
