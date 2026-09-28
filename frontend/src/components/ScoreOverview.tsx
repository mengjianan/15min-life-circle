import { Ico } from '../icons';

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
    transit: '公共交通',
    driving: '驾车'
  };

  const modeIcons: Record<string, string> = {
    walking: 'walk',
    cycling: 'bike',
    transit: 'bus',
    driving: 'car'
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
        <h3 className="section-title"><Ico n="trend" /> 综合评分</h3>
        <p className="blind-explain">
          五个维度加权合成：<b>设施覆盖 35% + 可达性 25% + 出行适配 20% + 盲区识别 10% + 风水评分 10%</b>，
          每个维度的含义见下方各项说明。
        </p>
        <div className="comprehensive-score-vertical">
          <div className="total-score-vertical">
            <span className="score-number" style={{ color: getScoreColor(comprehensiveScore.total || 0) }}>
              {comprehensiveScore.total || 0}
            </span>
            <span className="score-level" style={{ backgroundColor: getScoreColor(comprehensiveScore.total || 0) }}>
              {comprehensiveScore.level || '未知'}
            </span>
          </div>
        </div>
        <div className="category-coverage-compact">
          {[
            {
              key: 'facility_coverage', name: '设施覆盖', icon: 'building', weight: '35%',
              explain: <><b>各类设施数量对照标准的达标程度</b>——有设施得 40 分、数量达标再得 60 分，按类别权重（医疗最高 20%）加权，四种出行方式取平均。</>
            },
            {
              key: 'accessibility', name: '可达性', icon: 'walk', weight: '25%',
              explain: <><b>到设施的快慢与远近</b>——平均到达时间占 5 成、最近设施距离占 3 成、路网绕行占 2 成，5 分钟 / 300 米内为满分。</>
            },
            {
              key: 'mode_adaptability', name: '出行适配', icon: 'bus', weight: '20%',
              explain: <><b>四种出行方式得分是否均衡</b>——分差越小越好，避免「只有开车方便」；平均分 6 成、最佳方式 2 成、均衡度 2 成。</>
            },
            {
              key: 'blind_spot', name: '盲区识别', icon: 'warning', weight: '10%',
              explain: <><b>服务盲区越少分越高</b>——每个盲区扣 5 分，医疗/教育/养老类每个再扣 10 分。</>
            },
            {
              key: 'fengshui', name: '风水评分', icon: 'crystal', weight: '10%',
              explain: <><b>居住环境品质七项加权</b>——水系 20% 最高，地势/朝向/道路形态/敏感设施各 15%，绿化/人气各 10%。</>
            },
          ].map(({ key, name, icon, weight, explain }) => (
            <div key={key}>
              <div className="category-item-compact">
                <span className="category-icon-small"><Ico n={icon} /></span>
                <span className="category-name-small">{name}</span>
                <div className="category-bar-small">
                  <div className="category-bar-fill-small" style={{ width: `${comprehensiveScore[key] || 0}%`, backgroundColor: getScoreColor(comprehensiveScore[key] || 0) }} />
                </div>
                <span className="category-score-small">{comprehensiveScore[key] || 0}</span>
              </div>
              <p className="blind-explain"><b>{name}</b>（权重 {weight}）：{explain}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 出行方式对比 */}
      <section className="report-section compact">
        <h3 className="section-title"><Ico n="chart" /> 出行方式对比</h3>
        <p className="blind-explain">
          各方式得分 = <b>设施覆盖 50% + 可达性 30% + 盲区 20%</b>（15 分钟档）。
          圈越大能到的设施越多，所以<b>骑行/驾车通常高于步行</b>；步行分高说明家门口配套齐全，更宜居。
        </p>
        <div className="category-coverage-compact">
          {Object.entries(modes).map(([mode, modeData]: [string, any]) => {
            const score = modeData.score?.total || 0;
            return (
              <div key={mode} className="category-item-compact">
                <span className="category-icon-small"><Ico n={modeIcons[mode]} /></span>
                <span className="category-name-small">{modeNames[mode]}</span>
                <div className="category-bar-small">
                  <div className="category-bar-fill-small" style={{ width: `${comprehensiveScore.facility_coverage || 0}%`, backgroundColor: getScoreColor(score) }} />
                </div>
                <span className="category-score-small">{score}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 体检总结 */}
      <section className="report-section compact">
        <h3 className="section-title"><Ico n="chart" /> 体检总结</h3>
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
