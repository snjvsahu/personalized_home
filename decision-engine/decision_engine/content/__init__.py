"""Content package — CMS definitions only, no ranking or eligibility."""

from decision_engine.content.catalog import (
    ContentCatalog,
    ContentItem,
    DEFAULT_SLOT_LIMITS,
    QUICK_LINK_LIMITS,
    default_catalog,
)

__all__ = [
    "ContentCatalog",
    "ContentItem",
    "DEFAULT_SLOT_LIMITS",
    "QUICK_LINK_LIMITS",
    "default_catalog",
]
