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
}

const Report: React.FC<ReportProps> = ({
  communityName,
  score,
  suggestions,
  blindSpots
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

  return (
    <div className="report-container">
      <h2>{communityName} - 生活圈体检报告</h2>

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
        <h3>各类设施评分</h3>
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

      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>改善建议</h3>
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
      )}

      {blindSpots.length > 0 && (
        <div className="blind-spots-section">
          <h3>服务盲区 ({blindSpots.length}个)</h3>
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
        </div>
      )}
    </div>
  );
};

export default Report;
