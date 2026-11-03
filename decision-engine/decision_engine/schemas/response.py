"""API response models for home-screen decisions."""

from pydantic import BaseModel, Field

from decision_engine.schemas.reason_codes import ReasonCode


class RankedItem(BaseModel):
    content_id: str
    slot: str
    rank: int = Field(ge=1, description="1-based position within the slot")
    score: float | None = Field(
        default=None, description="Model score when ranking used features; null for pure fallback"
    )
    reason_code: ReasonCode
    reason_detail: str = Field(..., description="Short explainable string for ops/analytics")


class SlotDecision(BaseModel):
    slot: str
    items: list[RankedItem]


class HomeScreenDecisionResponse(BaseModel):
    customer_id: str
    line_of_business: str
    decisions: list[SlotDecision]
    model_version: str = "ranking-v1"
    eligibility_passed_count: dict[str, int] = Field(
        description="Count of catalog items that passed eligibility per slot"
    )
