import { useEffect, useRef, useState } from "react"
import { TreePine } from "lucide-react"

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
      <div className="relative h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
        {isLoadingImage ? (
          <span className="text-gray-400 text-sm">loading</span>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={tree.commonName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <TreePine size={32} />
            <span className="text-sm">no image available</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center border-none bg-black/40 text-white text-xl rounded-full cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-medium text-gray-900 m-0">
          {tree.commonName}
        </h3>
        <p className="text-sm italic text-gray-500 mt-1 mb-3">
          {tree.scientificName}
        </p>

        <p className="text-sm text-gray-600 leading-relaxed">
          Planted in {tree.yearPlanted}, in {tree.precinct}. Expected to live
          another {tree.usefulLifeExpectancy}.
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-700 no-underline"
          >
            view on street view
          </a>

          <p>
            <small className="text-gray-500">
              Some data (planting year, life expectancy, street view imagery)
              may be approximate or based on periodic assessments rather than
              current, tree-specific conditions.
            </small>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TreeInfoPanel
