"""
限流控制服务
防止API调用超过配额限制
"""
import asyncio
import time
from typing import Dict
from collections import defaultdict
from functools import wraps

from config import MAX_CONCURRENT_REQUESTS


class RateLimiter:
    """限流器"""

    def __init__(
        self,
        max_requests: int = MAX_CONCURRENT_REQUESTS,
        time_window: float = 1.0
    ):
        """
        初始化限流器

        Args:
            max_requests: 时间窗口内最大请求数
            time_window: 时间窗口（秒）
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests: Dict[str, list] = defaultdict(list)
        self.semaphore = asyncio.Semaphore(max_requests)

    async def acquire(self, key: str = "default"):
        """
        获取请求许可

        Args:
            key: 限流键（用于区分不同的API）
        """
        # 信号量控制并发
        await self.semaphore.acquire()

        # 清理过期的请求记录
        now = time.time()
        self.requests[key] = [
            t for t in self.requests[key]
            if now - t < self.time_window
        ]

        # 检查是否超过限制
        while len(self.requests[key]) >= self.max_requests:
            await asyncio.sleep(0.1)
            now = time.time()
            self.requests[key] = [
                t for t in self.requests[key]
                if now - t < self.time_window
            ]

        # 记录请求时间
        self.requests[key].append(time.time())

    def release(self):
        """释放请求许可"""
        self.semaphore.release()

    async def __aenter__(self):
        await self.acquire()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.release()


class SlidingWindowRateLimiter:
    """滑动窗口限流器"""

    def __init__(
        self,
        max_requests: int = 100,
        time_window: float = 60.0
    ):
        """
        初始化滑动窗口限流器

        Args:
            max_requests: 时间窗口内最大请求数
            time_window: 时间窗口（秒）
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests: Dict[str, list] = defaultdict(list)

    async def acquire(self, key: str = "default"):
        """
        获取请求许可

        Args:
            key: 限流键
        """
        while True:
            now = time.time()

            # 清理过期的请求记录
            self.requests[key] = [
                t for t in self.requests[key]
                if now - t < self.time_window
            ]

            # 检查是否超过限制
            if len(self.requests[key]) < self.max_requests:
                self.requests[key].append(now)
                return

            # 计算需要等待的时间
            oldest = self.requests[key][0]
            wait_time = self.time_window - (now - oldest)
            await asyncio.sleep(wait_time)

    def release(self):
        """释放请求许可（滑动窗口不需要显式释放）"""
        pass

    async def __aenter__(self):
        await self.acquire()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.release()


def rate_limit(
    max_requests: int = MAX_CONCURRENT_REQUESTS,
    time_window: float = 1.0
):
    """
    限流装饰器

    Args:
        max_requests: 时间窗口内最大请求数
        time_window: 时间窗口（秒）
    """
    limiter = RateLimiter(max_requests, time_window)

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            async with limiter:
                return await func(*args, **kwargs)
        return wrapper
    return decorator


# 全局限流器实例
rate_limiter = RateLimiter()
sliding_window_limiter = SlidingWindowRateLimiter()
