from pydantic import BaseModel, Field
from typing import List, Optional


class ConversationResponse(BaseModel):
    should_generate_strategy: bool = Field(description="True only if all discovery phases are done and user confirmed")
    response_to_user: Optional[str] = Field(description="The response message to the user if strategy is not yet generated")

class Competitor(BaseModel):
    name: str = Field(description="Name of the competitor product")
    description: str = Field(description="What the competitor does")
    positioning: str = Field(description="Market positioning (pricing, audience, strengths)")
    reference: Optional[str] = Field(
        None, description="Official website or reliable reference link"
    )


class ProductAnalysis(BaseModel):
    product_summary: str = Field(description="Summary of the product")
    target_users: str = Field(description="Who the product is for")
    problem_statement: str = Field(description="Problem the product solves")

    competitors: List[Competitor] = Field(
        description="List of competing or similar products"
    )

    pros: List[str] = Field(description="Strengths of the product")
    cons: List[str] = Field(description="Weaknesses or risks")

    market_insights: Optional[List[str]] = Field(
        None, description="Trends, demand signals, or opportunities"
    )

    references: List[str] = Field(
        description="List of reference links used in the analysis"
    )

# --------------

class MonthlyPlan(BaseModel):
    focus: str = Field(description="Primary focus for the month")
    key_activities: List[str] = Field(description="Execution steps")
    kpis: List[str] = Field(description="Success metrics")
    references: List[str] = Field(
        description="Links supporting strategies used in this month"
    )


class MarketingStrategy(BaseModel):
    product_overview: str = Field(description="Product overview in marketing context")

    target_audience: str = Field(description="Ideal customer profile and personas")

    value_proposition: str = Field(description="Core marketing value proposition")

    channels: List[str] = Field(description="Marketing channels to be used")

    month_1: MonthlyPlan
    month_2: MonthlyPlan
    month_3: MonthlyPlan

    risks_and_mitigation: List[str] = Field(description="Risks and fallback strategies")

    expected_outcomes: List[str] = Field(description="Expected results after 90 days")

    references: List[str] = Field(
        description="All references used in the strategy"
    )


# --------------

