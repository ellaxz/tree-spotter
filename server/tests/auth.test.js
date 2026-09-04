import { beforeAll, afterAll, beforeEach, describe, expect, test } from "vitest"
import request from "supertest"
import { MongoClient } from "mongodb"
import { MongoMemoryServer } from "mongodb-memory-server"

import createApp from "../app.js"
import { create } from "node:domain"

let mongoServer
let client
let usersCollection
let treesCollection
let app

beforeAll(async () => {
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
})

beforeEach(async () => {
  await usersCollection.deleteMany({})
})

afterAll(async () => {
  await client.close()
  await mongoServer.stop()
})

describe("Auth API", () => {
  test("POST /api/auth/register creates a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "hiibye@example.com",
      password: "heyyy123",
    })

    expect(response.status).toBe(201)
    expect(response.body.email).toBe("hiibye@example.com")
    expect(response.body.id).toBeDefined()
  })

  test("POST /api/auth/register rejects duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      email: "hiibye@example.com",
      password: "hey123",
    })

    const response = await request(app).post("/api/auth/register").send({
      email: "hiibye@example.com",
      password: "hey123",
    })
    console.log(response.status, response.body)

    expect(response.status).toBe(409)
    expect(response.body.error).toBe("email already registered")
  })
})
