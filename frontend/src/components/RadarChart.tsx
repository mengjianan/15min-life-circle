import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface RadarChartProps {
  categories: Record<string, number>;
}

const RadarChart: React.FC<RadarChartProps> = ({ categories }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化ECharts实例
    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    return () => {
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const categoryNames = Object.keys(categories);
    const categoryValues = Object.values(categories);

    const option: echarts.EChartsOption = {
      title: {
        text: '设施覆盖雷达图',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item'
      },
      radar: {
        indicator: categoryNames.map(name => ({
          name: name,
          max: 100
        })),
        shape: 'circle',
        splitNumber: 5,
        axisName: {
          color: '#333',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(24, 144, 255, 0.1)', 'rgba(24, 144, 255, 0.2)']
          }
        }
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: categoryValues,
              name: '设施覆盖评分',
              areaStyle: {
                color: 'rgba(24, 144, 255, 0.3)'
              },
              lineStyle: {
                color: '#1890ff',
                width: 2
              },
              itemStyle: {
                color: '#1890ff'
              }
            }
          ]
        }
      ]
    };

    chartInstanceRef.current.setOption(option);
  }, [categories]);

  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="radar-chart-container">
      <div ref={chartRef} className="radar-chart" />
    </div>
  );
};

export default RadarChart;
