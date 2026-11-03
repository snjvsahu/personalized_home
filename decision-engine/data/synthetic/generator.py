"""Generate SYNTHETIC feature datasets — not real customer data."""

from __future__ import annotations

import json
import random
from datetime import UTC, datetime
from pathlib import Path

from decision_engine.schemas.features import (
    ContentFeatureRow,
    CustomerFeatureRow,
    FeatureDataset,
    FeatureRecordLabel,
    InteractionFeatureRow,
)
from decision_engine.content.catalog import default_catalog

REGIONS = ["US-TX", "US-CA", "US-NY", "US-FL"]
SEGMENTS = ["consumer", "premium", "senior", "student", "smb"]
STATUSES = ["active", "past_due", "suspended", "pending"]
LOBS = ["wireless", "fiber", "prepaid", "business"]


def generate_synthetic_dataset(
    num_customers: int = 100,
    seed: int = 42,
) -> FeatureDataset:
    rng = random.Random(seed)
    now = datetime.now(tz=UTC)
    customers: list[CustomerFeatureRow] = []

    for i in range(num_customers):
        customers.append(
            CustomerFeatureRow(
                data_label=FeatureRecordLabel.SYNTHETIC,
                snapshot_at=now,
                customer_id=f"SYN-CUST-{i:05d}",
                line_of_business=rng.choice(LOBS),
                segment=rng.choice(SEGMENTS),
                account_status=rng.choice(STATUSES),
                region_code=rng.choice(REGIONS),
                tenure_days=rng.randint(0, 2000),
                has_autopay=rng.random() > 0.4,
                active_product_count=rng.randint(0, 5),
                data_usage_pct=round(rng.random(), 2) if rng.random() > 0.2 else None,
                days_since_last_app_open=rng.randint(0, 60) if rng.random() > 0.15 else None,
                hero_click_rate_30d=round(rng.random() * 0.3, 3),
                notification_open_rate_30d=round(rng.random() * 0.5, 3),
                quick_link_tap_rate_30d=round(rng.random() * 0.4, 3),
            )
        )

    content_rows: list[ContentFeatureRow] = []
    for item in default_catalog().items:
        content_rows.append(
            ContentFeatureRow(
                data_label=FeatureRecordLabel.SYNTHETIC,
                content_id=item.content_id,
                slot=item.slot,
                line_of_business=item.line_of_business.value,
                business_priority=item.business_priority,
                catalog_sort_order=item.catalog_sort_order,
                propensity_key=item.propensity_key,
                target_segments=sorted(item.target_segments),
            )
        )

    interactions: list[InteractionFeatureRow] = []
    content_ids = [c.content_id for c in content_rows[:20]]
    for cust in customers[: min(50, len(customers))]:
        for _ in range(rng.randint(1, 5)):
            cid = rng.choice(content_ids)
            slot = next(c.slot for c in content_rows if c.content_id == cid)
            imp = rng.randint(0, 50)
            clicks = rng.randint(0, min(imp, 10))
            interactions.append(
                InteractionFeatureRow(
                    data_label=FeatureRecordLabel.SYNTHETIC,
                    customer_id=cust.customer_id,
                    content_id=cid,
                    slot=slot,
                    impressions_30d=imp,
                    clicks_30d=clicks,
                )
            )

    return FeatureDataset(
        data_label=FeatureRecordLabel.SYNTHETIC,
        customers=customers,
        content=content_rows,
        interactions=interactions,
    )


def write_synthetic_json(path: Path, num_customers: int = 100, seed: int = 42) -> None:
    dataset = generate_synthetic_dataset(num_customers=num_customers, seed=seed)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(dataset.model_dump(mode="json"), indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "sample_features.json"
    write_synthetic_json(out)
    print(f"Wrote SYNTHETIC dataset to {out}")
