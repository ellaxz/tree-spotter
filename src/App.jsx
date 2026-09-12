import { TreePine, UserRound } from "lucide-react"
import { useState } from "react"
import { Group, Panel, Separator } from "react-resizable-panels"

import TreeInfoPanel from "./components/TreeInfoPanel"

import TreeMap from "./components/TreeMap.jsx"

import useGeolocation from "./hooks/useGeolocation.js"
import useTreesInBounds from "./hooks/useTreesInBounds.js"
import { useAuth } from "./context/AuthContext.jsx"
import useIsDesktop from "./hooks/useIsDesktop.js"
import LocationStatus from "./components/LocationStatus.jsx"
import AuthDialog from "./components/AuthDialog.jsx"
import MobileAuthSheet from "./components/MobileAuthSheet.jsx"

function App() {
  const { user, loading, logout } = useAuth()
  const isDesktop = useIsDesktop()

  const { trees, fetchTreesByBounds } = useTreesInBounds()
  const [selectedTree, setSelectedTree] = useState(null)
  const [layoutVersion, setLayoutVersion] = useState(0) // bump this to tell the map to recheck its size
  const [authOpen, setAuthOpen] = useState(false)

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
    <div className="h-dvh w-full overflow-hidden">
      {isDesktop ? (
        <div className="flex h-full flex-col">
          <header className="app-header">
            <TreePine size={20} className="text-brand" />

            <span className="text-heading">TreeSpotter</span>

            {user ? (
              <div className="ml-auto flex items-center gap-3">
                <span className="ml-auto text-sm text-text-muted">
                  logged in as {user.email}
                </span>

                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-brand hover:underline"
                >
                  log out
                </button>
              </div>
            ) : (
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Log in
                </button>
              </div>
            )}
          </header>

          <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />

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
              <LocationStatus
                loading={isLoadingLocation}
                error={locationError}
              />

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
      ) : (
        <div className="flex h-full w-full flex-col">
          <div className="mobile-header">
            <div className="flex items-center gap-2">
              <TreePine size={20} className="text-brand" />
              <span className="text-heading">TreeSpotter</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedTree(null)
                setAuthOpen(true)
              }}
              className={
                user
                  ? "mobile-account-button mobile-account-button-signed-in"
                  : "mobile-account-button"
              }
              aria-label="Open account"
            >
              {user ? (
                <span>{user.email[0].toUpperCase()}</span>
              ) : (
                <UserRound size={20} />
              )}
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <LocationStatus loading={isLoadingLocation} error={locationError} />

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

            <MobileAuthSheet
              open={authOpen}
              user={user}
              onClose={() => setAuthOpen(false)}
              onLogout={logout}
            />

            {selectedTree && (
              <div className="mobile-tree-panel">
                <TreeInfoPanel
                  tree={selectedTree}
                  onClose={() => setSelectedTree(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default App
