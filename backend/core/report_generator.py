"""
综合报告生成模块
生成完整的15分钟生活圈体检报告
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict


@dataclass
class ReportMeta:
    """报告元数据"""
    community_name: str
    center: Dict[str, float]
    analysis_time: str
    travel_modes: List[str]
    time_slots: List[int]
    data_source: str
    report_generate_time: str


@dataclass
class CoreConclusion:
    """核心结论"""
    overall_level: str
    overall_score: float
    best_mode: str
    best_mode_score: float
    sufficient_facilities: List[str]
    insufficient_facilities: List[str]
    blind_spot_count: int
    fengshui_level: str
    top3_improvements: List[str]


@dataclass
class FacilityStat:
    """设施统计"""
    category: str
    count_5min: int
    count_10min: int
    count_15min: int
    standard: int
    status: str  # 达标/不足/严重不足


@dataclass
class ModeComparison:
    """出行方式对比"""
    mode: str
    mode_name: str
    area_15min: float
    facility_count: int
    avg_time: float
    score: float


@dataclass
class BlindSpotInfo:
    """盲区信息"""
    location: Dict[str, float]
    missing_facilities: List[str]
    suggestion: str


@dataclass
class FengShuiReport:
    """风水报告"""
    total_score: float
    level: str
    terrain: float
    orientation: float
    water: float
    road_form: float
    sensitive_facilities: float
    greenery: float
    popularity: float
    description: str
    suggestions: List[str]


@dataclass
class PlanningSuggestion:
    """规划建议"""
    priority_facilities: List[Dict[str, str]]
    new_locations: List[Dict[str, str]]
    mode_optimization: List[str]
    fengshui_improvements: List[str]


@dataclass
class ComprehensiveReport:
    """综合报告"""
    meta: ReportMeta
    conclusion: CoreConclusion
    facility_stats: List[FacilityStat]
    mode_comparisons: List[ModeComparison]
    # 空间盲区（有坐标，地图红圈；规划建议的“新增点位”用它）
    blind_spots: List[BlindSpotInfo]
    # 可达性盲区（按类别，报告正文展示口径）
    accessibility_blind_spots: List[Dict]
    fengshui: FengShuiReport
    suggestions: PlanningSuggestion
    technical_notes: List[str]


# 设施推荐标准
FACILITY_STANDARDS = {
    "医疗": {"标准": 3, "类别": "基础覆盖"},
    "教育": {"标准": 3, "类别": "基础覆盖"},
    "购物": {"标准": 5, "类别": "基础覆盖"},
    "养老": {"标准": 2, "类别": "基础覆盖"},
    "文体": {"标准": 3, "类别": "基础覆盖"},
    "餐饮": {"标准": 5, "类别": "基础覆盖"},
    "交通": {"标准": 3, "类别": "基础覆盖"},
}


def generate_report_meta(
    community_name: str,
    center: Dict[str, float]
) -> ReportMeta:
    """生成报告元数据"""
    return ReportMeta(
        community_name=community_name,
        center=center,
        analysis_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        travel_modes=["步行", "骑行", "公交", "驾车"],
        time_slots=[5, 10, 15],
        data_source="百度地图开放平台",
        report_generate_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )


def generate_core_conclusion(
    comprehensive_score: Any,
    modes_data: Dict[str, Dict],
    blind_spots: List[Dict],
    fengshui_data: Optional[Dict]
) -> CoreConclusion:
    """生成核心结论"""
    # 整体水平
    overall_level = comprehensive_score.level
    overall_score = comprehensive_score.total

    # 最佳出行方式
    best_mode = max(
        comprehensive_score.modes.items(),
        key=lambda x: x[1].total_score
    )
    best_mode_name = best_mode[1].mode_name
    best_mode_score = best_mode[1].total_score

    # 设施充足/匮乏分析
    sufficient = []
    insufficient = []
    for mode_score in comprehensive_score.modes.values():
        for cat_name, cat_score in mode_score.categories.items():
            if cat_score.score >= 80 and cat_name not in sufficient:
                sufficient.append(cat_name)
            elif cat_score.score < 60 and cat_name not in insufficient:
                insufficient.append(cat_name)

    # 盲区数量
    blind_spot_count = len(blind_spots)

    # 风水水平
    fengshui_level = comprehensive_score.fengshui_detail.level

    # 最需要改进的3件事
    top3 = []
    if insufficient:
        top3.append(f"补充{insufficient[0]}设施")
    if blind_spot_count > 2:
        top3.append("减少服务盲区")
    if comprehensive_score.accessibility < 60:
        top3.append("提高设施可达性")
    if not top3:
        top3.append("维持现有服务水平")

    return CoreConclusion(
        overall_level=overall_level,
        overall_score=overall_score,
        best_mode=best_mode_name,
        best_mode_score=best_mode_score,
        sufficient_facilities=sufficient,
        insufficient_facilities=insufficient,
        blind_spot_count=blind_spot_count,
        fengshui_level=fengshui_level,
        top3_improvements=top3[:3]
    )


def generate_facility_stats(
    modes_data: Dict[str, Dict]
) -> List[FacilityStat]:
    """生成设施统计"""
    stats = []

    # 获取各时间档的POI数据
    walking_data = modes_data.get("walking", {})
    time_slots = walking_data.get("time_slots", {})

    for category, standard_info in FACILITY_STANDARDS.items():
        standard = standard_info["标准"]

        # 获取各时间档的设施数量
        count_5min = 0
        count_10min = 0
        count_15min = 0

        for time_key, slot_data in time_slots.items():
            coverage = slot_data.get("poi_coverage", {})
            cat_data = coverage.get(category, {})
            count = cat_data.get("count", 0)

            if time_key == "300":  # 5分钟
                count_5min = count
            elif time_key == "600":  # 10分钟
                count_10min = count
            elif time_key == "900":  # 15分钟
                count_15min = count

        # 达标状态
        if count_15min >= standard:
            status = "达标"
        elif count_15min >= standard * 0.5:
            status = "不足"
        else:
            status = "严重不足"

        stats.append(FacilityStat(
            category=category,
            count_5min=count_5min,
            count_10min=count_10min,
            count_15min=count_15min,
            standard=standard,
            status=status
        ))

    return stats


def generate_mode_comparisons(
    comprehensive_score: Any,
    modes_data: Dict[str, Dict]
) -> List[ModeComparison]:
    """生成出行方式对比"""
    comparisons = []

    for mode, mode_score in comprehensive_score.modes.items():
        mode_data = modes_data.get(mode, {})
        slot_15min = mode_data.get("time_slots", {}).get("900", {})

        # 等时圈面积
        area = slot_15min.get("area", 0)

        # 覆盖设施数量
        coverage = slot_15min.get("poi_coverage", {})
        facility_count = sum(
            cat_data.get("count", 0)
            for cat_data in coverage.values()
        )

        # 平均可达时间
        avg_time = mode_score.accessibility_score  # 简化处理

        comparisons.append(ModeComparison(
            mode=mode,
            mode_name=mode_score.mode_name,
            area_15min=round(area, 0),
            facility_count=facility_count,
            avg_time=round(avg_time, 1),
            score=mode_score.total_score
        ))

    return comparisons


def generate_blind_spot_info(
    blind_spots: List[Dict],
    poi_coverage: Dict[str, Any]
) -> List[BlindSpotInfo]:
    """生成盲区信息"""
    infos = []

    # 分析缺失设施
    missing_by_category = {}
    for category, data in poi_coverage.items():
        if data.get("count", 0) == 0:
            missing_by_category[category] = True

    for spot in blind_spots[:5]:  # 最多显示5个盲区
        center = spot.get("center", {})
        category = spot.get("category", "综合")

        # 缺失设施
        missing = [cat for cat in missing_by_category.keys()]
        if not missing:
            missing = [category] if category != "综合" else ["综合设施"]

        # 建议
        if "医疗" in missing:
            suggestion = "建议在该区域增设社区卫生服务站或药店"
        elif "教育" in missing:
            suggestion = "建议在该区域增设幼儿园或小学"
        elif "购物" in missing:
            suggestion = "建议在该区域增设菜市场或超市"
        else:
            suggestion = f"建议在该区域补充{missing[0]}设施"

        infos.append(BlindSpotInfo(
            location=center,
            missing_facilities=missing,
            suggestion=suggestion
        ))

    return infos


def generate_fengshui_report(
    fengshui_data: Optional[Dict],
    fengshui_score: Any
) -> FengShuiReport:
    """生成风水报告"""
    if not fengshui_data:
        return FengShuiReport(
            total_score=0,
            level="未知",
            terrain=0, orientation=0, water=0, road_form=0,
            sensitive_facilities=0, greenery=0, popularity=0,
            description="暂无风水数据",
            suggestions=[]
        )

    # 描述
    descriptions = []
    if fengshui_score.water >= 80:
        descriptions.append("水系条件良好")
    if fengshui_score.terrain >= 80:
        descriptions.append("地势平坦适宜")
    if fengshui_score.orientation >= 80:
        descriptions.append("朝向采光良好")

    description = "；".join(descriptions) if descriptions else "风水条件一般"

    # 建议
    suggestions = []
    if fengshui_score.sensitive_facilities < 70:
        suggestions.append("注意周边敏感设施的影响")
    if fengshui_score.greenery < 70:
        suggestions.append("建议增加绿化面积")
    if fengshui_score.road_form < 70:
        suggestions.append("注意道路形态对居住的影响")

    return FengShuiReport(
        total_score=fengshui_score.total,
        level=fengshui_score.level,
        terrain=fengshui_score.terrain,
        orientation=fengshui_score.orientation,
        water=fengshui_score.water,
        road_form=fengshui_score.road_form,
        sensitive_facilities=fengshui_score.sensitive_facilities,
        greenery=fengshui_score.greenery,
        popularity=fengshui_score.popularity,
        description=description,
        suggestions=suggestions
    )


def generate_planning_suggestions(
    facility_stats: List[FacilityStat],
    blind_spots: List[BlindSpotInfo],
    fengshui_report: FengShuiReport,
    mode_comparisons: List[ModeComparison]
) -> PlanningSuggestion:
    """生成规划建议"""
    # 优先补齐的设施
    priority_facilities = []
    for stat in facility_stats:
        if stat.status == "严重不足":
            priority_facilities.append({
                "设施": stat.category,
                "原因": f"15分钟生活圈内仅有{stat.count_15min}个，远低于标准{stat.standard}个",
                "优先级": "高"
            })
        elif stat.status == "不足":
            priority_facilities.append({
                "设施": stat.category,
                "原因": f"15分钟生活圈内有{stat.count_15min}个，低于标准{stat.standard}个",
                "优先级": "中"
            })

    # 建议新增点位
    new_locations = []
    for spot in blind_spots[:3]:
        for facility in spot.missing_facilities:
            new_locations.append({
                "设施": facility,
                "位置": f"({spot.location.get('lng', 0)}, {spot.location.get('lat', 0)})",
                "原因": "该区域为服务盲区"
            })

    # 出行方式优化
    mode_optimization = []
    if mode_comparisons:
        best_mode = max(mode_comparisons, key=lambda x: x.score)
        worst_mode = min(mode_comparisons, key=lambda x: x.score)

        if worst_mode.score < 60:
            mode_optimization.append(
                f"建议改善{worst_mode.mode_name}出行条件，当前得分仅{worst_mode.score}分"
            )

    # 风水改善
    fengshui_improvements = fengshui_report.suggestions

    return PlanningSuggestion(
        priority_facilities=priority_facilities[:5],
        new_locations=new_locations[:5],
        mode_optimization=mode_optimization,
        fengshui_improvements=fengshui_improvements
    )


def generate_technical_notes() -> List[str]:
    """生成技术说明"""
    return [
        "数据来源：百度地图开放平台POI检索API、路线规划API",
        "等时圈算法：基于步行速度（1.2m/s）和路网距离计算",
        "POI清洗规则：去重、过滤无效数据、保留前20条结果",
        "评分标准：参考《城市居住区规划设计标准》15分钟生活圈要求",
        "风水评分：基于传统风水理论的量化指标，仅供参考",
        "局限性：公交等待时间未计入、实时路况未考虑、部分设施可能未收录"
    ]


def generate_comprehensive_report(
    community_name: str,
    center: Dict[str, float],
    comprehensive_score: Any,
    modes_data: Dict[str, Dict],
    blind_spots: List[Dict],
    accessibility_blind_spots: Optional[List[Dict]],
    fengshui_data: Optional[Dict],
    poi_coverage: Dict[str, Any]
) -> ComprehensiveReport:
    """
    生成综合报告

    Args:
        community_name: 社区名称
        center: 中心点坐标
        comprehensive_score: 综合评分
        modes_data: 各出行方式数据
        blind_spots: 空间盲区列表（有坐标）
        accessibility_blind_spots: 可达性盲区列表（按类别，报告正文展示）
        fengshui_data: 风水数据
        poi_coverage: POI覆盖数据

    Returns:
        ComprehensiveReport
    """
    # 生成各部分
    meta = generate_report_meta(community_name, center)
    # 结论里的「服务盲区 N 个」要和报告正文展示的可达性盲区对得上
    conclusion = generate_core_conclusion(
        comprehensive_score, modes_data, accessibility_blind_spots, fengshui_data
    )
    facility_stats = generate_facility_stats(modes_data)
    mode_comparisons = generate_mode_comparisons(comprehensive_score, modes_data)
    blind_spot_infos = generate_blind_spot_info(blind_spots, poi_coverage)
    fengshui_report = generate_fengshui_report(
        fengshui_data, comprehensive_score.fengshui_detail
    )
    suggestions = generate_planning_suggestions(
        facility_stats, blind_spot_infos, fengshui_report, mode_comparisons
    )
    technical_notes = generate_technical_notes()

    return ComprehensiveReport(
        meta=meta,
        conclusion=conclusion,
        facility_stats=facility_stats,
        mode_comparisons=mode_comparisons,
        blind_spots=blind_spot_infos,
        accessibility_blind_spots=accessibility_blind_spots or [],
        fengshui=fengshui_report,
        suggestions=suggestions,
        technical_notes=technical_notes
    )


def report_to_dict(report: ComprehensiveReport) -> Dict[str, Any]:
    """将报告转换为字典格式"""
    return asdict(report)
