import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import RecenterMap from "./components/RecenterMap"
import LocateButton from "./components/LocateButton"

// fix for leaflet's default marker icon not showing up under Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// initial map center, near melbourne cbd for now

const MELBOURNE_CENTER = [-37.808, 144.965]

function App() {
  const [trees, setTrees] = useState([])
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation([lat, lng])

        fetch(`http://localhost:3001/api/trees/nearby?lat=${lat}&lng=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            setTrees(data)
          })
          .catch((err) => console.error("failed to fetch trees:", err))
      },
      (error) => {
        console.error("geolocation failed:", error)
      },
    )
  }, [])

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={userLocation || MELBOURNE_CENTER}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        <RecenterMap position={userLocation} />
        <LocateButton onLocate={setUserLocation} />
        {userLocation && (
          <Circle
            center={userLocation}
            radius={20}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.8 }}
          />
        )}
        <TileLayer
          attribution="&copy;OpenStreetMap contributors"
          url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* render each nearby tree as a map marker */}
        {trees.map((tree) => (
          <Marker key={tree.id} position={[tree.lat, tree.lng]}>
            <Popup>
              <strong>{tree.commonName}</strong>
              <br />
              <em>{tree.scientificName}</em>
              <br />
              Planted:{tree.yearPlanted}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default App
