import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Report from './components/Report';
import RadarChart from './components/RadarChart';
import { SAMPLE_COMMUNITIES } from './config';

interface Community {
  lng: number;
  lat: number;
  name: string;
}

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>15分钟生活圈智能体检与规划助手</h1>
        <p>基于百度地图开放能力，分析社区民生设施覆盖情况</p>
      </header>

      <main className="app-main">
        <div className="controls-panel">
          <div className="community-selector">
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

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading || !selectedCommunity}
          >
            {loading ? '分析中...' : '开始体检'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="content-area">
          <div className="map-section">
            <MapView
              center={selectedCommunity}
              isochrone={analysisResult?.isochrone}
              poiCoverage={analysisResult?.poi_coverage}
              blindSpots={analysisResult?.blind_spots}
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
                <p>点击"开始体检"按钮生成社区分析报告</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>15分钟生活圈智能体检与规划助手 © 2025</p>
      </footer>
    </div>
  );
}

export default App;
