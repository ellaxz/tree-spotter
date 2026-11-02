import { useEffect, useState } from "react"
import { useAuth } from "./AuthContext"
import { SavedTreesContext } from "./SavedTreesContext"
import { getSavedTrees } from "../api/savedTrees"

export default function SavedTreesProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [state, setState] = useState({
    userId,
    trees: [],
    status: userId ? "loading" : "idle",
    error: null,
  })

  let currentState = state
  if (state.userId !== userId) {
    currentState = {
      userId,
      trees: [],
      status: userId ? "loading" : "idle",
      error: null,
    }
    setState(currentState)
  }

  useEffect(() => {
    if (!userId) return
    let active = true

    async function loadSavedTrees() {
      try {
        const trees = await getSavedTrees()

        if (!Array.isArray(trees)) {
          throw new Error("invalid saved trees response")
        }

        if (!active) return
        setState({
          userId,
          trees,
          status: "success",
          error: null,
        })
      } catch (error) {
        if (!active) return
        console.error("failed to load saved trees", error)

        setState({
          userId,
          trees: [],
          status: "error",
          error: "could not load your saved trees",
        })
      }
    }
    loadSavedTrees()

    return () => {
      active = false
    }
  }, [userId])

  return (
    <SavedTreesContext.Provider
      value={{
        savedTrees: currentState.trees,
        status: currentState.status,
        error: currentState.error,
      }}
    >
      {children}
    </SavedTreesContext.Provider>
  )
}
