from agent.schemas import MarketingStrategy

def format_strategy(strategy: MarketingStrategy) -> str:
    """Convert the structured MarketingStrategy Pydantic model to clean Markdown"""
    lines = ["# 90-Day Marketing Strategy\n"]
    
    lines.append(f"## Product Overview\n{strategy.product_overview or 'Not specified'}")
    lines.append(f"\n## Core Value Proposition\n{strategy.value_proposition or 'Not specified'}")
    lines.append(f"\n## Target Audience\n{strategy.target_audience or 'Not specified'}")
    
    lines.append("\n## Recommended Channels")
    for channel in strategy.channels:
        lines.append(f"- {channel}")
    
    lines.append("\n## 90-Day Execution Roadmap")
    months = [strategy.month_1, strategy.month_2, strategy.month_3]
    for i, month in enumerate(months, 1):
        lines.append(f"\n### Month {i}: {month.focus}")
        lines.append("**Key Activities:**")
        for activity in month.key_activities:
            lines.append(f"- {activity}")
        lines.append("**KPIs:**")
        for kpi in month.kpis:
            lines.append(f"- {kpi}")
        if month.references:
            lines.append("**References:**")
            for ref in month.references:
                lines.append(f"- {ref}")
    
    lines.append("\n## Risks & Mitigation")
    for risk in strategy.risks_and_mitigation:
        lines.append(f"- {risk}")
    
    lines.append("\n## Expected Outcomes")
    for outcome in strategy.expected_outcomes:
        lines.append(f"- {outcome}")
    
    if strategy.references:
        lines.append("\n## Overall References & Further Reading")
        for ref in strategy.references:
            lines.append(f"- {ref}")
    
    return "\n".join(lines)