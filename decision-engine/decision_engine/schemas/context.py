"""Customer and session context for home-screen decisions."""

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class LineOfBusiness(StrEnum):
    WIRELESS = "wireless"
    FIBER = "fiber"
    PREPAID = "prepaid"
    BUSINESS = "business"


class AccountStatus(StrEnum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    SUSPENDED = "suspended"
    PENDING = "pending"


class CustomerSegment(StrEnum):
    CONSUMER = "consumer"
    PREMIUM = "premium"
    SENIOR = "senior"
    STUDENT = "student"
    SMB = "smb"


class CustomerContext(BaseModel):
    """Input describing who is viewing the home screen."""

    customer_id: str = Field(..., min_length=1, description="Opaque customer identifier")
    line_of_business: LineOfBusiness
    segment: CustomerSegment = CustomerSegment.CONSUMER
    account_status: AccountStatus = AccountStatus.ACTIVE
    region_code: str = Field(..., min_length=2, max_length=8, examples=["US-TX"])
    locale: str = Field(default="en-US", pattern=r"^[a-z]{2}-[A-Z]{2}$")
    active_product_skus: list[str] = Field(default_factory=list)
    tenure_days: int = Field(default=0, ge=0)
    has_autopay: bool = False
    data_usage_pct: float | None = Field(
        default=None, ge=0.0, le=1.5, description="Fraction of plan data used this cycle"
    )
    days_since_last_app_open: int | None = Field(default=None, ge=0)


class HomeScreenDecisionRequest(BaseModel):
    customer: CustomerContext
    slot_limits: dict[str, int] | None = Field(
        default=None,
        description="Optional caps per slot, e.g. hero=1, notifications=3, quick_links=8",
    )
