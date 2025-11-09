from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True)
    pmcid = Column(String, unique=True, index=True)
    pmid = Column(String, nullable=True)
    title = Column(String)
    authors = Column(String)
    published_date = Column(String)
    abstract = Column(Text)
    figures_urls = Column(JSON, default=[])
    search_query = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    classifications = relationship("ClassificationResult", back_populates="article")

class ClassificationResult(Base):
    __tablename__ = "classification_results"
    
    id = Column(Integer, primary_key=True)
    article_id = Column(Integer, ForeignKey("articles.id"), index=True)
    image_url = Column(String)
    is_graph = Column(Boolean, default=False)
    confidence = Column(Float)
    extracted_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    article = relationship("Article", back_populates="classifications")

class SearchResult(Base):
    __tablename__ = "search_results"
    
    id = Column(Integer, primary_key=True)
    query = Column(String)
    results_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
