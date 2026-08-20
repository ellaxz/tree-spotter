// fetch the whole tree dataset using exports endpoint which is not limited by the record cap

import { writeFileSync } from "fs"

const EXPORT_URL =
  "https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/trees-with-species-and-dimensions-urban-forest/exports/json"

async function fetchAllTrees() {
  console.log("fetching dull dataset export,..")
  const response = await fetch(EXPORT_URL)
  const trees = await response.json()
  return trees
}

fetchAllTrees().then((trees) => {
  writeFileSync("./data-raw/all-trees.json", JSON.stringify(trees, null, 2))
  console.log(`done saved ${trees.length} trees to data-raw/all-trees.json`)
})
