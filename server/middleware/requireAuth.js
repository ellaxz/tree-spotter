import jwt from "jsonwebtoken"

export default function requireAuth(req, res, next) {
  //read the JWT from httpOnly cookie
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({
      error: "authentication required",
    })
  }

  try {
    // verify the token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    //attach the authenticated user's id to the request
    req.userId = decoded.userId

    next()
  } catch (error) {
    return res.status(401).json({
      error: "invalid or expired session",
    })
  }
}
