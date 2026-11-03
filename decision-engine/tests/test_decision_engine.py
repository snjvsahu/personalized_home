import pytest
from fastapi.testclient import TestClient

from decision_engine.api.main import app
from decision_engine.content.catalog import ContentCatalog, ContentItem, default_catalog
from decision_engine.decision.service import HomeScreenDecisionService
from decision_engine.eligibility.rules import evaluate_eligibility
from decision_engine.ranking.model import rank_fallback_catalog_order, rank_with_model
from decision_engine.schemas.context import (
    AccountStatus,
    CustomerContext,
    CustomerSegment,
    HomeScreenDecisionRequest,
    LineOfBusiness,
)
from decision_engine.schemas.reason_codes import ReasonCode
from data.synthetic.generator import generate_synthetic_dataset


client = TestClient(app)


def _ctx(**overrides: object) -> CustomerContext:
    base = dict(
        customer_id="test-001",
        line_of_business=LineOfBusiness.WIRELESS,
        segment=CustomerSegment.CONSUMER,
        account_status=AccountStatus.ACTIVE,
        region_code="US-TX",
        active_product_skus=[],
        tenure_days=100,
        has_autopay=False,
        data_usage_pct=0.8,
        days_since_last_app_open=2,
    )
    base.update(overrides)
    return CustomerContext(**base)  # type: ignore[arg-type]


class TestEligibility:
    def test_excludes_5g_when_already_subscribed(self) -> None:
        catalog = default_catalog()
        item = next(i for i in catalog.items if i.content_id == "hero_wless_5g_upgrade")
        ctx = _ctx(active_product_skus=["SKU_5G_UNLIMITED"])
        ok, results = evaluate_eligibility(item, ctx)
        assert ok is False
        assert any(r.rule_id == "already_owned" for r in results)

    def test_data_notification_requires_usage_band(self) -> None:
        item = next(
            i for i in default_catalog().items if i.content_id == "notif_wless_data_80"
        )
        ok_low, _ = evaluate_eligibility(item, _ctx(data_usage_pct=0.5))
        assert ok_low is False
        ok_ok, _ = evaluate_eligibility(item, _ctx(data_usage_pct=0.8))
        assert ok_ok is True

    def test_fiber_hero_region_gate(self) -> None:
        item = next(i for i in default_catalog().items if i.content_id == "hero_fiber_gig")
        ok, _ = evaluate_eligibility(item, _ctx(line_of_business=LineOfBusiness.FIBER, region_code="US-NY"))
        assert ok is False
        ok_tx, _ = evaluate_eligibility(
            item, _ctx(line_of_business=LineOfBusiness.FIBER, region_code="US-TX")
        )
        assert ok_tx is True

    def test_autopay_hero_hidden_when_enrolled(self) -> None:
        item = next(i for i in default_catalog().items if i.content_id == "hero_wless_autopay")
        ok, _ = evaluate_eligibility(item, _ctx(has_autopay=True))
        assert ok is False


class TestRanking:
    def test_model_orders_by_score(self) -> None:
        items = default_catalog().for_slot("hero", LineOfBusiness.WIRELESS)
        eligible = [i for i in items if i.content_id != "hero_wless_autopay"]
        scored = rank_with_model(eligible, _ctx(), {"5g_upgrade": 0.99, "trade_in": 0.1})
        assert scored[0].item.content_id == "hero_wless_5g_upgrade"
        assert scored[0].reason_code == ReasonCode.ELIGIBLE_HIGH_PROPENSITY

    def test_fallback_uses_catalog_order(self) -> None:
        items = default_catalog().for_slot("quick_links", LineOfBusiness.WIRELESS)[:3]
        scored = rank_fallback_catalog_order(items)
        orders = [s.item.catalog_sort_order for s in scored]
        assert orders == sorted(orders)


class TestDecisionService:
    def test_wireless_home_screen_slots(self) -> None:
        svc = HomeScreenDecisionService()
        resp = svc.decide(HomeScreenDecisionRequest(customer=_ctx()))
        slots = {d.slot: d for d in resp.decisions}
        assert set(slots) == {"hero", "notifications", "quick_links"}
        assert len(slots["hero"].items) == 1
        assert len(slots["notifications"].items) <= 3
        assert len(slots["quick_links"].items) <= 8
        for item in slots["hero"].items + slots["notifications"].items:
            assert item.reason_code != ReasonCode.INELIGIBLE_FILTERED

    def test_prepaid_quick_link_cap(self) -> None:
        svc = HomeScreenDecisionService()
        ctx = _ctx(line_of_business=LineOfBusiness.PREPAID, region_code="US-FL")
        resp = svc.decide(HomeScreenDecisionRequest(customer=ctx))
        ql = next(d for d in resp.decisions if d.slot == "quick_links")
        assert len(ql.items) <= 4

    def test_fallback_when_no_behavioral_data(self) -> None:
        svc = HomeScreenDecisionService()
        ctx = _ctx(days_since_last_app_open=None, data_usage_pct=None, has_autopay=True)
        resp = svc.decide(HomeScreenDecisionRequest(customer=ctx), propensity_map={})
        hero = next(d for d in resp.decisions if d.slot == "hero").items[0]
        assert hero.reason_code == ReasonCode.FALLBACK_LOB_DEFAULT
        assert hero.score is None


class TestAPI:
    def test_health(self) -> None:
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_home_screen_decision(self) -> None:
        payload = {
            "customer": {
                "customer_id": "api-cust-1",
                "line_of_business": "wireless",
                "segment": "consumer",
                "account_status": "active",
                "region_code": "US-TX",
                "active_product_skus": [],
                "tenure_days": 200,
                "has_autopay": False,
                "data_usage_pct": 0.82,
                "days_since_last_app_open": 1,
            }
        }
        r = client.post("/v1/decisions/home-screen", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["customer_id"] == "api-cust-1"
        assert body["model_version"] == "ranking-v1"
        assert len(body["decisions"]) == 3


class TestSyntheticData:
    def test_dataset_labelled_synthetic(self) -> None:
        ds = generate_synthetic_dataset(num_customers=5, seed=1)
        assert ds.data_label.value == "SYNTHETIC"
        assert all(c.data_label.value == "SYNTHETIC" for c in ds.customers)
        assert len(ds.content) > 0
