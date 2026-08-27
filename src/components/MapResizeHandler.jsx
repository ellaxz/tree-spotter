import { useMap } from "react-leaflet"
import { useEffect } from "react"

// tells leaflet to recheck its size when the container resizes
// since leaflet doesnt notice on it own
function MapResizeHandler({ trigger }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 50)

    return () => clearTimeout(timer)
  }, [map, trigger])

  return null
}

export default MapResizeHandler
