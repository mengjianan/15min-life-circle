import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ModeData {
  mode: string;
  mode_name: string;
  area_5: number;
  area_10: number;
  area_15: number;
  score: number;
  level: string;
}

interface ModeComparisonChartProps {
  data: Record<string, any>;
  activeMode: string;
}

const LEVEL_COLORS: Record<string, string> = {
  '优秀': '#52c41a',
  '良好': '#1890ff',
  '一般': '#faad14',
  '需改善': '#ff4d4f',
};

const ModeComparisonChart: React.FC<ModeComparisonChartProps> = ({ data, activeMode }) => {
  const chartData: ModeData[] = Object.entries(data).map(([mode, modeData]: [string, any]) => {
    const timeSlots = modeData.time_slots || {};
    return {
      mode,
      mode_name: modeData.mode_name || mode,
      area_5: timeSlots['300'] ? Number((timeSlots['300'].area / 1000000).toFixed(2)) : 0,
      area_10: timeSlots['600'] ? Number((timeSlots['600'].area / 1000000).toFixed(2)) : 0,
      area_15: timeSlots['900'] ? Number((timeSlots['900'].area / 1000000).toFixed(2)) : 0,
      score: modeData.score?.total || 0,
      level: modeData.score?.level || '需改善',
    };
  });

  return (
    <div className="chart-container">
      <div className="chart-title">出行方式覆盖面积对比</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="mode_name"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
          />
          <YAxis
            label={{ value: 'km²', position: 'insideTopLeft', offset: -5 }}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
          />
          <Tooltip
            formatter={(value: any, name: any) => [`${value} km²`, name]}
            labelFormatter={(label: any) => `出行方式: ${label}`}
            contentStyle={{ borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="area_5" name="5分钟" fill="#91d5ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="area_10" name="10分钟" fill="#69c0ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="area_15" name="15分钟" fill="#1890ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mode-scores">
        {chartData.map(item => (
          <div
            key={item.mode}
            className={`mode-score-item ${activeMode === item.mode ? 'active' : ''}`}
          >
            <div className="mode-score-name">{item.mode_name}</div>
            <div
              className="mode-score-value"
              style={{ color: LEVEL_COLORS[item.level] || '#666' }}
            >
              {item.score}分
            </div>
            <div
              className="mode-score-level"
              style={{ backgroundColor: LEVEL_COLORS[item.level] || '#666' }}
            >
              {item.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeComparisonChart;