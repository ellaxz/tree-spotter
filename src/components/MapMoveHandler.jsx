import { useMapEvents } from "react-leaflet"

function MapMoveHandler({ onMapMove, onUserMove }) {
  useMapEvents({
    dragstart: () => {
      onUserMove?.()
    },

    moveend: (e) => {
      const bounds = e.target.getBounds()
      const zoom = e.target.getZoom()

      onMapMove(bounds, zoom)
    },
  })
  return null
}

export default MapMoveHandler
