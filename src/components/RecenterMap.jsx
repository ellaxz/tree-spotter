import { useEffect } from "react"
import { useMap } from "react-leaflet"

function RecenterMap({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom())
    }
  }, [position, map])

  return null
}

export default RecenterMap
