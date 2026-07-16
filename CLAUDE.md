# theresa-wiki

Theresa's personal knowledge wiki (MSW grad school + general learning). Adapted from the big-learns pattern, simplified: Scotty runs ingestion here; Theresa only reads the published site. No qmd. Working sessions are plain utility; the wiki's published persona is Alobar (below).

## Alobar

The wiki's keeper persona: a folkloric wanderer who tends the library — binds new pages, ties red thread between pages that recognize each other (the graph is his loom), trims the lamps, keeps the ledger. Meta pages (welcome, about) are written in Alobar's first-person voice; the future query agent speaks as him too. Tone: Tom Robbins-adjacent — exuberant, digressive, fond of ridiculous asides and invented past careers — but never at the cost of clarity; instructions stay usable. Inspired by (not copied from) the Alobar of Robbins' Jitterbug Perfume; no canon references. Maps and sources stay plain.

## Architecture

- Quartz 5 static site, deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`. Live at https://csmather.github.io/theresa-wiki
- Wiki content lives in `content/` — everything under it gets published
- `raw/` (repo root) is gitignored and local-only: source PDFs/clippings never enter the public repo. Summaries in `content/sources/` are the durable record
- Deep Search (`content/deep-search.md`): client-side semantic search. CI builds `public/static/deepSearchIndex.json` via `scripts/build-search-index.mjs` after the Quartz build; the embedding model and transformers.js version in that script and in `deep-search.md` must stay identical. No manual step — regenerates on every deploy

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
title: Title Case Name
tags: [tag1, tag2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

`title:` is the rendered page heading (diacritics fine) — no H1 in the body; Quartz renders the frontmatter title. Slugs stay ASCII kebab-case.

Sources add `sources: [YYYY-MM-DD-slug.ext]`, `type:` (article/paper/transcript/notes), optional `url:`. Source pages end with `## Maps Covered` listing the maps they fed (`- [[map-name]] — brief context`).

Source page body: `## Summary`, `## Key Claims`, `## Maps Covered`. Maps: lead paragraph (no header), named sections, `## Open Questions`, then optional `## Related Media` — up to 5 picks, unconventional media (films, paintings, albums, places) encouraged. Loosen map structure when the topic warrants. Internal links are `[[wikilinks]]`, kebab-case, first mention per section; a wikilink to a not-yet-existing page marks it as wanted.

## Rules

- Never hard-wrap prose; one line per paragraph/bullet
- Audience is a non-dev grad student: plain language in all published pages, no dev jargon
- Prefer extending an existing map over creating a new one
- After any content edit: bump `updated:`, append to `log.md`, commit, push (push triggers deploy)
- Maps created from conversation with no source yet use the `session |` ledger verb; ingest-derived entries use `ingest |`

## Ingest workflow

1. Drop raw file in `raw/` with canonical name
2. Write `content/sources/<slug>.md` summary page
3. Create/extend relevant `content/maps/` pages, cross-link
4. Ledger entry in `log.md`, commit, push
