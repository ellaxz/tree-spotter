import { MapContainer, TileLayer, CircleMarker, Circle } from "react-leaflet"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet/dist/leaflet.css"
import MarkerClusterGroup from "react-leaflet-cluster"

import MapMoveHandler from "./MapMoveHandler"
import InitialBoundsHandler from "./InitialBoundsHandler"
import MapResizeHandler from "./MapResizeHandler"
import RecenterMap from "./RecenterMap"
import LocateButton from "./LocateButton"

// fallback center used before we get the user's real location
const MELBOURNE_CENTER = [-37.808, 144.965]

function TreeMap({
  trees,
  selectedTree,
  onSelectTree,
  userLocation,
  followUser,
  onUserMove,
  onLocate,
  fetchTreesByBounds,
  layoutVersion,
}) {
  return (
    <MapContainer
      center={userLocation || MELBOURNE_CENTER}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
    >
      <MapMoveHandler onMapMove={fetchTreesByBounds} onUserMove={onUserMove} />
      <InitialBoundsHandler onReady={fetchTreesByBounds} />
      <RecenterMap position={userLocation} followUser={followUser} />
      <LocateButton onLocate={onLocate} />
      <MapResizeHandler trigger={layoutVersion} />
      {userLocation && (
        <>
          <Circle
            center={userLocation}
            radius={30}
            pathOptions={{
              color: "#3B82F6",
              fillColor: "#3B82F6",
              fillOpacity: 0.12,
              weight: 1,
            }}
          />
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              color: "#FFFFFF",
              fillColor: "#2563EB",
              fillOpacity: 1,
              weight: 3,
            }}
          />
        </>
      )}
      <TileLayer
        attribution="&copy;OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* render each nearby tree as a map marker */}
      <MarkerClusterGroup
        disableClusteringAtZoom={18}
        maxClusterRadius={60}
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
                  onSelectTree(tree)
                },
              }}
            />
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default TreeMap
