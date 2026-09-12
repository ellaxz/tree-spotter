function LocationStatus({ loading, error }) {
  //show a loading overlay while the browser is trying to get the user's location
  if (loading) {
    return (
      <div className="location-loading-status">
        <span>locating...</span>
      </div>
    )
  }

  //show an error message only when loading has finished and an error exists
  if (error) {
    return <div className="location-error-banner">{error}</div>
  }

  //nothing to show when location is ready and no error
  return null
}

export default LocationStatus
