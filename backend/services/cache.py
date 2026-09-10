"""
缓存服务
提供内存缓存和SQLite持久化缓存
"""
import json
import sqlite3
from typing import Any, Optional
from datetime import datetime, timedelta
from functools import wraps
import hashlib

from config import CACHE_TTL, DATABASE_URL


class CacheService:
    """缓存服务"""

    def __init__(self):
        self.memory_cache = {}
        self.db_path = DATABASE_URL.replace("sqlite:///", "")
        self._init_db()

    def _init_db(self):
        """初始化缓存数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值

        Args:
            key: 缓存键

        Returns:
            缓存值，不存在或已过期返回None
        """
        # 先查内存缓存
        if key in self.memory_cache:
            entry = self.memory_cache[key]
            if entry["expires_at"] > datetime.now():
                return entry["value"]
            else:
                del self.memory_cache[key]

        # 再查SQLite缓存
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT value, expires_at FROM cache WHERE key = ?",
            (key,)
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            value_str, expires_at_str = row
            expires_at = datetime.fromisoformat(expires_at_str)
            if expires_at > datetime.now():
                value = json.loads(value_str)
                # 写入内存缓存
                self.memory_cache[key] = {
                    "value": value,
                    "expires_at": expires_at
                }
                return value
            else:
                # 已过期，删除
                self.delete(key)

        return None

    def set(self, key: str, value: Any, ttl: int = CACHE_TTL):
        """
        设置缓存值

        Args:
            key: 缓存键
            value: 缓存值
            ttl: 过期时间（秒）
        """
        expires_at = datetime.now() + timedelta(seconds=ttl)

        # 写入内存缓存
        self.memory_cache[key] = {
            "value": value,
            "expires_at": expires_at
        }

        # 写入SQLite缓存
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO cache (key, value, created_at, expires_at)
            VALUES (?, ?, ?, ?)
            """,
            (key, json.dumps(value), datetime.now().isoformat(), expires_at.isoformat())
        )
        conn.commit()
        conn.close()

    def delete(self, key: str):
        """
        删除缓存

        Args:
            key: 缓存键
        """
        # 删除内存缓存
        if key in self.memory_cache:
            del self.memory_cache[key]

        # 删除SQLite缓存
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cache WHERE key = ?", (key,))
        conn.commit()
        conn.close()

    def clear_expired(self):
        """清理过期缓存"""
        # 清理内存缓存
        now = datetime.now()
        expired_keys = [
            key for key, entry in self.memory_cache.items()
            if entry["expires_at"] <= now
        ]
        for key in expired_keys:
            del self.memory_cache[key]

        # 清理SQLite缓存
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM cache WHERE expires_at <= ?",
            (now.isoformat(),)
        )
        conn.commit()
        conn.close()

    def clear_all(self):
        """清空所有缓存"""
        self.memory_cache.clear()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cache")
        conn.commit()
        conn.close()


def generate_cache_key(*args, **kwargs) -> str:
    """
    生成缓存键

    Args:
        *args: 位置参数
        **kwargs: 关键字参数

    Returns:
        缓存键字符串
    """
    key_parts = [str(arg) for arg in args]
    key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
    key_str = ":".join(key_parts)
    return hashlib.md5(key_str.encode()).hexdigest()


def cached(ttl: int = CACHE_TTL):
    """
    缓存装饰器

    Args:
        ttl: 缓存过期时间（秒）
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache = CacheService()
            cache_key = generate_cache_key(func.__name__, *args, **kwargs)

            # 尝试获取缓存
            result = cache.get(cache_key)
            if result is not None:
                return result

            # 执行函数
            result = await func(*args, **kwargs)

            # 写入缓存
            if result is not None:
                cache.set(cache_key, result, ttl)

            return result
        return wrapper
    return decorator


# 全局缓存实例
cache_service = CacheService()
