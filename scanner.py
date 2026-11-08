"""AI Job Scanner — pulls SimplifyJobs internship listings and filters them.

Pipeline:
    fetch_listings -> filter_listings -> print_listing

Each stage is its own function so we can swap pieces later (AI filtering,
email delivery) without rewriting the whole thing.
"""

from __future__ import annotations

import sys
from typing import Iterable, Optional

import requests

# Raw JSON file in the SimplifyJobs repo. The repo's data branch is `dev`.
LISTINGS_URL = (
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/"
    "dev/.github/scripts/listings.json"
)

# Title keywords for Software Engineering roles.
SWE_KEYWORDS = (
    "software engineer",
    "software developer",
    "swe",
    "backend",
    "back end",
    "back-end",
    "frontend",
    "front end",
    "front-end",
    "full stack",
    "fullstack",
    "full-stack",
    "mobile",
    "ios",
    "android",
    "systems engineer",
    "platform engineer",
    "devops",
    "site reliability",
    "sre",
    "web developer",
)

# Title keywords for AI / ML roles. We pad the title with spaces when matching,
# so short tokens like " ml " and " ai " won't match "html" or "email".
AI_ML_KEYWORDS = (
    "machine learning",
    " ml ",
    "ml engineer",
    "ml intern",
    "artificial intelligence",
    " ai ",
    "ai engineer",
    "ai intern",
    "ai/ml",
    "data scien",      # catches "data science" and "data scientist"
    "data engineer",
    "deep learning",
    "nlp",
    "natural language",
    "computer vision",
    "llm",
    "research scientist",
    "applied scientist",
    "mlops",
    "generative ai",
)


def fetch_listings(url: str = LISTINGS_URL) -> list[dict]:
    """Download the listings JSON file and return it as a list of dicts."""
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.json()


def is_active(listing: dict) -> bool:
    """A listing is 'live' when active is True and it's still visible."""
    return bool(listing.get("active")) and listing.get("is_visible", True)


def classify_role(listing: dict) -> Optional[str]:
    """Return 'SWE', 'AI/ML', or None based on keywords in the job title."""
    title = (listing.get("title") or "").lower()
    padded = f" {title} "
    if any(keyword in padded for keyword in AI_ML_KEYWORDS):
        return "AI/ML"
    if any(keyword in padded for keyword in SWE_KEYWORDS):
        return "SWE"
    return None


def format_location(listing: dict) -> str:
    """Join the locations list into a readable string."""
    locations = listing.get("locations") or []
    if not locations:
        return "Location not specified"
    if len(locations) <= 3:
        return ", ".join(locations)
    return f"{', '.join(locations[:3])} (+{len(locations) - 3} more)"


def filter_listings(listings: Iterable[dict]) -> list[tuple[dict, str]]:
    """Keep only active SWE / AI-ML roles. Returns (listing, category) pairs."""
    results: list[tuple[dict, str]] = []
    for listing in listings:
        if not is_active(listing):
            continue
        category = classify_role(listing)
        if category is None:
            continue
        results.append((listing, category))
    return results


def print_listing(listing: dict, category: str) -> None:
    """Print one match in a compact, readable block."""
    company = listing.get("company_name", "Unknown company")
    title = listing.get("title", "Unknown role")
    location = format_location(listing)
    link = listing.get("url") or listing.get("company_url") or "No link"

    print(f"[{category}] {company} — {title}")
    print(f"        Location: {location}")
    print(f"        Link:     {link}")
    print()


def main() -> int:
    print(f"Fetching listings from:\n  {LISTINGS_URL}\n")
    try:
        listings = fetch_listings()
    except requests.RequestException as error:
        print(f"Failed to fetch listings: {error}", file=sys.stderr)
        return 1

    print(f"Downloaded {len(listings)} total listings.")

    matches = filter_listings(listings)
    print(f"Found {len(matches)} active SWE or AI/ML roles.\n")

    # Group by category so the output is easier to scan.
    matches.sort(key=lambda pair: (pair[1], pair[0].get("company_name", "")))
    for listing, category in matches:
        print_listing(listing, category)

    return 0


if __name__ == "__main__":
    sys.exit(main())
