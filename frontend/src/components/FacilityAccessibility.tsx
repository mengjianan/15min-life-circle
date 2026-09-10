import React from 'react';

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
  poiCoverage,
  center
}) => {
  // 设施图标配置
  const iconConfig: Record<string, { emoji: string; color: string }> = {
    '医疗': { emoji: '🏥', color: '#ff4d4f' },
    '教育': { emoji: '🏫', color: '#1890ff' },
    '购物': { emoji: '🛒', color: '#52c41a' },
    '养老': { emoji: '👴', color: '#722ed1' },
    '文体': { emoji: '🏃', color: '#13c2c2' },
    '餐饮': { emoji: '🍜', color: '#faad14' },
  };

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

  return (
    <div className="facility-accessibility">
      <h4>📍 设施可达性分析</h4>

      {/* 最近设施统计 */}
      <div className="nearest-facilities">
        <h5>各类最近设施</h5>
        <div className="nearest-grid">
          {Object.entries(nearestByCategory).map(([category, facility]) => {
            const config = iconConfig[category] || { emoji: '📍', color: '#666' };
            return (
              <div key={category} className="nearest-item">
                <span className="nearest-icon">{config.emoji}</span>
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
              const config = iconConfig[facility.category] || { emoji: '📍', color: '#666' };
              return (
                <div key={index} className="facility-item">
                  <span className="facility-icon">{config.emoji}</span>
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
            const config = iconConfig[category] || { emoji: '📍', color: '#666' };
            const score = data.count >= 5 ? 100 : data.count >= 3 ? 80 : data.count >= 1 ? 60 : 30;
            return (
              <div key={category} className="score-item">
                <span className="score-icon">{config.emoji}</span>
                <span className="score-category">{category}</span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${score}%`,
                      backgroundColor: score >= 80 ? '#52c41a' : score >= 60 ? '#1890ff' : '#ff4d4f'
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
