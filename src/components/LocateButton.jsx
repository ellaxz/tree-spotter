import { useMap } from "react-leaflet"
import { LocateFixed } from "lucide-react"

function LocateButton({ onLocate }) {
  const map = useMap()

  function handleClick() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        map.setView([lat, lng], map.getZoom())
        onLocate([lat, lng])
      },
      (error) => {
        console.error("geolocation failed:", error)
      },
    )
  }

  return (
    <button
      onClick={handleClick}
      aria-label="locate me"
      className="absolute bottom-6 right-6 z-1000 w-11 h-11 rounded-full border-none bg-white shadow-lg cursor-pointer flex items-center justify-center"
    >
      <LocateFixed size={20} strokeWidth={1.8} className="text-brand" />
    </button>
  )
}

export default LocateButton
