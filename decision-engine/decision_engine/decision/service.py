"""Build home-screen decisions: eligibility → rank → slot limits."""

from decision_engine.content.catalog import (
    ContentCatalog,
    DEFAULT_SLOT_LIMITS,
    QUICK_LINK_LIMITS,
    default_catalog,
)
from decision_engine.eligibility.rules import evaluate_eligibility
from decision_engine.ranking.model import (
    has_sufficient_ranking_data,
    rank_fallback_catalog_order,
    rank_with_model,
)
from decision_engine.schemas.context import CustomerContext, HomeScreenDecisionRequest
from decision_engine.schemas.reason_codes import ReasonCode
from decision_engine.schemas.response import HomeScreenDecisionResponse, RankedItem, SlotDecision

SLOTS = ("hero", "notifications", "quick_links")


def default_propensity_for_context(ctx: CustomerContext) -> dict[str, float]:
    """
    Optional hook: in production, load from feature store.
    Demo heuristics only — not real customer data.
    """
    base: dict[str, float] = {}
    if ctx.segment.value == "premium":
        base["loyalty"] = 0.9
        base["trade_in"] = 0.75
    if ctx.data_usage_pct and ctx.data_usage_pct >= 0.75:
        base["data_boost"] = 0.85
    if not ctx.has_autopay:
        base["autopay"] = 0.7
    if ctx.account_status.value == "past_due":
        base["bill_pay"] = 0.95
    return base


class HomeScreenDecisionService:
    def __init__(self, catalog: ContentCatalog | None = None) -> None:
        self.catalog = catalog or default_catalog()

    def decide(
        self,
        request: HomeScreenDecisionRequest,
        propensity_map: dict[str, float] | None = None,
    ) -> HomeScreenDecisionResponse:
        ctx = request.customer
        propensity = propensity_map if propensity_map is not None else default_propensity_for_context(ctx)
        limits = dict(DEFAULT_SLOT_LIMITS)
        lob_ql_cap = QUICK_LINK_LIMITS.get(ctx.line_of_business, 8)
        limits["quick_links"] = min(limits["quick_links"], lob_ql_cap)
        if request.slot_limits:
            limits.update(request.slot_limits)

        decisions: list[SlotDecision] = []
        passed_counts: dict[str, int] = {}

        for slot in SLOTS:
            candidates = self.catalog.for_slot(slot, ctx.line_of_business)
            eligible_items = []
            for item in candidates:
                ok, _ = evaluate_eligibility(item, ctx)
                if ok:
                    eligible_items.append(item)
            passed_counts[slot] = len(eligible_items)

            use_model = has_sufficient_ranking_data(ctx, propensity)
            if use_model:
                scored = rank_with_model(eligible_items, ctx, propensity)
            else:
                scored = rank_fallback_catalog_order(eligible_items)
                for i, s in enumerate(scored):
                    scored[i] = type(s)(
                        item=s.item,
                        score=s.score,
                        reason_code=ReasonCode.FALLBACK_LOB_DEFAULT,
                        reason_detail="LOB default ordering; no engagement or propensity data",
                    )

            cap = limits.get(slot, len(scored))
            ranked: list[RankedItem] = []
            for idx, s in enumerate(scored[:cap], start=1):
                ranked.append(
                    RankedItem(
                        content_id=s.item.content_id,
                        slot=slot,
                        rank=idx,
                        score=round(s.score, 4) if use_model else None,
                        reason_code=s.reason_code,
                        reason_detail=s.reason_detail,
                    )
                )
            decisions.append(SlotDecision(slot=slot, items=ranked))

        return HomeScreenDecisionResponse(
            customer_id=ctx.customer_id,
            line_of_business=ctx.line_of_business.value,
            decisions=decisions,
            eligibility_passed_count=passed_counts,
        )
