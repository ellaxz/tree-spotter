import { TreePine, UserRound, Bookmark, X } from "lucide-react"
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
import TreeDataStatus from "./components/TreeDataStatus.jsx"
import SavedTreesPanel from "./components/SavedTreesPanel.jsx"
import useSavedTrees from "./hooks/useSavedTrees.js"

function App() {
  const { user, loading, logout } = useAuth()
  const isDesktop = useIsDesktop()

  const { trees, treesError, fetchTreesByBounds } = useTreesInBounds()
  const [selectedTree, setSelectedTree] = useState(null)
  const [layoutVersion, setLayoutVersion] = useState(0) // bump this to tell the map to recheck its size
  const [authOpen, setAuthOpen] = useState(false)
  const [panelView, setPanelView] = useState("tree")
  const { savedTrees, status: savedStatus } = useSavedTrees()

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

  function handleSelectTree(tree) {
    setSelectedTree(tree)
    setPanelView("tree")
  }

  function handleGoHome() {
    setSelectedTree(null)
    setPanelView("tree")
    setAuthOpen(false)
  }

  if (loading) {
    return <p>checking session..</p>
  }

  return (
    <div className="h-dvh w-full overflow-hidden">
      {isDesktop ? (
        <div className="flex h-full flex-col">
          <header className="app-header">
            <button
              type="button"
              onClick={handleGoHome}
              aria-label="TreeSpotter home"
              className="inline-flex items-center gap-2 rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <TreePine size={20} className="text-brand" aria-hidden="true" />
              <span className="text-heading">TreeSpotter</span>
            </button>

            {user ? (
              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setPanelView((previous) =>
                      previous === "saved" ? "tree" : "saved",
                    )
                  }
                  aria-pressed={panelView === "saved"}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    panelView === "saved"
                      ? "border-brand bg-brand text-white"
                      : "border-brand/30 bg-brand/10 text-brand hover:bg-brand/20"
                  }`}
                >
                  <Bookmark size={17} aria-hidden="true" />
                  <span>Saved trees</span>
                  {savedStatus === "success" && (
                    <span>{savedTrees.length}</span>
                  )}
                </button>
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
              {panelView === "saved" && user ? (
                <SavedTreesPanel />
              ) : (
                <TreeInfoPanel
                  tree={selectedTree}
                  onClose={() => selectedTree(null)}
                />
              )}
            </Panel>

            <Separator className="resize-separator" />

            <Panel className="relative">
              <div className="map-status-stack">
                <LocationStatus
                  loading={isLoadingLocation}
                  error={locationError}
                />
                <TreeDataStatus error={treesError} />
              </div>

              <TreeMap
                trees={trees}
                selectedTree={selectedTree}
                onSelectTree={handleSelectTree}
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
            <button
              type="button"
              onClick={handleGoHome}
              aria-label="TreeSpotter home"
              className="inline-flex items-center gap-2 rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <TreePine size={20} className="text-brand" aria-hidden="true" />
              <span className="text-heading">TreeSpotter</span>
            </button>

            {user && (
              <button
                type="button"
                onClick={() => {
                  setAuthOpen(false)
                  setPanelView((previous) =>
                    previous === "saved" ? "tree" : "saved",
                  )
                }}
                aria-pressed={panelView === "saved"}
                className="inline-flex items-center gap-1 rounded-lg border border-brand/30 px-2 py-2 text-sm text-brandinline-flex items-center gap-1 rounded-lg border border"
              >
                <Bookmark size={18} aria-hidden="true" />
                <span>Saved</span>
              </button>
            )}

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
            <div className="map-status-stack">
              <LocationStatus
                loading={isLoadingLocation}
                error={locationError}
              />
              <TreeDataStatus error={treesError} />
            </div>

            <TreeMap
              trees={trees}
              selectedTree={selectedTree}
              onSelectTree={handleSelectTree}
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

            {panelView === "saved" && user && !authOpen ? (
              <div className="mobile-tree-panel overflow-y-auto">
                <div className="sticky top-0 z-10 h-0 pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setPanelView("tree")}
                    aria-label="Close saved trees"
                    className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-brand shadow-sm pointer-events-auto hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                <SavedTreesPanel />
              </div>
            ) : selectedTree && !authOpen ? (
              <div className="mobile-tree-panel">
                <TreeInfoPanel
                  tree={selectedTree}
                  onClose={() => setSelectedTree(null)}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
export default App
