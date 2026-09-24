"""
综合评分模块
按照多维度、可解释、可对比的评分体系设计
"""
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


@dataclass
class CategoryScore:
    """单个类别的评分"""
    name: str
    count: int
    standard_count: int  # 推荐数量
    coverage_rate: float  # 覆盖率 0-1
    standard_rate: float  # 达标率 0-1
    score: float  # 0-100


@dataclass
class AccessibilityScore:
    """可达性评分"""
    avg_time: float  # 平均可达时间（分钟）
    nearest_distance: Dict[str, float]  # 最近设施距离
    detour_coefficient: float  # 路网绕行系数
    score: float  # 0-100


@dataclass
class ModeScore:
    """单种出行方式评分"""
    mode: str
    mode_name: str
    coverage_score: float  # 设施覆盖评分
    accessibility_score: float  # 可达性评分
    blind_spot_score: float  # 盲区评分
    total_score: float  # 综合得分
    categories: Dict[str, CategoryScore]


@dataclass
class FengShuiDetailScore:
    """风水详细评分"""
    terrain: float  # 地势
    orientation: float  # 朝向
    water: float  # 水系
    road_form: float  # 道路形态
    sensitive_facilities: float  # 敏感设施
    greenery: float  # 绿化
    popularity: float  # 人气
    total: float
    level: str


@dataclass
class ComprehensiveScore:
    """综合评分"""
    # 基础覆盖评分
    facility_coverage: float
    # 可达性效率评分
    accessibility: float
    # 出行方式适配度
    mode_adaptability: float
    # 服务盲区识别
    blind_spot: float
    # 风水/居住适宜性
    fengshui: float
    # 综合总分
    total: float
    level: str
    # 各模块详情
    modes: Dict[str, ModeScore]
    fengshui_detail: FengShuiDetailScore


# 设施推荐标准数量（15分钟生活圈）
FACILITY_STANDARDS = {
    "医疗": {"标准": 3, "权重": 0.20},
    "教育": {"标准": 3, "权重": 0.18},
    "购物": {"标准": 5, "权重": 0.15},
    "养老": {"标准": 2, "权重": 0.12},
    "文体": {"标准": 3, "权重": 0.15},
    "餐饮": {"标准": 5, "权重": 0.10},
    "交通": {"标准": 3, "权重": 0.10},
}

# 综合评分权重
TOTAL_WEIGHTS = {
    "facility_coverage": 0.35,
    "accessibility": 0.25,
    "mode_adaptability": 0.20,
    "blind_spot": 0.10,
    "fengshui": 0.10,
}


def calculate_category_score(category: str, count: int) -> CategoryScore:
    """
    计算单个类别的评分

    Args:
        category: 设施类别
        count: 设施数量

    Returns:
        CategoryScore
    """
    standard = FACILITY_STANDARDS.get(category, {"标准": 3, "权重": 0.1})["标准"]
    weight = FACILITY_STANDARDS.get(category, {"标准": 3, "权重": 0.1})["权重"]

    # 覆盖率：有设施就是1，没有就是0
    coverage_rate = 1.0 if count > 0 else 0.0

    # 达标率：实际数量/标准数量，最高1
    standard_rate = min(count / standard, 1.0) if standard > 0 else 0.0

    # 评分：覆盖率40分 + 达标率60分
    score = coverage_rate * 40 + standard_rate * 60

    return CategoryScore(
        name=category,
        count=count,
        standard_count=standard,
        coverage_rate=coverage_rate,
        standard_rate=standard_rate,
        score=score
    )


def calculate_mode_coverage_score(poi_coverage: Dict[str, Any]) -> tuple:
    """
    计算单种出行方式的设施覆盖评分

    Args:
        poi_coverage: POI覆盖数据

    Returns:
        (总分, 各类别评分)
    """
    category_scores = {}
    total_weighted_score = 0
    total_weight = 0

    for category, standards in FACILITY_STANDARDS.items():
        count = poi_coverage.get(category, {}).get("count", 0)
        cat_score = calculate_category_score(category, count)
        category_scores[category] = cat_score

        weight = standards["权重"]
        total_weighted_score += cat_score.score * weight
        total_weight += weight

    total_score = total_weighted_score / total_weight if total_weight > 0 else 0
    return total_score, category_scores


