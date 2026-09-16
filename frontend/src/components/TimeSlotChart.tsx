import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface TimeSlotData {
  time: string;
  area: number;
  facilities: number;
  blindSpots: number;
  isSelected: boolean;
}

interface TimeSlotChartProps {
  data: Record<string, any>;
  activeTimeSlot: number;
  onTimeSlotChange?: (time: number) => void;
}

const TimeSlotChart: React.FC<TimeSlotChartProps> = ({
  data,
  activeTimeSlot,
  onTimeSlotChange
}) => {
  const chartData: TimeSlotData[] = [
    { time: '5分钟', area: 0, facilities: 0, blindSpots: 0, isSelected: activeTimeSlot === 300 },
    { time: '10分钟', area: 0, facilities: 0, blindSpots: 0, isSelected: activeTimeSlot === 600 },
    { time: '15分钟', area: 0, facilities: 0, blindSpots: 0, isSelected: activeTimeSlot === 900 },
  ];

  Object.entries(data).forEach(([key, slotData]: [string, any]) => {
    const timeNum = Number(key);
    let index = -1;
    if (timeNum === 300) index = 0;
    else if (timeNum === 600) index = 1;
    else if (timeNum === 900) index = 2;

    if (index >= 0 && slotData) {
      chartData[index].area = Number((slotData.area / 1000000).toFixed(2));
      chartData[index].facilities = slotData.poi_coverage
        ? Object.values(slotData.poi_coverage).reduce((sum: number, cat: any) => sum + (cat.count || 0), 0)
        : 0;
      chartData[index].blindSpots = slotData.blind_spots?.length || 0;
    }
  });

  const handleClick = (data: any) => {
    if (onTimeSlotChange && data?.activePayload?.[0]) {
      const timeStr = data.activePayload[0].payload.time;
      const timeMap: Record<string, number> = {
        '5分钟': 300,
        '10分钟': 600,
        '15分钟': 900,
      };
      onTimeSlotChange(timeMap[timeStr] || 900);
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-title">时间维度覆盖对比</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
          />
          <YAxis
            label={{ value: 'km²', position: 'insideTopLeft', offset: -5 }}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d9d9d9' }}
          />
          <Tooltip
            formatter={(value: any, name: any) => {
              const labels: Record<string, string> = {
                area: '覆盖面积',
                facilities: '设施数',
                blindSpots: '盲区数',
              };
              const units: Record<string, string> = {
                area: 'km²',
                facilities: '个',
                blindSpots: '个',
              };
              return [`${value} ${units[name] || ''}`, labels[name] || name];
            }}
            contentStyle={{ borderRadius: 8 }}
          />
          <Bar dataKey="area" name="覆盖面积" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isSelected ? '#667eea' : '#b7c4f7'}
                stroke={entry.isSelected ? '#4f64d4' : 'none'}
                strokeWidth={entry.isSelected ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="time-slot-details">
        {chartData.map((item, index) => (
          <div
            key={index}
            className={`time-detail-item ${item.isSelected ? 'active' : ''}`}
            onClick={() => onTimeSlotChange?.(
              index === 0 ? 300 : index === 1 ? 600 : 900
            )}
          >
            <div className="detail-time">{item.time}</div>
            <div className="detail-stats">
              <span className="stat-item">
                <span className="stat-icon">📐</span>
                {item.area} km²
              </span>
              <span className="stat-item">
                <span className="stat-icon">🏢</span>
                {item.facilities} 个
              </span>
              <span className="stat-item">
                <span className="stat-icon">⚠️</span>
                {item.blindSpots} 个
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotChart;