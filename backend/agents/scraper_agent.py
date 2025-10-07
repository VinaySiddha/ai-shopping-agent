# agents/scraper_agent.py

import os
import json
import asyncio
from crewai import Agent
from crewai.tools import tool
from dotenv import load_dotenv

from tools.web_scraper import scrape_ecommerce_site
from services.enhanced_data_sources import EnhancedDataSources
from services.product_categorizer import ProductCategorizer

# Load environment variables
load_dotenv()


# --- Tool: Enhanced Web Scraper ---
@tool("EnhancedWebScraper")
def enhanced_web_scraper_tool(product_keyword: str, category: str = "general") -> str:
    """
    Enhanced scraper that combines product categorization with multiple data sources.

    Args:
        product_keyword (str): Search term for the product.
        category (str, optional): Product category (e.g., laptop, smartphone, headphones). Defaults to "general".

    Returns:
        str: JSON string with enriched product data including specifications, ratings, and confidence scores.
    """

    async def run_enhanced_scraping():
        # Step 1: Determine category
        if category == "general":
            detected_category, category_info = ProductCategorizer.categorize_product(product_keyword)
        else:
            category_info = ProductCategorizer.CATEGORIES.get(category)
            if not category_info:
                detected_category, category_info = ProductCategorizer.categorize_product(product_keyword)

        # Step 2: Generate refined search keywords
        search_keywords = ProductCategorizer.get_enhanced_search_keywords(product_keyword, category_info)

        # Step 3: Collect data from multiple enhanced sources
        async with EnhancedDataSources() as data_sources:
            results = await data_sources.search_multiple_sources(
                search_keywords,
                category_info.name,
                num_results=8
            )

        # Step 4: Format results
        formatted_results = []
        for item in results[:10]:  # Limit to top 10 results
            formatted_item = {
                "name": item.get("name", "N/A"),
                "current_price": item.get("current_price"),
                "image_url": item.get("image_url", "N/A"),
                "product_url": item.get("product_url", "N/A"),
                "source": item.get("source", "unknown"),
                "confidence_score": item.get("confidence_score", 0.5),
                "extracted_specs": item.get("extracted_specs", {}),
                "search_relevance": item.get("search_relevance", 0.5),
                "category": category_info.name
            }
            formatted_results.append(formatted_item)

        return formatted_results

    # Run async scraping with fallback
    try:
        results = asyncio.run(run_enhanced_scraping())
        return json.dumps(results)
    except Exception as e:
        print(f"[EnhancedWebScraper] Failed: {e}")
        # Fallback: Basic scraping
        fallback_results = asyncio.run(scrape_ecommerce_site(product_keyword, 5, "both"))
        return json.dumps(fallback_results)


# --- Agent: Scraper Orchestrator ---
scraper_orchestrator_agent = Agent(
    role="Enhanced Product Data Orchestrator",
    goal=(
        "Gather high-quality product data by intelligently categorizing items, "
        "scraping from multiple trusted sources, and applying confidence scoring "
        "with detailed specification extraction."
    ),
    backstory=(
        "A highly skilled product research specialist with expertise across "
        "different categories. Uses advanced categorization algorithms and "
        "multi-source aggregation to ensure accurate, comprehensive, and "
        "reliable product information for decision-making."
    ),
    tools=[enhanced_web_scraper_tool],
    verbose=True,
    allow_delegation=False
)
