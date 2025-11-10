"""
Custom exceptions for Nefarm AI
"""


class NefarmBaseException(Exception):
    """Base exception for all Nefarm errors"""

    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


# MCP Communication Errors
class MCPConnectionError(NefarmBaseException):
    """Raised when MCP connection fails"""

    pass


class MCPTimeoutError(NefarmBaseException):
    """Raised when MCP call times out"""

    pass


class MCPToolError(NefarmBaseException):
    """Raised when MCP tool call fails"""

    pass


# PMC Extractor Errors
class ArticleNotFoundError(NefarmBaseException):
    """Raised when PMC article is not found"""

    pass


class ScrapingError(NefarmBaseException):
    """Raised when HTML scraping fails"""

    pass


class InvalidPMCIDError(NefarmBaseException):
    """Raised when PMCID format is invalid"""

    pass


# IA Local Errors
class ModelLoadError(NefarmBaseException):
    """Raised when model fails to load"""

    pass


class ClassificationError(NefarmBaseException):
    """Raised when classification fails"""

    pass


# Browser Use Errors
class BrowserAutomationError(NefarmBaseException):
    """Raised when browser automation fails"""

    pass


class GraphExtractionError(NefarmBaseException):
    """Raised when graph data extraction fails"""

    pass


# API Gateway Errors
class ValidationError(NefarmBaseException):
    """Raised when request validation fails"""

    pass


class RateLimitError(NefarmBaseException):
    """Raised when rate limit is exceeded"""

    pass
