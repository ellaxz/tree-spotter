import express from "express"
import bcrypt from "bcrypt"

import { ObjectId } from "mongodb"

import requireAuth from "../middleware/requireAuth.js"
import { clearSession, createSession } from "../utils/authSession.js"
import findOrCreateGoogleUser from "../services/findOrCreateGoogleUser.js"
import { firebaseAuth } from "../firebaseAdmin.js"

export default function createAuthRouter(usersCollection) {
  const router = express.Router()

  router.post("/google", async (req, res) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://treespotter.web.app",
    ]

    if (!allowedOrigins.includes(req.get("origin"))) {
      return res.status(403).json({
        error: "request origin not allowed",
      })
    }

    const { idToken } = req.body ?? {}

    if (typeof idToken !== "string" || !idToken) {
      return res.status(400).json({
        error: "google id token is required",
      })
    }
    let decoded

    try {
      decoded = await firebaseAuth.verifyIdToken(idToken)
    } catch (error) {
      console.error("Google token verification failed", error.message)

      return res.status(401).json({
        error: "Google sign-in failed. Please try again.",
      })
    }

    if (
      decoded.firebase?.sign_in_provider !== "google.com" ||
      decoded.email_verified !== true ||
      typeof decoded.email !== "string"
    ) {
      return res.status(401).json({
        error: "a verified Google account is required",
      })
    }

    try {
      const user = await findOrCreateGoogleUser(usersCollection, {
        uid: decoded.uid,
        email: decoded.email,
      })

      createSession(res, user._id)

      return res.status(200).json({
        id: user._id,
        email: user.email,
      })
    } catch (error) {
      if (error.status === 409) {
        return res.status(409).json({
          error: error.message,
        })
      }

      console.error("Google login error", error)

      return res.status(500).json({
        error: "internal server error",
      })
    }
  })

  router.post("/register", async (req, res) => {
    try {
      // read user input from the request body
      const { email, password } = req.body ?? {}

      // validate input types before calling string methods
      if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({
          error: "email and password must be strings",
        })
      }

      const normalizedEmail = email.trim().toLowerCase()

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          error: "please enter a valid email address",
        })
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: "password must be at least 8 characters",
        })
      }

      // bcrypt only uses the first 72 bytes of a password
      if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({
          error: "password must not exceed 72 bytes",
        })
      }

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
      const { email, password } = req.body ?? {}

      if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({
          error: "email and password must be strings",
        })
      }

      const normalizedEmail = email.trim().toLowerCase()

      if (!normalizedEmail || !password) {
        return res.status(400).json({
          error: "email and password are required",
        })
      }
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

      createSession(res, user._id)

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
    clearSession(res)

    return res.status(200).json({
      message: "logged out successfully",
    })
  })

  return router
}
