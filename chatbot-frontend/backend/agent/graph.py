from typing import Optional, TypedDict, List
from agent.schemas import ProductAnalysis, MarketingStrategy, ConversationResponse
from agent.prompts import intent_prompt, analysis_prompt, marketing_strategy_planner, conversational_consultant_prompt
from agent.config import LLM, tavily

class MarketingState(TypedDict):
    messages: List[dict] # Chat history [{role, content}]
    user_message: str # Current message
    intent: Optional[str]
    analysis: Optional[ProductAnalysis]
    strategy: Optional[MarketingStrategy]
    conversation_response: Optional[str] # To store the reliable response text


def conversation_node(state: MarketingState):
    history = state.get("messages", [])
    # Convert dict history to string for prompt
    history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in history])
    current_msg = state["user_message"]
    full_history = f"{history_str}\nuser: {current_msg}"
    
    prompt = conversational_consultant_prompt(full_history)
    decision = LLM.with_structured_output(ConversationResponse).invoke(prompt)
    
    return {
        "intent": "GENERATE_STRATEGY" if decision.should_generate_strategy else "CONTINUE_CONVERSATION",
        "conversation_response": decision.response_to_user
    }


def analysis_node(state: MarketingState):
    user_request = state["user_message"]
    
    # Tavily searches to provide real-world context
    competitor_query = f"top competitors OR similar products OR alternatives to: {user_request}"
    competitor_results = tavily.search(query=competitor_query, max_results=10)
    
    insights_query = f"market trends OR industry analysis OR demand signals for: {user_request}"
    insights_results = tavily.search(query=insights_query, max_results=6)
    
    # Format search results as context
    competitors_context = "Web search results - Competitors & Alternatives:\n\n"
    for r in competitor_results["results"]:
        competitors_context += f"- {r['title']}\n  {r['content'][:300]}...\n  URL: {r['url']}\n\n"
    
    insights_context = "Web search results - Market Trends & Insights:\n\n"
    for r in insights_results["results"]:
        insights_context += f"- {r['title']}\n  {r['content'][:300]}...\n  URL: {r['url']}\n\n"
    
    # Enhance the original prompt with search context
    base_prompt = analysis_prompt(user_request)
    enhanced_prompt = f"""{base_prompt}

### Additional Research Context (MANDATORY: use these results to identify real competitors, extract accurate descriptions/positioning, and cite the provided URLs as references):

{competitors_context}

{insights_context}

Prioritize information from these sources. If a claim cannot be supported by the provided results, state "No reliable public reference available."
"""
    
    resp = LLM.with_structured_output(ProductAnalysis).invoke(enhanced_prompt)
    return {"analysis": resp}


def strategy_node(state: MarketingState):
    analysis: ProductAnalysis = state["analysis"]
    
    product_summary = analysis.product_summary or state["user_message"]
    
    combined_input = f"""
Product Analysis:
{analysis.model_dump_json(indent=2)}
"""
    
    # Additional Tavily search for real-world marketing examples
    case_query = f"successful marketing strategy OR growth case study OR 90-day launch plan for {product_summary}"
    case_results = tavily.search(query=case_query, max_results=8)
    
    case_context = "Web search results - Relevant Marketing Case Studies & Examples:\n\n"
    for r in case_results["results"]:
        case_context += f"- {r['title']}\n  {r['content'][:300]}...\n  URL: {r['url']}\n\n"
    
    base_prompt = marketing_strategy_planner(combined_input)
    enhanced_prompt = f"""{base_prompt}

### Additional Research Context (MANDATORY: draw practical tactics, channel recommendations, and references from these real examples):

{case_context}

Use the provided URLs in the References section where applicable.
"""
    
    resp = LLM.with_structured_output(MarketingStrategy).invoke(enhanced_prompt)
    return {"strategy": resp}

    resp = LLM.with_structured_output(MarketingStrategy).invoke(
        marketing_strategy_planner(combined_input)
    )
    return {"strategy": resp}


from langgraph.graph import StateGraph, END

graph = StateGraph(MarketingState)

graph.add_node("conversation", conversation_node)
graph.add_node("analysis", analysis_node)
graph.add_node("strategy", strategy_node)

graph.set_entry_point("conversation")

graph.add_conditional_edges(
    "conversation",
    lambda state: (
        "analysis"
        if state["intent"] == "GENERATE_STRATEGY"
        else END
    )
)

graph.add_edge("analysis", "strategy")
graph.add_edge("strategy", END)

marketing_agent = graph.compile()