def calculate_accessibility_score(
    center: Dict[str, float],
    poi_coverage: Dict[str, Any],
    mode_speed: float = 1.2
) -> AccessibilityScore:
    """
    计算可达性效率评分

    Args:
        center: 中心点坐标
        poi_coverage: POI覆盖数据
        mode_speed: 出行方式速度（米/秒）

    Returns:
        AccessibilityScore
    """
    nearest_distances = {}
    total_time = 0
    facility_count = 0

    for category, data in poi_coverage.items():
        facilities = data.get("facilities", [])
        if facilities:
            # 最近设施距离
            min_dist = min(f.get("distance", 9999) for f in facilities)
            nearest_distances[category] = min_dist

            # 平均可达时间
            for f in facilities[:3]:  # 取前3个
                dist = f.get("distance", 0)
                time_minutes = dist / mode_speed / 60
                total_time += time_minutes
                facility_count += 1

    # 平均可达时间
    avg_time = total_time / facility_count if facility_count > 0 else 999

    # 路网绕行系数（简化：实际距离/直线距离，假设1.2-1.5）
    detour_coefficient = 1.3

    # 评分计算
    # 平均时间评分：5分钟内100分，15分钟60分，超过扣分
    if avg_time <= 5:
        time_score = 100
    elif avg_time <= 10:
        time_score = 100 - (avg_time - 5) * 8
    elif avg_time <= 15:
        time_score = 60 - (avg_time - 10) * 4
    else:
        time_score = max(0, 40 - (avg_time - 15) * 2)

    # 最近距离评分
    if nearest_distances:
        avg_nearest = sum(nearest_distances.values()) / len(nearest_distances)
        if avg_nearest <= 300:
            dist_score = 100
        elif avg_nearest <= 500:
            dist_score = 100 - (avg_nearest - 300) * 0.2
        elif avg_nearest <= 1000:
            dist_score = 60 - (avg_nearest - 500) * 0.08
        else:
            dist_score = max(0, 20 - (avg_nearest - 1000) * 0.01)
    else:
        dist_score = 0

    # 绕行系数评分
    detour_score = max(0, 100 - (detour_coefficient - 1) * 100)

    # 综合评分
    total_score = time_score * 0.5 + dist_score * 0.3 + detour_score * 0.2

    return AccessibilityScore(
        avg_time=round(avg_time, 1),
        nearest_distance=nearest_distances,
        detour_coefficient=round(detour_coefficient, 2),
        score=round(total_score, 1)
    )


def calculate_blind_spot_score(
    blind_spots: List[Dict],
    total_area: float
) -> float:
    """
    计算服务盲区评分

    Args:
        blind_spots: 盲区列表
        total_area: 总面积

    Returns:
        评分 0-100
    """
    if not blind_spots:
        return 100.0

    # 盲区数量惩罚
    count_penalty = min(len(blind_spots) * 5, 30)

    # 盲区类别惩罚（重要类别惩罚更重）
    important_categories = {"医疗", "教育", "养老"}
    category_penalty = sum(
        10 for spot in blind_spots
        if spot.get("category") in important_categories
    )

    score = max(0, 100 - count_penalty - category_penalty)
    return score


def calculate_accessibility_blind_spots(
    coverage: Dict[str, Any],
    time_label: str = "15分钟"
) -> List[Dict]:
    """
    可达性盲区：该出行方式在该时段**能到达**的设施数量未达标准的类别。

    与空间盲区的区别（两者不要混用）：
    - 空间盲区：等时圈内存在连续的设施空白地带，站在那里 1 公里内找不到该类设施
      （有具体坐标，画在地图上）
    - 可达性盲区：能到达的设施**总量**不达标，例如养老标准 2 个、实际只到得了 0 个
      （没有坐标，按类别列出）

    等时圈越大能到达的设施越多，所以骑行/驾车的可达性盲区通常比步行少。

    Args:
        coverage: 某时段的 POI 覆盖数据 {类别: {count, facilities, ...}}
        time_label: 用于文案，如 "15分钟"

    Returns:
        可达性盲区列表，按缺口从大到小排序
    """
    # 延迟导入：scoring 被多处引用，避免顶层引入 sklearn/shapely 依赖
    from core.blind_spot import CATEGORY_SUGGESTION

    blind_spots: List[Dict] = []
    for category, std in FACILITY_STANDARDS.items():
        # 交通等标准类别不在 POI 分类里，没有覆盖数据就跳过
        if category not in coverage:
            continue

        count = coverage[category].get("count", 0) or 0
        standard = std["标准"]
        if count >= standard:
            continue

        deficit = standard - count
        blind_spots.append({
            "type": "accessibility",
            "category": category,
            "count": count,
            "standard": standard,
            "deficit": deficit,
            "weight": std["权重"],
            "description": (
                f"{time_label}内可到达{count}个{category}设施，"
                f"标准{standard}个，缺口{deficit}个"
            ),
            "suggestion": CATEGORY_SUGGESTION.get(
                category, f"建议增设{category}设施"
            ),
        })

    # 缺口大的优先，其次权重高
    blind_spots.sort(key=lambda s: (-s["deficit"], -s["weight"]))
    return blind_spots


def calculate_mode_adaptability_score(
    modes: Dict[str, ModeScore]
) -> float:
    """
    计算出行方式适配度评分

    Args:
        modes: 各出行方式评分

    Returns:
        评分 0-100
    """
    if not modes:
        return 0

    # 各方式得分的均衡度
    scores = [m.total_score for m in modes.values()]
    avg_score = sum(scores) / len(scores)

    # 标准差（越小越好，说明各方式均衡）
    if len(scores) > 1:
        variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
        std_dev = variance ** 0.5
        # 标准差小加分，大扣分
        balance_bonus = max(0, 20 - std_dev)
    else:
        balance_bonus = 10

    # 最佳方式得分
    best_score = max(scores)

    # 综合：平均分60% + 最佳分20% + 均衡度20%
    total = avg_score * 0.6 + best_score * 0.2 + balance_bonus * 0.2
    return min(100, total)


