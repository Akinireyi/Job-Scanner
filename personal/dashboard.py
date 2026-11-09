"""Local web dashboard for browsing scored matches.

Run:    python dashboard.py
Open:   http://127.0.0.1:5000

Reads scored.json and listings fresh from GitHub (cached in-memory
for 5 minutes). Mark-applied state persists in applied.json (gitignored).
Destination-agnostic — pulls from matches.py, same as email + sheets.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Iterable

from flask import Flask, jsonify, render_template_string

from scanner import fetch_listings, listing_id, load_score_cache, pre_filter_listings

HERE = Path(__file__).parent
APPLIED_PATH = HERE / "applied.json"
LISTINGS_CACHE_TTL = 300  # seconds

app = Flask(__name__)
_listings_cache: dict = {"data": None, "fetched_at": 0.0}


# ----------------------------------------------------------------- data ------

def _listings():
    """Cached listings fetch — refreshes at most once every 5 minutes."""
    if time.time() - _listings_cache["fetched_at"] > LISTINGS_CACHE_TTL:
        _listings_cache["data"] = fetch_listings()
        _listings_cache["fetched_at"] = time.time()
    return _listings_cache["data"]


def _load_applied() -> set[str]:
    if not APPLIED_PATH.exists():
        return set()
    with open(APPLIED_PATH, encoding="utf-8") as f:
        return set(json.load(f))


def _save_applied(ids: Iterable[str]) -> None:
    with open(APPLIED_PATH, "w", encoding="utf-8") as f:
        json.dump(sorted(ids), f, indent=2)


def _all_scored_matches() -> list[dict]:
    """Every pre-filtered listing that has a score, applied or not."""
    pre_filtered = pre_filter_listings(_listings())
    scored = load_score_cache()
    applied = _load_applied()
    matches: list[dict] = []
    for listing, category in pre_filtered:
        lid = listing_id(listing)
        info = scored.get(lid)
        if not info:
            continue
        matches.append({
            "id": lid,
            "company": listing.get("company_name") or "Unknown",
            "title": listing.get("title") or "Unknown",
            "locations": ", ".join(listing.get("locations") or []) or "Not specified",
            "url": listing.get("url") or "",
            "category": category,
            "score": int(info.get("score", 0)),
            "reason": info.get("reason", ""),
            "applied": lid in applied,
        })
    matches.sort(key=lambda m: (m["score"], m["company"]), reverse=True)
    return matches


# --------------------------------------------------------------- routes ------

@app.route("/")
def index():
    matches = _all_scored_matches()
    categories = sorted({m["category"] for m in matches})
    counts = {
        "total": len(matches),
        "strong": sum(1 for m in matches if m["score"] >= 8),
        "applied": sum(1 for m in matches if m["applied"]),
    }
    return render_template_string(
        TEMPLATE, matches=matches, categories=categories, counts=counts
    )


@app.route("/applied/<match_id>", methods=["POST"])
def toggle_applied(match_id):
    applied = _load_applied()
    if match_id in applied:
        applied.remove(match_id)
        is_applied = False
    else:
        applied.add(match_id)
        is_applied = True
    _save_applied(applied)
    return jsonify({"applied": is_applied, "applied_count": len(applied)})


# ------------------------------------------------------------- template ------

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AI Job Scanner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --pink-deep: #5B2147;
    --pink-mid: #f7c7d8;
    --pink-light: #fdf3f7;
    --pink-soft: #fde8ef;
    --ink: #2a2a2a;
    --muted: #7a7a7a;
    --green: #2a6b2d;
    --amber: #a07020;
    --red: #a0321f;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 1400px; margin: 0 auto; padding: 24px;
    color: var(--ink); background: #fff;
  }
  header { margin-bottom: 20px; }
  h1 { color: var(--pink-deep); margin: 0 0 4px 0; font-weight: 700; }
  .counts { color: var(--muted); font-size: 14px; }
  .counts strong { color: var(--pink-deep); }
  .filters {
    display: flex; gap: 16px; flex-wrap: wrap; align-items: end;
    background: var(--pink-light); padding: 14px 18px; border-radius: 10px;
    margin: 16px 0;
  }
  .filters label {
    display: flex; flex-direction: column; gap: 4px;
    font-size: 11px; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase;
  }
  .filters input[type="text"], .filters select {
    font-family: inherit; font-size: 14px; padding: 6px 10px;
    border: 1px solid #ddd; border-radius: 6px; background: #fff;
  }
  .filters input[type="range"] { width: 140px; }
  .score-slider-value { color: var(--pink-deep); font-weight: 600; font-size: 14px; }
  table {
    width: 100%; border-collapse: collapse; font-size: 13px;
  }
  thead th {
    background: var(--pink-mid); color: var(--pink-deep);
    padding: 12px 10px; text-align: left; font-weight: 600;
    position: sticky; top: 0; z-index: 1;
  }
  tbody td {
    padding: 10px; border-bottom: none; vertical-align: top;
  }
  tbody tr:nth-child(even) { background: var(--pink-light); }
  tbody tr.applied { opacity: 0.4; }
  tbody tr.applied td.company::after {
    content: " ✓"; color: var(--green); font-weight: 700;
  }
  td.score {
    font-weight: 700; text-align: center; font-size: 15px;
    width: 42px;
  }
  td.score-10, td.score-9, td.score-8 { color: var(--green); }
  td.score-7, td.score-6 { color: var(--amber); }
  td.score-5, td.score-4, td.score-3, td.score-2, td.score-1 { color: var(--red); }
  td.company { font-weight: 600; min-width: 110px; }
  td.title { min-width: 260px; }
  td.category {
    font-size: 11px; color: var(--pink-deep); letter-spacing: 0.4px;
    text-transform: uppercase; font-weight: 600; white-space: nowrap;
  }
  td.reason { color: #555; font-style: italic; }
  td.link a {
    color: var(--pink-deep); text-decoration: none; font-weight: 500;
    padding: 4px 10px; border: 1px solid var(--pink-mid); border-radius: 6px;
    display: inline-block;
  }
  td.link a:hover { background: var(--pink-soft); }
  button.applied-btn {
    font-family: inherit; font-size: 12px; cursor: pointer;
    padding: 6px 12px; border-radius: 6px;
    background: #fff; color: var(--muted); border: 1px solid #ddd;
    white-space: nowrap;
  }
  button.applied-btn.on {
    background: #e8f5e9; color: var(--green); border-color: #a5d6a7;
  }
  .empty {
    text-align: center; padding: 60px 20px; color: var(--muted);
  }
</style>
</head>
<body>
<header>
  <h1>AI Job Scanner</h1>
  <div class="counts">
    <strong>{{ counts.total }}</strong> scored &middot;
    <strong>{{ counts.strong }}</strong> strong (8+) &middot;
    <strong>{{ counts.applied }}</strong> applied
  </div>
</header>

<div class="filters">
  <label>Min score
    <input type="range" id="min-score" min="1" max="10" value="7" oninput="applyFilters()">
    <span class="score-slider-value" id="min-score-label">7</span>
  </label>
  <label>Category
    <select id="category" onchange="applyFilters()">
      <option value="">All</option>
      {% for c in categories %}<option>{{ c }}</option>{% endfor %}
    </select>
  </label>
  <label>Company contains
    <input type="text" id="company" oninput="applyFilters()" placeholder="google">
  </label>
  <label style="flex-direction: row; align-items: center; gap: 8px; text-transform: none; font-size: 13px; color: var(--ink);">
    <input type="checkbox" id="hide-applied" onchange="applyFilters()">
    Hide applied
  </label>
</div>

{% if matches %}
<table id="matches">
  <thead>
    <tr>
      <th>Score</th><th>Company</th><th>Role</th><th>Category</th>
      <th>Location</th><th>Why</th><th>Link</th><th>Status</th>
    </tr>
  </thead>
  <tbody>
    {% for m in matches %}
    <tr data-id="{{ m.id }}" data-score="{{ m.score }}"
        data-category="{{ m.category }}" data-company="{{ m.company|lower }}"
        class="{{ 'applied' if m.applied }}">
      <td class="score score-{{ m.score }}">{{ m.score }}</td>
      <td class="company">{{ m.company }}</td>
      <td class="title">{{ m.title }}</td>
      <td class="category">{{ m.category }}</td>
      <td>{{ m.locations }}</td>
      <td class="reason">{{ m.reason }}</td>
      <td class="link"><a href="{{ m.url }}" target="_blank" rel="noopener">Open</a></td>
      <td>
        <button class="applied-btn {{ 'on' if m.applied }}"
                onclick="toggleApplied(this, '{{ m.id }}')">
          {{ 'Applied' if m.applied else 'Mark applied' }}
        </button>
      </td>
    </tr>
    {% endfor %}
  </tbody>
</table>
{% else %}
<div class="empty">
  <p>No scored matches yet. Run <code>python scanner.py</code> first.</p>
</div>
{% endif %}

<script>
function applyFilters() {
  const minScore = +document.getElementById('min-score').value;
  document.getElementById('min-score-label').textContent = minScore;
  const cat = document.getElementById('category').value;
  const co = document.getElementById('company').value.trim().toLowerCase();
  const hideApplied = document.getElementById('hide-applied').checked;
  for (const row of document.querySelectorAll('#matches tbody tr')) {
    const score = +row.dataset.score;
    const rowCat = row.dataset.category;
    const rowCo = row.dataset.company;
    const isApplied = row.classList.contains('applied');
    const show = score >= minScore
      && (!cat || rowCat === cat)
      && (!co || rowCo.includes(co))
      && (!hideApplied || !isApplied);
    row.style.display = show ? '' : 'none';
  }
}

async function toggleApplied(btn, id) {
  const resp = await fetch('/applied/' + encodeURIComponent(id), {method: 'POST'});
  const data = await resp.json();
  btn.classList.toggle('on', data.applied);
  btn.textContent = data.applied ? 'Applied' : 'Mark applied';
  btn.closest('tr').classList.toggle('applied', data.applied);
  applyFilters();
}

applyFilters();
</script>
</body>
</html>"""


if __name__ == "__main__":
    app.run(debug=True, port=5000)
