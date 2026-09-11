import { useEffect, useState } from "react"

import LoginForm from "./LoginForm.jsx"
import SignupForm from "./SignupForm.jsx"
import { useAuth } from "../context/AuthContext.jsx"

export default function AuthPanel({ onAuthSuccess }) {
  //which auth form is currently visible
  const [mode, setMode] = useState("login")

  //message shown after successful signup
  const [message, setMessage] = useState("")

  //read the authenticated user from the shared auth context
  const { user } = useAuth()

  //notify the parent after a successful login
  useEffect(() => {
    if (user) {
      onAuthSuccess?.(user)
    }
  }, [user, onAuthSuccess])

  function handleSignupSuccess() {
    //after signup switch back to login
    setMode("login")

    setMessage("Account created. Please log in.")
  }

  return (
    <div className="auth-panel">
      <div className="auth-header">
        <h2 className="auth-title">
          {mode === "login" ? "Log in" : "Create an account"}
        </h2>
        <p className="auth-description">
          {mode === "login"
            ? "Continue exploring Melbourne's trees."
            : "Create an account to continue with TreeSpotter."}
        </p>
      </div>

      {message && <p className="auth-success">{message}</p>}

      {mode === "login" ? (
        <>
          <LoginForm />
          <p className="auth-switch">
            New here?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup")
                setMessage("")
              }}
            >
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <SignupForm onSignupSuccess={handleSignupSuccess} />
          <p className="auth-switch">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login")
                setMessage("")
              }}
            >
              Log in
            </button>
          </p>
        </>
      )}
    </div>
  )
}