def calculate_fengshui_detail_score(
    fengshui_data: Dict[str, Any]
) -> FengShuiDetailScore:
    """
    计算风水详细评分（可解释指标）

    Args:
        fengshui_data: 风水数据

    Returns:
        FengShuiDetailScore
    """
    # 地势评分
    terrain = fengshui_data.get("terrain", {}).get("score", 80)

    # 朝向评分
    orientation = fengshui_data.get("orientation", {}).get("score", 80)

    # 水系评分
    water = fengshui_data.get("water", {}).get("score", 70)

    # 道路形态评分（简化：假设良好）
    road_form = 85.0

    # 敏感设施评分（医院、殡仪馆等距离）
    sensitive = fengshui_data.get("environment", {}).get("score", 80)

    # 绿化评分
    greenery = 75.0

    # 人气评分（POI密度）
    popularity = 80.0

    # 综合评分
    total = (
        terrain * 0.15 +
        orientation * 0.15 +
        water * 0.20 +
        road_form * 0.15 +
        sensitive * 0.15 +
        greenery * 0.10 +
        popularity * 0.10
    )

    # 等级
    if total >= 90:
        level = "优秀"
    elif total >= 75:
        level = "良好"
    elif total >= 60:
        level = "一般"
    else:
        level = "需改善"

    return FengShuiDetailScore(
        terrain=round(terrain, 1),
        orientation=round(orientation, 1),
        water=round(water, 1),
        road_form=round(road_form, 1),
        sensitive_facilities=round(sensitive, 1),
        greenery=round(greenery, 1),
        popularity=round(popularity, 1),
        total=round(total, 1),
        level=level
    )


def calculate_comprehensive_score(
    modes_data: Dict[str, Dict],
    fengshui_data: Optional[Dict] = None
) -> ComprehensiveScore:
    """
    计算综合评分

    Args:
        modes_data: 各出行方式数据
        fengshui_data: 风水数据

    Returns:
        ComprehensiveScore
    """
    modes = {}

    # 计算各出行方式评分
    for mode, data in modes_data.items():
        slot_15min = data.get("time_slots", {}).get("900", {})
        coverage = slot_15min.get("poi_coverage", {})
        blind_spots = slot_15min.get("blind_spots", [])
        area = slot_15min.get("area", 0)

        # 设施覆盖评分
        coverage_score, category_scores = calculate_mode_coverage_score(coverage)

        # 可达性评分
        speed = data.get("speed", 1.2)
        accessibility = calculate_accessibility_score(
            {"lng": 0, "lat": 0}, coverage, speed
        )

        # 盲区评分
        blind_score = calculate_blind_spot_score(blind_spots, area)

        # 方式综合分
        total = coverage_score * 0.5 + accessibility.score * 0.3 + blind_score * 0.2

        modes[mode] = ModeScore(
            mode=mode,
            mode_name=data.get("mode_name", mode),
            coverage_score=round(coverage_score, 1),
            accessibility_score=round(accessibility.score, 1),
            blind_spot_score=round(blind_score, 1),
            total_score=round(total, 1),
            categories=category_scores
        )

    # 风水评分
    if fengshui_data:
        fengshui_score = calculate_fengshui_detail_score(fengshui_data)
    else:
        fengshui_score = FengShuiDetailScore(
            terrain=0, orientation=0, water=0, road_form=0,
            sensitive_facilities=0, greenery=0, popularity=0,
            total=0, level="未知"
        )

    # 各模块得分
    facility_coverage = sum(m.coverage_score for m in modes.values()) / len(modes) if modes else 0
    accessibility = sum(m.accessibility_score for m in modes.values()) / len(modes) if modes else 0
    mode_adaptability = calculate_mode_adaptability_score(modes)
    blind_spot = sum(m.blind_spot_score for m in modes.values()) / len(modes) if modes else 0
    fengshui = fengshui_score.total

    # 综合总分
    total = (
        facility_coverage * TOTAL_WEIGHTS["facility_coverage"] +
        accessibility * TOTAL_WEIGHTS["accessibility"] +
        mode_adaptability * TOTAL_WEIGHTS["mode_adaptability"] +
        blind_spot * TOTAL_WEIGHTS["blind_spot"] +
        fengshui * TOTAL_WEIGHTS["fengshui"]
    )

    # 等级
    if total >= 90:
        level = "优秀"
    elif total >= 75:
        level = "良好"
    elif total >= 60:
        level = "一般"
    else:
        level = "需改善"

    return ComprehensiveScore(
        facility_coverage=round(facility_coverage, 1),
        accessibility=round(accessibility, 1),
        mode_adaptability=round(mode_adaptability, 1),
        blind_spot=round(blind_spot, 1),
        fengshui=round(fengshui, 1),
        total=round(total, 1),
        level=level,
        modes=modes,
        fengshui_detail=fengshui_score
    )
