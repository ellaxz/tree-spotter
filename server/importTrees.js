import { MongoClient } from "mongodb"
import { readFileSync } from "node:fs"
import dotenv from "dotenv"

dotenv.config()

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function importTrees() {
  const trees = JSON.parse(
    readFileSync("../data-raw/clean-trees.json", "utf-8"),
  )

  // add a geojson location filed to each tree
  // [lng, lat]
  const treesWithLocation = trees.map((tree) => ({
    ...tree,
    location: {
      type: "Point",
      coordinates: [tree.lng, tree.lat],
    },
  }))

  try {
    await client.connect()
    const db = client.db("treespotter")
    const collection = db.collection("trees")

    await collection.deleteMany({})

    const result = await collection.insertMany(treesWithLocation)
    console.log(`insert ${result.insertedCount} trees`)

    //creat a 2dsphere index to makes queries fast
    await collection.createIndex({ location: "2dsphere" })
    console.log("created 2dsphere index on location filed")
  } catch (err) {
    console.error("import failed:", err)
  } finally {
    await client.close()
  }
}

importTrees()
