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

  // query trees within the map's current visible bounds
  function fetchTreesByBounds(bounds, zoom) {
    clearTimeout(fetchTimerRef.current)

    fetchTimerRef.current = setTimeout(() => {
      loadTreesByBounds(bounds, zoom)
    }, 120)
  }

  function loadTreesByBounds(bounds, zoom) {
    if (zoom < 13) {
      setTrees([])
      setTreesError(null)
      return
    }

    setTreesError(null)

    //cancel the previous request before starting a new one
    abortControllerRef.current?.abort()

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
