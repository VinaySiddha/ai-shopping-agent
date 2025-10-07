# agents/crew_setup.py

import os
import json
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from crewai import LLM

from tools.enhanced_web_scraper import search_both_platforms

# --- Load environment variables ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

# Set environment variables for LiteLLM
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# Debug print
print(f"Using model: {GEMINI_MODEL_NAME}")
print(f"API key exists: {bool(GEMINI_API_KEY)}")

# --- Initialize LLM using CrewAI's LLM class ---
llm = LLM(
    model="huggingface/deepseek-ai/DeepSeek-V3.2-Exp",
    temperature=0.7
)

# --- Tool: Enhanced Web Scraper ---
@tool("EnhancedWebScraper")
def web_scraper_tool(product_keyword: str, session_id: str = None) -> str:
    """
    Scrape product data from Amazon India and Flipkart using the enhanced scraper.

    Returns:
        JSON string: List of products with 'product_name', 'current_price', 'image_url', 'product_url', and 'source'.
    """
    try:
        # Import here to avoid circular imports
        from services.scraping_tracker import ScrapingTracker
        from supabase import create_client
        import os
        
        # Create tracker instance
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        if supabase_url and supabase_key:
            supabase_client = create_client(supabase_url, supabase_key)
            tracker = ScrapingTracker(supabase_client)
        else:
            tracker = None
            
        # Update status if tracker is available
        if tracker and session_id:
            tracker.update_status(session_id, "scraping_amazon", "amazon")
            
        # Use enhanced scraper to get products from both platforms
        results = search_both_platforms(product_keyword, max_results=8)
        
        # Store results if tracker is available
        if tracker and session_id:
            amazon_results = [p for p in results if p.get('source') == 'amazon']
            flipkart_results = [p for p in results if p.get('source') == 'flipkart']
            
            if amazon_results:
                tracker.store_products(session_id, amazon_results, "amazon")
            if flipkart_results:
                tracker.store_products(session_id, flipkart_results, "flipkart")
                
            tracker.update_product_count(session_id, 
                                       amazon_count=len(amazon_results), 
                                       flipkart_count=len(flipkart_results))
            tracker.update_status(session_id, "processing", "processing")
            
        return json.dumps(results)
    except Exception as e:
        return json.dumps({"error": str(e), "results": []})


# --- Agent 1: Product Request Parser ---
parser_agent = Agent(
    role="Product Request Parser",
    goal=(
        "Extract product type, key specifications (RAM, processor, screen size, storage), "
        "budget, and brand preferences from natural language input."
    ),
    backstory=(
        "Expert in natural language processing. Converts complex user requests "
        "into structured, actionable JSON data. Ensures numeric values and brand names are correctly identified."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)

# --- Agent 2: Web Search & Scraper Orchestrator ---
scraper_orchestrator_agent = Agent(
    role="Web Search & Scraping Orchestrator",
    goal="Use the WebScraper tool to gather comprehensive real-time product data based on parsed requirements.",
    backstory=(
        "Specialist in finding top online sources and efficiently extracting product information. "
        "Delegates scraping tasks to the WebScraper tool and compiles raw product data."
    ),
    llm=llm,
    tools=[web_scraper_tool],
    verbose=True,
    allow_delegation=False
)

# --- Agent 3: Product Comparison & Ranking ---
comparator_agent = Agent(
    role="Product Comparison & Ranking Specialist",
    goal="Compare products against user specifications and budget, rank them by overall fit, price, and reviews.",
    backstory=(
        "Analytical expert who compares specs, prices, and reviews to find the best value. "
        "Generates concise summaries highlighting matching features and key advantages."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)

# --- Agent 4: Result Formatter ---
formatter_agent = Agent(
    role="Result Formatter",
    goal="Format top-ranked products into a clean, concise, frontend-ready JSON structure.",
    backstory=(
        "Ensures complex data is distilled into user-friendly JSON. Strictly follows the required schema "
        "to guarantee consistency and compatibility with frontend displays."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)


# --- Function: Create Shopping Crew ---
def create_shopping_crew(user_prompt: str, num_products: int) -> Crew:
    """
    Assemble a sequential CrewAI workflow to:
        1. Parse product requests
        2. Scrape enhanced product data
        3. Compare and rank products
        4. Format results for frontend display

    Args:
        user_prompt (str): The user's product request.
        num_products (int): Number of top products to return.

    Returns:
        Crew: Configured CrewAI instance ready for execution.
    """

    # --- Task 1: Parse Product Request ---
    parse_task = Task(
        description=f"""
        Parse the following product request: '{user_prompt}'.
        Extract:
            - Product type (e.g., laptop, smartphone)
            - Key specifications (RAM, processor, screen size, storage)
            - Maximum budget (numeric)
            - Preferred brands (list)
            - Primary search keyword for scraping
        Example output:
        {{
            'product_type': 'laptop',
            'search_keyword': '15-inch laptop i7 16GB',
            'specs': {{'ram_gb': 16, 'processor': 'Intel i7', 'screen_size_inches': 15.6}},
            'budget': 1500,
            'brands': ['Dell', 'HP'],
            'num_results': {num_products}
        }}
        """,
        agent=parser_agent,
        expected_output="JSON object with parsed product requirements."
    )

    # --- Task 2: Scrape Products ---
    scrape_task = Task(
        description=f"""
        Using the 'search_keyword' from the parser task, scrape at least {num_products * 2} products.
        Extract: 'name', 'current_price', 'image_url', 'product_url'.
        Include 'summary' or 'key_specifications' if available.
        Return empty list if no products are found.
        Do NOT invent product data.
        """,
        agent=scraper_orchestrator_agent,
        context=[parse_task],
        expected_output="JSON array of raw product objects."
    )

    # --- Task 3: Compare & Rank Products ---
    compare_and_rank_task = Task(
        description=f"""
        Compare scraped products against user requirements:
            - Budget, specs, brand preferences
            - Generate one-paragraph 'summary' for each product
            - Identify 'key_specifications' matching user's request
            - Assign 'ranking_score' (0-100)
        Return only the top {num_products} products.
        """,
        agent=comparator_agent,
        context=[parse_task, scrape_task],
        expected_output=f"JSON array of top {num_products} product objects with 'product_name', 'current_price', 'image_url', 'product_url', 'ranking_score', 'summary', 'key_specifications'."
    )

    # --- Task 4: Format Final Results ---
    format_task = Task(
        description="""
        Format top-ranked products for frontend display:
            - Ensure each object has: 'product_name', 'image_url', 'current_price', 'summary', 'key_specifications', 'product_url'
            - Do not include 'ranking_score' unless required
            - Ensure 'current_price' is numeric and 'key_specifications' is a list of strings
        """,
        agent=formatter_agent,
        context=[compare_and_rank_task],
        expected_output="JSON array of final consumer-ready product objects."
    )

    # --- Assemble Crew ---
    product_crew = Crew(
        agents=[parser_agent, scraper_orchestrator_agent, comparator_agent, formatter_agent],
        tasks=[parse_task, scrape_task, compare_and_rank_task, format_task],
        verbose=True,
        process=Process.sequential
    )

    return product_crew
