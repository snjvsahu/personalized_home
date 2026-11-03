"""Eligibility rules run before any ranking model."""

from dataclasses import dataclass

from decision_engine.content.catalog import ContentItem
from decision_engine.schemas.context import CustomerContext


@dataclass(frozen=True)
class EligibilityResult:
    eligible: bool
    rule_id: str
    message: str


def rule_region(item: ContentItem, ctx: CustomerContext) -> EligibilityResult:
    if not item.required_region_prefixes:
        return EligibilityResult(True, "region", "No region restriction")
    ok = any(ctx.region_code.startswith(p) for p in item.required_region_prefixes)
    return EligibilityResult(
        ok,
        "region",
        "Region allowed" if ok else f"Region {ctx.region_code} not in allowed prefixes",
    )


def rule_already_owned(item: ContentItem, ctx: CustomerContext) -> EligibilityResult:
    overlap = item.excluded_if_product_skus & set(ctx.active_product_skus)
    ok = len(overlap) == 0
    return EligibilityResult(
        ok,
        "already_owned",
        "Customer does not already have excluded product"
        if ok
        else f"Customer already has {sorted(overlap)}",
    )


def rule_account_status(item: ContentItem, ctx: CustomerContext) -> EligibilityResult:
    if not item.required_account_statuses:
        return EligibilityResult(True, "account_status", "Any account status")
    ok = ctx.account_status in item.required_account_statuses
    return EligibilityResult(
        ok,
        "account_status",
        "Account status matches" if ok else f"Status {ctx.account_status.value} not allowed",
    )


def rule_tenure(item: ContentItem, ctx: CustomerContext) -> EligibilityResult:
    ok = ctx.tenure_days >= item.min_tenure_days
    return EligibilityResult(
        ok,
        "tenure",
        "Tenure sufficient" if ok else f"Requires {item.min_tenure_days} days tenure",
    )


def rule_data_usage(item: ContentItem, ctx: CustomerContext) -> EligibilityResult:
    if item.min_data_usage_pct is None and item.max_data_usage_pct is None:
        return EligibilityResult(True, "data_usage", "No data usage gate")
    if ctx.data_usage_pct is None:
        return EligibilityResult(False, "data_usage", "Data usage unknown; cannot evaluate offer")
    pct = ctx.data_usage_pct
    if item.min_data_usage_pct is not None and pct < item.min_data_usage_pct:
        return EligibilityResult(
            False, "data_usage", f"Usage {pct:.0%} below min {item.min_data_usage_pct:.0%}"
        )
    if item.max_data_usage_pct is not None and pct > item.max_data_usage_pct:
        return EligibilityResult(
            False, "data_usage", f"Usage {pct:.0%} above max {item.max_data_usage_pct:.0%}"
        )
    return EligibilityResult(True, "data_usage", "Data usage within bounds")


def rule_autopay_hero_conflict(item: ContentItem, ctx: CustomerContext) -> EligibilityResult:
    """Do not promote AutoPay hero if customer already enrolled."""
    if item.content_id != "hero_wless_autopay":
        return EligibilityResult(True, "autopay_enrolled", "N/A")
    ok = not ctx.has_autopay
    return EligibilityResult(
        ok, "autopay_enrolled", "Eligible for AutoPay pitch" if ok else "Already on AutoPay"
    )


ALL_RULES = [
    rule_region,
    rule_already_owned,
    rule_account_status,
    rule_tenure,
    rule_data_usage,
    rule_autopay_hero_conflict,
]


def evaluate_eligibility(item: ContentItem, ctx: CustomerContext) -> tuple[bool, list[EligibilityResult]]:
    results = [fn(item, ctx) for fn in ALL_RULES]
    eligible = all(r.eligible for r in results)
    return eligible, results
