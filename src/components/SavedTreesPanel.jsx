import useSavedTrees from "../hooks/useSavedTrees.js"

export default function SavedTreesPanel() {
  const { savedTrees, status, error } = useSavedTrees()

  if (status === "loading") {
    return (
      <div className="p-5" role="status">
        Loading saved trees...
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="p-5" role="alert">
        {error}
      </div>
    )
  }

  return (
    <div className="p-5">
      <h2 className="text-heading">Saved trees</h2>
      {status === "success" && savedTrees.length === 0 && (
        <p className="mt-3 text-body-muted">
          No savedd trees yet. Select a tree on the map and tap its bookmark.
        </p>
      )}

      {status === "success" && savedTrees.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {savedTrees.map((tree) => (
            <li key={tree._id} className="py-3">
              <p className="font-medium text-brand">
                {tree.commonName || "Unknown tree"}
              </p>
              <p className="mt-1 text-sm text-text-subtle">
                {tree.scientificName || "Species unavailable"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
