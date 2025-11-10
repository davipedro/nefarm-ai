"""
Shared Pydantic schemas for data exchange between MCPs
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, field_validator
import re


class ImageData(BaseModel):
    """Data structure for an image extracted from PMC article"""

    figure_id: str = Field(..., description="Figure identifier (e.g., 'fig1')")
    caption: str = Field(..., description="Figure caption text")
    image_url: HttpUrl = Field(..., description="URL to the image")
    alt_text: Optional[str] = Field(None, description="Alternative text if available")

    class Config:
        json_schema_extra = {
            "example": {
                "figure_id": "fig1",
                "caption": "Figure 1. Growth curve showing bacterial density over time.",
                "image_url": "https://cdn.ncbi.nlm.nih.gov/pmc/blobs/abc123/fig1.jpg",
                "alt_text": "Line graph with time on x-axis",
            }
        }


class ArticleMetadata(BaseModel):
    """Metadata for a PMC article"""

    pmcid: str = Field(..., description="PubMed Central ID")
    title: str = Field(..., description="Article title")
    authors: List[str] = Field(default_factory=list, description="List of authors")
    publication_date: Optional[str] = Field(None, description="Publication date")
    journal: Optional[str] = Field(None, description="Journal name")
    doi: Optional[str] = Field(None, description="Digital Object Identifier")
    images: List[ImageData] = Field(
        default_factory=list, description="Images found in article"
    )

    @field_validator("pmcid")
    @classmethod
    def validate_pmcid(cls, v: str) -> str:
        """Validate PMCID format"""
        if not re.match(r"^PMC\d+$", v):
            raise ValueError(f"Invalid PMCID format: {v}. Expected format: PMC1234567")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "pmcid": "PMC1234567",
                "title": "Study on bacterial growth",
                "authors": ["Smith, J.", "Doe, A."],
                "publication_date": "2023-01-15",
                "journal": "Journal of Microbiology",
                "doi": "10.1234/jm.2023.001",
                "images": [],
            }
        }


class ClassificationResult(BaseModel):
    """Result of graph classification"""

    is_graph: bool = Field(..., description="Whether the image is a graph")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    graph_type: Optional[str] = Field(
        None, description="Type of graph (line, bar, scatter, etc.)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "is_graph": True,
                "confidence": 0.94,
                "graph_type": "line_chart",
            }
        }


class DataPoint(BaseModel):
    """A single data point from extracted graph"""

    x: float = Field(..., description="X-axis value")
    y: float = Field(..., description="Y-axis value")
    series: Optional[str] = Field(None, description="Series name if multiple series")

    class Config:
        json_schema_extra = {"example": {"x": 1.5, "y": 2.3, "series": "Control"}}


class GraphMetadata(BaseModel):
    """Metadata about the extracted graph"""

    x_label: Optional[str] = Field(None, description="X-axis label")
    y_label: Optional[str] = Field(None, description="Y-axis label")
    title: Optional[str] = Field(None, description="Graph title")
    extraction_method: str = Field(
        ..., description="Method used for extraction (e.g., 'webplotdigitizer')"
    )
    extracted_via: str = Field(
        default="browser-use", description="Tool used (browser-use, playwright, etc.)"
    )
    extraction_time_seconds: Optional[float] = Field(
        None, description="Time taken to extract data"
    )
    llm_steps_taken: Optional[int] = Field(
        None, description="Number of LLM steps (if using browser-use)"
    )


class GraphData(BaseModel):
    """Complete graph data including points and metadata"""

    figure_id: str = Field(..., description="Original figure ID")
    caption: str = Field(..., description="Figure caption")
    image_url: HttpUrl = Field(..., description="URL to original image")
    classification: ClassificationResult = Field(
        ..., description="Classification result"
    )
    data_points: List[DataPoint] = Field(
        default_factory=list, description="Extracted data points"
    )
    metadata: GraphMetadata = Field(..., description="Graph metadata")

    class Config:
        json_schema_extra = {
            "example": {
                "figure_id": "fig1",
                "caption": "Growth curve showing bacterial density",
                "image_url": "https://cdn.ncbi.nlm.nih.gov/pmc/blobs/abc123/fig1.jpg",
                "classification": {"is_graph": True, "confidence": 0.94},
                "data_points": [{"x": 0, "y": 0.1}, {"x": 1, "y": 0.3}],
                "metadata": {
                    "x_label": "Time (hours)",
                    "y_label": "OD600",
                    "extraction_method": "webplotdigitizer",
                    "extracted_via": "browser-use",
                },
            }
        }


class ExtractGraphsResponse(BaseModel):
    """Complete response from graph extraction pipeline"""

    pmcid: str = Field(..., description="PubMed Central ID")
    article_title: str = Field(..., description="Article title")
    article_metadata: ArticleMetadata = Field(..., description="Full article metadata")
    graphs_found: int = Field(..., description="Number of graphs identified")
    graphs: List[GraphData] = Field(
        default_factory=list, description="Extracted graph data"
    )
    processing_time_seconds: float = Field(
        ..., description="Total processing time"
    )
    errors: List[str] = Field(
        default_factory=list, description="Any errors encountered"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "pmcid": "PMC1234567",
                "article_title": "Study on bacterial growth",
                "article_metadata": {
                    "pmcid": "PMC1234567",
                    "title": "Study on bacterial growth",
                    "authors": [],
                    "images": [],
                },
                "graphs_found": 2,
                "graphs": [],
                "processing_time_seconds": 45.2,
                "errors": [],
            }
        }


class MCPToolCall(BaseModel):
    """Generic MCP tool call structure"""

    tool_name: str = Field(..., description="Name of the tool to call")
    arguments: Dict[str, Any] = Field(..., description="Tool arguments")

    class Config:
        json_schema_extra = {
            "example": {
                "tool_name": "extract_images",
                "arguments": {"pmcid": "PMC1234567"},
            }
        }


class MCPToolResult(BaseModel):
    """Generic MCP tool result structure"""

    success: bool = Field(..., description="Whether the tool call succeeded")
    result: Optional[Dict[str, Any]] = Field(
        None, description="Tool result if successful"
    )
    error: Optional[str] = Field(None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "result": {"images": []},
                "error": None,
            }
        }
