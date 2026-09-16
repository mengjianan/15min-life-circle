"""
15分钟生活圈智能体检与规划助手 - 后端主入口
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from api import isochrone, poi, analysis, graph, full_analysis, fengshui
from services.api_protection import api_protection
from models.database import init_db
from config import BACKEND_HOST, BACKEND_PORT


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    init_db()
    yield
    # 关闭时清理资源


app = FastAPI(
    title="15分钟生活圈智能体检与规划助手",
    description="基于百度地图开放能力的社区生活圈分析工具",
    version="1.0.0",
    lifespan=lifespan
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(isochrone.router, prefix="/api/isochrone", tags=["等时圈"])
app.include_router(poi.router, prefix="/api/poi", tags=["POI检索"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["分析报告"])
app.include_router(graph.router, prefix="/api/graph", tags=["路网图"])
app.include_router(full_analysis.router, prefix="/api/analysis", tags=["全出行方式分析"])
app.include_router(fengshui.router)


@app.get("/")
async def root():
    return {
        "name": "15分钟生活圈智能体检与规划助手",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/status")
async def api_status():
    """获取API使用状态"""
    return api_protection.get_status()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=True
    )
