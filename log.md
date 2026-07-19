# Ledger

Append-only operational log. One entry per ingest/edit session.

## [2026-07-15] session | seed maps created
Created 8 conversation-seeded maps ([[fritjof-capra]], [[ignacio-matte-blanco]], [[sigmund-freud]], [[alenka-zupancic]], [[slavoj-zizek]], [[le-guin-tao-te-ching]], [[anne-dufourmantelle]], [[christopher-alexander]]) plus [[psychoanalysis]] and [[taoism]] hubs. Retitled site to "Theresa Wiki"; welcome page introduces Alobar; Related Media section added to map format.

## [2026-07-15] session | welcome page rewritten in Alobar's voice
First-person Robbins-adjacent register; persona and tone rules recorded in CLAUDE.md.

## [2026-07-15] ingest | 9 sources, every seed map grounded
Ingested 9 raws (Freud Clark lectures, Clarke on bi-logic, Zupančič Crisis & Critique interview, Žižek How to Read Lacan, Dufourmantelle Libération interview, Capra New Facts of Life, Alexander A City is Not a Tree, Legge Tao Te Ching, Le Guin NBA speech) → 9 source pages, all 10 maps extended. The Žižek ingest birthed [[jacques-lacan]]. Lint clean: no broken links, no orphans; systems-thinking hub considered and deferred (only two members).

## [2026-07-15] session | about page — Animal Collective staff introductions
Created [[about|About the Library]] introducing Bunny, Monkey, and Piggy as Alobar's staff; linked from the welcome page. In-map quips and ledger cameos deliberately deferred until the agent layer.


## [2026-07-16] session | deep search — client-side semantic search
Added [[deep-search|Deep Search]]: build-time embeddings over contentIndex (scripts/build-search-index.mjs, MiniLM q8 via transformers.js), browser-side query embedding + cosine ranking, results grouped per page. Linked from the welcome page; deploy workflow builds the index after Quartz. Verified end-to-end in-browser incl. SPA navigation.

## [2026-07-18] session | deep search RP pass
Dressed the [[deep-search|Deep Search]] page in staff voice: the search is Monkey's pneumatic Contraption (built into the library like a church organ, nine self-conducted inspections), Bunny keeps the toolbar catalog. Welcome-page bullets updated to match. (An earlier Piggy/truffle-scent draft was replaced on this branch before merge.)

