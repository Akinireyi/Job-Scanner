"""Email destination: SMTP send of a match digest.

Config via .env:
    EMAIL_FROM            — Gmail address that sends (needs an App Password)
    EMAIL_APP_PASSWORD    — 16-char App Password from Google
    EMAIL_TO              — recipient address
    EMAIL_SMTP_HOST       — optional, defaults to smtp.gmail.com
    EMAIL_SMTP_PORT       — optional, defaults to 465

Call deliver(matches) — notify.py handles the "when" (threshold, empty-skip).
"""

from __future__ import annotations

import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path

from dotenv import find_dotenv, load_dotenv

# Walk up from here to find .env — works at any depth in the repo.
load_dotenv(find_dotenv())


def _config() -> dict:
    required = ("EMAIL_FROM", "EMAIL_APP_PASSWORD", "EMAIL_TO")
    missing = [key for key in required if not os.environ.get(key)]
    if missing:
        raise RuntimeError(
            f"Missing env vars: {', '.join(missing)}. See .env.example."
        )
    return {
        "from": os.environ["EMAIL_FROM"],
        "to": os.environ["EMAIL_TO"],
        "password": os.environ["EMAIL_APP_PASSWORD"],
        "smtp_host": os.environ.get("EMAIL_SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": int(os.environ.get("EMAIL_SMTP_PORT", "465")),
    }


def _format_location(locations: list[str]) -> str:
    if not locations:
        return "Location not specified"
    if len(locations) <= 3:
        return ", ".join(locations)
    return f"{', '.join(locations[:3])} (+{len(locations) - 3} more)"


def _build_html(matches: list[dict]) -> str:
    today = datetime.now().strftime("%A, %B %d")  # email keeps long date
    rows = []
    for m in matches:
        rows.append(f"""
<div style="border-left:4px solid #4a7c59;margin-bottom:16px;padding:10px 14px;background:#fafafa;border-radius:4px;">
  <div style="font-size:11px;color:#888;letter-spacing:0.5px;">{m['category'].upper()} &middot; SCORE {m['score']}/10</div>
  <div style="font-size:16px;font-weight:600;margin:6px 0 4px 0;">
    <a href="{m['url']}" style="color:#1a1a1a;text-decoration:none;">{m['company']} &mdash; {m['title']}</a>
  </div>
  <div style="font-size:13px;color:#555;">{_format_location(m['locations'])}</div>
  <div style="font-size:13px;color:#333;margin-top:6px;font-style:italic;">{m['reason']}</div>
</div>""")
    plural = "es" if len(matches) != 1 else ""
    return f"""<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:16px;color:#1a1a1a;">
<h2 style="margin:0 0 4px 0;">Your top internship matches &mdash; {today}</h2>
<p style="color:#666;margin:0 0 20px 0;">{len(matches)} new match{plural}, each scored 8+/10.</p>
{''.join(rows)}
<p style="color:#999;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">AI Job Scanner &middot; edit profile.json to tune scoring</p>
</body></html>"""


def _build_text(matches: list[dict]) -> str:
    lines = [f"Your top internship matches - {datetime.now().strftime('%A, %B %d')}", ""]
    for m in matches:
        lines.append(f"[{m['score']}/10 {m['category']}] {m['company']} - {m['title']}")
        lines.append(f"    Location: {_format_location(m['locations'])}")
        lines.append(f"    Link:     {m['url']}")
        lines.append(f"    Why:      {m['reason']}")
        lines.append("")
    return "\n".join(lines)


def deliver(matches: list[dict]) -> None:
    """Send the matches as a single digest email. No-op if matches is empty."""
    if not matches:
        return
    config = _config()

    msg = EmailMessage()
    msg["From"] = config["from"]
    msg["To"] = config["to"]
    today = datetime.now().strftime("%b %d")
    msg["Subject"] = f"AI Job Scanner - {len(matches)} top matches ({today})"
    msg.set_content(_build_text(matches))
    msg.add_alternative(_build_html(matches), subtype="html")

    print(f"Connecting to {config['smtp_host']}:{config['smtp_port']} as {config['from']} ...")
    with smtplib.SMTP_SSL(config["smtp_host"], config["smtp_port"]) as smtp:
        smtp.login(config["from"], config["password"])
        smtp.send_message(msg)
    print(f"Sent {len(matches)} matches to {config['to']}.")
