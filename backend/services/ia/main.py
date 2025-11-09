from fastapi import FastAPI
from datetime import datetime
import random

app = FastAPI(title="nefarm-ai IA Service", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ia"}

@app.post("/ia/classify")
async def classify_image(request: dict):
    """
    Classify image as graph or non-graph using simulated ML model.
    In production, this would use MobileNetV2 or similar.
    """
    image_url = request.get("image_url", "")
    
    # Simulate classification logic
    # In production: download image, run through model, return results
    is_graph = random.choice([True, False])
    confidence = round(random.uniform(0.75, 0.99), 3)
    
    # Determine image type if it's a graph
    graph_type = None
    if is_graph:
        graph_type = random.choice(["line", "bar", "scatter", "heatmap", "histogram"])
    
    return {
        "success": True,
        "image_url": image_url,
        "is_graph": is_graph,
        "type": graph_type,
        "confidence": confidence,
        "model": "MobileNetV2-simulated",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/ia/batch-classify")
async def batch_classify(request: dict):
    """
    Batch classify multiple images.
    """
    image_urls = request.get("image_urls", [])
    
    results = []
    for url in image_urls:
        is_graph = random.choice([True, False])
        confidence = round(random.uniform(0.75, 0.99), 3)
        graph_type = random.choice(["line", "bar", "scatter"]) if is_graph else None
        
        results.append({
            "image_url": url,
            "is_graph": is_graph,
            "type": graph_type,
            "confidence": confidence
        })
    
    return {
        "success": True,
        "total": len(results),
        "results": results
    }

@app.get("/ia/health")
async def service_health():
    return {
        "status": "operational",
        "service": "ia",
        "model": "MobileNetV2-simulated",
        "version": "1.0.0"
    }
