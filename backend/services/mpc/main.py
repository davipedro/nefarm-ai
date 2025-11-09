from fastapi import FastAPI
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import random

app = FastAPI(title="nefarm-ai PMC Service", version="1.0.0")

# Mock data for demonstration
MOCK_ARTICLES = [
    {
        "pmcid": "PMC7123456",
        "pmid": "32123456",
        "title": "Machine Learning Approaches to Protein Folding",
        "authors": "Smith, J.; Johnson, A.; Williams, B.",
        "published_date": "2023-06-15",
        "abstract": "We present a novel approach to protein folding using transformer-based models...",
        "figures": [
            "https://via.placeholder.com/400x300?text=Protein+Structure+1",
            "https://via.placeholder.com/400x300?text=Graph+Comparison",
        ]
    },
    {
        "pmcid": "PMC7234567",
        "pmid": "32234567",
        "title": "Neural Networks in Drug Discovery",
        "authors": "Brown, C.; Davis, D.; Miller, E.",
        "published_date": "2023-05-20",
        "abstract": "Deep learning methods accelerate drug candidate screening...",
        "figures": [
            "https://via.placeholder.com/400x300?text=Neural+Network",
            "https://via.placeholder.com/400x300?text=Results+Graph",
        ]
    }
]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pmc"}

@app.post("/pmc/search")
async def search_pmc(query: dict):
    """
    Simulates PMC API search.
    Returns mock articles matching the query.
    """
    query_text = query.get("query", "").lower()
    limit = query.get("limit", 10)
    
    results = [a for a in MOCK_ARTICLES if query_text in a["title"].lower() or query_text in a["abstract"].lower()]
    
    if not results:
        results = MOCK_ARTICLES[:limit]
    else:
        results = results[:limit]
    
    return {
        "success": True,
        "query": query_text,
        "count": len(results),
        "articles": results
    }

@app.get("/pmc/article/{pmcid}")
async def get_article(pmcid: str):
    """
    Retrieve specific article by PMCID.
    """
    article = next((a for a in MOCK_ARTICLES if a["pmcid"] == pmcid), None)
    
    if not article:
        return JSONResponse(
            status_code=404,
            content={"error": "Article not found"}
        )
    
    return {"success": True, "article": article}

@app.get("/pmc/health")
async def service_health():
    return {
        "status": "operational",
        "service": "pmc",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }
