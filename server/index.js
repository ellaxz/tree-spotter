// test connection to mongodb
import express from "express"
import cors from "cors"

import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

const app = express()
const PORT = 3001

app.use(cors())

let treesCollection

async function startServer() {
  await client.connect()
  const db = client.db("treespotter")
  treesCollection = db.collection("trees")
  console.log("connected to mongodb")

  const count = await treesCollection.countDocuments()
  console.log("total trees in collection:", count)

  app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
  })
}

// a simple test route to confirm the server is working
app.get("/", (req, res) => {
  res.send("treespotter api is running")
})

app.get("/test", (req, res) => {
  console.log(req.query)
  console.log(typeof req.query.lat)

  const latNumber = parseFloat(req.query.lat)
  console.log(latNumber)
  console.log(typeof latNumber)

  res.send("this is a test route")
})

app.get("/api/trees/nearby", async (req, res) => {
  const lat = parseFloat(req.query.lat)
  const lng = parseFloat(req.query.lng)

  if (isNaN(lat) || isNaN(lng)) {
    return res
      .status(400)
      .json({ error: "lat and lng query parameters are required" })
  }

  try {
    const nearbyTrees = await treesCollection
      .find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 1000,
          },
        },
      })
      .limit(100)
      .toArray()

    res.json(nearbyTrees)
  } catch (err) {
    console.error("Query failed:", err)
    res.status(500).json({ error: "Failed to query nearby trees" })
  }
})

startServer()
