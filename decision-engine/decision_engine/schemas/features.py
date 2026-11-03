"""Feature dataset schema for training / offline evaluation (synthetic only in-repo)."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class FeatureRecordLabel(StrEnum):
    """Marks rows as synthetic — never use real customer data in this repository."""

    SYNTHETIC = "SYNTHETIC"


class CustomerFeatureRow(BaseModel):
    """
    One row per customer snapshot used to derive ranking features.
    All rows in generated datasets MUST set data_label=SYNTHETIC.
    """

    data_label: FeatureRecordLabel = FeatureRecordLabel.SYNTHETIC
    snapshot_at: datetime
    customer_id: str
    line_of_business: str
    segment: str
    account_status: str
    region_code: str
    tenure_days: int = Field(ge=0)
    has_autopay: bool
    active_product_count: int = Field(ge=0)
    data_usage_pct: float | None = Field(default=None, ge=0.0, le=1.5)
    days_since_last_app_open: int | None = Field(default=None, ge=0)
    hero_click_rate_30d: float | None = Field(default=None, ge=0.0, le=1.0)
    notification_open_rate_30d: float | None = Field(default=None, ge=0.0, le=1.0)
    quick_link_tap_rate_30d: float | None = Field(default=None, ge=0.0, le=1.0)


class ContentFeatureRow(BaseModel):
    """Content-level features keyed by content_id and slot."""

    data_label: FeatureRecordLabel = FeatureRecordLabel.SYNTHETIC
    content_id: str
    slot: str
    line_of_business: str
    business_priority: int = Field(ge=1, le=100, description="CMS/editorial priority")
    catalog_sort_order: int = Field(ge=1, description="Stable CMS ordering for fallback")
    propensity_key: str | None = Field(
        default=None, description="Key matched against customer propensity map"
    )
    target_segments: list[str] = Field(default_factory=list)


class InteractionFeatureRow(BaseModel):
    """Optional customer x content engagement (synthetic)."""

    data_label: FeatureRecordLabel = FeatureRecordLabel.SYNTHETIC
    customer_id: str
    content_id: str
    slot: str
    impressions_30d: int = Field(ge=0)
    clicks_30d: int = Field(ge=0)


class FeatureDataset(BaseModel):
    """Bundle written by the synthetic generator."""

    data_label: FeatureRecordLabel = FeatureRecordLabel.SYNTHETIC
    customers: list[CustomerFeatureRow]
    content: list[ContentFeatureRow]
    interactions: list[InteractionFeatureRow] = Field(default_factory=list)
