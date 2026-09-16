import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';

interface FacilityData {
  name: string;
  value: number;
  color: string;
}

interface FacilityPieChartProps {
  data: Record<string, any>;
}

const CATEGORY_COLORS: Record<string, string> = {
  '医疗': '#ff4d4f',
  '教育': '#1890ff',
  '购物': '#52c41a',
  '养老': '#722ed1',
  '文体': '#fa8c16',
  '餐饮': '#eb2f96',
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const FacilityPieChart: React.FC<FacilityPieChartProps> = ({ data }) => {
  const chartData: FacilityData[] = Object.entries(data)
    .map(([category, categoryData]: [string, any]) => ({
      name: category,
      value: categoryData.count || 0,
      color: CATEGORY_COLORS[category] || '#666',
    }))
    .filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="chart-container">
        <div className="chart-title">设施分布</div>
        <div className="empty-chart">暂无设施数据</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-title">设施分布</div>
      <div className="pie-chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value}个`, name]}
              contentStyle={{ borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="facility-legend">
          {chartData.map(item => (
            <div key={item.name} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: item.color }} />
              <span className="legend-name">{item.name}</span>
              <span className="legend-count">{item.value}个</span>
              <span className="legend-percent">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          <div className="legend-total">
            <span>总计</span>
            <span className="total-count">{total}个</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityPieChart;