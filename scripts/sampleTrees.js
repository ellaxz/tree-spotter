// randomly sample a small amount of trees from cleaned data

import { readFileSync, writeFileSync } from "node:fs"

const cleanTrees = JSON.parse(
  readFileSync("./data-raw/clean-trees.json", "utf-8"),
)

const SAMPLE_SIZE = 200

// shuffle
function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const sampledTrees = shuffle(cleanTrees).slice(0, SAMPLE_SIZE)

const fileContent = `// randomly sampled trees from the cleaned city of melbourne tree dataset
// this is a temporary sample for development.
export const sampleTrees = ${JSON.stringify(sampledTrees, null, 2)}`

writeFileSync("./src/data/sampleTrees.js", fileContent)

console.log(`Sampled ${sampledTrees.length} trees into src/data/sampleTrees.js`)
