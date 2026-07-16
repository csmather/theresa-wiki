// Build-time embedding index for the Deep Search page.
// Run AFTER `npx quartz build` — reads the emitted contentIndex.json and writes
// deepSearchIndex.json next to it. The browser embeds queries with the SAME
// model (see content/deep-search.md); keep MODEL in sync between the two.
import { pipeline, env } from "@huggingface/transformers"
import fs from "node:fs"

const MODEL = "Xenova/all-MiniLM-L6-v2"
const INDEX_IN = "public/static/contentIndex.json"
const INDEX_OUT = "public/static/deepSearchIndex.json"
const MAX_CHUNK_CHARS = 900

env.cacheDir = ".cache/transformers" // stable path so CI can cache the model

if (!fs.existsSync(INDEX_IN)) {
  console.error(`${INDEX_IN} not found — run 'npx quartz build' first`)
  process.exit(1)
}

const contentIndex = JSON.parse(fs.readFileSync(INDEX_IN, "utf8"))

// Greedily pack paragraphs into chunks of at most MAX_CHUNK_CHARS.
function chunkText(text) {
  const paras = text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
  const chunks = []
  let current = ""
  for (const para of paras) {
    if (current && current.length + para.length + 1 > MAX_CHUNK_CHARS) {
      chunks.push(current)
      current = para
    } else {
      current = current ? `${current}\n${para}` : para
    }
    // a single paragraph longer than the cap gets split hard
    while (current.length > MAX_CHUNK_CHARS) {
      chunks.push(current.slice(0, MAX_CHUNK_CHARS))
      current = current.slice(MAX_CHUNK_CHARS)
    }
  }
  if (current) chunks.push(current)
  return chunks
}

const chunks = []
for (const [slug, page] of Object.entries(contentIndex)) {
  if (slug === "deep-search" || slug.startsWith("tags/")) continue
  const content = (page.content ?? "").trim()
  if (content.length < 80) continue // folder stubs, empty pages
  for (const text of chunkText(content)) {
    chunks.push({ slug, title: page.title, text })
  }
}
console.log(`Embedding ${chunks.length} chunks from ${new Set(chunks.map((c) => c.slug)).size} pages…`)

const extractor = await pipeline("feature-extraction", MODEL, { dtype: "q8" })

// Prefix each chunk with its page title — cheap context boost for retrieval.
const inputs = chunks.map((c) => `${c.title}. ${c.text}`)
const BATCH = 16
const vectors = []
for (let i = 0; i < inputs.length; i += BATCH) {
  const out = await extractor(inputs.slice(i, i + BATCH), { pooling: "mean", normalize: true })
  const [n, dims] = out.dims
  const data = out.data
  for (let j = 0; j < n; j++) {
    vectors.push(Array.from(data.slice(j * dims, (j + 1) * dims), (v) => Math.round(v * 1e4) / 1e4))
  }
}

const index = {
  model: MODEL,
  dims: vectors[0].length,
  chunks: chunks.map((c, i) => ({ ...c, vec: vectors[i] })),
}
fs.writeFileSync(INDEX_OUT, JSON.stringify(index))
console.log(`Wrote ${INDEX_OUT} (${(fs.statSync(INDEX_OUT).size / 1024).toFixed(0)} KB, ${index.dims} dims)`)
