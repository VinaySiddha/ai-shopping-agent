# agents/crew_orchestrator.py

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai import LLM

# Load environment variables
load_dotenv()

# --- Initialize LLM ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
os.environ["GOOGLE_API_KEY"] = gemini_api_key

llm = LLM(
    model="huggingface/deepseek-ai/DeepSeek-V3.2-Exp",
    temperature=0.7
)

# --- Import Agents & Tools ---
from .crew_setup import (
    parser_agent,
    scraper_orchestrator_agent,
    comparator_agent,
    formatter_agent,
    web_scraper_tool
)

def create_shopping_crew(user_prompt: str, num_products: int, scraping_session_id: str = None):
    """Create a shopping crew with 3 parameters"""
    
    # Simple task setup
    parse_task = Task(
        description=f"Parse this product request: {user_prompt}",
        agent=parser_agent,
        expected_output="JSON object with parsed requirements."
    )
    
    scrape_task = Task(
        description=f"Scrape {num_products} products using session {scraping_session_id}",
        agent=scraper_orchestrator_agent,
        context=[parse_task],
        expected_output="JSON array of product objects."
    )
    
    compare_task = Task(
        description=f"Compare and rank top {num_products} products",
        agent=comparator_agent,
        context=[parse_task, scrape_task],
        expected_output="JSON array of ranked products."
    )
    
    format_task = Task(
        description="Format results with name (string), price (formatted string like '$100.00' or '₹100'), price_numeric (float), rating (string), rating_numeric (float), source_url (string), brand (string), features (list), availability (string), image_url (string) fields",
        agent=formatter_agent,
        context=[compare_task],
        expected_output="JSON array of final products with properly formatted string prices."
    )
    
    crew = Crew(
        agents=[parser_agent, scraper_orchestrator_agent, comparator_agent, formatter_agent],
        tasks=[parse_task, scrape_task, compare_task, format_task],
        verbose=True,
        process=Process.sequential
    )
    
    return crew

