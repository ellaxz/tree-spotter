// test connection to mongodb

import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function testConnection() {
  try {
    await client.connect()
    console.log("successfully connected")
  } catch (err) {
    console.error("connection  failed", err)
  } finally {
    await client.close()
  }
}

testConnection()
