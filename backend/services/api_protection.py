"""
API保护机制
1. 使用模拟数据作为默认
2. 只在必要时调用真实API
3. 限制每日调用次数
"""
import os
from datetime import datetime, date
import json
import sqlite3

# 配置
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"  # 默认使用模拟数据
DAILY_API_LIMIT = int(os.getenv("DAILY_API_LIMIT", "1000"))  # 每日API调用限制
DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./data/cache.db").replace("sqlite:///", "")


class APIProtection:
    """API保护服务"""

    def __init__(self):
        self._init_db()

    def _init_db(self):
        """初始化数据库"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS api_usage (
                date TEXT PRIMARY KEY,
                count INTEGER DEFAULT 0
            )
        """)
        conn.commit()
        conn.close()

    def get_today_usage(self) -> int:
        """获取今日API调用次数"""
        today = date.today().isoformat()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT count FROM api_usage WHERE date = ?", (today,))
        row = cursor.fetchone()
        conn.close()
        return row[0] if row else 0

    def increment_usage(self) -> bool:
        """
        增加API调用计数

        Returns:
            True if within limit, False if exceeded
        """
        today = date.today().isoformat()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # 获取当前计数
        cursor.execute("SELECT count FROM api_usage WHERE date = ?", (today,))
        row = cursor.fetchone()
        current_count = row[0] if row else 0

        # 检查是否超过限制
        if current_count >= DAILY_API_LIMIT:
            conn.close()
            return False

        # 更新计数
        cursor.execute("""
            INSERT INTO api_usage (date, count) VALUES (?, 1)
            ON CONFLICT(date) DO UPDATE SET count = count + 1
        """, (today,))

        conn.commit()
        conn.close()
        return True

    def should_use_mock(self) -> bool:
        """
        判断是否应该使用模拟数据

        Returns:
            True if should use mock data
        """
        # 如果配置为使用模拟数据
        if USE_MOCK_DATA:
            return True

        # 如果超过每日限制
        if self.get_today_usage() >= DAILY_API_LIMIT:
            print(f"API调用已达每日限制({DAILY_API_LIMIT})，使用模拟数据")
            return True

        return False

    def get_status(self) -> dict:
        """获取API使用状态"""
        return {
            "use_mock": USE_MOCK_DATA,
            "daily_limit": DAILY_API_LIMIT,
            "today_usage": self.get_today_usage(),
            "remaining": max(0, DAILY_API_LIMIT - self.get_today_usage())
        }


# 全局实例
api_protection = APIProtection()


# 在baidu_map.py中使用示例：
"""
from api_protection import api_protection

async def search_poi(self, location, query, radius=1500):
    # 检查是否使用模拟数据
    if api_protection.should_use_mock():
        return self._generate_mock_poi(location, query)

    # 检查API额度
    if not api_protection.increment_usage():
        return self._generate_mock_poi(location, query)

    # 调用真实API
    ...
"""