// test connection to mongodb
import express from "express"
import cors from "cors"

import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import createTreesRouter from "./routes/trees.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error("MONGODB_URI environment variable is missing")
}

const client = new MongoClient(uri)

app.use(cors())
app.use(express.json())

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

async function startServer() {
  try {
    await client.connect()

    const db = client.db("treespotter")
    const treesCollection = db.collection("trees")
    console.log("connected to mongodb")

    const count = await treesCollection.countDocuments()
    console.log("total trees in collection:", count)

    //treesCollection must exist by this point
    app.use("/api/trees", createTreesRouter(treesCollection))

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("failed to start server", error)
    process.exit(1)
  }
}

startServer()
