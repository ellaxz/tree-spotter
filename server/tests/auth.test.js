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

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret"

  mongoServer = await MongoMemoryServer.create()

  const uri = mongoServer.getUri()

  client = new MongoClient(uri)
  await client.connect()

  const db = client.db("treespotter-test")

  usersCollection = db.collection("users")
  treesCollection = db.collection("trees")

  await usersCollection.createIndex(
    {
      email: 1,
    },
    { unique: true },
  )

  app = createApp({
    usersCollection,
    treesCollection,
  })
}, 60000)

beforeEach(async () => {
  await usersCollection.deleteMany({})
})

afterAll(async () => {
  if (client) {
    await client.close()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }
})

describe("Auth API", () => {
  test("POST /api/auth/register creates a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "hibyefriend@example.com",
      password: "hello123",
    })

    expect(response.status).toBe(201)
    expect(response.body.email).toBe("hibyefriend@example.com")
    expect(response.body.id).toBeDefined()
  })

  test("POST /api/auth/register rejects duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      email: "hibyefriend@example.com",
      password: "hello123",
    })

    const response = await request(app).post("/api/auth/register").send({
      email: "hibyefriend@example.com",
      password: "hello123",
    })

    expect(response.status).toBe(409)
    expect(response.body.error).toBe("email already registered")
  })

  test("POST /api/auth/login logs in as existing user", async () => {
    await request(app).post("/api/auth/register").send({
      email: "hellohi@gmail.com",
      password: "hellohi123",
    })

    const response = await request(app).post("/api/auth/login").send({
      email: "hellohi@gmail.com",
      password: "hellohi123",
    })

    expect(response.status).toBe(200)
    expect(response.body.email).toBe("hellohi@gmail.com")
  })

  test("POST /api/auth/login rejects wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      email: "wrongpassword@test.com",
      password: "correct123",
    })

    const response = await request(app).post("/api/auth/login").send({
      email: "wrongpassword@test.com",
      password: "wrong123",
    })

    expect(response.status).toBe(401)
    expect(response.body.error).toBe("invalid email or password")
  })

  test("GET /api/auth/me rejects requests without session", async () => {
    const response = await request(app).get("/api/auth/me")

    expect(response.status).toBe(401)
  })

  test("GET /api/auth/me returns current user with session", async () => {
    const agent = request.agent(app)

    await agent.post("/api/auth/register").send({
      email: "session@test.com",
      password: "hello123",
    })

    await agent.post("/api/auth/login").send({
      email: "session@test.com",
      password: "hello123",
    })

    const response = await agent.get("/api/auth/me")

    expect(response.status).toBe(200)
    expect(response.body.email).toBe("session@test.com")
  })

  test("POST /api/auth/logout clears the session", async () => {
    const agent = request.agent(app)

    await agent.post("/api/auth/register").send({
      email: "logout@test.com",
      password: "hello123",
    })

    await agent.post("/api/auth/login").send({
      email: "logout@test.com",
      password: "hello123",
    })

    const logoutResponse = await agent.post("/api/auth/logout")

    expect(logoutResponse.status).toBe(200)

    const meResponse = await agent.get("/api/auth/me")

    expect(meResponse.status).toBe(401)
  })
})
