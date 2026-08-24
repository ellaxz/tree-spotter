function TreeInfoPanel({ tree, onClose }) {
  if (!tree) {
    return (
      <div style={{ padding: "16ps" }}>
        <p>click a tree on the map to see details</p>
      </div>
    )
  }
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
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          border: "none",
          background: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
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
    </div>
  )
}

export default TreeInfoPanel
