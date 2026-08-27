import { useMapEvents } from "react-leaflet"

function MapMoveHandler({ onMapMove }) {
  useMapEvents({
    dragend: (e) => {
      const bounds = e.target.getBounds()
      onMapMove(bounds)
    },
    zoomend: (e) => {
      const bounds = e.target.getBounds()
      onMapMove(bounds)
    },
  })
  return null
}

export default MapMoveHandler
