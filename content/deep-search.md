---
title: Deep Search
created: 2026-07-16
updated: 2026-07-19
---

The search bar in the toolbar belongs to Bunny: it matches your words exactly how she files them, and it has never once been wrong about a word. But sometimes you don't *have* the word — only the shape of one. For that, there is the Contraption.

Monkey built it — alone, at night, without permission: the three conditions under which, he says, all real engineering happens. It is not so much *in* the library as the library is now, structurally, part of *it* — built into the building the way a church organ is built into a church: pipes through the walls, bellows under the floorboards, one repurposed bubble wand performing a function I have been assured is critical. You whisper a question into the tube — your own words, half-formed is fine ("why do opposites attract in the psyche?") — and the works take it from there: the whisper is weighed, wrung out, held up to a strong light, and read for what it *meant* rather than what it said, and presently the pages that meant the same thing come rattling back through the pipes, smelling faintly of brass and banana, even the ones that share not one word with your question. I have asked Monkey what, precisely, happens between the whisper and the rattling. He showed me the clipboard. There is still nothing on the clipboard.

For the record, Bunny insists I add two practical notes, and Bunny is right to insist: first, your browser must take delivery of the machine — a ~25 MB installation, once. Monkey will hand you some paperwork to sign (though I think he just wants your autograph). Second, the entire apparatus operates inside your own machine.

<div id="deep-search-app">
  <form id="ds-form" style="display: flex; gap: 0.5rem; margin: 1rem 0;">
    <input id="ds-input" type="text" placeholder="Whisper into the tube…" autocomplete="off" style="flex: 1; padding: 0.6rem 0.8rem; border: 1px solid var(--lightgray); border-radius: 6px; background: var(--light); color: var(--darkgray); font-size: 1rem;" />
    <button id="ds-button" type="submit" style="padding: 0.6rem 1.1rem; border: none; border-radius: 6px; background: var(--secondary); color: var(--light); cursor: pointer; font-size: 1rem;">Pull the Lever</button>
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
    status("Taking delivery of the Contraption (~25 MB of pipework, once; Monkey is supervising from the rafters)…")
    const { pipeline } = await import(LIB)
    return pipeline("feature-extraction", MODEL, { dtype: "q8" })
  })()
  return extractorPromise
}

async function runSearch(query, status, results) {
  const [index, extractor] = await Promise.all([loadIndex(), loadExtractor(status)])
  status("Important machinery is happening in the walls…")
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
    status("The tube came back empty, with a faint apologetic whistle. Try other words — or hand Scotty a source on it, and Monkey will fit a new pipe within the week.")
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
    pct.textContent = ` ${Math.round(r.score * 100)}% certified`
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
      status(`The Contraption has jammed. A safety citation has been issued, contested, and overturned. (${err.message})`)
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

*He built it for you, by the way. He would want you to know that. He would also want you to know that it was "nothing," that you should ask it many questions, and that you should please not tap on the pipes between the hours of anything and anything else. — A.*
