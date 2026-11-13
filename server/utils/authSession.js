import jwt from "jsonwebtoken"

const AUTH_COOKIE = "__session"
const SESSION_MAX_AGE = 60 * 60 * 1000

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  }
}

export function createSession(res, userId) {
  const token = jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  )

  res.cookie(AUTH_COOKIE, token, {
    ...cookieOptions(),
    maxAge: SESSION_MAX_AGE,
  })
}

export function clearSession(res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions())
}
