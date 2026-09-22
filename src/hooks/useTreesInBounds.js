import { useEffect, useRef, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL

export default function useTreesInBounds() {
  const [trees, setTrees] = useState([])
  const [treesError, setTreesError] = useState(null)

  const abortControllerRef = useRef(null)
  const fetchTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      clearTimeout(fetchTimerRef.current)
      abortControllerRef.current?.abort()
    }
  }, [])

  function normalizeLng(lng) {
    return ((((lng + 180) % 360) + 360) % 360) - 180
  }

  function clampLat(lat) {
    return Math.max(-90, Math.min(90, lat))
  }

  function fetchTreesByBounds(bounds, zoom) {
    clearTimeout(fetchTimerRef.current)

    // cancel the request for the previous map view
    abortControllerRef.current?.abort()
    abortControllerRef.current = null

    // avoid large queries when zoomed out
    if (zoom < 13) {
      setTrees([])
      setTreesError(null)
      return
    }

    setTreesError(null)

    // debounce rapid map movements
    fetchTimerRef.current = setTimeout(() => {
      loadTreesByBounds(bounds)
    }, 120)
  }

  function loadTreesByBounds(bounds) {
    const controller = new AbortController()
    abortControllerRef.current = controller

    const north = clampLat(bounds.getNorth())
    const south = clampLat(bounds.getSouth())
    const east = normalizeLng(bounds.getEast())
    const west = normalizeLng(bounds.getWest())

    fetch(
      `${API_URL}/api/trees/in-bounds?north=${north}&south=${south}&east=${east}&west=${west}`,
      {
        signal: controller.signal,
      },
    )
      .then(async (res) => {
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch trees")
        }
        return data
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid tree data received")
        }

        setTrees(data)
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return
        }
        console.error("failed to fetch trees:", error)
        setTreesError(error.message)
      })
  }
  return { trees, treesError, fetchTreesByBounds }
}
