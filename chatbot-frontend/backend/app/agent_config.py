from dotenv import load_dotenv
load_dotenv()

# Import your existing compiled LangGraph agent
from agent.graph import marketing_agent
from agent.schemas import MarketingStrategy