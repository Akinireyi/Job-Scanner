"""Google Sheets destination: append matches to a worksheet tab.

Config via .env:
    GOOGLE_SHEET_ID               — the sheet's ID, from the URL (the long
                                    string between /d/ and /edit)
    GOOGLE_SHEET_TAB              — tab name (default: "New Matches")
    GOOGLE_SERVICE_ACCOUNT_FILE   — path to the service account JSON key
                                    (relative to project root, or absolute)

Setup summary (see walkthrough):
    1. Create a Google Cloud project; enable the Google Sheets API.
    2. Create a service account; download its JSON key.
    3. Share your Google Sheet with the service account's email
       (ends in .iam.gserviceaccount.com) as Editor.
    4. Fill the three env vars above.
"""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path

import gspread
from dotenv import find_dotenv, load_dotenv
from google.oauth2.service_account import Credentials

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(find_dotenv())  # walks up to find .env regardless of folder depth

HEADERS = ["Found", "Score", "Category", "Company", "Role", "Locations", "URL", "Why"]
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def _config() -> dict:
    required = ("GOOGLE_SHEET_ID", "GOOGLE_SERVICE_ACCOUNT_FILE")
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise RuntimeError(
            f"Missing env vars: {', '.join(missing)}. See .env.example."
        )
    key_file = os.environ["GOOGLE_SERVICE_ACCOUNT_FILE"]
    key_path = Path(key_file)
    if not key_path.is_absolute():
        key_path = PROJECT_ROOT / key_path
    if not key_path.exists():
        raise RuntimeError(
            f"Service account file not found: {key_path}. "
            "Check GOOGLE_SERVICE_ACCOUNT_FILE in .env."
        )
    return {
        "sheet_id": os.environ["GOOGLE_SHEET_ID"],
        "tab": os.environ.get("GOOGLE_SHEET_TAB", "New Matches"),
        "key_path": str(key_path),
    }


def _open_tab(config: dict):
    """Open the target tab, creating it with headers if it doesn't exist."""
    creds = Credentials.from_service_account_file(config["key_path"], scopes=SCOPES)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(config["sheet_id"])
    try:
        worksheet = sheet.worksheet(config["tab"])
    except gspread.WorksheetNotFound:
        worksheet = sheet.add_worksheet(
            title=config["tab"], rows=1000, cols=len(HEADERS)
        )
        worksheet.append_row(HEADERS)
        return worksheet
    # If the tab exists but was never populated, add headers.
    if not worksheet.row_values(1):
        worksheet.insert_row(HEADERS, 1)
    return worksheet


def _format_location(locations: list) -> str:
    if not locations:
        return "Not specified"
    if len(locations) <= 3:
        return ", ".join(locations)
    return f"{', '.join(locations[:3])} (+{len(locations) - 3} more)"


def deliver(matches: list[dict]) -> None:
    """Append each match as a new row in the configured tab. No-op if empty."""
    if not matches:
        return
    config = _config()
    worksheet = _open_tab(config)
    today = datetime.now().strftime("%Y-%m-%d")  # ISO; column numberFormat renders it as "Nov 9, 2026"
    rows = [
        [
            today,
            m["score"],
            m["category"],
            m["company"],
            m["title"],
            _format_location(m["locations"]),
            m["url"],
            m["reason"],
        ]
        for m in matches
    ]
    worksheet.append_rows(rows, value_input_option="USER_ENTERED")
    print(f"Appended {len(rows)} row(s) to '{config['tab']}' tab.")
