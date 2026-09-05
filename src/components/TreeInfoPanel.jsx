import { useEffect, useRef, useState } from "react"
import { TreePine, X, ArrowRight } from "lucide-react"

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

        // cache null when no wikipedia result is found
        if (results.length === 0) {
          imageCache.current[tree.scientificName] = null
          return null
        }

        const pageTitle = results[0].title

        return fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
        )
          .then((res) => res.json())
          .then((data) => {
            const foundUrl = data.thumbnail ? data.thumbnail.source : null
            //cache either the image url or null
            imageCache.current[tree.scientificName] = foundUrl
            setImageUrl(foundUrl)
          })
      })
      .catch((err) => {
        console.error("failed to fetch tree image:", err)
      })
      .finally(() => {
        setIsLoadingImage(false)
      })
  }, [tree])

  if (!tree) {
    return (
      <div className="p-6 bg-surface h-full">
        <p className="text-label">Melbourne Urban Forest</p>

        <h2 className="mt-3 text-heading">
          Explore the trees
          <br />
          around you.
        </h2>

        <p className="mt-4 max-w-56 text-body-muted">
          Click a tree on the map to find out what it is.
        </p>
      </div>
    )
  }

  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${tree.lat},${tree.lng}`
  return (
    <div className="h-full box-border bg-surface border border-border ">
      {/* keep the close button visible while the panel scrolls */}
      <div className="sticky top-0 z-02 h-0 pointer-events-none">
        <button
          onClick={onClose}
          aria-label="close"
          className="absolute top-3 right-3 close-button pointer-events-auto"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
        {isLoadingImage ? (
          <span className="text-sm text-text-subtle">loading</span>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={tree.commonName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-subtle">
            <TreePine size={32} />
            <span className="text-sm">no image available</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-title m-0">{tree.commonName}</h3>
        <p className="text-scientific mt-1 mb-3">{tree.scientificName}</p>
        <div className="accent-divider mb-4" />

        <div className="space-y-3 text-body-muted">
          <p>
            Planted in {tree.yearPlanted}, in {tree.precinct}.
          </p>
          <p>Life expectancy: {tree.usefulLifeExpectancy}</p>
        </div>

        <div className="mt-4 pt-3.5 border-t border-border">
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-brand no-underline hover:underline"
          >
            view on street view
            <ArrowRight size={16} strokeWidth={1.8} />
          </a>

          <p className="mt-4 text-disclaimer">
            Tree information comes from City of Melbourne open data and may
            reflect previous assessments.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TreeInfoPanel
