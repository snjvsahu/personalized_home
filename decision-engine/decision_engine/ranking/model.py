"""Explainable weighted ranking and catalog-order fallback."""

from dataclasses import dataclass

from decision_engine.content.catalog import ContentItem
from decision_engine.schemas.context import CustomerContext
from decision_engine.schemas.reason_codes import ReasonCode


@dataclass
class ScoredItem:
    item: ContentItem
    score: float
    reason_code: ReasonCode
    reason_detail: str


# Default propensity when no feature data — neutral 0.5
DEFAULT_PROPENSITY = 0.5

# Segment affinity boost when content targets customer's segment
SEGMENT_MATCH_BOOST = 0.15

# Weights (must sum to 1.0 for interpretability in docs)
WEIGHT_BUSINESS_PRIORITY = 0.35
WEIGHT_PROPENSITY = 0.40
WEIGHT_ENGAGEMENT = 0.15
WEIGHT_SEGMENT = 0.10


def _engagement_signal(ctx: CustomerContext) -> float:
    """Derive a simple engagement prior from recency of app use."""
    if ctx.days_since_last_app_open is None:
        return 0.5
    if ctx.days_since_last_app_open <= 3:
        return 1.0
    if ctx.days_since_last_app_open <= 14:
        return 0.7
    if ctx.days_since_last_app_open <= 30:
        return 0.4
    return 0.2


def _propensity(ctx: CustomerContext, item: ContentItem, propensity_map: dict[str, float]) -> float:
    if not item.propensity_key:
        return DEFAULT_PROPENSITY
    return propensity_map.get(item.propensity_key, DEFAULT_PROPENSITY)


def _normalize_priority(priority: int) -> float:
    return min(max(priority, 1), 100) / 100.0


def rank_with_model(
    items: list[ContentItem],
    ctx: CustomerContext,
    propensity_map: dict[str, float] | None = None,
) -> list[ScoredItem]:
    """
    Simple linear model: weighted sum of normalized CMS priority, propensity,
    engagement prior, and segment match. Fully explainable via reason_code on winner.
    """
    propensity_map = propensity_map or {}
    engagement = _engagement_signal(ctx)
    segment_value = ctx.segment.value
    scored: list[ScoredItem] = []

    for item in items:
        pri = _normalize_priority(item.business_priority)
        prop = _propensity(ctx, item, propensity_map)
        if item.target_segments and segment_value in item.target_segments:
            seg_score = 1.0
        elif not item.target_segments:
            seg_score = 0.5
        else:
            seg_score = 0.0

        score = (
            WEIGHT_BUSINESS_PRIORITY * pri
            + WEIGHT_PROPENSITY * prop
            + WEIGHT_ENGAGEMENT * engagement
            + WEIGHT_SEGMENT * seg_score
        )

        # Pick dominant explainable reason (highest contributing normalized component)
        components = [
            (WEIGHT_PROPENSITY * prop, ReasonCode.ELIGIBLE_HIGH_PROPENSITY, "High propensity for offer"),
            (
                WEIGHT_BUSINESS_PRIORITY * pri,
                ReasonCode.ELIGIBLE_BUSINESS_PRIORITY,
                "Elevated business priority",
            ),
            (
                WEIGHT_ENGAGEMENT * engagement,
                ReasonCode.ELIGIBLE_RECENT_ENGAGEMENT,
                "Recent app engagement",
            ),
            (
                WEIGHT_SEGMENT * seg_score,
                ReasonCode.ELIGIBLE_SEGMENT_MATCH,
                "Segment targeting match",
            ),
        ]
        components.sort(key=lambda x: x[0], reverse=True)
        _, reason_code, reason_detail = components[0]

        scored.append(ScoredItem(item=item, score=score, reason_code=reason_code, reason_detail=reason_detail))

    scored.sort(key=lambda s: (-s.score, s.item.catalog_sort_order))
    return scored


def rank_fallback_catalog_order(items: list[ContentItem]) -> list[ScoredItem]:
    """Used when insufficient data to differentiate (empty propensity and no engagement fields)."""
    ordered = sorted(items, key=lambda i: (i.catalog_sort_order, i.content_id))
    return [
        ScoredItem(
            item=i,
            score=0.0,
            reason_code=ReasonCode.FALLBACK_CATALOG_ORDER,
            reason_detail="CMS catalog order; insufficient behavioral data",
        )
        for i in ordered
    ]


def has_sufficient_ranking_data(ctx: CustomerContext, propensity_map: dict[str, float] | None) -> bool:
    if propensity_map:
        return True
    return ctx.days_since_last_app_open is not None
