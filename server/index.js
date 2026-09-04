import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import createApp from "./app.js"

dotenv.config()

const PORT = process.env.PORT || 3001

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error("MONGODB_URI environment variable is missing")
}

const client = new MongoClient(uri)

async function startServer() {
  try {
    await client.connect()

    const db = client.db("treespotter")

    const treesCollection = db.collection("trees")
    const usersCollection = db.collection("users")

    console.log("connected to mongodb")

    await usersCollection.createIndex(
      {
        email: 1,
      },
      { unique: true },
    )

    const count = await treesCollection.countDocuments()
    console.log("total trees in collection:", count)
    const app = createApp({
      treesCollection,
      usersCollection,
    })

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("failed to start server", error)
    process.exit(1)
  }
}

startServer()
