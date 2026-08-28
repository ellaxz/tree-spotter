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
import InitialBoundsHandler from "./components/InitialBoundsHandler"
import MapResizeHandler from "./components/MapResizeHandler"

// fix for leaflet's default marker icon not showing up under Vite/bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// fallback center used before we get the user's real location
const MELBOURNE_CENTER = [-37.808, 144.965]

function App() {
  const [trees, setTrees] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedTree, setSelectedTree] = useState(null)
  const [layoutVersion, setLayoutVersion] = useState(0) // bump this to tell the map to recheck its size

  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState(null)

  // queries trees within the map's current visible rectangle
  function fetchTreesByBounds(bounds) {
    const north = bounds.getNorth()
    const south = bounds.getSouth()
    const east = bounds.getEast()
    const west = bounds.getWest()

    fetch(
      `http://localhost:3001/api/trees/in-bounds?north=${north}&south=${south}&east=${east}&west=${west}`,
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
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error("geolocation failed:", error)
        setLocationError(
          "unable to access your location. you can still explore trees in the default area",
        )
        setIsLoadingLocation(false)
      },
    )
  }, [])

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <TreePine size={20} className="text-green-700" />
        <span className="text-lg font-medium text-gray-900">TreeSpotter</span>
      </header>

      {/* desktop: drag the separator to resize sidebar vs map */}
      <Group
        orientation="horizontal"
        className="flex-1"
        onLayoutChanged={() => setLayoutVersion((v) => v + 1)} // recheck the map size when sidebar width changed
      >
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
          {isLoadingLocation && (
            <div className="absolute inset-0 z-1200 flex items-center justify-center bg-white/70">
              <span className="text-gray-700 text-sm"> locating...</span>
            </div>
          )}

          {!isLoadingLocation && locationError && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-1200 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm px-3 py-2 rounded-md shadow-sm max-w-xs text-center">
              {locationError}
            </div>
          )}

          {selectedTree && (
            <div className="md:hidden absolute bottom-0 left-0 right-0 z-1000 bg-white rounded-t-2xl shadow-lg max-h-[60vh] overflow-y-auto">
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
            <MapMoveHandler onMapMove={fetchTreesByBounds} />
            <InitialBoundsHandler onReady={fetchTreesByBounds} />
            <RecenterMap position={userLocation} />
            <LocateButton onLocate={setUserLocation} />
            <MapResizeHandler trigger={layoutVersion} />
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
