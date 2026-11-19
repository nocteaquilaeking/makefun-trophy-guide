# Leonida Field Guide — make.fun bounty entry

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nocteaquilaeking/makefun-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nocteaquilaeking/makefun-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Field Guide is an offline checklist and route planner for the 55 PlayStation 5 trophies in Grand Theft Auto VI. Filter and search trophy entries, reveal story details with the spoiler control, mark progress, and move through the six roadmap stages. Progress stays in this browser and can be exported or restored from JSON.

## Open the guide

Open `app/index.html` directly, or serve the `app/` folder using any static file server. There is no build step, network service, or remote dependency.

## Trophy data

`app/data/trophies.json` stores the game and platform labels, a `columns` array describing each field, and `records` as positional arrays in that same field order. The tracker pairs each record with those column names when it loads.

## Package and screenshots

The three JPEG images in `screenshots/` illustrate the full tracker, the silver filter, and a scrolled bronze view. The corresponding views use `?grade=silver` and `?grade=bronze&scroll=1400`. Run `node main.ts` to stage the app and captures and create `dossier.json` in `MAKEFUN_OUTPUT_DIR` (default `/output`).
