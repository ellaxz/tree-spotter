import { useEffect } from "react"
import { useMap } from "react-leaflet"

function InitialBoundsHandler({ onReady }) {
  const map = useMap()

  useEffect(() => {
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    onReady(bounds, zoom)
  }, [map])

  return null
}

export default InitialBoundsHandler
