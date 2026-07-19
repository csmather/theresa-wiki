---
title: Deep Search
created: 2026-07-16
updated: 2026-07-18
---

The search bar in the toolbar belongs to Bunny: it matches your words exactly, the way she files them, and it has never once been wrong about a word. But sometimes you don't *have* the word — only the shape of a question. This page is for that, and it belongs to Piggy.

Here is how it works, as best I can explain it without Monkey's diagrams (he has diagrams; they are of his lunch). Piggy has read every page in this library over my shoulder — twice — and what she remembers is not the words but the *scent* of the meaning underneath them. Ask a question in your own language ("why do opposites attract in the psyche?") and she will snuffle through the stacks and drag back whatever smells like your question, even pages that never use your words. Truffle-hunting, but for ideas.

Two practical notes, because Bunny insists on practical notes: your first search carries the snuffling-engine into your browser — a ~25 MB download, once; after that it's cached and quick. And the whole hunt happens inside your own machine — nothing you type leaves it. Piggy is shy. She doesn't send your questions anywhere.

<div id="deep-search-app">
  <form id="ds-form" style="display: flex; gap: 0.5rem; margin: 1rem 0;">
    <input id="ds-input" type="text" placeholder="Ask in your own words…" autocomplete="off" style="flex: 1; padding: 0.6rem 0.8rem; border: 1px solid var(--lightgray); border-radius: 6px; background: var(--light); color: var(--darkgray); font-size: 1rem;" />
    <button id="ds-button" type="submit" style="padding: 0.6rem 1.1rem; border: none; border-radius: 6px; background: var(--secondary); color: var(--light); cursor: pointer; font-size: 1rem;">Snuffle</button>
  </form>
  <p id="ds-status" style="color: var(--gray); font-style: italic; min-height: 1.4em;"></p>
  <div id="ds-results"></div>
</div>

<script type="module">
// Query-side of the deep search. The index is built in CI by
// scripts/build-search-index.mjs — model and library version must match it.
const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0"
const MODEL = "Xenova/all-MiniLM-L6-v2"
const MIN_SCORE = 0.25
const MAX_RESULTS = 6

let extractorPromise = null
let indexPromise = null

function loadIndex() {
  indexPromise ??= fetch("./static/deepSearchIndex.json").then((r) => {
    if (!r.ok) throw new Error(`index fetch failed (${r.status})`)
    return r.json()
  })
  return indexPromise
}

function loadExtractor(status) {
  extractorPromise ??= (async () => {
    status("Waking Piggy — the first visit downloads ~25 MB of snuffling-engine; she is a substantial pig…")
    const { pipeline } = await import(LIB)
    return pipeline("feature-extraction", MODEL, { dtype: "q8" })
  })()
  return extractorPromise
}

async function runSearch(query, status, results) {
  const [index, extractor] = await Promise.all([loadIndex(), loadExtractor(status)])
  status("Snuffling through the stacks…")
  const out = await extractor([`${query}`], { pooling: "mean", normalize: true })
  const q = out.data
  const byPage = new Map()
  for (const chunk of index.chunks) {
    let dot = 0
    for (let i = 0; i < index.dims; i++) dot += q[i] * chunk.vec[i]
    const prev = byPage.get(chunk.slug)
    if (!prev || dot > prev.score) byPage.set(chunk.slug, { ...chunk, score: dot })
  }
  const ranked = [...byPage.values()]
    .filter((r) => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
  results.replaceChildren()
  if (ranked.length === 0) {
    status("Piggy came back with an empty snout. Try other words — or hand Scotty a source on it, and we'll have it bound and scented within the week.")
    return
  }
  status("")
  for (const r of ranked) {
    const card = document.createElement("div")
    card.style.cssText = "padding: 0.8rem 1rem; margin-bottom: 0.8rem; border: 1px solid var(--lightgray); border-radius: 8px;"
    const a = document.createElement("a")
    a.href = `./${r.slug}`
    a.textContent = r.title
    a.style.cssText = "font-weight: 700; font-size: 1.05rem;"
    const pct = document.createElement("span")
    pct.textContent = ` ${Math.round(r.score * 100)}% on-scent`
    pct.style.cssText = "color: var(--gray); font-size: 0.85rem;"
    const snippet = document.createElement("p")
    snippet.textContent = r.text.length > 260 ? r.text.slice(0, 260) + "…" : r.text
    snippet.style.cssText = "margin: 0.4rem 0 0; color: var(--darkgray); font-size: 0.92rem;"
    card.append(a, pct, snippet)
    results.append(card)
  }
}

function init() {
  const form = document.getElementById("ds-form")
  if (!form || form.dataset.bound) return
  form.dataset.bound = "true"
  const input = document.getElementById("ds-input")
  const results = document.getElementById("ds-results")
  const statusEl = document.getElementById("ds-status")
  const status = (msg) => (statusEl.textContent = msg)
  // visiting the page signals intent — start fetching the index right away,
  // and warm the model as soon as the input is touched
  loadIndex().catch(() => {})
  input.addEventListener("focus", () => loadExtractor(status).then(() => status("")).catch(() => {}), { once: true })
  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const query = input.value.trim()
    if (!query) return
    try {
      await runSearch(query, status, results)
    } catch (err) {
      status(`Something has jammed in the stacks — Monkey has been dispatched, which is its own problem. (${err.message})`)
    }
  })
}

// Quartz's SPA router swaps page content without a full reload; re-bind on its
// nav event, and only register that listener once per real page load.
if (!window.__deepSearchNavHook) {
  window.__deepSearchNavHook = true
  document.addEventListener("nav", init)
}
init()
</script>

*She reads sideways, not literally — bring her your half-formed questions; those are her favorite kind. And if a result seems strange, remember: sometimes the correct answer to a question smells nothing like it. — A.*
