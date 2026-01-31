# agent/config.py (new file) or add to top of agent/graph.py

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from tavily import TavilyClient

load_dotenv()

# LLM configuration (Groq)
LLM = ChatGroq(
    api_key=os.getenv("GROK_API_KEY"),
    model_name=os.getenv("MODEL"),
    temperature=0.0,  # Deterministic for structured output
)

# Tavily search client
tavily = TavilyClient(api_key=os.getenv("TAVIKY_API_KEY"))