// test connection to mongodb
import express from "express"
import cors from "cors"

import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import createTreesRouter from "./routes/trees.js"

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
  //treesCollection must exist by this point
  app.use("/api/trees", createTreesRouter(treesCollection))

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

startServer()
