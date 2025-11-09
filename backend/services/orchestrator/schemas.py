from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

class ArticleResponse(BaseModel):
    id: int
    title: str
    pmcid: str
    authors: str
    published_date: str
    figures_count: int

class SearchResponse(BaseModel):
    success: bool
    message: str
    articles_count: int
    articles: List[ArticleResponse]

class ExportRequest(BaseModel):
    search_query: str
