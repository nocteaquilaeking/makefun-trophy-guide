# Leonida Field Guide — make.fun bounty entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nocteaquilaeking/makefun-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nocteaquilaeking/makefun-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Field Guide is an offline tracker and roadmap for all 55 GTA VI PlayStation 5 trophies. Browse trophy descriptions and guide notes, filter by grade or kind, search names, and save earned progress in this browser. Progress can also be exported or imported as JSON.

## Run the guide

Open `app/index.html` in a browser, or serve the `app/` directory with a static file server. The page loads its trophy records from `app/data/trophies.json` and does not need a build step.

## Screenshots and entry package

The three JPEG captures in `screenshots/` show the checklist, silver-grade trophies, and a scrolled bronze-grade view. The screenshot harness can open the page with `?grade=silver` or `?grade=bronze&scroll=1400` for the filtered captures. Run `node main.ts` to copy the app and captures to `MAKEFUN_OUTPUT_DIR` (default `/output`) and create `dossier.json`.
