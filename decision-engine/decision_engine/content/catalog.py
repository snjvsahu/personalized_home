"""CMS-style content definitions (what marketing/ops publishes)."""

from dataclasses import dataclass, field
from typing import Callable

from decision_engine.schemas.context import AccountStatus, CustomerContext, LineOfBusiness


@dataclass(frozen=True)
class ContentItem:
    content_id: str
    slot: str
    title: str
    line_of_business: LineOfBusiness
    business_priority: int
    catalog_sort_order: int
    target_segments: frozenset[str] = frozenset()
    propensity_key: str | None = None
    required_region_prefixes: frozenset[str] = frozenset()
    excluded_if_product_skus: frozenset[str] = frozenset()
    required_account_statuses: frozenset[AccountStatus] = frozenset()
    min_tenure_days: int = 0
    max_data_usage_pct: float | None = None
    min_data_usage_pct: float | None = None


@dataclass
class ContentCatalog:
    """In production this would be loaded from a CMS; here it is static sample content."""

    items: list[ContentItem] = field(default_factory=list)

    def for_lob(self, lob: LineOfBusiness) -> list[ContentItem]:
        return [i for i in self.items if i.line_of_business == lob]

    def for_slot(self, slot: str, lob: LineOfBusiness) -> list[ContentItem]:
        return [i for i in self.for_lob(lob) if i.slot == slot]


def default_catalog() -> ContentCatalog:
    """Representative telecom self-care catalog across LOBs and slots."""
    items: list[ContentItem] = []

    def add(**kwargs: object) -> None:
        items.append(ContentItem(**kwargs))  # type: ignore[arg-type]

    # --- Wireless hero ---
    add(
        content_id="hero_wless_5g_upgrade",
        slot="hero",
        title="Upgrade to 5G Unlimited",
        line_of_business=LineOfBusiness.WIRELESS,
        business_priority=90,
        catalog_sort_order=1,
        target_segments=frozenset({"consumer", "premium"}),
        propensity_key="5g_upgrade",
        excluded_if_product_skus=frozenset({"SKU_5G_UNLIMITED"}),
    )
    add(
        content_id="hero_wless_autopay",
        slot="hero",
        title="Save with AutoPay",
        line_of_business=LineOfBusiness.WIRELESS,
        business_priority=70,
        catalog_sort_order=2,
        propensity_key="autopay",
        excluded_if_product_skus=frozenset(),
    )
    add(
        content_id="hero_wless_trade_in",
        slot="hero",
        title="Trade in your device",
        line_of_business=LineOfBusiness.WIRELESS,
        business_priority=80,
        catalog_sort_order=3,
        propensity_key="trade_in",
        min_tenure_days=30,
    )

    # --- Fiber hero ---
    add(
        content_id="hero_fiber_gig",
        slot="hero",
        title="Gig fiber for your address",
        line_of_business=LineOfBusiness.FIBER,
        business_priority=95,
        catalog_sort_order=1,
        required_region_prefixes=frozenset({"US-TX", "US-CA"}),
        excluded_if_product_skus=frozenset({"SKU_FIBER_GIG"}),
        propensity_key="fiber_upgrade",
    )
    add(
        content_id="hero_fiber_wifi_extender",
        slot="hero",
        title="Whole-home WiFi",
        line_of_business=LineOfBusiness.FIBER,
        business_priority=60,
        catalog_sort_order=2,
        propensity_key="wifi_extender",
    )

    # --- Notifications (wireless) ---
    for nid, title, pri, order, seg, prop, statuses in [
        (
            "notif_wless_bill_due",
            "Bill due in 3 days",
            100,
            1,
            frozenset({"consumer", "premium", "senior"}),
            "bill_pay",
            frozenset({AccountStatus.ACTIVE, AccountStatus.PAST_DUE}),
        ),
        (
            "notif_wless_data_80",
            "You've used 80% of data",
            85,
            2,
            frozenset({"consumer", "student"}),
            "data_boost",
            frozenset({AccountStatus.ACTIVE}),
        ),
        (
            "notif_wless_suspended",
            "Restore service",
            100,
            3,
            frozenset({"consumer", "premium", "senior", "student", "smb"}),
            "restore_service",
            frozenset({AccountStatus.SUSPENDED}),
        ),
        (
            "notif_wless_loyalty",
            "Loyalty reward unlocked",
            50,
            4,
            frozenset({"premium"}),
            "loyalty",
            frozenset({AccountStatus.ACTIVE}),
        ),
    ]:
        add(
            content_id=nid,
            slot="notifications",
            title=title,
            line_of_business=LineOfBusiness.WIRELESS,
            business_priority=pri,
            catalog_sort_order=order,
            target_segments=seg,
            propensity_key=prop,
            required_account_statuses=statuses,
            max_data_usage_pct=0.85 if "data_80" in nid else None,
            min_data_usage_pct=0.75 if "data_80" in nid else None,
        )

    # --- Quick links wireless (up to 8) ---
    ql_wless = [
        ("ql_pay_bill", "Pay bill", 100, 1, "bill_pay"),
        ("ql_usage", "View usage", 90, 2, "usage"),
        ("ql_shop_devices", "Shop devices", 75, 3, "devices"),
        ("ql_change_plan", "Change plan", 70, 4, "plan_change"),
        ("ql_support", "Get support", 65, 5, "support"),
        ("ql_roaming", "International roaming", 40, 6, "roaming"),
        ("ql_insurance", "Device protection", 55, 7, "insurance"),
        ("ql_refer", "Refer a friend", 30, 8, "referral"),
    ]
    for cid, title, pri, order, prop in ql_wless:
        add(
            content_id=cid,
            slot="quick_links",
            title=title,
            line_of_business=LineOfBusiness.WIRELESS,
            business_priority=pri,
            catalog_sort_order=order,
            propensity_key=prop,
        )

    # --- Prepaid quick links (subset) ---
    for cid, title, pri, order in [
        ("ql_prepaid_topup", "Add funds", 100, 1),
        ("ql_prepaid_usage", "Check balance", 95, 2),
        ("ql_prepaid_plans", "Change plan", 80, 3),
        ("ql_prepaid_support", "Support", 70, 4),
    ]:
        add(
            content_id=cid,
            slot="quick_links",
            title=title,
            line_of_business=LineOfBusiness.PREPAID,
            business_priority=pri,
            catalog_sort_order=order,
            propensity_key=None,
        )

    return ContentCatalog(items=items)


# LOB-specific max quick links (product config, not decision logic)
QUICK_LINK_LIMITS: dict[LineOfBusiness, int] = {
    LineOfBusiness.WIRELESS: 8,
    LineOfBusiness.FIBER: 6,
    LineOfBusiness.PREPAID: 4,
    LineOfBusiness.BUSINESS: 8,
}

DEFAULT_SLOT_LIMITS: dict[str, int] = {
    "hero": 1,
    "notifications": 3,
    "quick_links": 8,
}
