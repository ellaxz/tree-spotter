import { useContext } from "react"
import { SavedTreesContext } from "../context/SavedTreesContext"

export default function useSavedTrees() {
  const context = useContext(SavedTreesContext)

  if (context === null) {
    throw new Error("useSavedTrees must be used within SavedTreesProvider")
  }
  return context
}
