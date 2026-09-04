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

  if (loading) {
    return <p>checking session..</p>
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <header className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <TreePine size={20} className="text-green-700" />

        <span className="text-lg font-medium text-gray-900">TreeSpotter</span>

        {user ? (
          <span className="ml-auto text-sm text-gray-600">
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

          <TreeMap
            trees={trees}
            selectedTree={selectedTree}
            onSelectTree={setSelectedTree}
            userLocation={userLocation}
            followUser={followUser}
            onUserMove={() => setFollowUser(false)}
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
