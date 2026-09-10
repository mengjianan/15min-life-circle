import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface AreaComparisonProps {
  data: {
    time5?: { area: number };
    time10?: { area: number };
    time15?: { area: number };
  };
}

const AreaComparison: React.FC<AreaComparisonProps> = ({ data }) => {
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

    // 准备数据
    const categories = ['5分钟', '10分钟', '15分钟'];
    const areas = [
      data.time5?.area ? data.time5.area / 1000000 : 0,
      data.time10?.area ? data.time10.area / 1000000 : 0,
      data.time15?.area ? data.time15.area / 1000000 : 0
    ];

    const colors = ['#52c41a', '#faad14', '#1890ff'];

    const option: echarts.EChartsOption = {
      title: {
        text: '等时圈面积对比',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
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
        data: categories,
        axisLabel: {
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '面积 (km²)',
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          type: 'bar',
          data: areas.map((value, index) => ({
            value: value,
            itemStyle: {
              color: colors[index],
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
        }
      ]
    };

    chartInstanceRef.current.setOption(option);
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算增长比例
  const getGrowthRate = () => {
    if (!data.time5?.area || !data.time15?.area) return null;
    const growth = ((data.time15.area - data.time5.area) / data.time5.area * 100).toFixed(1);
    return growth;
  };

  const growthRate = getGrowthRate();

  return (
    <div className="area-comparison-container">
      <div ref={chartRef} className="area-chart" />
      {growthRate && (
        <div className="growth-info">
          <span className="growth-label">15分钟比5分钟面积增长:</span>
          <span className="growth-value">+{growthRate}%</span>
        </div>
      )}
    </div>
  );
};

export default AreaComparison;
