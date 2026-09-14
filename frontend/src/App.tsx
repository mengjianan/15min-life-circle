import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Report from './components/Report';
import RadarChart from './components/RadarChart';
import TimeComparison from './components/TimeComparison';
import AreaComparison from './components/AreaComparison';
import FacilityAccessibility from './components/FacilityAccessibility';
import CustomCenter from './components/CustomCenter';
import CommunityComparison from './components/CommunityComparison';
import AnalysisProgress from './components/AnalysisProgress';
import { SAMPLE_COMMUNITIES, Community, API_BASE_URL } from './config';
import { exportPDFReport } from './pdfExport';
import type { AnalysisResult, MultiTimeData } from './types';

// 分析步骤类型
interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  message?: string;
}

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
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState<{name: string; category: string; location: {lng: number; lat: number}} | null>(null);
  const [travelMode, setTravelMode] = useState('walking'); // walking, cycling, ebike, driving
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'isochrone', label: '计算等时圈范围', status: 'pending' },
    { id: 'poi', label: '搜索周边设施', status: 'pending' },
    { id: 'blindspot', label: '识别服务盲区', status: 'pending' },
    { id: 'score', label: '计算综合评分', status: 'pending' },
    { id: 'report', label: '生成体检报告', status: 'pending' }
  ]);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (SAMPLE_COMMUNITIES.length > 0) {
      setSelectedCommunity(SAMPLE_COMMUNITIES[0]);
    }
  }, []);

  // 获取所有设施列表
  const getAllFacilities = () => {
    if (!analysisResult?.poi_coverage) return [];

    const facilities: Array<{
      name: string;
      category: string;
      address?: string;
      distance?: number;
      location?: { lng: number; lat: number };
    }> = [];

    Object.entries(analysisResult.poi_coverage).forEach(([category, data]: [string, any]) => {
      if (selectedFilter === 'all' || selectedFilter === category) {
        if (data.facilities) {
          data.facilities.forEach((facility: any) => {
            facilities.push({
              name: facility.name,
              category: category,
              address: facility.address,
              distance: facility.distance,
              location: facility.location
            });
          });
        }
      }
    });

    // 按距离排序
    return facilities.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '医疗': '#ff4d4f',
      '教育': '#1890ff',
      '购物': '#52c41a',
      '养老': '#722ed1',
      '文体': '#fa8c16',
      '餐饮': '#eb2f96',
      '交通': '#13c2c2'
    };
    return colors[category] || '#666';
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      '医疗': '医',
      '教育': '教',
      '购物': '购',
      '养老': '养',
      '文体': '文',
      '餐饮': '餐',
      '交通': '交'
    };
    return icons[category] || '设';
  };

  const getCurrentCenter = () => {
    if (customCenter) {
      return customCenter;
    }
    return selectedCommunity;
  };

  // 更新步骤状态
  const updateStepStatus = (stepId: string, status: 'pending' | 'active' | 'completed', message?: string) => {
    setAnalysisSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status, message: message || step.message } : step
    ));
  };

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleAnalyze = async () => {
    const center = getCurrentCenter();
    if (!center) return;

    setLoading(true);
    setError(null);
    setShowProgress(true);

    // 重置步骤状态
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));

    try {
      // 步骤1: 计算等时圈
      updateStepStatus('isochrone', 'active', '计算5/10/15分钟步行范围...');
      const multiResponse = await fetch(`${API_BASE_URL}/isochrone/multi-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lng: center.lng,
          lat: center.lat,
          directions: 36
        })
      });

      let multiResult = null;
      if (multiResponse.ok) {
        multiResult = await multiResponse.json();
        setMultiTimeData(multiResult);
      }
      updateStepStatus('isochrone', 'completed', '等时圈计算完成');
      await delay(300);

      // 步骤2: 搜索POI
      updateStepStatus('poi', 'active', '搜索周边设施...');
      await delay(500); // 模拟搜索过程

      // 步骤3: 识别盲区
      updateStepStatus('blindspot', 'active', '识别服务盲区...');
      await delay(300);

      // 步骤4-5: 调用完整分析报告API
      updateStepStatus('score', 'active', '计算综合评分...');
      const singleResponse = await fetch(`${API_BASE_URL}/analysis/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lng: center.lng,
          lat: center.lat,
          community_name: center.name
        })
      });

      if (!singleResponse.ok) {
        throw new Error('分析请求失败');
      }

      const result: AnalysisResult = await singleResponse.json();

      // 更新POI和盲区步骤状态 - 显示设施信息
      const poiCount = result.poi_coverage
        ? Object.values(result.poi_coverage).reduce((sum: number, cat: any) => sum + cat.count, 0)
        : 0;
      updateStepStatus('poi', 'completed', `找到${poiCount}处设施`);
      updateStepStatus('blindspot', 'completed', `识别到${result.blind_spots?.length || 0}个盲区`);
      await delay(300);

      updateStepStatus('score', 'completed', `综合评分：${result.score.total}分`);
      await delay(300);

      // 步骤5: 生成报告
      updateStepStatus('report', 'active', '生成体检报告...');
      setAnalysisResult(result);
      await delay(500);
      updateStepStatus('report', 'completed', '报告生成完成');

      setAnalysisHistory(prev => [result, ...prev.slice(0, 4)]);

      // 等待一下让用户看到完成状态
      await delay(800);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
    } finally {
      setLoading(false);
      setShowProgress(false);
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

  const handleExportPDF = async () => {
    if (analysisResult) {
      await exportPDFReport(analysisResult);
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
        {/* 控制面板 */}
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

          <div className="control-group">
            <label>出行方式：</label>
            <select
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
            >
              <option value="walking">🚶 步行</option>
              <option value="cycling">🚲 骑自行车</option>
              <option value="ebike">🛵 骑电动车</option>
              <option value="driving">🚗 驾驶轿车</option>
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

          {/* 分析进度 */}
          <AnalysisProgress
            steps={analysisSteps}
            visible={showProgress}
          />

          <button
            className="analyze-button secondary"
            onClick={() => setShowCustomCenter(!showCustomCenter)}
          >
            <Icons.MapPin />
            {showCustomCenter ? '隐藏自定义位置' : '自定义位置'}
          </button>

          {analysisResult && (
            <button className="analyze-button secondary" onClick={handleExportPDF}>
              <Icons.Download />
              导出PDF报告
            </button>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="error-banner">
            <Icons.AlertTriangle />
            <span>{error}</span>
            <button onClick={handleAnalyze}>
              <Icons.Refresh />
              重试
            </button>
          </div>
        )}

        {/* 主内容区域 */}
        {analysisResult ? (
          /* 分析后 - 50/50布局 */
          <div className="main-content analyzed">
            {/* 左侧 - 地图区域 */}
            <div className="map-panel">
              <MapView
                center={getCurrentCenter()}
                isochrone={getCurrentIsochrone()}
                poiCoverage={analysisResult?.poi_coverage}
                blindSpots={analysisResult?.blind_spots}
                multiTimeData={multiTimeData}
                loading={loading}
                selectedFacility={selectedFacility}
                onFacilityClose={() => setSelectedFacility(null)}
                travelMode={travelMode}
              />
            </div>

            {/* 右侧 - 双栏布局 */}
            <div className="right-panel">
              {/* 第一栏 - 综合数据 */}
              <div className="data-column">
                {/* 评分卡片 */}
                <div className="score-card">
                  <div className="score-header">
                    <Icons.Activity />
                    <span>综合评分</span>
                  </div>
                  <div className="score-value">{analysisResult.score.total}</div>
                  <div className="score-level">{analysisResult.score.level}</div>
                </div>

                {/* 时间维度对比 */}
                {multiTimeData && (
                  <div className="detail-card">
                    <TimeComparison
                      data={{
                        time5: multiTimeData.layers.find(l => l.time === 300),
                        time10: multiTimeData.layers.find(l => l.time === 600),
                        time15: multiTimeData.layers.find(l => l.time === 900)
                      }}
                      onTimeChange={handleTimeChange}
                    />
                  </div>
                )}

                {/* 关键指标 */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon">
                      <Icons.Map />
                    </div>
                    <div className="metric-info">
                      <div className="metric-value">{analysisResult.isochrone.area.toFixed(2)} km²</div>
                      <div className="metric-label">覆盖面积</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">
                      <Icons.Layers />
                    </div>
                    <div className="metric-info">
                      <div className="metric-value">
                        {analysisResult.poi_coverage
                          ? Object.values(analysisResult.poi_coverage).reduce((sum, cat) => sum + cat.count, 0)
                          : 0}
                      </div>
                      <div className="metric-label">周边设施</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">
                      <Icons.AlertTriangle />
                    </div>
                    <div className="metric-info">
                      <div className="metric-value">{analysisResult.blind_spots?.length || 0}</div>
                      <div className="metric-label">服务盲区</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">
                      <Icons.Clock />
                    </div>
                    <div className="metric-info">
                      <div className="metric-value">{selectedTime / 60} 分钟</div>
                      <div className="metric-label">步行时间</div>
                    </div>
                  </div>
                </div>


                {/* 雷达图 */}
                <div className="detail-card">
                  <RadarChart
                    categories={analysisResult.score.categories}
                  />
                </div>

                {/* 面积对比 */}
                {multiTimeData && (
                  <div className="detail-card">
                    <AreaComparison
                      data={{
                        time5: multiTimeData.layers.find(l => l.time === 300),
                        time10: multiTimeData.layers.find(l => l.time === 600),
                        time15: multiTimeData.layers.find(l => l.time === 900)
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 第二栏 - 设施列表 */}
              <div className="facility-list-container">
                {/* 设施筛选按钮 */}
                <div className="facility-filters">
                  <button
                    className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedFilter('all')}
                  >
                    全部
                  </button>
                  {analysisResult.poi_coverage && Object.keys(analysisResult.poi_coverage).map(category => (
                    <button
                      key={category}
                      className={`filter-btn ${selectedFilter === category ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* 设施列表（可滚动） */}
                <div className="facility-scroll-list">
                  {getAllFacilities().map((facility, index) => (
                    <div
                      key={index}
                      className={`facility-list-item ${selectedFacility?.name === facility.name ? 'selected' : ''}`}
                      onClick={() => {
                        if (facility.location) {
                          setSelectedFacility({
                            name: facility.name,
                            category: facility.category,
                            location: facility.location
                          });
                        }
                      }}
                    >
                      <div
                        className="facility-item-icon"
                        style={{ backgroundColor: getCategoryColor(facility.category) }}
                      >
                        {getCategoryIcon(facility.category)}
                      </div>
                      <div className="facility-item-info">
                        <div className="facility-item-name">{facility.name}</div>
                        <div className="facility-item-detail">{facility.category} · {facility.address || '暂无地址'}</div>
                      </div>
                      <div className="facility-item-distance">
                        {facility.distance ? `${facility.distance}m` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 分析前 - 两栏布局 */
          <div className="main-content">
            {/* 左侧 - 地图区域 */}
            <div className="map-panel">
              {showCustomCenter && (
                <CustomCenter
                  onCenterSelect={handleCenterSelect}
                  currentCenter={getCurrentCenter()}
                />
              )}
              <MapView
                center={getCurrentCenter()}
                isochrone={getCurrentIsochrone()}
                poiCoverage={undefined}
                blindSpots={undefined}
                multiTimeData={multiTimeData}
                loading={loading}
              />
            </div>

            {/* 右侧 - 数据面板 */}
            <div className="data-panel">
              {/* 空状态提示 */}
              <div className="empty-state">
                <div className="empty-icon">
                  <Icons.Map />
                </div>
                <h3>开始分析</h3>
                <p>选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告</p>
                <div className="feature-list">
                  <div className="feature-item">
                    <Icons.Clock />
                    <span>计算5/10/15分钟步行范围</span>
                  </div>
                  <div className="feature-item">
                    <Icons.MapPin />
                    <span>分析周边设施覆盖</span>
                  </div>
                  <div className="feature-item">
                    <Icons.AlertTriangle />
                    <span>识别服务盲区</span>
                  </div>
                  <div className="feature-item">
                    <Icons.BarChart />
                    <span>生成体检报告</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 综合报告 - 两栏布局 */}
        {analysisResult && (
          <div className="report-section">
            {/* 详细报告 */}
            <div className="detail-card">
              <Report
                communityName={analysisResult.community_name}
                score={analysisResult.score}
                suggestions={analysisResult.suggestions}
                blindSpots={analysisResult.blind_spots}
                poiCoverage={analysisResult.poi_coverage}
                isochrone={analysisResult.isochrone}
              />
            </div>

            {/* 设施可达性 */}
            {analysisResult.poi_coverage && getCurrentCenter() && (
              <div className="detail-card">
                <FacilityAccessibility
                  poiCoverage={analysisResult.poi_coverage}
                  center={getCurrentCenter()!}
                />
              </div>
            )}
          </div>
        )}

        {/* 社区对比 */}
        {analysisHistory.length > 1 && (
          <div className="comparison-section">
            <CommunityComparison history={comparisonData} />
          </div>
        )}

        {/* 分析历史 */}
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
