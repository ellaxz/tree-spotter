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

  test("loggedin user can save a tree", async () => {
    const agent = request.agent(app)

    const registerResponse = await agent.post("/api/auth/register").send({
      email: "save@test.com",
      password: "testpassword123",
    })

    expect(registerResponse.status).toBe(201)

    const loginResponse = await agent.post("/api/auth/login").send({
      email: "save@test.com",
      password: "testpassword123",
    })

    expect(loginResponse.status).toBe(200)

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
    expect(savedTree.userId.toString()).toBe(loginResponse.body.id)
    expect(savedTree.createdAt).toBeInstanceOf(Date)

    const secondSaveResponse = await agent.put(`/api/saved-trees/${treeId}`)

    expect(secondSaveResponse.status).toBe(200)

    const savedCount = await savedTreesCollection.countDocuments({
      userId: savedTree.userId,
      treeId: result.insertedId,
    })

    expect(savedCount).toBe(1)

    const listResponse = await agent.get("/api/saved-trees")

    expect(listResponse.status).toBe(200)
    expect(listResponse.body).toHaveLength(1)
    expect(listResponse.body[0]._id).toBe(treeId)
    expect(listResponse.body[0].commonName).toBe("Test Tree")

    const deleteResponse = await agent.delete(`/api/saved-trees/${treeId}`)

    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.body).toEqual({
      treeId,
      saved: false,
    })

    const afterDeleteResponse = await agent.get("/api/saved-trees")

    expect(afterDeleteResponse.status).toBe(200)
    expect(afterDeleteResponse.body).toEqual([])
  })

  test("users cannot access each others saved trees", async () => {
    const userA = request.agent(app)
    const userB = request.agent(app)

    const crentialsA = {
      email: "usera@test.com",
      password: "testpassword123",
    }

    const registerA = await userA.post("/api/auth/register").send(crentialsA)

    expect(registerA.status).toBe(201)

    const loginA = await userA.post("/api/auth/login").send(crentialsA)
    expect(loginA.status).toBe(200)

    const credentialsB = {
      email: "userb@test.com",
      password: "testpassword123",
    }

    const registerB = await userB.post("/api/auth/register").send(credentialsB)

    expect(registerB.status).toBe(201)

    const loginB = await userB.post("/api/auth/login").send(credentialsB)

    expect(loginB.status).toBe(200)

    const result = await treesCollection.insertOne({
      commonName: "A's saved tree",
      scientificName: "Test species",
    })

    const treeId = result.insertedId.toString()

    const saveResponse = await userA.put(`/api/saved-trees/${treeId}`)

    expect(saveResponse.status).toBe(200)

    const listB = await userB.get("/api/saved-trees")

    expect(listB.status).toBe(200)
    expect(listB.body).toEqual([])

    const deleteB = await userB.delete(`/api/saved-trees/${treeId}`)

    expect(deleteB.status).toBe(200)

    const listA = await userA.get("/api/saved-trees")

    expect(listA.status).toBe(200)
    expect(listA.body).toHaveLength(1)
    expect(listA.body[0]._id).toBe(treeId)
  })
})
