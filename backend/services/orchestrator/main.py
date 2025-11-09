from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import httpx
import os
from datetime import datetime

from database import Base
from models import Article, SearchResult, ClassificationResult
from schemas import SearchRequest, SearchResponse, ExportRequest
from config import Settings

settings = Settings()
app = FastAPI(title="nefarm-ai Orchestrator", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
engine = create_engine(settings.database_url, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    print("Orchestrator Service Started")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "orchestrator"}

@app.get("/search-mock")
async def search_mock(query: str = "graph", limit: int = 5):
    """
    Mock search endpoint that returns sample data without requiring external services.
    Useful for testing and development when services are not running.
    """
    mock_articles = [
        {
            "pmcid": "PMC9234567",
            "pmid": "36123456",
            "title": f"Analysis of {query} patterns in molecular biology",
            "authors": "Smith J, Johnson K, Brown L",
            "published_date": "2024-01-15",
            "abstract": f"This study examines the effects of {query} on molecular interactions and biological processes.",
            "figures": [
                "https://via.placeholder.com/400x300?text=Figure+1",
                "https://via.placeholder.com/400x300?text=Figure+2"
            ]
        },
        {
            "pmcid": "PMC9234568",
            "pmid": "36123457",
            "title": f"Structural insights into {query} mechanisms",
            "authors": "Wilson A, Davis M, Miller S",
            "published_date": "2024-02-10",
            "abstract": f"A comprehensive analysis of {query} behavior in cellular environments.",
            "figures": [
                "https://via.placeholder.com/400x300?text=Figure+3",
                "https://via.placeholder.com/400x300?text=Figure+4"
            ]
        },
        {
            "pmcid": "PMC9234569",
            "pmid": "36123458",
            "title": f"Clinical applications of {query} research",
            "authors": "Taylor R, Anderson E, Thomas P",
            "published_date": "2024-03-05",
            "abstract": f"Review of recent {query} findings and their therapeutic potential.",
            "figures": [
                "https://via.placeholder.com/400x300?text=Figure+5"
            ]
        },
    ]
    
    return {
        "success": True,
        "message": "Mock search results (no services required)",
        "articles_count": min(len(mock_articles), limit),
        "articles": mock_articles[:limit]
    }

@app.post("/search", response_model=SearchResponse)
async def search_articles(request: SearchRequest, db: Session = None):
    """
    Search for articles using PMC Service.
    Orchestrates the flow: PMC Search -> Classification -> Data Extraction.
    """
    if db is None:
        db = SessionLocal()
    
    try:
        # Call PMC Service
        async with httpx.AsyncClient() as client:
            pmc_response = await client.post(
                f"{settings.pmc_service_url}/pmc/search",
                json={"query": request.query, "limit": request.limit}
            )
            pmc_response.raise_for_status()
            pmc_data = pmc_response.json()
        
        articles = []
        for article_data in pmc_data.get("articles", []):
            # Store article in database
            article = Article(
                pmcid=article_data.get("pmcid"),
                pmid=article_data.get("pmid"),
                title=article_data.get("title"),
                authors=article_data.get("authors"),
                published_date=article_data.get("published_date"),
                abstract=article_data.get("abstract"),
                figures_urls=article_data.get("figures", []),
                search_query=request.query
            )
            db.add(article)
            
            # Classify figures
            classifications = []
            for fig_url in article_data.get("figures", []):
                async with httpx.AsyncClient() as client:
                    ia_response = await client.post(
                        f"{settings.ia_service_url}/ia/classify",
                        json={"image_url": fig_url}
                    )
                    ia_response.raise_for_status()
                    classification = ia_response.json()
                
                if classification.get("is_graph"):
                    # If it's a graph, extract data
                    async with httpx.AsyncClient() as client:
                        browser_response = await client.post(
                            f"{settings.browser_service_url}/browser/extract",
                            json={"image_url": fig_url, "graph_type": classification.get("type")}
                        )
                        browser_response.raise_for_status()
                        extracted_data = browser_response.json()
                    
                    classification_result = ClassificationResult(
                        article_id=article.id,
                        image_url=fig_url,
                        is_graph=True,
                        confidence=classification.get("confidence"),
                        extracted_data=extracted_data.get("data")
                    )
                else:
                    classification_result = ClassificationResult(
                        article_id=article.id,
                        image_url=fig_url,
                        is_graph=False,
                        confidence=classification.get("confidence")
                    )
                
                db.add(classification_result)
                classifications.append(classification_result)
            
            db.commit()
            articles.append(article)
        
        return SearchResponse(
            success=True,
            message="Search completed successfully",
            articles_count=len(articles),
            articles=[{
                "id": a.id,
                "title": a.title,
                "pmcid": a.pmcid,
                "authors": a.authors,
                "published_date": str(a.published_date),
                "figures_count": len(a.figures_urls)
            } for a in articles]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/articles")
async def list_articles(db: Session = None, limit: int = 50):
    """List all stored articles."""
    if db is None:
        db = SessionLocal()
    
    articles = db.query(Article).limit(limit).all()
    return {
        "total": len(articles),
        "articles": [{
            "id": a.id,
            "title": a.title,
            "pmcid": a.pmcid,
            "authors": a.authors,
            "published_date": str(a.published_date),
            "figures_count": len(a.figures_urls)
        } for a in articles]
    }

@app.get("/article/{article_id}")
async def get_article_details(article_id: int, db: Session = None):
    """Get article details with classifications."""
    if db is None:
        db = SessionLocal()
    
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    classifications = db.query(ClassificationResult).filter(
        ClassificationResult.article_id == article_id
    ).all()
    
    return {
        "article": {
            "id": article.id,
            "title": article.title,
            "pmcid": article.pmcid,
            "pmid": article.pmid,
            "authors": article.authors,
            "published_date": str(article.published_date),
            "abstract": article.abstract,
            "figures_count": len(article.figures_urls)
        },
        "classifications": [{
            "id": c.id,
            "image_url": c.image_url,
            "is_graph": c.is_graph,
            "confidence": c.confidence,
            "extracted_data": c.extracted_data
        } for c in classifications]
    }

@app.post("/export")
async def export_csv(request: ExportRequest, db: Session = None):
    """Export search results to CSV."""
    if db is None:
        db = SessionLocal()
    
    import csv
    from io import StringIO
    
    articles = db.query(Article).filter(
        Article.search_query == request.search_query
    ).all()
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Article ID", "Title", "PMCID", "Authors", "Published Date", "Figures"])
    
    for article in articles:
        writer.writerow([
            article.id,
            article.title,
            article.pmcid,
            article.authors,
            article.published_date,
            len(article.figures_urls)
        ])
    
    return {
        "success": True,
        "csv_data": output.getvalue(),
        "filename": f"nefarm_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    }
