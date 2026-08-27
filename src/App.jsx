import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet"
import { TreePine } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { Group, Panel, Separator } from "react-resizable-panels"

import RecenterMap from "./components/RecenterMap"
import LocateButton from "./components/LocateButton"
import TreeInfoPanel from "./components/TreeInfoPanel"
import MapMoveHandler from "./components/MapMoveHandler"

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

// convert the map's zoom level in meters to avoid showing a mostly empty map
function getRadiusForZoom(zoom) {
  if (zoom >= 16) return 1000
  if (zoom >= 14) return 3000
  if (zoom >= 12) return 8000
  if (zoom >= 10) return 20000
  return 40000
}

function App() {
  const [trees, setTrees] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedTree, setSelectedTree] = useState(null)

  function fetchNearbyTrees(lat, lng, zoom) {
    const radius = getRadiusForZoom(zoom)

    fetch(
      `http://localhost:3001/api/trees/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setTrees(data)
      })
      .catch((err) => console.error("failed to fetch trees:", err))
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation([lat, lng])
        fetchNearbyTrees(lat, lng, 16)
      },
      (error) => {
        console.error("geolocation failed:", error)
      },
    )
  }, [])

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <TreePine size={20} className="text-green-700" />
        <span className="text-lg font-medium text-gray-900">TreeSpotter</span>
      </header>

      <Group orientation="horizontal" className="flex-1">
        <Panel
          defaultSize="20%"
          minSize="15%"
          maxSize="40%"
          className="hidden md:block border-r border-gray-200"
        >
          <TreeInfoPanel
            tree={selectedTree}
            onClose={() => setSelectedTree(null)}
          />
        </Panel>
        <Separator className="hidden md:block w-1 bg-gray-200 hover:bg-green-600 cursor-col-resize transition-colors" />

        <Panel className="relative">
          {selectedTree && (
            <div className="md:hidden absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-lg max-h-[60vh] overflow-y-auto">
              <TreeInfoPanel
                tree={selectedTree}
                onClose={() => setSelectedTree(null)}
              />
            </div>
          )}
          <MapContainer
            center={userLocation || MELBOURNE_CENTER}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
          >
            <MapMoveHandler onMapMove={fetchNearbyTrees} />
            <RecenterMap position={userLocation} />
            <LocateButton onLocate={setUserLocation} />
            {userLocation && (
              <Circle
                center={userLocation}
                radius={20}
                pathOptions={{
                  color: "red",
                  fillColor: "red",
                  fillOpacity: 0.8,
                }}
              />
            )}
            <TileLayer
              attribution="&copy;OpenStreetMap contributors"
              url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* render each nearby tree as a map marker */}
            <MarkerClusterGroup disableClusteringAtZoom={16}>
              {trees.map((tree) => {
                const isSelected = selectedTree && selectedTree.id === tree.id
                return (
                  <CircleMarker
                    key={tree.id}
                    center={[tree.lat, tree.lng]}
                    radius={isSelected ? 12 : 7}
                    pathOptions={{
                      color: "white",
                      weight: 2,
                      fillColor: isSelected ? "#FF5722" : "#2E7D32",
                      fillOpacity: 0.9,
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedTree(tree)
                      },
                    }}
                  />
                )
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </Panel>
      </Group>
    </div>
  )
}

export default App
