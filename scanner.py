"""AI Job Scanner — SimplifyJobs listings + pre-filter + Claude Haiku scoring.

Pipeline:
    fetch -> pre-filter (active, US, freshman-friendly, right role category)
          -> split (already-scored vs new)
          -> AI-score only the new ones (Haiku 5.5)
          -> cache scores locally in scored.json
          -> rank + print matches with score >= MIN_SCORE_TO_SHOW

Keeping the stages separate lets us swap pieces later (email delivery next).
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Iterable, Optional

import requests

HERE = Path(__file__).parent
SCORE_CACHE_PATH = HERE / "scored.json"

LISTINGS_URL = (
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/"
    "dev/.github/scripts/listings.json"
)

MIN_SCORE_TO_SHOW = 7  # after AI scoring, only print matches this strong or stronger

# ------------------------------------------------------------------ keywords --

# A title that mentions one of these very likely belongs to one of the four
# role buckets the student picked. We check first-year programs and PM before
# SWE / AI-ML so a "Google STEP SWE Intern" lands in the first-year bucket.

FIRST_YEAR_KEYWORDS = (
    "first year", "first-year", "freshman", "freshmen", "sophomore",
    "early career", "early-career",
    "google step",
    "step intern",
    "microsoft explore",
    "meta university",
    "facebook university",
    "university program",
    "discovery program",
)

PM_KEYWORDS = (
    "product manager",
    "product management",
    " apm ",
    "associate product manager",
    "technical program manager",
    " tpm ",
    "business analyst",
    "strategy & operations",
    "strategy and operations",
    "business intelligence",
    "business development",
)

AI_ML_KEYWORDS = (
    "machine learning",
    " ml ",
    "ml engineer", "ml intern",
    "artificial intelligence",
    " ai ",
    "ai engineer", "ai intern", "ai/ml",
    "data scien",    # catches "data science" and "data scientist"
    "data engineer",
    "deep learning",
    "nlp", "natural language",
    "computer vision",
    "llm",
    "research scientist",
    "applied scientist",
    "mlops",
    "generative ai",
)

SWE_KEYWORDS = (
    "software engineer", "software developer", "swe",
    "backend", "back end", "back-end",
    "frontend", "front end", "front-end",
    "full stack", "fullstack", "full-stack",
    "mobile", "ios", "android",
    "systems engineer", "platform engineer",
    "devops", "site reliability", "sre",
    "web developer",
)

# A title that mentions any of these is almost certainly NOT entry-level.
SENIOR_MARKERS = (
    "senior", "sr.",
    "staff", "principal", "architect",
    "manager", "director", "head of",
    " lead ", "team lead", "tech lead",
    "phd", "ph.d", "doctoral", "doctorate",
    "mba",
    "graduate student", "graduate program",
    "master's", "masters-only", "masters only",
    "experienced",
    "postdoc", "post-doc", "post doc",
)

# 50 states + DC. Used to detect US locations by suffix match.
US_STATES = frozenset([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
])

NON_US_MARKERS = (
    "Canada", "UK", "United Kingdom", "England", "Scotland", "Wales",
    "Ireland", "France", "Germany", "Spain", "Italy", "Netherlands",
    "Switzerland", "Sweden", "Norway", "Denmark", "Finland", "Poland",
    "India", "China", "Japan", "Korea", "Singapore", "Taiwan",
    "Australia", "New Zealand", "Brazil", "Mexico", "Argentina", "Chile",
    "Israel", "UAE", "Saudi Arabia",
    "Toronto", "Vancouver", "Montreal", "Ottawa", "Calgary",
    "London", "Dublin", "Berlin", "Munich", "Paris", "Amsterdam",
    "Zurich", "Stockholm", "Oslo",
    "Tokyo", "Seoul", "Hong Kong", "Beijing", "Shanghai",
    "Bangalore", "Hyderabad", "Delhi", "Mumbai", "Chennai", "Pune",
    "Sydney", "Melbourne",
)


# ------------------------------------------------------------------- fetch ----

def fetch_listings(url: str = LISTINGS_URL) -> list[dict]:
    """Download listings.json from GitHub and parse it."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()


# ------------------------------------------------------------- classification -

def is_active(listing: dict) -> bool:
    return bool(listing.get("active")) and listing.get("is_visible", True)


def classify_role(listing: dict) -> Optional[str]:
    """Tag a listing with a role category or None. Order matters — first match wins."""
    title = (listing.get("title") or "").lower()
    padded = f" {title} "
    if any(k in padded for k in FIRST_YEAR_KEYWORDS):
        return "First-Year"
    if any(k in padded for k in PM_KEYWORDS):
        return "PM"
    if any(k in padded for k in AI_ML_KEYWORDS):
        return "AI/ML"
    if any(k in padded for k in SWE_KEYWORDS):
        return "SWE"
    return None


def is_freshman_friendly(listing: dict) -> bool:
    """Reject listings whose titles scream senior / grad-only."""
    title = (listing.get("title") or "").lower()
    padded = f" {title} "
    return not any(marker in padded for marker in SENIOR_MARKERS)


