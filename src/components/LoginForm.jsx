import { useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"

export default function LoginForm() {
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError("")

    if (!email.includes("@")) {
      setError("Please enter a valid email.")
      setSubmitting(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      setSubmitting(false)
      return
    }
    setSubmitting(true)

    try {
      await login(email, password)
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-field">
        <label htmlFor="login-email">Email</label>

        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div className="auth-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" disabled={submitting} className="auth-submit">
        {submitting ? "Logging in ..." : "Log in"}
      </button>
    </form>
  )
}
