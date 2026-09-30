import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Report from './components/Report';
import ComprehensiveReport from './components/ComprehensiveReport';
// import ModeScorePanel from './components/ModeScorePanel';
import ScoreOverview from './components/ScoreOverview';
import CustomCenter from './components/CustomCenter';
import AnalysisProgress from './components/AnalysisProgress';
import { SAMPLE_COMMUNITIES, Community, API_BASE_URL, PRESET_SNAPSHOT_PATHS } from './config';
import { resolveStreetName } from './services/localSearch';
import { ensureCustomPointUnlocked } from './services/pointGuard';
import { exportElementPDF } from './pdfExport';
import { HistoryEntry, loadHistory, saveHistory, removeHistory } from './services/communityHistory';
import { DEMO_RESULTS } from './services/demoData';
import CommunityComparison from './components/CommunityComparison';
import { Ico } from './icons';
import type { TravelMode, FullAnalysisResult, TravelModeData, POIItem, POICategoryData } from './types';

// 出行方式配置
const TRAVEL_MODES: { mode: TravelMode; name: string; speed: number }[] = [
  { mode: 'walking', name: '步行', speed: 1.2 },
  { mode: 'cycling', name: '骑行', speed: 3.5 },
  { mode: 'transit', name: '公共交通', speed: 5.0 },
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
  // 点页面空白处退出设施聚焦（地图内空白由 MapView 自己的 click 处理，故排除 .map-panel）
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest('button, a, input, select, textarea, label, .facility-card, .report-dropdown-bar, .map-panel, .modal-content')) return;
      setSelectedFacility(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 消息带 SVG 图标（不再使用 emoji）
  const [analysisMessage, setAnalysisMessage] = useState<{ icon: string; text: string } | null>(null);
  const [showCustomCenter, setShowCustomCenter] = useState(false);
  const [reportExpanded, setReportExpanded] = useState(true);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'walking', label: '步行', status: 'pending' },
    { id: 'cycling', label: '骑行', status: 'pending' },
    { id: 'transit', label: '公共交通', status: 'pending' },
    { id: 'driving', label: '驾车', status: 'pending' },
    { id: 'report', label: '生成报告', status: 'pending' },
  ]);
  const [showProgress, setShowProgress] = useState(false);
  // 最近三次体检历史（社区对比数据源，IndexedDB）
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    loadHistory().then(setHistoryEntries);
  }, []);

  // 说明：不再预取「中心→各设施」的路线。
  // 地图现在只在悬浮/选中某个 POI 时才显现那一条路线，几何由前端调百度
  // JS SDK 客户端算（services/localSearch.ts 的 planRoute），零后端配额；
  // 预取全部设施的路线既没人看，又要多打 11~36 次方向API。

  // 风水数据直接取自 full-analysis 的返回。
  // full-analysis 内部已经跑过风水，之前体检结束后又单独请求一次
  // /api/fengshui/analyze 属于重复调用，白烧地点检索配额。
  const fengshuiData = fullResult?.fengshui || null;


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

  // 当前时段下，各出行方式**自己**的等时圈。
  // 悬浮卡片靠它判定「这个设施哪些方式够得着」—— 只在骑行时圈里才出现的
  // 新设施，卡片上就不该显示「步行」那一行。
  const getModeIsochrones = (): Record<string, { lng: number; lat: number }[]> => {
    const out: Record<string, { lng: number; lat: number }[]> = {};
    if (!fullResult?.modes) return out;
    const order: TravelMode[] = ['walking', 'cycling', 'transit', 'driving'];
    order.forEach((m) => {
      const slots = fullResult.modes[m]?.time_slots as Record<string, any> | undefined;
      const slot = slots?.[String(activeTimeSlot)];
      if (slot?.boundary_points && slot.boundary_points.length >= 3) {
        out[m] = slot.boundary_points;
      }
    });
    return out;
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
      '交通': '#13c2c2',
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
      '交通': '通',
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

  // 切换出行方式/换中心点时清掉选中：设施集合随模式半径变化，旧选中的可能不在新等时圈里；
  // 换中心后旧选中属于上一个位置，不清会让镜头和路线一直停在旧位置
  useEffect(() => {
    setSelectedFacility(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode, customCenter, selectedCommunity]);

  const handleAnalyze = async () => {
    let center = getCurrentCenter();
    if (!center) return;

    // 自定义点名可能还在逆地理解析中（点完立刻体检）——补一次，报告社区名才准确
    if (center.name === '自定义位置') {
      const streetName = await resolveStreetName(center.lng, center.lat);
      if (streetName) {
        const prevLng = center.lng;
        const prevLat = center.lat;
        center = { ...center, name: streetName };
        setCustomCenter((prev) =>
          prev && prev.lng === prevLng && prev.lat === prevLat ? { ...prev, name: streetName } : prev
        );
      }
    }

    setLoading(true);
    setError(null);
    setAnalysisMessage(null);
    setShowProgress(true);
    // 首请求是整段 full-analysis（十几秒到半分钟），进度条在此期间不动，
    // 不打招呼会像卡死——先给一句话垫场
    setAnalysisMessage({ icon: 'clock', text: '正在分析，请耐心等待...' });

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
        // GitHub Pages 等静态托管没有后端：POST 一律 405、缺路径 404——都不是接口报错
        if (response.status === 404 || response.status === 405) {
          throw new Error('当前入口是在线展示版（无后端），体检请用 Docker 版入口（本地端口 3001），或在下方对比区「载入演示数据」查看效果');
        }
        if (response.status === 502 || response.status === 503) {
          throw new Error(`后端服务未响应（HTTP ${response.status}），请先启动后端：docker compose up -d`);
        }
        throw new Error(`分析请求失败（HTTP ${response.status}）`);
      }

      const result: FullAnalysisResult = await response.json();

      // 更新步骤状态 - 逐步显示
      updateStepStatus('walking', 'completed', '步行范围计算完成');
      setAnalysisMessage({ icon: 'walk', text: '步行分析完成，正在计算骑行范围...' });
      await delay(300);

      updateStepStatus('cycling', 'active', '正在计算骑行范围...');
      await delay(200);
      updateStepStatus('cycling', 'completed', '骑行范围计算完成');
      setAnalysisMessage({ icon: 'bike', text: '骑行分析完成，正在计算公共交通范围...' });
      await delay(300);

      updateStepStatus('transit', 'active', '正在计算公共交通范围...');
      await delay(200);
      updateStepStatus('transit', 'completed', '公共交通范围计算完成');
      setAnalysisMessage({ icon: 'bus', text: '公共交通分析完成，正在计算驾车范围...' });
      await delay(300);

      updateStepStatus('driving', 'active', '正在计算驾车范围...');
      await delay(200);
      updateStepStatus('driving', 'completed', '驾车范围计算完成');
      setAnalysisMessage({ icon: 'car', text: '驾车分析完成，正在生成报告...' });
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
        setAnalysisMessage({ icon: 'search', text: `发现${totalFacilities}处设施：${summaryText}` });
        await delay(500);
      }

      setFullResult(result);
      // 写入对比历史（同社区覆盖、新社区挤掉最旧），失败不影响报告展示
      saveHistory(result).then(setHistoryEntries).catch(() => {});
      await delay(300);

      updateStepStatus('report', 'completed', '报告生成完成');
      setAnalysisMessage({ icon: 'check', text: '分析完成！' });

    } catch (err) {
      // 预设社区降级：地图 API 失败时展示内置快照，四个街道始终有内容
      const preset = SAMPLE_COMMUNITIES.find((c) => c.name === center.name);
      const snapPath = preset && PRESET_SNAPSHOT_PATHS[preset.name];
      if (snapPath) {
        try {
          const snapRes = await fetch(snapPath);
          if (snapRes.ok) {
            const cached: FullAnalysisResult = await snapRes.json();
            setFullResult(cached);
            // 写入对比历史（失败不阻塞展示）
            saveHistory(cached).then(setHistoryEntries).catch(() => {});
            setError(`地图 API 调用失败，已展示「${preset.name}」内置缓存数据（可点重试获取最新）`);
            setAnalysisMessage(null);
            return;
          }
        } catch {
          // 快照也拉不到，落到下面的原始错误
        }
      }
      setError(err instanceof Error ? err.message : '分析过程中出现错误');
      setAnalysisMessage(null);
    } finally {
      setAnalysisMessage(null);
      setLoading(false);
      setShowProgress(false);
    }
  };

  const handleCenterSelect = (lng: number, lat: number) => {
    // 地图选点/预设点后不再是「选中的社区」——必须清掉，
    // 否则下拉仍显示旧社区，再选同一个社区不触发 onChange，customCenter 清不掉、中心点回不去
    setSelectedCommunity(null);
    // 先落点保证响应即时，社区名随后按所在道路逆地理回填（如 鼓楼区湖南路街道）
    setCustomCenter({ lng, lat, name: '自定义位置' });
    resolveStreetName(lng, lat).then((streetName) => {
      if (!streetName) return;
      // 只回填坐标仍匹配的结果：期间又选了新点就丢弃，避免旧名覆盖新点
      setCustomCenter((prev) =>
        prev && prev.lng === lng && prev.lat === lat && prev.name !== streetName
          ? { ...prev, name: streetName }
          : prev
      );
    });
  };

  // 切类别：地图标记与右侧列表一起筛；选中设施不在新类别里就退出聚焦
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (selectedFacility && category !== '全部' && selectedFacility.category !== category) {
      setSelectedFacility(null);
    }
  };

  const handleExportPDF = async () => {
    if (!fullResult) return;
    // 收起时先展开，等 recharts 动画（默认 750ms）走完再截图
    if (!reportExpanded) setReportExpanded(true);
    await new Promise((r) => setTimeout(r, 900));
    const el = document.querySelector('.report-section.flush');
    if (el instanceof HTMLElement) {
      await exportElementPDF(el, `${fullResult.community_name}_15分钟生活圈体检报告.pdf`);
    }
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
              onClick={() => {
                if (!ensureCustomPointUnlocked()) return;
                setShowCustomCenter(!showCustomCenter);
              }}
            >
              <Icons.MapPin />
              自定义位置
            </button>

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
            <span className="message-icon"><Ico n={analysisMessage.icon} /></span>
            <span className="message-text">{analysisMessage.text}</span>
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
                activeMode={activeMode}
                activeCategory={activeCategory}
                fengshuiData={fengshuiData}
                modeIsochrones={getModeIsochrones()}
                onCenterChange={handleCenterSelect}
                onFacilitySelect={f => setSelectedFacility(f as POIItem | null)}
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
              {/* 切换区（出行方式 + 时间档 + 注）：滑动时吸顶固定 */}
              <div className="score-panel-sticky">
              {/* 出行方式切换 */}
              <div>
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
              </div>

              
              {/* 时间维度对比 - 紧凑版，放在综合评分上方 */}
              {modeData && modeData.time_slots && (
                <div>
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
                          <span className="time-score-mini">{((modeData.time_slots as Record<string, any>)[String(time)] as any)?.score?.total ?? modeData.score?.total ?? 0}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                  <div className="option-note"><span className="option-note-tag">注</span><span>切换<b>出行方式 / 时间档</b>：地图等时圈随之切换、只显示圈内设施，下方<b>覆盖评分 / 可达性 / 盲区</b>重算；悬停设施弹<b>耗时卡片</b>（各方式耗时 + 距离）并画中心→设施<b>真实路线</b>。默认<b>步行 + 15 分钟 + 全部设施</b>。</span></div>
                </div>
              )}
              </div>


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
                  activeMode={activeMode}
                  activeTimeSlot={activeTimeSlot}
                />
              )}

            </div>

            {/* 右侧 - 设施列表 (25%) */}
            <div className="facility-panel">
              {/* 设施筛选标签 */}
              <div className="facility-filter-tabs">
                <button
                  className={`filter-tab ${activeCategory === '全部' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('全部')}
                >
                  全部
                </button>
                {timeSlotData?.poi_coverage && Object.keys(timeSlotData.poi_coverage).map(category => (
                  <button
                    key={category}
                    className={`filter-tab ${activeCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="option-note"><span className="option-note-tag">注</span><span>点类别筛选<b>地图上的设施点与右侧列表</b>（默认「全部」= 当前时间档圈内的七类民生设施；再点「全部」恢复）；<b>下方评分与盲区不随筛选变化</b>，它只是查看视角；点击设施卡片与悬停一致，弹出耗时卡片并画出中心到该设施的真实路线。</span></div>

              {/* 设施列表（竖向滑轨） */}
              <div className="facility-list-container">
                {facilities.map((facility, index) => (
                  <div
                    key={index}
                    className={`facility-card ${selectedFacility?.name === facility.name ? 'selected' : ''}`}
                    onClick={() => setSelectedFacility(prev => (prev?.name === facility.name ? null : facility))}
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
                onCenterChange={handleCenterSelect}
              />
            </div>

            {/* 右侧 - 数据面板 */}
            <div className="data-panel">
              <div className="empty-state">
                <div className="empty-icon">
                  <Icons.Map />
                </div>
                <h3>开始体检</h3>
                <p>选择一个社区或自定义位置，点击「开始体检」，约 30 秒生成该点位的 15 分钟生活圈体检报告。</p>

                <div className="empty-block">
                  <div className="empty-block-title">怎么用</div>
                  <div className="empty-steps">
                    <div className="empty-step">
                      <span className="empty-step-no">1</span>
                      <div>
                        <b>选位置</b>
                        <p>顶部选择社区，或点「自定义位置」在地图上任意选点。</p>
                      </div>
                    </div>
                    <div className="empty-step">
                      <span className="empty-step-no">2</span>
                      <div>
                        <b>点开始体检</b>
                        <p>按真实路网计算等时圈、抓取周边 POI、识别服务盲区。</p>
                      </div>
                    </div>
                    <div className="empty-step">
                      <span className="empty-step-no">3</span>
                      <div>
                        <b>看报告</b>
                        <p>左侧地图看等时圈范围、设施点与盲区；中间面板切换出行方式 / 时间档看评分变化；最右侧按类别筛选（地图与列表一起筛）、点卡片查看详情；下方展开综合报告。</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="empty-block">
                  <div className="empty-block-title">体检算什么</div>
                  <div className="feature-list">
                    <div className="feature-item">
                      <Ico n="clock" />
                      <div>
                        <b>等时圈</b>
                        <p>5/10/15 分钟真实路网可达范围，步行 / 骑行 / 公共交通 / 驾车四种方式（公交、地铁分开规划）。</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <Ico n="building" />
                      <div>
                        <b>设施覆盖</b>
                        <p>医疗 / 教育 / 购物 / 养老 / 文体 / 餐饮 / 交通七类民生设施，对照标准数量打分（医疗 3、教育 3、购物 5、养老 2、文体 3、餐饮 5、交通 3 个）。</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <Ico n="warning" />
                      <div>
                        <b>盲区识别</b>
                        <p>空间盲区（圈内连续的设施空白地带，地图红圈）+ 可达性盲区（数量不达标的类别）。</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <Ico n="walk" />
                      <div>
                        <b>可达性</b>
                        <p>到设施的平均时间与距离——回答「够不够快、够不够近」。</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <Ico n="chart" />
                      <div>
                        <b>出行方式对比</b>
                        <p>四种方式得分对比，避免「只有开车方便」；步行分高说明家门口配套齐全。</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <Ico n="crystal" />
                      <div>
                        <b>风水/居住适宜性</b>
                        <p>地势 / 朝向 / 水系 / 道路形态 / 敏感设施 / 绿化 / 人气七项加权评估居住环境品质。</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="empty-block">
                  <div className="empty-block-title">综合评分怎么算</div>
                  <p className="empty-note">
                    <b>设施覆盖 35% + 可达性 25% + 出行适配 20% + 盲区 10% + 风水 10%</b> 加权合成，取四种出行方式的平均水平。
                    评级：<b>≥90 优秀 / ≥75 良好 / ≥60 一般 / 其余需改善</b>。
                  </p>
                </div>

                <div className="empty-block">
                  <div className="empty-block-title">交互提示</div>
                  <p className="empty-note">
                    默认显示 <b>步行 + 15 分钟 + 全部设施</b>；切换出行方式时地图换成该方式的等时圈，覆盖 / 可达 / 盲区随之重算；
                    点 5 / 10 / 15 只看该分钟圈内设施；鼠标悬停设施可看各方式耗时卡片与真实路线。
                    <b>点击设施卡片</b>：地图自动聚焦到该设施并画出中心→设施的真实路线、弹出耗时卡片；
                    <b>退出聚焦：点页面空白处</b>（或再点一次同一卡片），地图回到中心视图。
                  </p>
                </div>

                <div className="empty-foot">数据来源：百度地图开放平台路网 / POI，估算值仅供参考</div>
              </div>
            </div>
          </div>
        )}

        {/* 综合报告区域 */}
        {fullResult && (
          <div className="report-section flush">
            {/* 整条下拉框 */}
            {/* 点击展开/收起按钮 */}
            <div className="report-dropdown-bar" onClick={() => setReportExpanded(!reportExpanded)}>
              <span className="report-dropdown-label">15分钟生活圈体检报告</span>
              <span className="report-dropdown-actions">
                <button
                  className="dropdown-pdf-btn"
                  onClick={(e) => { e.stopPropagation(); handleExportPDF(); }}
                >
                  导出PDF
                </button>
                <span className="report-toggle-btn">
                  <span className="toggle-text">{reportExpanded ? "收起报告" : "展开报告"}</span>
                  <span className="toggle-arrow">{reportExpanded ? "▲" : "▼"}</span>
                </span>
              </span>
            </div>
            {reportExpanded && (
              <div className="report-content">
                {/* 综合报告 */}
                {fullResult?.report && (
                  <ComprehensiveReport
                    report={fullResult.report}
                    communityName={fullResult.community_name}
                    fullResult={fullResult}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* 最近三次体检对比；仅本次会话点过体检才出现（刷新后历史不自动露，保持初始页干净） */}
        {fullResult && (
          <CommunityComparison
            entries={historyEntries}
            onDelete={(id) => removeHistory(id).then(setHistoryEntries)}
            onLoadDemo={() => {
              Promise.all(DEMO_RESULTS.map((r) => saveHistory(r))).then((lists) => {
                setHistoryEntries(lists[lists.length - 1] || []);
              });
            }}
          />
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