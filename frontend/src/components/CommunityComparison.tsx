import React, { useState } from 'react';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

interface CommunityData {
  name: string;
  score: number;
  level: string;
  categories: Record<string, number>;
  area: number;
}

interface CommunityComparisonProps {
  history: CommunityData[];
}

const CommunityComparison: React.FC<CommunityComparisonProps> = ({ history }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'area' | 'categories'>('score');

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    return () => {
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current || history.length === 0) return;

    let option: echarts.EChartsOption;

    if (selectedMetric === 'score') {
      // 综合评分对比
      option = {
        title: {
          text: '社区综合评分对比',
          left: 'center',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const data = params[0];
            return `${data.name}<br/>评分: ${data.value}`;
          }
        },
        xAxis: {
          type: 'category',
          data: history.map(item => item.name),
          axisLabel: {
            rotate: 30,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          name: '评分',
          min: 0,
          max: 100
        },
        series: [{
          type: 'bar',
          data: history.map(item => ({
            value: item.score,
            itemStyle: {
              color: item.score >= 80 ? '#52c41a' : item.score >= 60 ? '#1890ff' : '#ff4d4f',
              borderRadius: [4, 4, 0, 0]
            }
          })),
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            fontSize: 12
          }
        }]
      };
    } else if (selectedMetric === 'area') {
      // 面积对比
      option = {
        title: {
          text: '15分钟步行范围面积对比',
          left: 'center',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const data = params[0];
            return `${data.name}<br/>面积: ${data.value.toFixed(2)} km²`;
          }
        },
        xAxis: {
          type: 'category',
          data: history.map(item => item.name),
          axisLabel: {
            rotate: 30,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          name: '面积 (km²)'
        },
        series: [{
          type: 'bar',
          data: history.map(item => ({
            value: item.area / 1000000,
            itemStyle: {
              color: '#1890ff',
              borderRadius: [4, 4, 0, 0]
            }
          })),
          barWidth: '40%',
          label: {
            show: true,
            position: 'top',
            formatter: '{c} km²',
            fontSize: 12
          }
        }]
      };
    } else {
      // 各类别评分雷达图对比
      const categories = Object.keys(history[0]?.categories || {});
      const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

      option = {
        title: {
          text: '各类设施评分对比',
          left: 'center',
          textStyle: { fontSize: 14 }
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: 0,
          data: history.map(item => item.name)
        },
        radar: {
          indicator: categories.map(cat => ({ name: cat, max: 100 })),
          shape: 'circle',
          splitNumber: 5
        },
        series: [{
          type: 'radar',
          data: history.map((item, index) => ({
            value: categories.map(cat => item.categories[cat] || 0),
            name: item.name,
            lineStyle: { color: colors[index % colors.length] },
            areaStyle: { color: colors[index % colors.length], opacity: 0.1 },
            itemStyle: { color: colors[index % colors.length] }
          }))
        }]
      };
    }

    chartInstanceRef.current.setOption(option);
  }, [history, selectedMetric]);

  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (history.length < 2) {
    return (
      <div className="community-comparison">
        <h4>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          社区对比
        </h4>
        <p className="comparison-hint">分析至少2个社区后可进行对比</p>
      </div>
    );
  }

  return (
    <div className="community-comparison">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        社区对比
      </h4>

      <div className="metric-selector">
        <button
          className={`metric-button ${selectedMetric === 'score' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('score')}
        >
          综合评分
        </button>
        <button
          className={`metric-button ${selectedMetric === 'area' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('area')}
        >
          覆盖面积
        </button>
        <button
          className={`metric-button ${selectedMetric === 'categories' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('categories')}
        >
          各类设施
        </button>
      </div>

      <div ref={chartRef} className="comparison-chart" />

      <div className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>社区</th>
              <th>评分</th>
              <th>等级</th>
              <th>面积</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td className="score-cell">{item.score}</td>
                <td>
                  <span className={`level-badge level-${item.level}`}>
                    {item.level}
                  </span>
                </td>
                <td>{(item.area / 1000000).toFixed(2)} km²</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityComparison;
