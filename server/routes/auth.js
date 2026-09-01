import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

import requireAuth from "../middleware/requireAuth.js"

export default function createAuthRouter(usersCollection) {
  const router = express.Router()

  router.post("/register", async (req, res) => {
    try {
      // read user input from the request body
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error: "email and password are required",
        })
      }

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

      return res.status(201).json({
        id: result.insertedId,
        email: normalizedEmail,
      })
    } catch (error) {
      //handle duplicate key errors from the unique email index
      if (error.code === 11000) {
        return res.status(409).json({
          error: "email already registered",
        })
      }

      console.error("register error", error)
      return res.status(500).json({
        error: "internal server error",
      })
    }
  })

  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error: "email and password are required",
        })
      }

      const normalizedEmail = email.trim().toLowerCase()

      //find the user by normalized email
      const user = await usersCollection.findOne({
        email: normalizedEmail,
      })

      //keep the error message generic
      if (!user || !user.passwordHash) {
        return res.status(401).json({
          error: "invalid email or password",
        })
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash)

      if (!passwordMatches) {
        return res.status(401).json({
          error: "invalid email or password",
        })
      }

      //create a signed JWT for the authenticated user
      const token = jwt.sign(
        {
          userId: user._id.toString(),
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        },
      )

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })

      return res.status(200).json({
        id: user._id,
        email: user.email,
      })
    } catch (error) {
      console.error("login error", error)

      return res.status(500).json({
        error: "internal server error",
      })
    }
  })

  router.get("/me", requireAuth, async (req, res) => {
    try {
      //find the authenticated user by id
      const user = await usersCollection.findOne({
        _id: new ObjectId(req.userId),
      })

      if (!user) {
        return res.status(404).json({
          error: "user not found",
        })
      }

      return res.status(200).json({
        id: user._id,
        email: user.email,
      })
    } catch (error) {
      console.error("get current user error", error)

      return res.status(500).json({
        error: "internal server error",
      })
    }
  })

  router.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return res.status(200).json({
      message: "logged out sucessfully",
    })
  })

  return router
}
