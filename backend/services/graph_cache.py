"""
路网数据缓存服务
持久化存储已计算的路网数据，避免重复计算
"""
import json
import sqlite3
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

from config import DATABASE_URL


class GraphCache:
    """路网数据缓存"""

    def __init__(self):
        self.db_path = DATABASE_URL.replace("sqlite:///", "")
        self._init_db()

    def _init_db(self):
        """初始化缓存数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 路网数据缓存表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS graph_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                center_lng REAL NOT NULL,
                center_lat REAL NOT NULL,
                radius REAL NOT NULL,
                graph_data TEXT NOT NULL,
                node_count INTEGER,
                edge_count INTEGER,
                total_distance REAL,
                total_duration REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                UNIQUE(center_lng, center_lat, radius)
            )
        """)

        # 等时圈数据缓存表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS isochrone_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                center_lng REAL NOT NULL,
                center_lat REAL NOT NULL,
                max_time INTEGER NOT NULL,
                directions INTEGER NOT NULL,
                isochrone_data TEXT NOT NULL,
                area REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                UNIQUE(center_lng, center_lat, max_time, directions)
            )
        """)

        # 分析报告缓存表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                center_lng REAL NOT NULL,
                center_lat REAL NOT NULL,
                community_name TEXT,
                report_data TEXT NOT NULL,
                score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                UNIQUE(center_lng, center_lat)
            )
        """)

        conn.commit()
        conn.close()

    def get_graph(
        self,
        center_lng: float,
        center_lat: float,
        radius: float
    ) -> Optional[Dict[str, Any]]:
        """
        获取缓存的路网数据

        Args:
            center_lng: 中心点经度
            center_lat: 中心点纬度
            radius: 半径（米）

        Returns:
            路网数据，不存在或已过期返回None
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT graph_data, expires_at FROM graph_cache
            WHERE center_lng = ? AND center_lat = ? AND radius = ?
            AND expires_at > ?
            """,
            (center_lng, center_lat, radius, datetime.now().isoformat())
        )

        row = cursor.fetchone()
        conn.close()

        if row:
            graph_data_str, expires_at_str = row
            return json.loads(graph_data_str)

        return None

    def set_graph(
        self,
        center_lng: float,
        center_lat: float,
        radius: float,
        graph_data: Dict[str, Any],
        ttl: int = 86400  # 24小时
    ):
        """
        缓存路网数据

        Args:
            center_lng: 中心点经度
            center_lat: 中心点纬度
            radius: 半径（米）
            graph_data: 路网数据
            ttl: 过期时间（秒）
        """
        expires_at = datetime.now() + timedelta(seconds=ttl)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT OR REPLACE INTO graph_cache
            (center_lng, center_lat, radius, graph_data, node_count, edge_count,
             total_distance, total_duration, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                center_lng,
                center_lat,
                radius,
                json.dumps(graph_data),
                graph_data.get('node_count', 0),
                graph_data.get('edge_count', 0),
                graph_data.get('total_distance', 0),
                graph_data.get('total_duration', 0),
                datetime.now().isoformat(),
                expires_at.isoformat()
            )
        )

        conn.commit()
        conn.close()

    def get_isochrone(
        self,
        center_lng: float,
        center_lat: float,
        max_time: int,
        directions: int
    ) -> Optional[Dict[str, Any]]:
        """
        获取缓存的等时圈数据

        Args:
            center_lng: 中心点经度
            center_lat: 中心点纬度
            max_time: 最大步行时间（秒）
            directions: 采样方向数

        Returns:
            等时圈数据，不存在或已过期返回None
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT isochrone_data, expires_at FROM isochrone_cache
            WHERE center_lng = ? AND center_lat = ? AND max_time = ? AND directions = ?
            AND expires_at > ?
            """,
            (center_lng, center_lat, max_time, directions, datetime.now().isoformat())
        )

        row = cursor.fetchone()
        conn.close()

        if row:
            isochrone_data_str, expires_at_str = row
            return json.loads(isochrone_data_str)

        return None

    def set_isochrone(
        self,
        center_lng: float,
        center_lat: float,
        max_time: int,
        directions: int,
        isochrone_data: Dict[str, Any],
        ttl: int = 86400
    ):
        """
        缓存等时圈数据

        Args:
            center_lng: 中心点经度
            center_lat: 中心点纬度
            max_time: 最大步行时间（秒）
            directions: 采样方向数
            isochrone_data: 等时圈数据
            ttl: 过期时间（秒）
        """
        expires_at = datetime.now() + timedelta(seconds=ttl)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT OR REPLACE INTO isochrone_cache
            (center_lng, center_lat, max_time, directions, isochrone_data, area,
             created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                center_lng,
                center_lat,
                max_time,
                directions,
                json.dumps(isochrone_data),
                isochrone_data.get('area', 0),
                datetime.now().isoformat(),
                expires_at.isoformat()
            )
        )

        conn.commit()
        conn.close()

    def get_analysis(
        self,
        center_lng: float,
        center_lat: float
    ) -> Optional[Dict[str, Any]]:
        """
        获取缓存的分析报告

        Args:
            center_lng: 中心点经度
            center_lat: 中心点纬度

        Returns:
            分析报告数据，不存在或已过期返回None
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT report_data, expires_at FROM analysis_cache
            WHERE center_lng = ? AND center_lat = ?
            AND expires_at > ?
            """,
            (center_lng, center_lat, datetime.now().isoformat())
        )

        row = cursor.fetchone()
        conn.close()

        if row:
            report_data_str, expires_at_str = row
            return json.loads(report_data_str)

        return None

    def set_analysis(
        self,
        center_lng: float,
        center_lat: float,
        community_name: str,
        report_data: Dict[str, Any],
        ttl: int = 3600  # 1小时
    ):
        """
        缓存分析报告

        Args:
            center_lng: 中心点经度
            center_lat: 中心点纬度
            community_name: 社区名称
            report_data: 分析报告数据
            ttl: 过期时间（秒）
        """
        expires_at = datetime.now() + timedelta(seconds=ttl)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT OR REPLACE INTO analysis_cache
            (center_lng, center_lat, community_name, report_data, score,
             created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                center_lng,
                center_lat,
                community_name,
                json.dumps(report_data),
                report_data.get('score', {}).get('total', 0),
                datetime.now().isoformat(),
                expires_at.isoformat()
            )
        )

        conn.commit()
        conn.close()

    def get_all_analyses(self) -> List[Dict[str, Any]]:
        """
        获取所有缓存的分析报告

        Returns:
            分析报告列表
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT center_lng, center_lat, community_name, score, created_at
            FROM analysis_cache
            WHERE expires_at > ?
            ORDER BY created_at DESC
            """,
            (datetime.now().isoformat(),)
        )

        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "center_lng": row[0],
                "center_lat": row[1],
                "community_name": row[2],
                "score": row[3],
                "created_at": row[4]
            }
            for row in rows
        ]

    def clear_expired(self):
        """清理过期缓存"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        now = datetime.now().isoformat()

        cursor.execute("DELETE FROM graph_cache WHERE expires_at <= ?", (now,))
        cursor.execute("DELETE FROM isochrone_cache WHERE expires_at <= ?", (now,))
        cursor.execute("DELETE FROM analysis_cache WHERE expires_at <= ?", (now,))

        conn.commit()
        conn.close()

    def clear_all(self):
        """清空所有缓存"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("DELETE FROM graph_cache")
        cursor.execute("DELETE FROM isochrone_cache")
        cursor.execute("DELETE FROM analysis_cache")

        conn.commit()
        conn.close()


# 全局缓存实例
graph_cache = GraphCache()
