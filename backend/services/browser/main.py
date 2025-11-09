from fastapi import FastAPI
from datetime import datetime
import random

app = FastAPI(title="nefarm-ai Browser Service", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "browser"}

@app.post("/browser/extract")
async def extract_data(request: dict):
    """
    Simulates automated web extraction of graph data.
    In production, would use Playwright/Selenium + WebPlotDigitizer integration.
    """
    image_url = request.get("image_url", "")
    graph_type = request.get("graph_type", "unknown")
    
    # Generate mock extracted data based on graph type
    if graph_type == "line":
        data = {
            "type": "line",
            "title": "Protein Concentration Over Time",
            "x_label": "Time (hours)",
            "y_label": "Concentration (mM)",
            "series": [
                {
                    "name": "Treatment A",
                    "data": [0.5, 1.2, 2.1, 3.5, 4.8, 5.9]
                },
                {
                    "name": "Control",
                    "data": [0.1, 0.15, 0.2, 0.25, 0.3, 0.35]
                }
            ]
        }
    elif graph_type == "bar":
        data = {
            "type": "bar",
            "title": "Expression Levels by Gene",
            "categories": ["Gene A", "Gene B", "Gene C", "Gene D"],
            "values": [45.2, 67.8, 23.4, 89.1]
        }
    else:
        data = {
            "type": graph_type,
            "title": "Extracted Graph Data",
            "note": "Simulated extraction"
        }
    
    return {
        "success": True,
        "image_url": image_url,
        "data": data,
        "method": "simulated-extraction",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/browser/extract-batch")
async def extract_batch(request: dict):
    """
    Batch extract data from multiple graphs.
    """
    images = request.get("images", [])
    
    results = []
    for img in images:
        graph_type = img.get("type", "unknown")
        result = {
            "image_url": img.get("url"),
            "data": {
                "type": graph_type,
                "extracted": True,
                "confidence": round(random.uniform(0.8, 0.99), 3)
            }
        }
        results.append(result)
    
    return {
        "success": True,
        "total": len(results),
        "results": results
    }

@app.get("/browser/health")
async def service_health():
    return {
        "status": "operational",
        "service": "browser",
        "extraction_method": "simulated",
        "version": "1.0.0"
    }