def is_us_location(location: str) -> bool:
    """Return True if a location string plausibly represents a US location."""
    if any(marker in location for marker in NON_US_MARKERS):
        return False
    lower = location.lower()
    if "remote" in lower:
        if "us" in lower or "united states" in lower or "u.s." in lower:
            return True
        if lower.strip() == "remote":
            return True  # bare "Remote" — ambiguous, keep it
    if "United States" in location or "USA" in location or location.endswith(", US"):
        return True
    parts = [p.strip() for p in location.split(",")]
    for p in parts[-2:]:
        if p.upper() in US_STATES:
            return True
    return False


def has_us_location(listing: dict) -> bool:
    locations = listing.get("locations") or []
    return any(is_us_location(loc) for loc in locations)


def pre_filter_listings(listings: Iterable[dict]) -> list[tuple[dict, str]]:
    """All the cheap, local filtering before we spend API dollars."""
    results: list[tuple[dict, str]] = []
    for listing in listings:
        if not is_active(listing):
            continue
        category = classify_role(listing)
        if category is None:
            continue
        if not has_us_location(listing):
            continue
        if not is_freshman_friendly(listing):
            continue
        results.append((listing, category))
    return results


# --------------------------------------------------------------- score cache --

def load_score_cache() -> dict[str, dict]:
    if not SCORE_CACHE_PATH.exists():
        return {}
    with open(SCORE_CACHE_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_score_cache(cache: dict[str, dict]) -> None:
    with open(SCORE_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2)


def listing_id(listing: dict) -> str:
    """Stable ID used as the cache key. Prefer SimplifyJobs' id; fall back to url."""
    return str(listing.get("id") or listing.get("url") or "")


# ---------------------------------------------------------------- formatting --

def format_location(listing: dict) -> str:
    locations = listing.get("locations") or []
    if not locations:
        return "Location not specified"
    if len(locations) <= 3:
        return ", ".join(locations)
    return f"{', '.join(locations[:3])} (+{len(locations) - 3} more)"


def print_listing(listing: dict, category: str, score_info: Optional[dict] = None) -> None:
    company = listing.get("company_name", "Unknown company")
    title = listing.get("title", "Unknown role")
    location = format_location(listing)
    link = listing.get("url") or listing.get("company_url") or "No link"

    if score_info is not None:
        header = f"[{score_info['score']:>2}/10 {category}]"
    else:
        header = f"[{category}]"
    print(f"{header} {company} — {title}")
    print(f"        Location: {location}")
    print(f"        Link:     {link}")
    if score_info is not None and score_info.get("reason"):
        print(f"        Why:      {score_info['reason']}")
    print()


# ---------------------------------------------------------------------- main --

def main() -> int:
    print(f"Fetching listings from:\n  {LISTINGS_URL}\n")
    try:
        listings = fetch_listings()
    except requests.RequestException as error:
        print(f"Failed to fetch listings: {error}", file=sys.stderr)
        return 1
    print(f"  Downloaded {len(listings):,} total listings.")

    pre_filtered = pre_filter_listings(listings)
    print(f"  After pre-filters (active, US, right role, not senior): {len(pre_filtered):,}\n")

    # Try to score. If anything AI-related fails, print unscored and bail gracefully.
    try:
        from ai_score import get_client, load_profile, score_listing
        profile = load_profile()
        client = get_client()
    except (ImportError, FileNotFoundError, RuntimeError) as error:
        print(f"AI scoring skipped: {error}")
        print("Showing the first 30 pre-filtered listings unscored.\n")
        for listing, category in pre_filtered[:30]:
            print_listing(listing, category)
        return 0

    cache = load_score_cache()
    to_score: list[tuple[dict, str, str]] = []
    scored: list[tuple[dict, str, dict]] = []
    for listing, category in pre_filtered:
        lid = listing_id(listing)
        if lid and lid in cache:
            scored.append((listing, category, cache[lid]))
        else:
            to_score.append((listing, category, lid))

    print(f"Already scored (cached): {len(scored):,}")
    print(f"New listings to score:   {len(to_score):,}")
    if to_score:
        print("Scoring now — Haiku is fast but this takes ~1s per listing.\n")

    for i, (listing, category, lid) in enumerate(to_score, 1):
        company = (listing.get("company_name") or "?")[:35]
        title = (listing.get("title") or "?")[:55]
        print(f"  [{i:>4}/{len(to_score)}] {company} — {title}")
        result = score_listing(client, profile, listing)
        if lid:
            cache[lid] = result
        scored.append((listing, category, result))
        if i % 25 == 0:  # checkpoint in case of interruption
            save_score_cache(cache)
    save_score_cache(cache)

    scored.sort(key=lambda t: t[2].get("score", 0), reverse=True)
    good = [t for t in scored if t[2].get("score", 0) >= MIN_SCORE_TO_SHOW]

    print(f"\n{'=' * 60}")
    print(f"Top matches (score >= {MIN_SCORE_TO_SHOW}): {len(good)}")
    print(f"{'=' * 60}\n")
    for listing, category, score_info in good:
        print_listing(listing, category, score_info)

    return 0


if __name__ == "__main__":
    sys.exit(main())
