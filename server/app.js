import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

import createAuthRouter from "./routes/auth.js"
import createTreesRouter from "./routes/trees.js"
import createSavedTreesRouter from "./routes/savedTrees.js"

export default function createApp({
  treesCollection,
  usersCollection,
  savedTreesCollection,
}) {
  const app = express()

  const allowedOrigins = [
    "http://localhost:5173",
    "https://treespotter.web.app",
  ]

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error("not allowed by cors"))
        }
      },
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())

  app.use(
    "/api/saved-trees",
    createSavedTreesRouter({
      savedTreesCollection,
      treesCollection,
    }),
  )

  app.get("/", (req, res) => {
    return res.send("treespotter api is running")
  })

  app.use("/api/trees", createTreesRouter(treesCollection))
  app.use("/api/auth", createAuthRouter(usersCollection))

  return app
}
