import { useEffect } from "react"
import { useMap } from "react-leaflet"

function RecenterMap({ position, followUser }) {
  const map = useMap()

  useEffect(() => {
    if (!position || !followUser) return

    map.setView(position)
  }, [map, position, followUser])

  return null
}

export default RecenterMap
