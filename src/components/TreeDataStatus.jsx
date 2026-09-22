function TreeDataStatus({ error }) {
  if (!error) {
    return null
  }

  return (
    <div className="tree-error-banner" role="alert">
      unable to update trees. showing previous results
    </div>
  )
}

export default TreeDataStatus
