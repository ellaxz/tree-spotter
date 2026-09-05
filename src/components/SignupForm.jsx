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
      setError("please enter a valid email")
      return
    }

    if (password.length < 8) {
      setError("password must be at least 8 characters")
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
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        autoComplete="email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="password"
        autoComplete="new-password"
        required
      />

      {error && <p>{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "signing up..." : "sign up"}
      </button>
    </form>
  )
}
