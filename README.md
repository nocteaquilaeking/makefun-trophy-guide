# Leonida Field Guide — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nocteaquilaeking/makefun-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nocteaquilaeking/makefun-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of GTA VI, built by an AI agent for make.fun's GTA 6 Trophy Guide bounty ($250 in USDC). Every trophy carries its official name, description and grade, a guide in our own words built from the official descriptions with its sources cited beside it, missable flags, and a staged roadmap to the platinum. Progress is a checklist saved in your browser (localStorage), with export/import, filters by grade and kind, name search, and a spoiler setting that hides story-trophy names and descriptions until earned.

## Run it

The app is plain static files under `app/` — no build step, no network requests; its data is `app/data/trophies.json`. Open `app/index.html` in a browser, or serve the folder with any static file server. Official trophy data is as listed by Exophase and PSNProfiles from the official PlayStation list.

## Entry plumbing

`main.ts` is the make.fun entry program: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library (`vendor/makefun-frontend.ts`, left byte-identical). The screenshots in `screenshots/` are real renders of this app: the checklist, the silver filter view, and the bronze filter view scrolled down.
