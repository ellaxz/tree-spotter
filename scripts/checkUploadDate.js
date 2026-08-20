// check how many tree records actually have uploaddate

import { readFileSync } from "fs"

const trees = JSON.parse(readFileSync("./data-raw/all-trees.json", "utf-8"))

const total = trees.length
const nullEntries = trees.filter((tree) => tree === null).length
const withUploadDate = trees.filter(
  (tree) => tree !== null && tree.uploaddate !== null,
).length

console.log(`Total entries: ${total}`)
console.log(`Null entries: ${nullEntries}`)
console.log(`Trees with a non-null uploaddate: ${withUploadDate}`)
console.log(`Percentage: ${((withUploadDate / total) * 100).toFixed(2)}%`)
