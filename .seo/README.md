# Personal website SEO operations

This is an existing-content and engineering program, not a publishing pipeline. See [operating rules](AGENTS.md) and [brand contract](brand.md).

## Daily operation

Read the installed unified `seo` skill and `PROCESSES.md` in the operator workspace. Measure, rank eligible repairs/refreshes, ship one justified action through PR, verify, and register. Existing user authorization permits merging without human approval after required CI/reviews. Do not change protections. Record unavailable reviews as blocked, not passed.

The scheduler is outside this repo: daily 10:30 Europe/Istanbul, reporting to the personal-website Slack channel. This config does not create a schedule. No new paid research unless separately authorized; current per-run incremental research budget is zero.

## Authoritative private store

`config.json` contains non-secret Rowset project/section/dataset locators. All three datasets are private. Get dataset metadata before row access. Stable indexes: Observations=`observation_key`, Runs=`run_id`, Actions=`action_id`. Read newest runs/debt, then relevant action reservations, before selecting work. Do not recreate stores or use a local tracker on an outage.

Baseline run: `apw:2026-09-28:baseline`. Observations include `health` summary + per-URL records; GSC sources `gsc-pages`, `gsc-queries`, `gsc-totals`, `gsc-previous`; PSI, redirect probes, corrected link checks and Plausible. The full private report is in `apw:2026-09-28:baseline:audit:limitations`. The action dataset owns candidate statuses and evidence. This repo's roadmap is only a sanitized direction document, not another action ledger.

Use bounded fully paginated source/run/window reads. Rowset text filters are contains: enforce exact equality locally. Append new observation windows; never overwrite earlier measurements. Retain compact metrics/provenance, not repeated raw pages.

## Local script bridge

Hydrate only needed records into a disposable private workspace using the installed skill's `state_bridge.py`. `rowset_projection.py` supports this observation schema: health includes a summary and one entity per URL; single-source snapshots contain JSON payloads. Preserve missing-data labels. Paths in config are logical projections, not files to commit. Runs and Actions are structured canonical records, not opaque copies of Markdown files: adapt needed rows to script inputs explicitly. After writes, read back exact records and verify before advancing sync status.

## Measurement cautions

Resolve observed www/apex redirects before counting internal links or orphans. Percent-encode spaces before HTTP link checks; browser verification rejected the first audit's tag-link false positives. Do not collapse paths without observing redirects. GSC daily totals differ from summed page/fragment impressions; hidden queries are not absent demand. GSC Pacific dates and Plausible Istanbul dates differ. Lab speed does not establish real-user CWV or INP. AI referrals do not establish citation share. Report unmeasured panels honestly.

## Privacy

Never commit credentials, private analytics, raw responses, research snapshots, health inventories, content/action ledgers or outcome history. Ignore patterns are defense in depth, not permission to stage everything. Keep public rule/plan files here; store research in Rowset. Original local audit evidence is retained until read-back verification succeeds.
