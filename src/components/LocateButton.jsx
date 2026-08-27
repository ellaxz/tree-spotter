import { useMap } from "react-leaflet"

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
      className="absolute bottom-6 right-6 z-1000 w-11 h-11 rounded-full border-none bg-white shadow-lg cursor-pointer flex items-center justify-center"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4285F4"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    </button>
  )
}

export default LocateButton
