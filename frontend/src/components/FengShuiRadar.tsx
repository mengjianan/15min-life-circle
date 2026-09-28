import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { Ico } from '../icons';

interface FengShuiRadarProps {
  data: any;  // 支持完整分析结果或纯评分数据
  showLabels?: boolean;
  detailScore?: any;  // comprehensive_score.fengshui_detail，七项加权官方总分（与「风水/居住适宜性」同口径）
}

const getLevel = (score: number): string => {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '一般';
  return '需改善';
};

const getScoreColor = (score: number) => {
  if (score >= 90) return '#52c41a';
  if (score >= 75) return '#1890ff';
  if (score >= 60) return '#faad14';
  return '#ff4d4f';
};

const FengShuiRadarComponent: React.FC<FengShuiRadarProps> = ({ data, showLabels = true, detailScore }) => {
  // 兼容完整分析结果和纯评分数据
  const scores = data.score || data;
  const rows = [
    { name: '地形', icon: 'mountain', score: scores.terrain || 0 },
    { name: '水系', icon: 'droplet', score: scores.water || 0 },
    { name: '环境', icon: 'tree', score: scores.environment || 0 },
    { name: '方位', icon: 'compass', score: scores.orientation || 0 },
  ];
  const chartData = rows.map(r => ({ dimension: r.name, score: r.score, fullMark: 100 }));

  // 统一口径：总分用后端七项加权官方分（与「风水/居住适宜性」一致）；无 detailScore 时退回四项平均
  const averageScore = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);
  const total = detailScore?.total ?? averageScore;
  const level = detailScore?.level ?? getLevel(averageScore);

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
        <>
          <p className="blind-explain">
            总分与「风水/居住适宜性」同口径：<b>七项加权</b>——<b>水系 20%</b> 最高，
            地势/朝向/道路形态/敏感设施各 15%，绿化/人气各 10%（道路形态 85、人气 80 为简化估算）。
            雷达图四项即其中的地势（地形）、水系、敏感设施（环境）、朝向（方位），绿化计入总分但不在图中。
          </p>
          <div className="fengshui-compact">
            <div className="fengshui-total-compact">
              <span className="fengshui-score-compact" style={{ color: getScoreColor(total) }}>{total}</span>
              <span className="fengshui-level-compact">{level}</span>
            </div>
            <div className="fengshui-items-compact">
              {rows.map(item => (
                <div key={item.name} className="fengshui-item-compact">
                  <span><Ico n={item.icon} /> {item.name}</span>
                  <span>{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FengShuiRadarComponent;