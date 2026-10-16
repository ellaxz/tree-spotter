import { beforeAll, afterAll, beforeEach, describe, expect, test } from "vitest"
import request from "supertest"
import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"

import createApp from "../app.js"

let mongoServer
let client
let usersCollection
let treesCollection
let app
let savedTreesCollection

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret"

  mongoServer = await MongoMemoryServer.create()

  const uri = mongoServer.getUri()

  client = new MongoClient(uri)
  await client.connect()

  const db = client.db("treespotter-test")

  usersCollection = db.collection("users")
  treesCollection = db.collection("trees")
  savedTreesCollection = db.collection("savedTrees")

  await usersCollection.createIndex(
    {
      email: 1,
    },
    { unique: true },
  )

  await savedTreesCollection.createIndex(
    { userId: 1, treeId: 1 },
    { unique: true },
  )

  app = createApp({
    usersCollection,
    treesCollection,
    savedTreesCollection,
  })
}, 60000)

beforeEach(async () => {
  await usersCollection.deleteMany({})
  await treesCollection.deleteMany({})
  await savedTreesCollection.deleteMany({})
})

afterAll(async () => {
  if (client) {
    await client.close()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
})

describe("Saved Trees API", () => {
  test("GET /api/saved-trees rejects requests without session", async () => {
    const response = await request(app).get("/api/saved-trees")

    expect(response.status).toBe(401)
    expect(response.body.error).toBe("authentication required")
  })
})
