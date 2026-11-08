@echo off
REM Weekly runner: re-scan listings, then notify on new 8+/10 matches.
REM Scheduled via Windows Task Scheduler. Output goes to weekly.log.

cd /d "C:\Users\inika\OneDrive\AI Job Scanner"
echo ============================================= >> weekly.log
echo Run started %date% %time% >> weekly.log
python scanner.py >> weekly.log 2>&1
python notify.py >> weekly.log 2>&1
echo Run finished %date% %time% >> weekly.log
echo. >> weekly.log
