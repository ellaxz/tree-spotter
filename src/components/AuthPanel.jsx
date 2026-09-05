import { useState } from "react"

import LoginForm from "./LoginForm.jsx"
import SignupForm from "./SignupForm.jsx"

export default function AuthPanel() {
  //which auth form is currently visible
  const [mode, setMode] = useState("login")

  //message shown after successful signup
  const [message, setMessage] = useState("")

  function handleSignupSuccess() {
    //after signup switch back to login
    setMode("login")

    setMessage("account created. please log in")
  }

  return (
    <div>
      {message && <p>{message}</p>}

      {mode === "login" ? (
        <>
          <LoginForm />

          <button
            type="button"
            onClick={() => {
              setMode("signup")
              setMessage("")
            }}
          >
            sign up
          </button>
        </>
      ) : (
        <>
          <SignupForm onSignupSuccess={handleSignupSuccess} />

          <button
            type="button"
            onClick={() => {
              setMode("login")
              setMessage("")
            }}
          >
            back to log in
          </button>
        </>
      )}
    </div>
  )
}
