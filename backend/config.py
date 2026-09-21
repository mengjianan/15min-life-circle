"""
配置管理模块（优化版）
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# 加载.env文件（优先从当前目录加载，其次从父目录）
env_path = Path(__file__).parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# 百度地图API配置
BAIDU_MAP_AK = os.getenv("BAIDU_MAP_AK", "")
BAIDU_MAP_SK = os.getenv("BAIDU_MAP_SK", "")

# 百度地图API端点
BAIDU_MAP_API_BASE = "https://api.map.baidu.com"

# 地理编码服务
GEOCODER_API = f"{BAIDU_MAP_API_BASE}/geocoder/v2"

# 地点检索服务
PLACE_API = f"{BAIDU_MAP_API_BASE}/place/v2/search"
PLACE_DETAIL_API = f"{BAIDU_MAP_API_BASE}/place/v2/detail"

# 路线规划服务（Lite版）
DIRECTION_API = f"{BAIDU_MAP_API_BASE}/directionlite/v1"
WALKING_DIRECTION_API = f"{DIRECTION_API}/walking"
RIDING_DIRECTION_API = f"{DIRECTION_API}/riding"
DRIVING_DIRECTION_API = f"{DIRECTION_API}/driving"
TRANSIT_DIRECTION_API = f"{DIRECTION_API}/transit"

# 距离矩阵
DISTANCE_MATRIX_API = f"{BAIDU_MAP_API_BASE}/routematrix/v1"

# IP定位
IP_LOCATION_API = f"{BAIDU_MAP_API_BASE}/location/ip"

# 鹰眼轨迹服务
YINGYAN_API_BASE = f"{BAIDU_MAP_API_BASE}/api/v3"
YINGYAN_ENTITY_API = f"{YINGYAN_API_BASE}/entity"
YINGYAN_TRACK_API = f"{YINGYAN_API_BASE}/track"
YINGYAN_GEOFENCE_API = f"{YINGYAN_API_BASE}/geofence"

# 等时圈计算配置（优化版）
ISOCHRONE_DIRECTIONS = 16  # 采样方向数（每15度一个，从36减少到24）
ISOCHRONE_MAX_TIME = 15 * 60  # 15分钟（秒）
ISOCHRONE_WALKING_SPEED = 1.2  # 步行速度（米/秒）
BINARY_SEARCH_ITERATIONS = 4  # 二分搜索迭代次数（从8减少到6）
MAX_SEARCH_RADIUS = 2000  # 最大搜索半径（米）

# 快速模式配置（用于预览）
FAST_MODE_DIRECTIONS = 12  # 快速模式方向数
FAST_MODE_ITERATIONS = 4  # 快速模式迭代次数

# POI配置
POI_RADIUS = 1500  # POI检索半径（米）
POI_PAGE_SIZE = 20  # 每页结果数
POI_TYPES = {
    "医疗": ["诊所", "药店", "医院"],
    "教育": ["小学", "幼儿园", "培训机构"],
    "购物": ["菜市场", "超市", "便利店"],
    "养老": ["养老院", "老年活动中心"],
    "文体": ["公园", "图书馆", "体育场馆"],
    "餐饮": ["餐厅", "早餐店"],
}

# 盲区识别配置
BLIND_SPOT_GRID_SIZE = 100  # 网格大小（米）
BLIND_SPOT_RADIUS = 1000  # 盲区判定半径（米）
BLIND_SPOT_MIN_COUNT = 1  # 最少设施数量

# 服务配置
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8080"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/cache.db")
CACHE_TTL = int(os.getenv("CACHE_TTL", "86400"))
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", "5"))
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "10"))

# 南京市中心坐标（默认）
DEFAULT_CENTER = {
    "lng": 118.7969,
    "lat": 32.0603,
    "name": "南京市中心"
}

# 示例社区坐标（南京市鼓楼区）
SAMPLE_COMMUNITIES = [
    {"lng": 118.7784, "lat": 32.0663, "name": "鼓楼区湖南路街道"},
    {"lng": 118.7854, "lat": 32.0553, "name": "鼓楼区中央门街道"},
    {"lng": 118.8034, "lat": 32.0683, "name": "玄武区新街口街道"},
    {"lng": 118.7894, "lat": 32.0433, "name": "秦淮区夫子庙街道"},
]
