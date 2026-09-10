import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Report from './components/Report';
import RadarChart from './components/RadarChart';
import TimeComparison from './components/TimeComparison';
import AreaComparison from './components/AreaComparison';
import FacilityAccessibility from './components/FacilityAccessibility';
import CustomCenter from './components/CustomCenter';
import CommunityComparison from './components/CommunityComparison';
import { SAMPLE_COMMUNITIES, Community } from './config';
import { exportPDFReport } from './pdfExport';
import type { AnalysisResult, MultiTimeData, IsochroneLayer } from './types';

function App() {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [customCenter, setCustomCenter] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [multiTimeData, setMultiTimeData] = useState<MultiTimeData | null>(null);
  const [selectedTime, setSelectedTime] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [showCustomCenter, setShowCustomCenter] = useState(false);

  useEffect(() => {
    // 默认选择第一个社区
    if (SAMPLE_COMMUNITIES.length > 0) {
      setSelectedCommunity(SAMPLE_COMMUNITIES[0]);
    }
  }, []);

  // 获取当前中心点
  const getCurrentCenter = () => {
    if (customCenter) {
      return customCenter;
    }
    return selectedCommunity;
  };

  const handleAnalyze = async () => {
    const center = getCurrentCenter();
    if (!center) return;

    setLoading(true);
    setError(null);

    try {
      // 并行请求单时间分析和多时间分析
      const [singleResponse, multiResponse] = await Promise.all([
        fetch('/api/analysis/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lng: center.lng,
            lat: center.lat,
            community_name: center.name
          })
        }),
        fetch('/api/isochrone/multi-time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lng: center.lng,
            lat: center.lat,
            directions: 36
          })
        })
      ]);

      if (!singleResponse.ok) {
        throw new Error('分析请求失败');
      }

      const result = await singleResponse.json();
      setAnalysisResult(result);

      // 处理多时间数据
      if (multiResponse.ok) {
        const multiResult = await multiResponse.json();
        setMultiTimeData(multiResult);
      }

      // 添加到历史记录
      setAnalysisHistory(prev => [result, ...prev.slice(0, 4)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (time: number) => {
    setSelectedTime(time);
  };

  const handleCenterSelect = (lng: number, lat: number) => {
    setCustomCenter({
      lng,
      lat,
      name: '自定义位置'
    });
    setSelectedCommunity(null);
  };

  // 获取当前选中时间的等时圈数据
  const getCurrentIsochrone = () => {
    if (multiTimeData && multiTimeData.layers) {
      const layer = multiTimeData.layers.find((l: IsochroneLayer) => l.time === selectedTime * 60);
      return layer || analysisResult?.isochrone;
    }
    return analysisResult?.isochrone;
  };

  const handleExportReport = () => {
    if (!analysisResult) return;

    // 使用新的 PDF 导出功能
    exportPDFReport(analysisResult, multiTimeData);
  };

  const currentCenter = getCurrentCenter();

  // 准备社区对比数据
  const comparisonData = analysisHistory.map((result: AnalysisResult) => ({
    name: result.community_name,
    score: result.score.total,
    level: result.score.level,
    categories: result.score.categories,
    area: result.isochrone?.area || 0
  }));

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
                setCustomCenter(null);
              }}
            >
              <option value="">自定义位置</option>
              {SAMPLE_COMMUNITIES.map((community) => (
                <option key={community.name} value={community.name}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button
              className="toggle-custom-button"
              onClick={() => setShowCustomCenter(!showCustomCenter)}
            >
              📍 {showCustomCenter ? '隐藏' : '显示'}自定义位置
            </button>
          </div>

          <div className="control-group">
            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading || !currentCenter}
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
            {/* 自定义中心点面板 */}
            {showCustomCenter && (
              <CustomCenter
                onCenterSelect={handleCenterSelect}
                currentCenter={currentCenter}
              />
            )}

            <MapView
              center={currentCenter}
              isochrone={getCurrentIsochrone()}
              poiCoverage={analysisResult?.poi_coverage}
              blindSpots={analysisResult?.blind_spots}
              loading={loading}
            />
          </div>

          <div className="report-section">
            {analysisResult ? (
              <>
                {/* 时间维度选择 */}
                {multiTimeData && (
                  <TimeComparison
                    data={{
                      time5: multiTimeData.layers.find((l: IsochroneLayer) => l.time === 300),
                      time10: multiTimeData.layers.find((l: IsochroneLayer) => l.time === 600),
                      time15: multiTimeData.layers.find((l: IsochroneLayer) => l.time === 900)
                    }}
                    onTimeChange={handleTimeChange}
                  />
                )}

                {/* 面积对比图 */}
                {multiTimeData && (
                  <AreaComparison
                    data={{
                      time5: multiTimeData.layers.find((l: IsochroneLayer) => l.time === 300),
                      time10: multiTimeData.layers.find((l: IsochroneLayer) => l.time === 600),
                      time15: multiTimeData.layers.find((l: IsochroneLayer) => l.time === 900)
                    }}
                  />
                )}

                <Report
                  communityName={analysisResult.community_name}
                  score={analysisResult.score}
                  suggestions={analysisResult.suggestions}
                  blindSpots={analysisResult.blind_spots}
                />

                {/* 设施可达性分析 */}
                {analysisResult.poi_coverage && currentCenter && (
                  <FacilityAccessibility
                    poiCoverage={analysisResult.poi_coverage}
                    center={currentCenter}
                  />
                )}

                <RadarChart
                  categories={analysisResult.score.categories}
                />
              </>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">🏘️</div>
                <h3>开始分析</h3>
                <p>选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告</p>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">🕐</span>
                    <span>计算5/10/15分钟步行范围</span>
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

        {/* 社区对比功能 */}
        {analysisHistory.length > 1 && (
          <CommunityComparison history={comparisonData} />
        )}

        {/* 分析历史 */}
        {analysisHistory.length > 1 && (
          <div className="history-section">
            <h3>📋 分析历史</h3>
            <div className="history-list">
              {analysisHistory.slice(1).map((item: AnalysisResult, index: number) => (
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
