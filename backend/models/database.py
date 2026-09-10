"""
数据库模型和初始化
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class IsochroneCache(Base):
    """等时圈缓存表"""
    __tablename__ = "isochrone_cache"

    id = Column(Integer, primary_key=True, index=True)
    center_lng = Column(Float, nullable=False)
    center_lat = Column(Float, nullable=False)
    max_time = Column(Integer, nullable=False)
    polygon_data = Column(Text, nullable=False)
    area = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class POICache(Base):
    """POI缓存表"""
    __tablename__ = "poi_cache"

    id = Column(Integer, primary_key=True, index=True)
    center_lng = Column(Float, nullable=False)
    center_lat = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    poi_data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnalysisReport(Base):
    """分析报告表"""
    __tablename__ = "analysis_reports"

    id = Column(Integer, primary_key=True, index=True)
    community_name = Column(String(100), nullable=False)
    center_lng = Column(Float, nullable=False)
    center_lat = Column(Float, nullable=False)
    report_data = Column(Text, nullable=False)
    score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """初始化数据库"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
