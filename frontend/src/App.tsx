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
import type { AnalysisResult, MultiTimeData } from './types';

// SVG图标组件
const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"></circle>
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
    </svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  BarChart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  ),
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6"></path>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
    </svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
};

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
    if (SAMPLE_COMMUNITIES.length > 0) {
      setSelectedCommunity(SAMPLE_COMMUNITIES[0]);
    }
  }, []);

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

      if (multiResponse.ok) {
        const multiResult = await multiResponse.json();
        setMultiTimeData(multiResult);
      }

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
  };

  const getCurrentIsochrone = () => {
    if (!multiTimeData) return analysisResult?.isochrone;
    const layer = multiTimeData.layers.find(l => l.time === selectedTime);
    return layer ? { boundary_points: layer.boundary_points, polygon: layer.polygon } : analysisResult?.isochrone;
  };

  const handleExportPDF = () => {
    if (analysisResult) {
      exportPDFReport(analysisResult);
    }
  };

  const comparisonData = analysisHistory.slice(0, 5).map(item => ({
    name: item.community_name,
    score: item.score.total,
    level: item.score.level,
    categories: item.score.categories,
    area: item.isochrone.area
  }));

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Icons.Home />
              15分钟生活圈智能体检与规划助手
            </h1>
            <p>基于百度地图的社区生活圈分析工具</p>
          </div>
          <div className="header-right">
            <a href="../" className="back-button">
              <Icons.ArrowLeft />
              返回首页
            </a>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="controls-panel">
          <div className="control-group">
            <label>选择社区：</label>
            <select
              value={selectedCommunity ? `${selectedCommunity.lng},${selectedCommunity.lat}` : ''}
              onChange={(e) => {
                const [lng, lat] = e.target.value.split(',').map(Number);
                const community = SAMPLE_COMMUNITIES.find(c => c.lng === lng && c.lat === lat);
                setSelectedCommunity(community || null);
                setCustomCenter(null);
              }}
            >
              {SAMPLE_COMMUNITIES.map((community, index) => (
                <option key={index} value={`${community.lng},${community.lat}`}>
                  {community.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading || (!selectedCommunity && !customCenter)}
          >
            {loading ? (
              <>
                <Icons.Refresh />
                分析中...
              </>
            ) : (
              <>
                <Icons.Play />
                开始体检
              </>
            )}
          </button>

          <button
            className="analyze-button"
            onClick={() => setShowCustomCenter(!showCustomCenter)}
            style={{ background: showCustomCenter ? '#6b7280' : undefined }}
          >
            <Icons.MapPin />
            {showCustomCenter ? '隐藏自定义位置' : '显示自定义位置'}
          </button>

          {analysisResult && (
            <button className="analyze-button" onClick={handleExportPDF}>
              <Icons.Download />
              导出PDF
            </button>
          )}
        </div>

        {error && (
          <div className="error-container">
            <div className="error-icon">
              <Icons.AlertTriangle />
            </div>
            <h3 className="error-title">分析失败</h3>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={handleAnalyze}>
              <Icons.Refresh />
              重试
            </button>
          </div>
        )}

        <div className="content-area">
          <div className="map-section">
            {showCustomCenter && (
              <CustomCenter
                onCenterSelect={handleCenterSelect}
                currentCenter={getCurrentCenter()}
              />
            )}

            <MapView
              center={getCurrentCenter()}
              isochrone={getCurrentIsochrone()}
              poiCoverage={analysisResult?.poi_coverage}
              blindSpots={analysisResult?.blind_spots}
              loading={loading}
            />
          </div>

          <div className="report-section">
            {analysisResult ? (
              <>
                {multiTimeData && (
                  <TimeComparison
                    data={{
                      time5: multiTimeData.layers.find(l => l.time === 300),
                      time10: multiTimeData.layers.find(l => l.time === 600),
                      time15: multiTimeData.layers.find(l => l.time === 900)
                    }}
                    onTimeChange={handleTimeChange}
                  />
                )}

                {multiTimeData && (
                  <AreaComparison
                    data={{
                      time5: multiTimeData.layers.find(l => l.time === 300),
                      time10: multiTimeData.layers.find(l => l.time === 600),
                      time15: multiTimeData.layers.find(l => l.time === 900)
                    }}
                  />
                )}

                <Report
                  communityName={analysisResult.community_name}
                  score={analysisResult.score}
                  suggestions={analysisResult.suggestions}
                  blindSpots={analysisResult.blind_spots}
                />

                {analysisResult.poi_coverage && getCurrentCenter() && (
                  <FacilityAccessibility
                    poiCoverage={analysisResult.poi_coverage}
                    center={getCurrentCenter()!}
                  />
                )}

                <RadarChart
                  categories={analysisResult.score.categories}
                />
              </>
            ) : (
              <div className="placeholder">
                <div className="placeholder-icon">
                  <Icons.Home />
                </div>
                <h3>开始分析</h3>
                <p>选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告</p>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">
                      <Icons.Clock />
                    </span>
                    <span>计算5/10/15分钟步行范围</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">
                      <Icons.MapPin />
                    </span>
                    <span>分析周边设施覆盖</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">
                      <Icons.AlertTriangle />
                    </span>
                    <span>识别服务盲区</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">
                      <Icons.BarChart />
                    </span>
                    <span>生成体检报告</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {analysisHistory.length > 1 && (
          <CommunityComparison history={comparisonData} />
        )}

        {analysisHistory.length > 1 && (
          <div className="history-section">
            <h3>
              <Icons.History />
              分析历史
            </h3>
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
