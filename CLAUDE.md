# theresa-wiki

Theresa's personal knowledge wiki (MSW grad school + general learning). Adapted from the big-learns pattern, simplified: Scotty runs ingestion here; Theresa only reads the published site. No qmd, no roleplay — sessions in this repo are utility.

## Architecture

- Quartz 5 static site, deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`. Live at https://csmather.github.io/theresa-wiki
- Wiki content lives in `content/` — everything under it gets published
- `raw/` (repo root) is gitignored and local-only: source PDFs/clippings never enter the public repo. Summaries in `content/sources/` are the durable record

## Structure

- `raw/` — immutable source drops, local-only. Canonical filename: `YYYY-MM-DD-slug.<ext>` (ingest date)
- `content/index.md` — landing page Theresa sees first
- `content/sources/` — one summary page per ingested raw file, kebab-case slug from the title
- `content/maps/` — living topic pages, kebab-case slugs
- `log.md` — append-only operational ledger, one entry per ingest

## Page schema

Same as big-learns. Maps:

```yaml
---
tags: [tag1, tag2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

Sources add `sources: [YYYY-MM-DD-slug.ext]`, `type:` (article/paper/transcript/notes), optional `url:`. Source pages end with `## Maps Covered` listing the maps they fed (`- [[map-name]] — brief context`).

Source page body: `## Summary`, `## Key Claims`, `## Maps Covered`. Maps: H1, lead paragraph, named sections, open questions. Internal links are `[[wikilinks]]`, kebab-case, first mention per section.

## Rules

- Never hard-wrap prose; one line per paragraph/bullet
- Audience is a non-dev grad student: plain language in all published pages, no dev jargon
- Prefer extending an existing map over creating a new one
- After any content edit: bump `updated:`, append to `log.md`, commit, push (push triggers deploy)

## Ingest workflow

1. Drop raw file in `raw/` with canonical name
2. Write `content/sources/<slug>.md` summary page
3. Create/extend relevant `content/maps/` pages, cross-link
4. Ledger entry in `log.md`, commit, push
