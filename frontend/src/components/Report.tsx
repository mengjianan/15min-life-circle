import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  communityName: string;
  fullResult?: any;
}

const MODE_NAMES: Record<string, string> = {
  walking: '步行',
  cycling: '骑行',
  transit: '公交',
  driving: '驾车'
};

const MODE_ICONS: Record<string, string> = {
  walking: '🚶',
  cycling: '🚴',
  transit: '🚌',
  driving: '🚗'
};

export default function Report({ communityName, fullResult }: Props) {
  if (!fullResult) return null;

  const comprehensiveScore = fullResult.comprehensive_score || {};
  const modes = fullResult.modes || {};

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return '#ecfdf5';
    if (score >= 70) return '#eff6ff';
    if (score >= 60) return '#fffbeb';
    return '#fef2f2';
  };

  // 雷达图数据
  const radarData = [
    { subject: '设施覆盖', score: comprehensiveScore.facility_coverage || 0, fullMark: 100 },
    { subject: '可达性', score: comprehensiveScore.accessibility || 0, fullMark: 100 },
    { subject: '出行适配', score: comprehensiveScore.mode_adaptability || 0, fullMark: 100 },
    { subject: '服务盲区', score: 100 - (comprehensiveScore.blind_spot_penalty || 0), fullMark: 100 },
    { subject: '风水宜居', score: comprehensiveScore.fengshui || 0, fullMark: 100 },
  ];

  // 柱状图数据
  const barData = Object.entries(modes).map(([mode, data]: [string, any]) => ({
    name: MODE_NAMES[mode],
    score: data.coverage_score || 0,
    facilities: data.total_facilities || 0,
  }));

  return (
    <div className="report-container compact-report">
      <h1 style={{ textAlign: 'center', marginBottom: '4px' }}>📊 15分钟生活圈体检报告</h1>
      <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '10px', marginBottom: '8px' }}>{communityName}</p>

      {/* 一、综合评分 */}
      <h2>一、综合评分</h2>
      <div className="comprehensive-score">
        <div className="score-header">
          <div>
            <div className="score-value">{comprehensiveScore.total || 0}</div>
            <div className="score-level">{comprehensiveScore.level || '未知'}</div>
          </div>
        </div>
        <div className="score-desc">基于设施覆盖、可达性、出行适配、服务盲区、风水宜居5个维度的综合评估</div>

        {/* 雷达图 */}
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={100}>
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Radar name="评分" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 权重 */}
        <div className="weights-grid">
          <div className="weight-item"><span className="weight-name">设施覆盖</span><span className="weight-value">35%</span></div>
          <div className="weight-item"><span className="weight-name">可达性</span><span className="weight-value">25%</span></div>
          <div className="weight-item"><span className="weight-name">出行适配</span><span className="weight-value">20%</span></div>
          <div className="weight-item"><span className="weight-name">服务盲区</span><span className="weight-value">10%</span></div>
          <div className="weight-item"><span className="weight-name">风水宜居</span><span className="weight-value">10%</span></div>
        </div>

        {/* 分项得分 */}
        <div className="breakdown-grid">
          <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.facility_coverage || 0) }}>
            <span className="breakdown-name">设施覆盖</span>
            <span className="breakdown-value">{comprehensiveScore.facility_coverage || 0}</span>
          </div>
          <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.accessibility || 0) }}>
            <span className="breakdown-name">可达性</span>
            <span className="breakdown-value">{comprehensiveScore.accessibility || 0}</span>
          </div>
          <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.mode_adaptability || 0) }}>
            <span className="breakdown-name">出行适配</span>
            <span className="breakdown-value">{comprehensiveScore.mode_adaptability || 0}</span>
          </div>
          <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(100 - (comprehensiveScore.blind_spot_penalty || 0)) }}>
            <span className="breakdown-name">服务盲区</span>
            <span className="breakdown-value">{100 - (comprehensiveScore.blind_spot_penalty || 0)}</span>
          </div>
          <div className="breakdown-item" style={{ backgroundColor: getScoreBgColor(comprehensiveScore.fengshui || 0) }}>
            <span className="breakdown-name">风水宜居</span>
            <span className="breakdown-value">{comprehensiveScore.fengshui || 0}</span>
          </div>
        </div>
      </div>

      {/* 二、各出行方式覆盖 */}
      <h2>二、各出行方式覆盖</h2>
      <div className="modes-grid">
        {Object.entries(modes).map(([mode, data]: [string, any]) => (
          <div key={mode} className="mode-card">
            <div className="mode-title">{MODE_ICONS[mode]} {MODE_NAMES[mode]}</div>
            <div className="mode-score">{data.coverage_score || 0}</div>
            <div className="mode-count">{data.total_facilities || 0}个设施</div>
            <div className="mode-area">覆盖{data.coverage_area_km2 || 0}km²</div>
          </div>
        ))}
      </div>

      {/* 柱状图 */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip />
            <Bar dataKey="score" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 三、可达性分析 */}
      <h2>三、可达性分析</h2>
      <div className="access-grid">
        {Object.entries(modes).map(([mode, data]: [string, any]) => (
          <div key={mode} className="access-card">
            <div className="access-title">{MODE_NAMES[mode]}</div>
            <div className="access-value">{data.avg_duration || '-'}</div>
            <div className="access-unit">分钟(平均)</div>
          </div>
        ))}
      </div>

      {/* 四、服务盲区 */}
      <h2>四、服务盲区</h2>
      {Object.entries(modes).map(([mode, data]: [string, any]) => (
        data.blind_spots && data.blind_spots.length > 0 && (
          <div key={mode}>
            <h3>{MODE_ICONS[mode]} {MODE_NAMES[mode]}盲区</h3>
            <ul className="blind-list">
              {data.blind_spots.slice(0, 3).map((spot: any, i: number) => (
                <li key={i}>• {spot.category}: {spot.reason}</li>
              ))}
            </ul>
          </div>
        )
      ))}

      {/* 五、风水宜居 */}
      <h2>五、风水宜居分析</h2>
      {comprehensiveScore.fengshui_detail && (
        <div className="fengshui-grid">
          <div className="fengshui-mini"><span>⛰️</span><span>地势</span><strong>{comprehensiveScore.fengshui_detail.terrain}</strong></div>
          <div className="fengshui-mini"><span>🧭</span><span>朝向</span><strong>{comprehensiveScore.fengshui_detail.orientation}</strong></div>
          <div className="fengshui-mini"><span>💧</span><span>水系</span><strong>{comprehensiveScore.fengshui_detail.water}</strong></div>
          <div className="fengshui-mini"><span>🛤️</span><span>道路</span><strong>{comprehensiveScore.fengshui_detail.road_form}</strong></div>
          <div className="fengshui-mini"><span>🏥</span><span>敏感设施</span><strong>{comprehensiveScore.fengshui_detail.sensitive_facilities}</strong></div>
          <div className="fengshui-mini"><span>🌳</span><span>绿化</span><strong>{comprehensiveScore.fengshui_detail.greenery}</strong></div>
          <div className="fengshui-mini"><span>👥</span><span>人气</span><strong>{comprehensiveScore.fengshui_detail.popularity}</strong></div>
        </div>
      )}

      {/* 六、总结 */}
      <h2>六、总结与建议</h2>
      <div className="conclusion-content">
        <p>该区域15分钟生活圈综合评分为 <strong>{comprehensiveScore.total || 0}</strong> 分，等级为 <strong>{comprehensiveScore.level || '未知'}</strong>。</p>
        <p>• 设施覆盖较为完善，基本满足日常生活需求</p>
        <p>• 步行和骑行可达性较好，公共交通便利</p>
        <p>• 风水宜居指数较高，居住环境舒适</p>
        <p style={{ marginTop: '4px', fontWeight: 600 }}>建议：适合居住，可优先考虑</p>
      </div>
    </div>
  );
}