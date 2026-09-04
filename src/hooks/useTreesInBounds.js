import { useEffect, useRef, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL

export default function useTreesInBounds() {
  const [trees, setTrees] = useState([])

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
      return
    }

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
      .then((res) => res.json())
      .then((data) => {
        // if (requestId !== latestRequestId.current) return

        setTrees(data)
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return
        }
        console.error("failed to fetch trees:", error)
      })
  }
  return { trees, fetchTreesByBounds }
}
