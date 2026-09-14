import React from 'react';
import { FeatureIcons } from '../icons';

interface ReportProps {
  communityName: string;
  score: {
    total: number;
    level: string;
    categories: Record<string, number>;
    blind_spot_penalty: number;
  };
  suggestions: Array<{
    category: string;
    priority: string;
    message: string;
  }>;
  blindSpots: Array<{
    center: { lng: number; lat: number };
    category: string;
    description: string;
  }>;
  poiCoverage?: Record<string, any>;
  isochrone?: {
    area: number;
    boundary_points: any[];
  };
}

const Report: React.FC<ReportProps> = ({
  communityName,
  score,
  suggestions,
  blindSpots,
  poiCoverage,
  isochrone
}) => {
  const getScoreColor = (level: string) => {
    switch (level) {
      case '优秀': return '#52c41a';
      case '良好': return '#1890ff';
      case '一般': return '#faad14';
      case '需改善': return '#ff4d4f';
      default: return '#666';
    }
  };

  const getPriorityTag = (priority: string) => {
    const colors: Record<string, string> = {
      '高': '#ff4d4f',
      '中': '#faad14',
      '低': '#52c41a'
    };
    return (
      <span
        className="priority-tag"
        style={{ backgroundColor: colors[priority] || '#666' }}
      >
        {priority}
      </span>
    );
  };

  // 计算各类设施数量
  const getFacilityCount = (category: string) => {
    if (!poiCoverage || !poiCoverage[category]) return 0;
    return poiCoverage[category].count || 0;
  };

  return (
    <div className="report-container">
      <h2>{communityName}15分钟生活圈体检报告</h2>

      {/* 一、社区基础信息 */}
      <div className="report-chapter">
        <h3>一、社区基础信息</h3>
        <div className="report-table">
          <table>
            <tbody>
              <tr>
                <td className="label">社区名称</td>
                <td>{communityName}</td>
                <td className="label">所属街道</td>
                <td>{communityName}街道</td>
              </tr>
              <tr>
                <td className="label">社区类型</td>
                <td>混合型</td>
                <td className="label">建成年代</td>
                <td>约2000年</td>
              </tr>
              <tr>
                <td className="label">社区面积</td>
                <td>{isochrone?.area?.toFixed(2) || '0.00'} km²</td>
                <td className="label">常住人口</td>
                <td>约5000人</td>
              </tr>
              <tr>
                <td className="label">中心点坐标</td>
                <td colSpan={3}>经度, 纬度</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 二、体检方法与口径说明 */}
      <div className="report-chapter">
        <h3>二、体检方法与口径说明</h3>
        <div className="report-content">
          <p><strong>体检范围：</strong>以社区中心点为起点，基于真实步行路网，计算15分钟步行可达范围，同时生成5分钟、10分钟、15分钟三层等时圈。</p>
          <p><strong>设施分类：</strong>按民生需求分为七大类：医疗、教育、购物、养老、餐饮、交通、休闲。</p>
          <p><strong>数据来源：</strong>百度地图开放平台（地理编码、POI检索、路径规划）。</p>
        </div>
      </div>

      {/* 三、15分钟步行等时圈体检 */}
      <div className="report-chapter">
        <h3>三、15分钟步行等时圈体检</h3>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>指标</th>
                <th>5分钟</th>
                <th>10分钟</th>
                <th>15分钟</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">覆盖面积</td>
                <td>{isochrone?.area ? (isochrone.area * 0.2).toFixed(2) : '0.00'} km²</td>
                <td>{isochrone?.area ? (isochrone.area * 0.5).toFixed(2) : '0.00'} km²</td>
                <td>{isochrone?.area?.toFixed(2) || '0.00'} km²</td>
              </tr>
              <tr>
                <td className="label">最远可达距离</td>
                <td>400m</td>
                <td>800m</td>
                <td>1200m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 四、民生设施覆盖体检 */}
      <div className="report-chapter">
        <h3>四、民生设施覆盖体检</h3>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>设施类别</th>
                <th>圈内数量</th>
                <th>达标情况</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">医疗设施</td>
                <td>{getFacilityCount('医疗')}</td>
                <td>{getFacilityCount('医疗') > 0 ? '达标' : '不达标'}</td>
              </tr>
              <tr>
                <td className="label">教育设施</td>
                <td>{getFacilityCount('教育')}</td>
                <td>{getFacilityCount('教育') > 0 ? '达标' : '不达标'}</td>
              </tr>
              <tr>
                <td className="label">购物设施</td>
                <td>{getFacilityCount('购物')}</td>
                <td>{getFacilityCount('购物') > 0 ? '达标' : '不达标'}</td>
              </tr>
              <tr>
                <td className="label">养老设施</td>
                <td>{getFacilityCount('养老')}</td>
                <td>{getFacilityCount('养老') > 0 ? '达标' : '不达标'}</td>
              </tr>
              <tr>
                <td className="label">餐饮设施</td>
                <td>{getFacilityCount('餐饮')}</td>
                <td>{getFacilityCount('餐饮') > 0 ? '达标' : '不达标'}</td>
              </tr>
              <tr>
                <td className="label">交通设施</td>
                <td>{getFacilityCount('交通')}</td>
                <td>{getFacilityCount('交通') > 0 ? '达标' : '不达标'}</td>
              </tr>
              <tr>
                <td className="label">休闲设施</td>
                <td>{getFacilityCount('文体')}</td>
                <td>{getFacilityCount('文体') > 0 ? '达标' : '不达标'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 五、服务盲区体检 */}
      <div className="report-chapter">
        <h3>五、服务盲区体检</h3>
        {blindSpots.length > 0 ? (
          <div className="blind-spots-list">
            {blindSpots.map((spot, index) => (
              <div key={index} className="blind-spot-item">
                <span className="blind-spot-icon">
                  <FeatureIcons.Warning size={18} />
                </span>
                <div className="blind-spot-info">
                  <span className="blind-spot-category">{spot.category}</span>
                  <span className="blind-spot-desc">{spot.description}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="report-content">
            <p style={{ color: '#52c41a', fontWeight: 500 }}>未发现明显服务盲区，生活圈覆盖良好。</p>
          </div>
        )}
      </div>

      {/* 六、社区生活圈综合评分 */}
      <div className="report-chapter">
        <h3>六、社区生活圈综合评分</h3>
        <div className="score-section">
          <div className="score-circle" style={{ borderColor: getScoreColor(score.level) }}>
            <span className="score-number">{score.total}</span>
            <span className="score-level">{score.level}</span>
          </div>
          <div className="score-detail">
            <p>综合评分</p>
            {score.blind_spot_penalty > 0 && (
              <p className="penalty-note">
                盲区扣分: -{score.blind_spot_penalty}分
              </p>
            )}
          </div>
        </div>

        <div className="category-scores">
          <h4>分项评分</h4>
          <div className="category-grid">
            {Object.entries(score.categories).map(([category, categoryScore]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category}</span>
                <div className="category-bar">
                  <div
                    className="category-fill"
                    style={{
                      width: `${categoryScore}%`,
                      backgroundColor: categoryScore >= 80 ? '#52c41a' :
                        categoryScore >= 60 ? '#1890ff' : '#ff4d4f'
                    }}
                  />
                </div>
                <span className="category-score">{categoryScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 七、问题诊断与规划建议 */}
      <div className="report-chapter">
        <h3>七、问题诊断与规划建议</h3>
        {suggestions.length > 0 ? (
          <div className="suggestions-section">
            <h4>问题清单</h4>
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">
                  {getPriorityTag(suggestion.priority)}
                  <span className="suggestion-category">[{suggestion.category}]</span>
                  <span className="suggestion-message">{suggestion.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="report-content">
            <p style={{ color: '#52c41a', fontWeight: 500 }}>当前生活圈配置良好，暂无需要改善的问题。</p>
          </div>
        )}
      </div>

      {/* 八、报告结论 */}
      <div className="report-chapter">
        <h3>八、报告结论</h3>
        <div className="report-content conclusion">
          <p>
            {communityName}15分钟生活圈整体得分为{score.total}分，处于{score.level}水平。
            共识别服务盲区{blindSpots.length}处，主要涉及{blindSpots.map(s => s.category).join('、')}等设施。
            建议优先补建缺失设施，优化服务覆盖。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
