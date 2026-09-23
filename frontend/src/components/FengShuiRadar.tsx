import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

interface FengShuiRadarProps {
  data: any;  // 支持完整分析结果或纯评分数据
  showLabels?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  '优秀': '#52c41a',
  '良好': '#1890ff',
  '一般': '#faad14',
  '需改善': '#ff4d4f',
};

const getLevel = (score: number): string => {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '一般';
  return '需改善';
};

const FengShuiRadarComponent: React.FC<FengShuiRadarProps> = ({ data, showLabels = true }) => {
  // 兼容完整分析结果和纯评分数据
  const scores = data.score || data;
  const chartData = [
    { dimension: '地形', score: scores.terrain || 0, fullMark: 100 },
    { dimension: '水系', score: scores.water || 0, fullMark: 100 },
    { dimension: '环境', score: scores.environment || 0, fullMark: 100 },
    { dimension: '方位', score: scores.orientation || 0, fullMark: 100 },
  ];

  const averageScore = Math.round(
    ((scores.terrain || 0) + (scores.water || 0) + (scores.environment || 0) + (scores.orientation || 0)) / 4
  );
  const level = getLevel(averageScore);

  return (
    <div className="fengshui-radar-container">
      <div className="chart-title">风水评分</div>

      <ResponsiveContainer width="100%" height={200}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e8e8e8" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="风水评分"
            dataKey="score"
            stroke="#722ed1"
            fill="#722ed1"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: any) => [`${value}分`, '评分']}
            contentStyle={{ borderRadius: 8 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {showLabels && (
        <div className="fengshui-details">
          <div className="fengshui-total">
            <span className="total-label">综合风水评分</span>
            <span className="total-value" style={{ color: LEVEL_COLORS[level] }}>
              {averageScore}分
            </span>
            <span
              className="total-level"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
            >
              {level}
            </span>
          </div>
          <div className="fengshui-dimensions">
            {chartData.map(item => {
              const itemLevel = getLevel(item.score);
              return (
                <div key={item.dimension} className="dimension-item">
                  <span className="dimension-name">{item.dimension}</span>
                  <div className="dimension-bar-bg">
                    <div
                      className="dimension-bar-fill"
                      style={{
                        width: `${item.score}%`,
                        backgroundColor: LEVEL_COLORS[itemLevel]
                      }}
                    />
                  </div>
                  <span
                    className="dimension-score"
                    style={{ color: LEVEL_COLORS[itemLevel] }}
                  >
                    {item.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FengShuiRadarComponent;