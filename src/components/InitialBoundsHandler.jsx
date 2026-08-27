import { useEffect } from "react"
import { useMap } from "react-leaflet"

function InitialBoundsHandler({ onReady }) {
  const map = useMap()

  useEffect(() => {
    const bounds = map.getBounds()
    onReady(bounds)
  }, [map])

  return null
}

export default InitialBoundsHandler
