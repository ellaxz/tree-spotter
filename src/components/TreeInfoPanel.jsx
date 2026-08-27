import { useEffect, useRef, useState } from "react"

function TreeInfoPanel({ tree, onClose }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [isLoadingImage, setIsLoadingImage] = useState(true)
  const imageCache = useRef({})

  // two step look up
  // search first then fectch summary by the matched title
  useEffect(() => {
    if (!tree) return
    // clear the previous tree's image before fetching the new one
    setImageUrl(null)
    setIsLoadingImage(true)

    //if we've already lookup up this species, use the cached result
    if (imageCache.current[tree.scientificName] !== undefined) {
      setImageUrl(imageCache.current[tree.scientificName])
      setIsLoadingImage(false)
      return
    }

    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(tree.scientificName)}&format=json&origin=*`,
    )
      .then((res) => res.json())
      .then((searchData) => {
        const results = searchData.query.search
        if (results.length === 0) return

        const pageTitle = results[0].title

        return fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
        )
          .then((res) => res.json())
          .then((data) => {
            const foundUrl = data.thumbnail ? data.thumbnail.source : null
            imageCache.current[tree.scientificName] = foundUrl
            setImageUrl(foundUrl)
          })
          .catch((err) => {
            console.error("failed to fetch tree image:", err)
          })
          .finally(() => {
            setIsLoadingImage(false)
          })
      })
  }, [tree])

  if (!tree) {
    return (
      <div className="p-4">
        <p>click a tree on the map to see details</p>
      </div>
    )
  }

  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${tree.lat},${tree.lng}`
  return (
    <div className="h-full box-border">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {isLoadingImage ? (
          <span className="text-gray-400 text-sm">loading</span>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={tree.commonName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm">no image available</span>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 border-none bg-transparent text-lg cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="p-4">
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
          <small className="text-gray-500">
            Street View imagery may not reflect the tree's current appearance
          </small>
        </p>
      </div>
    </div>
  )
}

export default TreeInfoPanel
