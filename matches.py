"""Destination-agnostic match collection.

This module answers "what should the user see next?" without caring where the
answer goes. Call collect_new_matches() from any destination — email, a
Google Sheet writer, a web dashboard pushing updates, a Slack bot, whatever.
Call mark_delivered() after a destination successfully handles a batch so
the same match isn't surfaced again.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, Optional

from scanner import (
    fetch_listings,
    listing_id,
    load_score_cache,
    pre_filter_listings,
)

HERE = Path(__file__).parent
DELIVERED_PATH = HERE / "delivered.json"
LEGACY_EMAILED_PATH = HERE / "emailed.json"


def load_delivered_ids() -> set[str]:
    """IDs already delivered. Falls back to legacy emailed.json for one-time migration."""
    if DELIVERED_PATH.exists():
        with open(DELIVERED_PATH, encoding="utf-8") as f:
            return set(json.load(f))
    if LEGACY_EMAILED_PATH.exists():
        with open(LEGACY_EMAILED_PATH, encoding="utf-8") as f:
            return set(json.load(f))
    return set()


def save_delivered_ids(ids: Iterable[str]) -> None:
    with open(DELIVERED_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted(ids), f, indent=2)


def collect_new_matches(
    min_score: int = 8,
    max_count: Optional[int] = None,
) -> list[dict]:
    """Find listings with score >= min_score that have not been delivered yet.

    Returns a list of plain dicts (not scanner-internal objects) so destinations
    can serialize them freely to JSON, HTML, Sheet rows, dashboard state, etc.
    """
    listings = fetch_listings()
    pre_filtered = pre_filter_listings(listings)
    scored = load_score_cache()
    delivered = load_delivered_ids()

    matches: list[dict] = []
    for listing, category in pre_filtered:
        lid = listing_id(listing)
        if not lid or lid in delivered:
            continue
        info = scored.get(lid)
        if not info or info.get("score", 0) < min_score:
            continue
        matches.append({
            "id": lid,
            "company": listing.get("company_name") or "Unknown",
            "title": listing.get("title") or "Unknown",
            "locations": listing.get("locations") or [],
            "url": listing.get("url") or listing.get("company_url") or "",
            "category": category,
            "score": info["score"],
            "reason": info.get("reason", ""),
        })

    matches.sort(key=lambda m: m["score"], reverse=True)
    if max_count is not None:
        matches = matches[:max_count]
    return matches


def mark_delivered(ids: Iterable[str]) -> None:
    """Record that these IDs have been delivered. Call after a successful destination run."""
    delivered = load_delivered_ids()
    delivered.update(ids)
    save_delivered_ids(delivered)
