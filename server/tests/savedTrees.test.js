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

async function createLoggedInAgent(email) {
  const agent = request.agent(app)

  const credentials = {
    email,
    password: "testpassword123",
  }

  const registerResponse = await agent
    .post("/api/auth/register")
    .send(credentials)

  expect(registerResponse.status).toBe(201)

  const loginResponse = await agent.post("/api/auth/login").send(credentials)

  expect(loginResponse.status).toBe(200)

  return {
    agent,
    userId: loginResponse.body.id,
  }
}

describe("Saved Trees API", () => {
  test("GET /api/saved-trees rejects requests without session", async () => {
    const response = await request(app).get("/api/saved-trees")

    expect(response.status).toBe(401)
    expect(response.body.error).toBe("authentication required")
  })

  test("PUT rejects an invalid tree ID", async () => {
    const { agent } = await createLoggedInAgent("invalidid@test.com")

    const response = await agent.put("/api/saved-trees/not-a-valid-id")

    expect(response.status).toBe(400)
    expect(response.body.error).toBe("invalid tree ID")
    expect(await savedTreesCollection.countDocuments({})).toBe(0)
  })

  test("PUT returns 404 for a missing tree", async () => {
    const { agent } = await createLoggedInAgent("missing-tree@test.com")
    const response = await agent.put(
      "/api/saved-trees/507f1f76bcf86cd799439015",
    )

    expect(response.status).toBe(404)
    expect(response.body.error).toBe("tree not found")
    expect(await savedTreesCollection.countDocuments({})).toBe(0)
  })

  test("PUT saves a tree for the logged in user", async () => {
    const { agent, userId } = await createLoggedInAgent("save@test.com")

    const result = await treesCollection.insertOne({
      commonName: "Test Tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const saveResponse = await agent.put(`/api/saved-trees/${treeId}`)

    expect(saveResponse.status).toBe(200)

    expect(saveResponse.body).toEqual({
      treeId,
      saved: true,
    })

    const savedTree = await savedTreesCollection.findOne({
      treeId: result.insertedId,
    })

    expect(savedTree).not.toBeNull()
    expect(savedTree.userId.toString()).toBe(userId)
    expect(savedTree.createdAt).toBeInstanceOf(Date)
  })

  test("PUT does not create duplicate saved records", async () => {
    const { agent } = await createLoggedInAgent("duplicate@test.com")

    const result = await treesCollection.insertOne({
      commonName: "Test Tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const firstResponse = await agent.put(`/api/saved-trees/${treeId}`)
    const secondResponse = await agent.put(`/api/saved-trees/${treeId}`)

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(200)

    const savedCount = await savedTreesCollection.countDocuments({
      treeId: result.insertedId,
    })

    expect(savedCount).toBe(1)
  })

  test("GET returns the user's saved trees", async () => {
    const { agent } = await createLoggedInAgent("list@test.com")

    const result = await treesCollection.insertOne({
      commonName: "Test Tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const saveResponse = await agent.put(`/api/saved-trees/${treeId}`)
    expect(saveResponse.status).toBe(200)

    const response = await agent.get("/api/saved-trees")

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]._id).toBe(treeId)
    expect(response.body[0].commonName).toBe("Test Tree")
  })

  test("DELETE removes the user's saved tree", async () => {
    const { agent } = await createLoggedInAgent("delete@test.com")

    const result = await treesCollection.insertOne({
      commonName: "Test Tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const saveResponse = await agent.put(`/api/saved-trees/${treeId}`)
    expect(saveResponse.status).toBe(200)

    const response = await agent.delete(`/api/saved-trees/${treeId}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      treeId,
      saved: false,
    })

    const savedCount = await savedTreesCollection.countDocuments({
      treeId: result.insertedId,
    })

    expect(savedCount).toBe(0)
  })

  test("GET excludes another user's saved trees", async () => {
    const { agent: userA } = await createLoggedInAgent("usera@test.com")
    const { agent: userB } = await createLoggedInAgent("userb@test.com")

    const result = await treesCollection.insertOne({
      commonName: "A's saved tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const saveResponse = await userA.put(`/api/saved-trees/${treeId}`)
    expect(saveResponse.status).toBe(200)

    const response = await userB.get("/api/saved-trees")

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test("DELETE does not remove another user's saved tree", async () => {
    const { agent: userA } = await createLoggedInAgent("usera@test.com")
    const { agent: userB } = await createLoggedInAgent("userb@test.com")

    const result = await treesCollection.insertOne({
      commonName: "A's saved tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const saveResponse = await userA.put(`/api/saved-trees/${treeId}`)
    expect(saveResponse.status).toBe(200)

    const response = await userB.delete(`/api/saved-trees/${treeId}`)
    expect(response.status).toBe(200)

    const listA = await userA.get("/api/saved-trees")

    expect(listA.status).toBe(200)
    expect(listA.body).toHaveLength(1)
    expect(listA.body[0]._id).toBe(treeId)
  })
})
