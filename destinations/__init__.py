"""Pluggable notification destinations.

Each module in this package exposes a single function:

    deliver(matches: list[dict]) -> None

`matches` is the list produced by matches.collect_new_matches(). Each dict
has the keys: id, company, title, locations, url, category, score, reason.

Destinations currently available:
    email — SMTP send via Gmail (or any provider by overriding EMAIL_SMTP_HOST)

Future destinations that would slot in here:
    sheets    — append rows to a Google Sheet (e.g. "Internship Tracker")
    webhook   — POST to a personal dashboard / website
    slack     — DM or channel post via Slack webhook
    discord   — post to a Discord webhook

To add a destination, create a new module here with a deliver() function,
then import it in notify.py and append it to DESTINATIONS.
"""
