# main.py

import asyncio
import os
from dotenv import load_dotenv

from agent.graph import marketing_agent
from agent.schemas import MarketingStrategy, ProductAnalysis

load_dotenv()

async def chatbot():
    print("Marketing Strategy Agent Chatbot")
    print("Describe your product/service and request a marketing strategy (e.g., 'Create a marketing strategy for my AI-powered task management app').")
    print("Type 'exit' or 'quit' to end the conversation.\n")

    while True:
        user_message = input("You: ").strip()
        
        if user_message.lower() in ["exit", "quit"]:
            print("Bot: Goodbye!")
            break
        
        if not user_message:
            continue

        print("\nBot: Processing your request...\n")
        
        # Invoke the agent
        result = await marketing_agent.ainvoke({"user_message": user_message})
        
        intent = result.get("intent")
        
        if intent == "CASUAL_CHAT":
            print("Bot: This appears to be casual conversation. I am specialized in product analysis and 90-day marketing strategy planning. Please describe your product/service and request a marketing strategy.")
            continue
        
        # If it's a marketing strategy request, we will always have a strategy object
        if "strategy" in result and isinstance(result["strategy"], MarketingStrategy):
            strategy: MarketingStrategy = result["strategy"]
            
            print("=== 90-DAY MARKETING STRATEGY ===\n")
            
            print("## Product Overview")
            print(strategy.product_overview or "Not specified")
            
            print("\n## Core Value Proposition")
            print(strategy.value_proposition or "Not specified")
            
            print("\n## Target Audience")
            print(strategy.target_audience or "Not specified")
            
            print("\n## Recommended Channels")
            for channel in strategy.channels:
                print(f"- {channel}")
            
            print("\n## 90-Day Execution Roadmap")
            
            # Month 1
            print(f"\n### Month 1: {strategy.month_1.focus}")
            print("Key Activities:")
            for activity in strategy.month_1.key_activities:
                print(f"  - {activity}")
            print("KPIs:")
            for kpi in strategy.month_1.kpis:
                print(f"  - {kpi}")
            if strategy.month_1.references:
                print("References:")
                for ref in strategy.month_1.references:
                    print(f"  - {ref}")
            
            # Month 2
            print(f"\n### Month 2: {strategy.month_2.focus}")
            print("Key Activities:")
            for activity in strategy.month_2.key_activities:
                print(f"  - {activity}")
            print("KPIs:")
            for kpi in strategy.month_2.kpis:
                print(f"  - {kpi}")
            if strategy.month_2.references:
                print("References:")
                for ref in strategy.month_2.references:
                    print(f"  - {ref}")
            
            # Month 3
            print(f"\n### Month 3: {strategy.month_3.focus}")
            print("Key Activities:")
            for activity in strategy.month_3.key_activities:
                print(f"  - {activity}")
            print("KPIs:")
            for kpi in strategy.month_3.kpis:
                print(f"  - {kpi}")
            if strategy.month_3.references:
                print("References:")
                for ref in strategy.month_3.references:
                    print(f"  - {ref}")
            
            print("\n## Risks & Mitigation")
            for item in strategy.risks_and_mitigation:
                print(f"- {item}")
            
            print("\n## Expected Outcomes")
            for item in strategy.expected_outcomes:
                print(f"- {item}")
            
            if strategy.references:
                print("\n## Overall References & Further Reading")
                for ref in strategy.references:
                    print(f"- {ref}")
        
        elif "analysis" in result and isinstance(result["analysis"], ProductAnalysis):
            # Fallback if only analysis is present (should not normally happen)
            analysis: ProductAnalysis = result["analysis"]
            print("=== Product Analysis (Intermediate Step) ===")
            print(analysis.model_dump_json(indent=2))
        
        else:
            print("Bot: Unable to generate a complete strategy. Please provide a clearer product description.")

if __name__ == "__main__":
    asyncio.run(chatbot())