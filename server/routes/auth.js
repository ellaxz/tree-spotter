import express from "express"
import bcrypt from "bcrypt"

export default function createAuthRouter(usersCollection) {
  const router = express.Router()

  router.post("/register", async (req, res) => {
    // read user input from the request body
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required",
      })
    }
    // normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // check whether this email is already registered
    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      return res.status(409).json({
        error: "email already registered",
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    //create the new user document
    const result = await usersCollection.insertOne({
      email: normalizedEmail,
      passwordHash,
      googleId: null,
      createdAt: new Date(),
    })

    res.status(201).json({
      id: result.insertedId,
      email: normalizedEmail,
    })

    res.status(200).json({
      email: normalizedEmail,
      message: "register input received",
    })
  })

  return router
}
