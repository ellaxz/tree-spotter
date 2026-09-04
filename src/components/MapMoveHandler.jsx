import { useMapEvents } from "react-leaflet"

function MapMoveHandler({ onMapMove, onUserMove }) {
  useMapEvents({
    dragstart: () => {
      onUserMove?.()
    },

    dragend: (e) => {
      const bounds = e.target.getBounds()

      // dragging doesn't change zoom but we still read the current
      // zoom level off the map instance for consistency
      const zoom = e.target.getZoom()

      onMapMove(bounds, zoom)
    },

    zoomend: (e) => {
      const bounds = e.target.getBounds()
      const zoom = e.target.getZoom()

      onMapMove(bounds, zoom)
    },
  })
  return null
}

export default MapMoveHandler
