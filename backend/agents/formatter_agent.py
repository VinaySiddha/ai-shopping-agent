# agents/formatter_agent.py

from crewai import Agent
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Formatter Agent: Ensures product ranking results are cleanly structured
formatter_agent = Agent(
    role="Result Formatter",
    goal=(
        "Convert the top N ranked products into a clean, concise, and "
        "frontend-ready JSON structure. Ensure the format is easy to read "
        "and integrate directly into UI components."
    ),
    backstory=(
        "A detail-oriented data presenter who transforms complex product "
        "comparisons into clear, attractive, and standardized JSON outputs. "
        "Strictly follows the required schema to maintain consistency and "
        "frontend compatibility."
    ),
    verbose=True,
    allow_delegation=False
)
