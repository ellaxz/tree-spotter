// clean the raw data

import { readFileSync, writeFileSync } from "fs"

const rawTrees = JSON.parse(readFileSync("./data-raw/all-trees.json", "utf-8"))

function cleanTree(tree) {
  return {
    id: tree.com_id,
    commonName: tree.common_name,
    scientificName: tree.scientific_name,
    precinct: tree.precinct,
    locatediN: tree.located_in,
    yearPlanted: tree.year_planted,
    usefulLifeExpectancy: tree.useful_life_expectency,
    lat: tree.latitude,
    lng: tree.longitude,
  }
}

//only keep tress that have vaild coordinates
function hasValidCoordinated(tree) {
  return typeof tree.lat === "number" && typeof tree.lng == "number"
}

const cleanedTrees = rawTrees.map(cleanTree).filter(hasValidCoordinated)

writeFileSync(
  "./data-raw/clean-trees.json",
  JSON.stringify(cleanedTrees, null, 2),
)

console.log(`raw trees: ${rawTrees.length}`)
console.log(`cleaned trees (with valid coordinates): ${cleanedTrees.length}`)
console.log(`dropped: ${rawTrees.length - cleanedTrees.length}`)
