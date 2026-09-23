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
from pathlib import Path
from dotenv import load_dotenv

# 加载.env文件
load_dotenv(Path(__file__).parent.parent.parent / ".env")

# 配置
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "false").lower() == "true"  # 默认不使用模拟数据
DAILY_API_LIMIT = int(os.getenv("DAILY_API_LIMIT", "2000"))  # 每日API调用限制（百度地图配额3000/天，留1000缓冲）
DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./data/cache.db").replace("sqlite:///", "")


class APIProtection:
    """API保护服务"""

    def __init__(self):
        self._init_db()

    def _init_db(self):
        """初始化数据库"""
        try:
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
        except Exception as e:
            print(f"初始化数据库失败: {e}")

    def get_today_usage(self) -> int:
        """获取今日API使用量"""
        try:
            today = date.today().isoformat()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT count FROM api_usage WHERE date = ?", (today,))
            result = cursor.fetchone()
            conn.close()
            return result[0] if result else 0
        except Exception as e:
            print(f"获取使用量失败: {e}")
            return 0

    def increment_usage(self):
        """增加今日使用量"""
        try:
            today = date.today().isoformat()
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO api_usage (date, count) VALUES (?, 1)
                ON CONFLICT(date) DO UPDATE SET count = count + 1
            """, (today,))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"更新使用量失败: {e}")

    def should_use_mock(self) -> bool:
        """
        判断是否应该使用模拟数据

        Returns:
            True if should use mock data
        """
        # 如果配置为使用模拟数据
        if USE_MOCK_DATA:
            print("配置为使用模拟数据")
            return True

        # 如果超过每日限制
        usage = self.get_today_usage()
        if usage >= DAILY_API_LIMIT:
            print(f"API调用已达每日限制({DAILY_API_LIMIT})，使用模拟数据")
            return True

        print(f"使用真实API数据 (今日已用: {usage}/{DAILY_API_LIMIT})")
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
