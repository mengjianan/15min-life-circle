import { useState } from 'react';
import MapView from './components/MapView';
import Report from './components/Report';
import ComprehensiveReport from './components/ComprehensiveReport';
// import ModeScorePanel from './components/ModeScorePanel';
import ScoreOverview from './components/ScoreOverview';
import CustomCenter from './components/CustomCenter';
import AnalysisProgress from './components/AnalysisProgress';
import FengShuiRadar from './components/FengShuiRadar';
import { SAMPLE_COMMUNITIES, Community, API_BASE_URL } from './config';
import type { TravelMode, FullAnalysisResult, TravelModeData, POIItem, POICategoryData } from './types';

// 出行方式配置
const TRAVEL_MODES: { mode: TravelMode; name: string; speed: number }[] = [
  { mode: 'walking', name: '步行', speed: 1.2 },
  { mode: 'cycling', name: '骑行', speed: 3.5 },
  { mode: 'transit', name: '公交', speed: 5.0 },
  { mode: 'driving', name: '驾车', speed: 8.0 },
];

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
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
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
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  ),
};

function App() {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [customCenter, setCustomCenter] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const [fullResult, setFullResult] = useState<FullAnalysisResult | null>(null);
  const [activeMode, setActiveMode] = useState<TravelMode>('walking');
  const [activeTimeSlot, setActiveTimeSlot] = useState(900);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedFacility, setSelectedFacility] = useState<POIItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const [showCustomCenter, setShowCustomCenter] = useState(false);
  const [reportExpanded, setReportExpanded] = useState(true);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'walking', label: '步行', status: 'pending' },
    { id: 'cycling', label: '骑行', status: 'pending' },
    { id: 'transit', label: '公交', status: 'pending' },
    { id: 'driving', label: '驾车', status: 'pending' },
    { id: 'report', label: '生成报告', status: 'pending' },
  ]);
  const [showProgress, setShowProgress] = useState(false);
  const [fengshuiScore, setFengshuiScore] = useState<any>(null);


  // 获取当前出行方式数据
  const getCurrentModeData = (): TravelModeData | null => {
    if (!fullResult?.modes) return null;
    return fullResult.modes[activeMode] || null;
  };

  // 获取当前时段数据
  const getCurrentTimeSlotData = () => {
    const modeData = getCurrentModeData();
    if (!modeData?.time_slots) return null;
    // 后端返回的键是字符串，需要转换
    
    return (modeData.time_slots as Record<string, any>)[String(activeTimeSlot)] || null;
  };

  // 获取所有设施列表
  const getAllFacilities = (): POIItem[] => {
    const timeSlotData = getCurrentTimeSlotData();
    if (!timeSlotData?.poi_coverage) return [];

    const facilities: POIItem[] = [];

    const coverage = timeSlotData.poi_coverage as Record<string, POICategoryData>;
    Object.entries(coverage).forEach(([category, data]) => {
      if (activeCategory === '全部' || activeCategory === category) {
        if (data.facilities) {
          data.facilities.forEach((facility: POIItem) => {
            facilities.push({
              ...facility,
              category: category,
            });
          });
        }
      }
    });

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
    };
    return icons[category] || '设';
  };

  const getCurrentCenter = () => {
    if (customCenter) return customCenter;
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

  const fetchFengshuiScore = async (lng: number, lat: number) => {
    try {
      const response = await fetch('/api/fengshui/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lng, lat }),
      });
      if (response.ok) {
        const data = await response.json();
        setFengshuiScore(data);
      }
    } catch (err) {
      console.error('获取风水评分失败:', err);
    }
  };

  const handleAnalyze = async () => {
    const center = getCurrentCenter();
    if (!center) return;

    setLoading(true);
    setError(null);
    setAnalysisMessage(null);
    setShowProgress(true);

    // 重置步骤状态
    setAnalysisSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined })));

    try {
      // 调用全出行方式分析API
      updateStepStatus('walking', 'active', '正在计算步行范围...');

      const response = await fetch(`${API_BASE_URL}/analysis/full-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lng: center.lng,
          lat: center.lat,
          community_name: center.name,
        }),
      });

      if (!response.ok) {
        throw new Error('分析请求失败');
      }

      const result: FullAnalysisResult = await response.json();

      // 更新步骤状态 - 逐步显示
      updateStepStatus('walking', 'completed', '步行范围计算完成');
      setAnalysisMessage('🚶 步行分析完成，正在计算骑行范围...');
      await delay(300);

      updateStepStatus('cycling', 'active', '正在计算骑行范围...');
      await delay(200);
      updateStepStatus('cycling', 'completed', '骑行范围计算完成');
      setAnalysisMessage('🚲 骑行分析完成，正在计算公交范围...');
      await delay(300);

      updateStepStatus('transit', 'active', '正在计算公交范围...');
      await delay(200);
      updateStepStatus('transit', 'completed', '公交范围计算完成');
      setAnalysisMessage('🚌 公交分析完成，正在计算驾车范围...');
      await delay(300);

      updateStepStatus('driving', 'active', '正在计算驾车范围...');
      await delay(200);
      updateStepStatus('driving', 'completed', '驾车范围计算完成');
      setAnalysisMessage('🚗 驾车分析完成，正在生成报告...');
      await delay(300);

      updateStepStatus('report', 'active', '生成综合报告...');

      // 统计设施信息
      let totalFacilities = 0;
      const facilitySummary: Record<string, number> = {};

      if (result.modes?.walking?.time_slots?.['900']?.poi_coverage) {
        const coverage = result.modes.walking.time_slots['900'].poi_coverage;
        Object.entries(coverage).forEach(([category, data]: [string, any]) => {
          const count = data.count || 0;
          totalFacilities += count;
          facilitySummary[category] = count;
        });
      }

      // 显示设施发现消息
      const summaryText = Object.entries(facilitySummary)
        .filter(([_, count]) => count > 0)
        .map(([category, count]) => `${category}${count}处`)
        .join('、');

      if (summaryText) {
        setAnalysisMessage(`🔍 发现${totalFacilities}处设施：${summaryText}`);
        await delay(500);
      }

      setFullResult(result);
      await delay(300);

      updateStepStatus('report', 'completed', '报告生成完成');
      setAnalysisMessage('✅ 分析完成！');

    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
      setAnalysisMessage(null);
    } finally {
      setAnalysisMessage(null);
      setLoading(false);
      setShowProgress(false);
      // 获取风水评分
      fetchFengshuiScore(center.lng, center.lat);
    }
  };

  const handleCenterSelect = (lng: number, lat: number) => {
    setCustomCenter({
      lng,
      lat,
      name: '自定义位置',
    });
  };

  const handleExportPDF = async () => {
    // TODO: 导出全出行方式PDF报告
    console.log('导出PDF报告');
  };

  // 获取等级颜色
//  // const getLevelColor = (level: string) => {
//    switch (level) {
//      case '优秀': return '#52c41a';
//      case '良好': return '#1890ff';
//      case '一般': return '#faad14';
//      default: return '#ff4d4f';
//    }
//  };
//
  const modeData = getCurrentModeData();
  const timeSlotData = getCurrentTimeSlotData();
  const facilities = getAllFacilities();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Icons.Home />
              15分钟生活圈智能体检与规划助手
            </h1>
          </div>
          <div className="header-center">
            <select
              className="community-select"
              value={selectedCommunity ? `${selectedCommunity.lng},${selectedCommunity.lat}` : ''}
              onChange={(e) => {
                if (!e.target.value) return;
                const [lng, lat] = e.target.value.split(',').map(Number);
                const community = SAMPLE_COMMUNITIES.find(c => c.lng === lng && c.lat === lat);
                setSelectedCommunity(community || null);
                setCustomCenter(null);
              }}
            >
              <option value="" disabled>请选择社区</option>
              {SAMPLE_COMMUNITIES.map((community, index) => (
                <option key={index} value={`${community.lng},${community.lat}`}>
                  {community.name}
                </option>
              ))}
            </select>

            <button
              className="header-btn primary"
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
              className="header-btn"
              onClick={() => setShowCustomCenter(!showCustomCenter)}
            >
              <Icons.MapPin />
              自定义位置
            </button>

            {fullResult && (
              <button className="header-btn" onClick={handleExportPDF}>
                <Icons.Download />
                导出PDF
              </button>
            )}
          </div>
          <div className="header-right">
            <a href="../" className="back-button">
              <Icons.ArrowLeft />
              返回首页
            </a>
          </div>
        </div>
        {/* 分析进度 */}
        <AnalysisProgress
          steps={analysisSteps}
          visible={showProgress}
        />
      </header>

      <main className="app-main">

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

        {/* 分析消息提示 */}
        {analysisMessage && (
          <div className="analysis-message-banner">
            <span className="message-icon">ℹ️</span>
            <span className="message-text">{analysisMessage}</span>
          </div>
        )}

        {/* 主内容区域 - 三栏布局 */}
        {fullResult ? (
          <div className="main-content three-columns">
            {/* 左侧 - 地图区域 (50%) */}
            <div className="map-panel">
              {showCustomCenter && (
                <CustomCenter
                  onCenterSelect={handleCenterSelect}
                  currentCenter={getCurrentCenter()}
                  onClose={() => setShowCustomCenter(false)}
                />
              )}
              <MapView
                center={getCurrentCenter()}
                isochrone={timeSlotData?.polygon ? {
                  boundary_points: timeSlotData.boundary_points,
                  polygon: timeSlotData.polygon,
                  area: timeSlotData.area,
                  max_time: activeTimeSlot,
                } : undefined}
                poiCoverage={timeSlotData?.poi_coverage}
                blindSpots={timeSlotData?.blind_spots}
                loading={loading}
                selectedFacility={selectedFacility}
                activeTimeSlot={activeTimeSlot}
                multiTimeData={modeData?.time_slots ? {
                  layers: Object.entries(modeData.time_slots).map(([key, slot]: [string, any]) => ({
                    time: Number(key),
                    boundary_points: slot.boundary_points,
                    area: slot.area
                  }))
                } : undefined}
              />
            </div>

            {/* 中间 - 综合评分 (25%) */}
            <div className="score-panel">
              {/* 出行方式切换 */}
              <div className="travel-mode-tabs">
                {TRAVEL_MODES.map(({ mode, name }) => (
                  <button
                    key={mode}
                    className={`mode-tab ${activeMode === mode ? 'active' : ''}`}
                    onClick={() => setActiveMode(mode)}
                  >
                    {name}
                  </button>
                ))}
              </div>

              
              {/* 时间维度对比 - 紧凑版，放在综合评分上方 */}
              {modeData && modeData.time_slots && (
                <div className="time-comparison-mini">
                  <div className="time-buttons-mini">
                    {[300, 600, 900].map(time => {
                      
                      
                      const isSelected = activeTimeSlot === time;
                      return (
                        <div
                          key={time}
                          className={`time-button-mini ${isSelected ? 'active' : ''}`}
                          onClick={() => setActiveTimeSlot(time)}
                        >
                          <span className="time-label-mini">{time === 300 ? '5分钟' : time === 600 ? '10分钟' : '15分钟'}</span>
                          <span className="time-score-mini">{modeData.score?.total || 0}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


{/* 综合评分概览 - 不随出行方式切换 */}
              {fullResult && (
                <ScoreOverview
                  fullResult={fullResult}
                  communityName={fullResult.community_name || ''}
                />
              )}

              {/* 出行方式评分 - 根据出行方式和时间维度切换 */}
              {fullResult && (
                <Report
                  communityName={fullResult.community_name || ''}
                  fullResult={fullResult}
                  fengshuiResult={fengshuiScore}
                  activeMode={activeMode}
                  activeTimeSlot={activeTimeSlot}
                />
              )}




              {/* 风水评分 */}
              {fengshuiScore && (
                <div className="fengshui-card">
                  <div className="fengshui-card-header">风水评分</div>
                  <FengShuiRadar data={fengshuiScore} showLabels={true} />
                </div>
              )}

            </div>

            {/* 右侧 - 设施列表 (25%) */}
            <div className="facility-panel">
              {/* 设施筛选标签 */}
              <div className="facility-filter-tabs">
                <button
                  className={`filter-tab ${activeCategory === '全部' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('全部')}
                >
                  全部
                </button>
                {timeSlotData?.poi_coverage && Object.keys(timeSlotData.poi_coverage).map(category => (
                  <button
                    key={category}
                    className={`filter-tab ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* 设施列表（竖向滑轨） */}
              <div className="facility-list-container">
                {facilities.map((facility, index) => (
                  <div
                    key={index}
                    className={`facility-card ${selectedFacility?.name === facility.name ? 'selected' : ''}`}
                    onClick={() => setSelectedFacility(facility)}
                  >
                    <div className="facility-card-header">
                      <div
                        className="facility-icon"
                        style={{ backgroundColor: getCategoryColor(facility.category || '') }}
                      >
                        {getCategoryIcon(facility.category || '')}
                      </div>
                      <div className="facility-info">
                        <div className="facility-name">{facility.name}</div>
                        <div className="facility-category">{facility.category}</div>
                      </div>
                    </div>
                    <div className="facility-details">
                      {facility.distance && (
                        <span className="facility-distance">{facility.distance}米</span>
                      )}
                      {facility.address && (
                        <span className="facility-address">{facility.address}</span>
                      )}
                    </div>
                  </div>
                ))}
                {facilities.length === 0 && (
                  <div className="empty-facilities">
                    暂无设施数据
                  </div>
                )}
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
                  onClose={() => setShowCustomCenter(false)}
                />
              )}
              <MapView
                center={getCurrentCenter()}
                loading={loading}
              />
            </div>

            {/* 右侧 - 数据面板 */}
            <div className="data-panel">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 综合报告区域 */}
        {fullResult && (
          <div className="report-section">
            {/* 整条下拉框 */}
            {/* 点击展开/收起按钮 */}
            <div className="report-dropdown-bar" onClick={() => setReportExpanded(!reportExpanded)}>
              <span className="report-dropdown-label">15分钟生活圈体检报告</span>
              <span className="report-toggle-btn">
                <span className="toggle-text">{reportExpanded ? "收起报告" : "展开报告"}</span>
                <span className="toggle-arrow">{reportExpanded ? "▲" : "▼"}</span>
              </span>
            </div>
            {reportExpanded && (
              <div className="report-content">
                {/* 综合报告 */}
                {fullResult?.report && (
                  <ComprehensiveReport
                    report={fullResult.report}
                    communityName={fullResult.community_name}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>15分钟生活圈智能体检与规划助手</p>
          <p className="footer-tech">
            技术栈：React + FastAPI + 百度地图API + NetworkX
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;