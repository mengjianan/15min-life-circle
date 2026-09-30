import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid,
  PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// 报告页专用小图表：分组条形图（设施覆盖 / 出行得分 / 等时圈面积 共用）
interface GroupedBarChartProps {
  data: Record<string, any>[];            // 每行 { name, [seriesKey]: number }
  series: { key: string; color: string }[];
  unit?: string;
  height?: number;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data, series, unit = '', height = 170 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} interval={0} />
      <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
      <Tooltip
        formatter={(v: any, k: any) => [`${v}${unit}`, k]}
        contentStyle={{ fontSize: 11, borderRadius: 8 }}
      />
      <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
      {series.map((s) => (
        <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[2, 2, 0, 0]} barSize={9} />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

// 报告页专用小图表：综合五维雷达
interface ScoreRadarProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
}

export const ScoreRadar: React.FC<ScoreRadarProps> = ({ data, color = '#667eea', height = 180 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
      <PolarGrid stroke="#e5e7eb" />
      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: '#c0c4cc' }} />
      <Radar name="得分" dataKey="value" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
      <Tooltip formatter={(v: any) => [`${v}分`, '得分']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
    </RadarChart>
  </ResponsiveContainer>
);

// 社区对比用：多社区雷达叠加（一社区一色，与柱状图同色系）
interface MultiRadarProps {
  data: Record<string, any>[]; // 每行 { name, [seriesKey]: number }
  series: { key: string; color: string }[];
  height?: number;
}

export const MultiScoreRadar: React.FC<MultiRadarProps> = ({ data, series, height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <RadarChart cx="50%" cy="50%" outerRadius="66%" data={data}>
      <PolarGrid stroke="#e5e7eb" />
      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: '#c0c4cc' }} />
      <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
      {series.map((s) => (
        <Radar
          key={s.key}
          name={s.key}
          dataKey={s.key}
          stroke={s.color}
          fill={s.color}
          fillOpacity={0.15}
          strokeWidth={2}
        />
      ))}
      <Tooltip formatter={(v: any, k: any) => [`${v}分`, k]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
    </RadarChart>
  </ResponsiveContainer>
);
