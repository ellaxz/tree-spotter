import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function SignupForm({ onSignupSuccess }) {
  const { register } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError("")

    if (!email.includes("@")) {
      setError("Please enter a valid email.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setSubmitting(true)

    try {
      await register(email, password)
      setEmail("")
      setPassword("")

      onSignupSuccess?.()
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />{" "}
      </div>

      <div className="auth-field">
        <label htmlFor="signup-password">Password</label>

        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={submitting} className="auth-submit">
        {submitting ? "Signing up..." : "Sign up"}
      </button>
    </form>
  )
}
