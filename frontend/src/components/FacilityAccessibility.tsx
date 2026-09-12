import React from 'react';
import { FacilityIcons, getFacilityColor, getFacilityBgColor } from '../icons';

interface Facility {
  name: string;
  address?: string;
  location?: { lng: number; lat: number };
  distance?: number;
  duration?: number;
  category: string;
}

interface FacilityAccessibilityProps {
  poiCoverage: Record<string, { count: number; level: string; facilities: Facility[] }>;
  center: { lng: number; lat: number };
}

const FacilityAccessibility: React.FC<FacilityAccessibilityProps> = ({
  poiCoverage
}) => {
  // 计算步行时间（假设步行速度1.2m/s）
  const calculateWalkingTime = (distance: number): number => {
    return Math.round(distance / 1.2 / 60);  // 分钟
  };

  // 获取所有设施并按距离排序
  const getAllFacilities = (): Facility[] => {
    const allFacilities: Facility[] = [];

    Object.entries(poiCoverage).forEach(([category, data]) => {
      data.facilities.forEach(facility => {
        allFacilities.push({
          ...facility,
          category
        });
      });
    });

    // 按距离排序
    return allFacilities.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  const allFacilities = getAllFacilities();

  // 按类别统计最近设施
  const getNearestByCategory = () => {
    const nearest: Record<string, Facility | null> = {};

    Object.keys(poiCoverage).forEach(category => {
      const categoryFacilities = allFacilities.filter(f => f.category === category);
      nearest[category] = categoryFacilities.length > 0 ? categoryFacilities[0] : null;
    });

    return nearest;
  };

  const nearestByCategory = getNearestByCategory();

  // 获取设施图标
  const getFacilityIcon = (category: string, size: number = 20) => {
    const IconComponent = FacilityIcons[category] || FacilityIcons['综合'];
    return <IconComponent size={size} />;
  };

  return (
    <div className="facility-accessibility">
      <h4>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
        </svg>
        设施可达性分析
      </h4>

      {/* 最近设施统计 */}
      <div className="nearest-facilities">
        <h5>各类最近设施</h5>
        <div className="nearest-grid">
          {Object.entries(nearestByCategory).map(([category, facility]) => {
            const color = getFacilityColor(category);
            const bgColor = getFacilityBgColor(category);
            return (
              <div key={category} className="nearest-item">
                <span className="nearest-icon" style={{ backgroundColor: bgColor, color }}>
                  {getFacilityIcon(category)}
                </span>
                <div className="nearest-info">
                  <span className="nearest-category">{category}</span>
                  {facility ? (
                    <>
                      <span className="nearest-name">{facility.name}</span>
                      <span className="nearest-distance">
                        {facility.distance ? `${facility.distance}米` : '未知'}
                        {facility.distance && ` (${calculateWalkingTime(facility.distance)}分钟)`}
                      </span>
                    </>
                  ) : (
                    <span className="nearest-none">暂无数据</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 设施列表 */}
      {allFacilities.length > 0 && (
        <div className="facility-list">
          <h5>周边设施列表 (前10个)</h5>
          <div className="facility-items">
            {allFacilities.slice(0, 10).map((facility, index) => {
              const color = getFacilityColor(facility.category);
              const bgColor = getFacilityBgColor(facility.category);
              return (
                <div key={index} className="facility-item">
                  <span className="facility-icon" style={{ backgroundColor: bgColor, color }}>
                    {getFacilityIcon(facility.category)}
                  </span>
                  <div className="facility-info">
                    <span className="facility-name">{facility.name}</span>
                    <span className="facility-address">{facility.address || '暂无地址'}</span>
                  </div>
                  <div className="facility-distance">
                    {facility.distance && (
                      <>
                        <span className="distance-value">{facility.distance}米</span>
                        <span className="distance-time">
                          步行{calculateWalkingTime(facility.distance)}分钟
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 可达性评分 */}
      <div className="accessibility-score">
        <h5>可达性评分</h5>
        <div className="score-items">
          {Object.entries(poiCoverage).map(([category, data]) => {
            const color = getFacilityColor(category);
            const bgColor = getFacilityBgColor(category);
            const score = data.count >= 5 ? 100 : data.count >= 3 ? 80 : data.count >= 1 ? 60 : 30;
            return (
              <div key={category} className="score-item">
                <span className="score-icon" style={{ backgroundColor: bgColor, color }}>
                  {getFacilityIcon(category)}
                </span>
                <span className="score-category">{category}</span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${score}%`,
                      backgroundColor: score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : '#ef4444'
                    }}
                  />
                </div>
                <span className="score-value">{score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacilityAccessibility;
