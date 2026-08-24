function TreeInfoPanel({ tree, onClose }) {
  if (!tree) {
    return null
  }
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        maxWidth: "280px",
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
