import { createContext, useContext, useEffect, useState } from "react"
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  loginWithGoogle as googleLoginRequest,
} from "../api/auth.js"
import { signInWithPopup, signOut } from "firebase/auth"
import { googleProvider } from "../firebase.js"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("failed to load current user", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  async function login(email, password) {
    const user = await loginRequest(email, password)
    setUser(user)
    return user
  }

  async function loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      const currentUser = await googleLoginRequest(idToken)

      setUser(currentUser)
      return currentUser
    } finally {
      await signOut(auth).catch(() => {})
    }
  }
  async function register(email, password) {
    const user = await registerRequest(email, password)
    return user
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
