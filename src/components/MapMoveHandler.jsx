import { useMapEvents } from "react-leaflet"

function MapMoveHandler({ onMapMove }) {
  useMapEvents({
    dragend: (e) => {
      const center = e.target.getCenter()
      onMapMove(center.lat, center.lng)
    },
    zoomend: (e) => {
      const center = e.target.getCenter()
      onMapMove(center.lat, center.lng)
    },
  })
  return null
}

export default MapMoveHandler
