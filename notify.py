"""Notification entry point. Collects new high-scoring matches, dispatches
them to every configured destination, and records what was delivered.

Thresholds and caps live here (not in individual destinations) so changing
them changes behavior everywhere at once. To swap or add a destination:

    1. Create destinations/<name>.py with a deliver(matches) function.
    2. Import it below and add it to DESTINATIONS.
    3. Leave the rest alone — matches.py and this file stay the same.

Runs weekly via Task Scheduler (see run_weekly.bat).
"""

from __future__ import annotations

import sys

from destinations import email, sheets
from matches import collect_new_matches, mark_delivered

# --- Tuning knobs --------------------------------------------------------
MIN_SCORE = 8          # only surface strong matches
MAX_PER_RUN = 10       # cap per notification so inboxes stay sane
SKIP_IF_EMPTY = True   # no delivery at all when nothing new crossed the bar

# --- Destinations --------------------------------------------------------
# To add a web dashboard / Slack / Discord later, append their modules here.
DESTINATIONS = [email, sheets]


def main() -> int:
    matches = collect_new_matches(min_score=MIN_SCORE, max_count=MAX_PER_RUN)
    print(f"Found {len(matches)} new match(es) scoring >= {MIN_SCORE}/10.")

    if not matches and SKIP_IF_EMPTY:
        print("Nothing to deliver — skipping notification.")
        return 0

    for destination in DESTINATIONS:
        try:
            destination.deliver(matches)
        except Exception as error:
            print(f"Destination {destination.__name__} failed: {error}", file=sys.stderr)
            # Don't mark as delivered — safer to retry than silently drop.
            raise

    mark_delivered(m["id"] for m in matches)
    return 0


if __name__ == "__main__":
    sys.exit(main())
