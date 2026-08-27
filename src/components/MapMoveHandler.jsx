import { useMapEvents } from "react-leaflet"

function MapMoveHandler({ onMapMove }) {
  useMapEvents({
    dragend: (e) => {
      const center = e.target.getCenter()
      const zoom = e.target.getZoom()
      onMapMove(center.lat, center.lng, zoom)
    },
    zoomend: (e) => {
      const center = e.target.getCenter()
      const zoom = e.target.getZoom()
      onMapMove(center.lat, center.lng, zoom)
    },
  })
  return null
}

export default MapMoveHandler
