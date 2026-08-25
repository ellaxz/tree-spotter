function TreeInfoPanel({ tree, onClose }) {
  if (!tree) {
    return (
      <div style={{ padding: "16ps" }}>
        <p>click a tree on the map to see details</p>
      </div>
    )
  }

  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${tree.lat},${tree.lng}`
  return (
    <div
      style={{
        padding: "16px",
        height: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 border-none bg-transparent text-lg cursor-pointer"
      >
        ✕
      </button>
      <h3>{tree.commonName}</h3>
      <p>
        <em>{tree.scientificName}</em>
      </p>
      <p>Planted: {tree.yearPlanted}</p>
      <p>Life expectancy: {tree.usefulLifeExpectancy}</p>
      <p>Precinct: {tree.precinct}</p>
      <p>
        <a href={streetViewUrl} target="_blank" rel="noopener noreferrer">
          View on Street View
        </a>
        <br />
        <small style={{ color: "#888" }}>
          Street View imagery may not reflect the tree's current appearance
        </small>
      </p>
    </div>
  )
}

export default TreeInfoPanel
