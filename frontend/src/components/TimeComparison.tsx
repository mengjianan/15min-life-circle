import React, { useState } from 'react';

interface TimeData {
  time?: number;
  time_text?: string;
  area?: number;
  boundary_points?: any[];
}

interface TimeComparisonProps {
  data: {
    time5?: TimeData;
    time10?: TimeData;
    time15?: TimeData;
  };
  onTimeChange: (time: number) => void;
}

const TimeComparison: React.FC<TimeComparisonProps> = ({ data, onTimeChange }) => {
  const [selectedTime, setSelectedTime] = useState(15);

  const timeOptions = [
    { value: 5, label: '5分钟', color: '#52c41a' },
    { value: 10, label: '10分钟', color: '#faad14' },
    { value: 15, label: '15分钟', color: '#1890ff' }
  ];

  const handleTimeSelect = (time: number) => {
    setSelectedTime(time);
    onTimeChange(time);
  };

  const getAreaData = () => {
    return timeOptions.map(option => {
      let area = 0;
      if (option.value === 5) area = data.time5?.area || 0;
      else if (option.value === 10) area = data.time10?.area || 0;
      else if (option.value === 15) area = data.time15?.area || 0;

      return {
        ...option,
        area: area,
        areaText: area > 0 ? `${(area / 1000000).toFixed(2)} km²` : '计算中'
      };
    });
  };

  const areaData = getAreaData();

  return (
    <div className="time-comparison">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        时间维度对比
      </h4>

      <div className="time-selector">
        {timeOptions.map(option => (
          <button
            key={option.value}
            className={`time-button ${selectedTime === option.value ? 'active' : ''}`}
            onClick={() => handleTimeSelect(option.value)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, color: option.color }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <span className="time-label">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="area-stats">
        {areaData.map(item => (
          <div
            key={item.value}
            className={`area-item ${selectedTime === item.value ? 'active' : ''}`}
          >
            <div
              className="area-color"
              style={{ backgroundColor: item.color }}
            />
            <div className="area-info">
              <span className="area-time">{item.label}</span>
              <span className="area-value">{item.areaText}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="area-chart">
        <div className="chart-bars">
          {areaData.map(item => {
            const maxArea = Math.max(...areaData.map(d => d.area || 1));
            const width = item.area > 0 ? (item.area / maxArea) * 100 : 0;

            return (
              <div key={item.value} className="chart-bar-container">
                <div className="chart-bar-label">{item.label}</div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${width}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
                <div className="chart-bar-value">{item.areaText}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeComparison;
