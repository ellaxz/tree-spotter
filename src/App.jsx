import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet"
import { TreePine } from "lucide-react"
import "leaflet/dist/leaflet.css"

import { useEffect, useState, useRef } from "react"
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
import { useAuth } from "./context/AuthContext.jsx"

// fallback center used before we get the user's real location
const MELBOURNE_CENTER = [-37.808, 144.965]

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const { user, loading } = useAuth()

  const [trees, setTrees] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [selectedTree, setSelectedTree] = useState(null)
  const [layoutVersion, setLayoutVersion] = useState(0) // bump this to tell the map to recheck its size

  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const latestRequestId = useRef(0)

  function normalizeLng(lng) {
    return ((((lng + 180) % 360) + 360) % 360) - 180
  }

  function clampLat(lat) {
    return Math.max(-90, Math.min(90, lat))
  }

  // query trees within the map's current visible bounds
  function fetchTreesByBounds(bounds, zoom) {
    if (zoom < 10) {
      setTrees([])
      return
    }

    const north = clampLat(bounds.getNorth())
    const south = clampLat(bounds.getSouth())
    const east = normalizeLng(bounds.getEast())
    const west = normalizeLng(bounds.getWest())

    const requestId = ++latestRequestId.current

    fetch(
      `${API_URL}/api/trees/in-bounds?north=${north}&south=${south}&east=${east}&west=${west}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (requestId !== latestRequestId.current) return

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

  if (loading) {
    return <p>checking session..</p>
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <TreePine size={20} className="text-green-700" />
        <span className="text-lg font-medium text-gray-900">TreeSpotter</span>
        <span className="ml-auto text-sm text-gray-600">
          {user ? `logged in as ${user.email}` : "not logged in"}
        </span>
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
                  color: "#7fa8b3",
                  fillColor: "#7fa8b3",
                  fillOpacity: 0.8,
                }}
              />
            )}
            <TileLayer
              attribution="&copy;OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* render each nearby tree as a map marker */}
            <MarkerClusterGroup
              disableClusteringAtZoom={16}
              maxZoom={19}
              spiderfyOnMaxZoom={false}
              zoomToBoundsOnClick={true}
            >
              {trees.map((tree) => {
                const isSelected = selectedTree?._id === tree._id
                return (
                  <CircleMarker
                    key={tree._id}
                    center={[
                      tree.location.coordinates[1],
                      tree.location.coordinates[0],
                    ]}
                    radius={isSelected ? 7 : 4}
                    pathOptions={{
                      color: isSelected ? "#C87941" : "#58735F",
                      fillColor: isSelected ? "#C87941" : "#58735F",
                      fillOpacity: isSelected ? 0.9 : 0.6,
                      weight: isSelected ? 2 : 1,
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
