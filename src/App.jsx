import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { fakeTrees } from "./data/fakeTrees"

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
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={MELBOURNE_CENTER}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy;OpenStreetMap contributors"
          url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* turn each tree in fake trees into a map marker */}
        {fakeTrees.map((tree) => (
          <Marker key={tree.id} position={[tree.lat, tree.lng]}>
            <Popup>
              <strong>{tree.commonName}</strong>
              <br />
              <em>{tree.scientificName}</em>
              <br />
              Planted:{tree.plantedYear}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default App
