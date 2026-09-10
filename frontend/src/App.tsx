import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Report from './components/Report';
import RadarChart from './components/RadarChart';
import { SAMPLE_COMMUNITIES, Community } from './config';

interface AnalysisResult {
  community_name: string;
  center: { lng: number; lat: number };
  isochrone: any;
  poi_coverage: any;
  blind_spots: any[];
  score: any;
  suggestions: any[];
}

function App() {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    // 默认选择第一个社区
    if (SAMPLE_COMMUNITIES.length > 0) {
      setSelectedCommunity(SAMPLE_COMMUNITIES[0]);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!selectedCommunity) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analysis/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lng: selectedCommunity.lng,
          lat: selectedCommunity.lat,
          community_name: selectedCommunity.name
        })
      });

      if (!response.ok) {
        throw new Error('分析请求失败');
      }

      const result = await response.json();
      setAnalysisResult(result);

      // 添加到历史记录
      setAnalysisHistory(prev => [result, ...prev.slice(0, 4)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!analysisResult) return;

    // 生成报告内容
    const reportContent = generateReportContent(analysisResult);

    // 创建下载链接
    const blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysisResult.community_name}_生活圈体检报告.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = (result: AnalysisResult): string => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${result.community_name} - 15分钟生活圈体检报告</title>
    <style>
        body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
        .score-section { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .score-number { font-size: 48px; font-weight: bold; color: ${result.score.level === '优秀' ? '#52c41a' : result.score.level === '良好' ? '#1890ff' : '#faad14'}; }
        .category-item { display: flex; align-items: center; margin: 10px 0; }
        .category-name { width: 80px; }
        .category-bar { flex: 1; height: 20px; background: #e8e8e8; border-radius: 10px; overflow: hidden; }
        .category-fill { height: 100%; border-radius: 10px; }
        .suggestion { padding: 10px; margin: 10px 0; background: #fff1f0; border-left: 4px solid #ff4d4f; }
    </style>
</head>
<body>
    <h1>📊 ${result.community_name} - 15分钟生活圈体检报告</h1>

    <div class="score-section">
        <div class="score-number">${result.score.total}</div>
        <div>综合评分：${result.score.level}</div>
    </div>

    <h2>📈 各类设施评分</h2>
    ${Object.entries(result.score.categories).map(([cat, score]) => `
        <div class="category-item">
            <span class="category-name">${cat}</span>
            <div class="category-bar">
                <div class="category-fill" style="width: ${score}%; background: ${(score as number) >= 80 ? '#52c41a' : (score as number) >= 60 ? '#1890ff' : '#ff4d4f'}"></div>
            </div>
            <span>${score}</span>
        </div>
    `).join('')}

    <h2>💡 改善建议</h2>
    ${result.suggestions.map(s => `
        <div class="suggestion">
            <strong>[${s.category}]</strong> ${s.message}
        </div>
    `).join('')}

    <h2>⚠️ 服务盲区</h2>
    <p>发现 ${result.blind_spots.length} 个服务盲区</p>

    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e8e8; color: #666;">
        报告生成时间：${new Date().toLocaleString()}<br>
        15分钟生活圈智能体检与规划助手
    </footer>
</body>
</html>
    `;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🏘️ 15分钟生活圈智能体检与规划助手</h1>
          <p>基于百度地图开放能力，分析社区民生设施覆盖情况</p>
        </div>
      </header>

      <main className="app-main">
        <div className="controls-panel">
          <div className="control-group">
            <label>选择社区：</label>
            <select
              value={selectedCommunity?.name || ''}
              onChange={(e) => {
                const community = SAMPLE_COMMUNITIES.find(c => c.name === e.target.value);
                setSelectedCommunity(community || null);
              }}
            >
              {SAMPLE_COMMUNITIES.map((community) => (
                <option key={community.name} value={community.name}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading || !selectedCommunity}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  分析中...
                </>
              ) : (
                '🔍 开始体检'
              )}
            </button>

            {analysisResult && (
              <button
                className="export-button"
                onClick={handleExportReport}
              >
                📥 导出报告
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span>❌</span> {error}
            </div>
          )}
        </div>

        <div className="content-area">
          <div className="map-section">
            <MapView
              center={selectedCommunity}
              isochrone={analysisResult?.isochrone}
              poiCoverage={analysisResult?.poi_coverage}
              blindSpots={analysisResult?.blind_spots}
              loading={loading}
            />
          </div>

          <div className="report-section">
            {analysisResult ? (
              <>
                <Report
                  communityName={analysisResult.community_name}
                  score={analysisResult.score}
                  suggestions={analysisResult.suggestions}
                  blindSpots={analysisResult.blind_spots}
                />
                <RadarChart
                  categories={analysisResult.score.categories}
                />
              </>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">🏘️</div>
                <h3>开始分析</h3>
                <p>选择一个社区，点击"开始体检"按钮生成分析报告</p>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">🕐</span>
                    <span>计算15分钟步行等时圈</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📍</span>
                    <span>分析周边设施覆盖</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚠️</span>
                    <span>识别服务盲区</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <span>生成体检报告</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 分析历史 */}
        {analysisHistory.length > 1 && (
          <div className="history-section">
            <h3>📋 分析历史</h3>
            <div className="history-list">
              {analysisHistory.slice(1).map((item, index) => (
                <div key={index} className="history-item">
                  <span className="history-name">{item.community_name}</span>
                  <span className="history-score">{item.score.total}分</span>
                  <span className="history-level">{item.score.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>15分钟生活圈智能体检与规划助手 © 2025</p>
          <p className="footer-tech">
            技术栈：React + FastAPI + 百度地图API + NetworkX
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
