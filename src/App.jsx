import { TreePine } from "lucide-react"
import { useState } from "react"
import { Group, Panel, Separator } from "react-resizable-panels"

import TreeInfoPanel from "./components/TreeInfoPanel"
import LoginForm from "./components/LoginForm.jsx"
import TreeMap from "./components/TreeMap.jsx"

import useGeolocation from "./hooks/useGeolocation.js"
import useTreesInBounds from "./hooks/useTreesInBounds.js"
import { useAuth } from "./context/AuthContext.jsx"

function App() {
  const { user, loading } = useAuth()

  const { trees, fetchTreesByBounds } = useTreesInBounds()
  const [selectedTree, setSelectedTree] = useState(null)
  const [layoutVersion, setLayoutVersion] = useState(0) // bump this to tell the map to recheck its size

  const {
    userLocation,
    isLoadingLocation,
    locationError,
    followUser,
    setFollowUser,
    locateNow,
  } = useGeolocation()

  const handleLayoutChanged = () => {
    setLayoutVersion((v) => v + 1)
  }

  const handleUserMove = () => {
    setFollowUser(false)
  }

  if (loading) {
    return <p>checking session..</p>
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="app-header">
        <TreePine size={20} className="text-brand" />

        <span className="text-heading">TreeSpotter</span>

        {user ? (
          <span className="ml-auto text-sm text-text-muted">
            logged in as {user.email}
          </span>
        ) : (
          <div className="ml-auto">
            <LoginForm />
          </div>
        )}
      </header>

      {/* desktop: drag the separator to resize sidebar vs map */}
      <Group
        orientation="horizontal"
        className="flex-1"
        onLayoutChanged={handleLayoutChanged} // recheck the map size when sidebar width changed
      >
        <Panel
          defaultSize="20%"
          minSize="15%"
          maxSize="40%"
          className="desktop-tree-panel"
        >
          <TreeInfoPanel
            tree={selectedTree}
            onClose={() => setSelectedTree(null)}
          />
        </Panel>
        <Separator className="resize-separator" />

        <Panel className="relative">
          {isLoadingLocation && (
            <div className="location-loading-overlay">
              <span className="text-text-muted text-sm"> locating...</span>
            </div>
          )}

          {!isLoadingLocation && locationError && (
            <div className="location-error-banner">{locationError}</div>
          )}

          {selectedTree && (
            <div className="mobile-tree-panel">
              <TreeInfoPanel
                tree={selectedTree}
                onClose={() => setSelectedTree(null)}
              />
            </div>
          )}

          <TreeMap
            trees={trees}
            selectedTree={selectedTree}
            onSelectTree={setSelectedTree}
            userLocation={userLocation}
            followUser={followUser}
            onUserMove={handleUserMove}
            onLocate={locateNow}
            fetchTreesByBounds={fetchTreesByBounds}
            layoutVersion={layoutVersion}
          />
        </Panel>
      </Group>
    </div>
  )
}

export default App
