import { useEffect, useRef } from "react"
import L from "leaflet"
import { LocateFixed } from "lucide-react"

function LocateButton({ onLocate }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!buttonRef.current) return

    L.DomEvent.disableClickPropagation(buttonRef.current)
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onLocate}
      aria-label="locate me"
      className="absolute bottom-6 right-6 z-1000 w-11 h-11 rounded-full border-none bg-white shadow-lg cursor-pointer flex items-center justify-center"
    >
      <LocateFixed size={20} strokeWidth={1.8} className="text-brand" />
    </button>
  )
}

export default LocateButton
