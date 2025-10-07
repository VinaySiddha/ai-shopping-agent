from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class SearchFilters(BaseModel):
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    brands: Optional[List[str]] = []
    use_case: Optional[str] = None
    features: Optional[List[str]] = []

class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10
    filters: Optional[SearchFilters] = None

class ProductResult(BaseModel):
    name: str
    price: str
    price_numeric: Optional[float] = None
    brand: Optional[str] = None
    rating: Optional[str] = None
    rating_numeric: Optional[float] = None
    reviews: Optional[str] = None
    features: Optional[List[str]] = None
    pros_cons: Optional[Dict[str, List[str]]] = None
    availability: Optional[str] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    category: Optional[str] = None
    match_score: Optional[float] = Field(default=0.0, description="How well this product matches the search criteria")

class SearchResponse(BaseModel):
    query_id: str
    results: List[ProductResult]
    comparison_summary: Optional[str] = None
    recommendation: Optional[str] = None
    total_found: int
    search_timestamp: datetime
    applied_filters: Optional[SearchFilters] = None
    search_strategy: Optional[str] = None

class FilterSuggestion(BaseModel):
    category: str
    suggested_brands: List[str]
    suggested_price_ranges: List[Dict[str, Union[str, int]]]
    suggested_use_cases: List[str]
    popular_features: List[str]

class SearchStatus(BaseModel):
    query_id: str
    status: str  # "pending", "processing", "completed", "failed"
    current_stage: Optional[str] = None
    progress: Optional[int] = None  # 0-100
    estimated_time: Optional[int] = None  # seconds
    error_message: Optional[str] = None
    scraping_session_id: Optional[str] = None  # For tracking scraping progress