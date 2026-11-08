"""Claude Haiku relevance scoring for internship listings.

Haiku 5.5 is Anthropic's cheapest + fastest model — perfect for a 1-10 score
with a short reason. One API call per listing (sequential), ~0.5s each.
Costs ~$0.0001 per listing, so a full first run is ~$0.10.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import anthropic
from dotenv import load_dotenv

HERE = Path(__file__).parent
load_dotenv(HERE / ".env")

MODEL = "claude-haiku-5-5"
PROFILE_PATH = HERE / "profile.json"


def load_profile() -> dict[str, Any]:
    """Read the student profile; raises FileNotFoundError if missing."""
    with open(PROFILE_PATH, encoding="utf-8") as f:
        return json.load(f)


def get_client() -> anthropic.Anthropic:
    """Build an Anthropic client. Raises if no API key is set."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. "
            "Copy .env.example to .env and add your key from console.anthropic.com."
        )
    return anthropic.Anthropic()


def _format_profile_block(profile: dict[str, Any]) -> str:
    """Render the profile as a short, human-readable block for the system prompt."""
    lines = [
        f"- Year: {profile.get('year', 'unknown')} (graduating {profile.get('graduation', 'unknown')})",
    ]
    for key, label in [
        ("role_focus", "Role focus"),
        ("location_preferences", "Locations"),
        ("company_preferences", "Companies / missions"),
    ]:
        items = profile.get(key, [])
        if items:
            lines.append(f"- {label}:")
            for item in items:
                lines.append(f"    - {item}")
    notes = (profile.get("background_notes") or "").strip()
    if notes and not notes.startswith("<<"):
        lines.append(f"- Background notes: {notes}")
    return "\n".join(lines)


def _build_system_prompt(profile: dict[str, Any]) -> str:
    return f"""You score internship listings for a specific student. Return STRICT JSON only, no code fences, no prose.

Student profile:
{_format_profile_block(profile)}

Scoring rules:
- 1-10 integer. 10 = ideal match (role, level, location, company all fit). 1 = clearly not a fit.
- BOOST listings that are first-year / sophomore programs (Google STEP, Meta University, Microsoft Explore, "freshmen eligible", "early career", "university program").
- DOCK listings requiring PhD / Master's / "3+ years experience" / senior / staff / principal / lead / manager.
- Favor companies and missions from the profile, but don't reject a good role just because the company isn't named.
- Be strict: reserve 8+ for genuinely strong matches.

Output ONLY a JSON object with this exact shape:
{{"score": <integer 1-10>, "reason": "<one sentence, max 20 words>"}}"""


def _parse_score_response(text: str) -> dict[str, Any]:
    """Parse model output into {score, reason}. Robust to code fences."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        data = json.loads(text)
        score = int(data.get("score", 0))
        score = max(1, min(10, score))
        return {"score": score, "reason": str(data.get("reason", "")).strip()}
    except (json.JSONDecodeError, ValueError, TypeError) as error:
        return {"score": 0, "reason": f"[parse error: {error}]"}


def score_listing(
    client: anthropic.Anthropic,
    profile: dict[str, Any],
    listing: dict[str, Any],
) -> dict[str, Any]:
    """Score a single listing. Returns {"score": int, "reason": str}."""
    locations = listing.get("locations") or []
    user_msg = (
        f"Company: {listing.get('company_name', 'Unknown')}\n"
        f"Role: {listing.get('title', 'Unknown')}\n"
        f"Locations: {', '.join(locations) if locations else 'Not specified'}"
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=256,
        system=_build_system_prompt(profile),
        output_config={"effort": "low"},
        messages=[{"role": "user", "content": user_msg}],
    )

    text = next((b.text for b in response.content if b.type == "text"), "")
    return _parse_score_response(text)
