import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"

import createAuthRouter from "./routes/auth.js"
import createTreesRouter from "./routes/trees.js"

export default function createApp({ treesCollection, usersCollection }) {
  const app = express()

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get("/", (req, res) => {
    return res.send("treespotter api is running")
  })

  app.use("/api/trees", createTreesRouter(treesCollection))
  app.use("/api/auth", createAuthRouter(usersCollection))

  return app
}
