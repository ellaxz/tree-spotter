import express from "express"

const router = express.Router()

//treeCollection is passed in because it's only available after
// the database connection succeed in server/index.js

export default function createTreesRouter(treeCollection) {
  router.get("/nearby", async (req, res) => {
    const lat = parseFloat(req.query.lat)
    const lng = parseFloat(req.query.lng)
    const radius = parseFloat(req.query.radius) || 1000

    if (isNaN(lat) || isNaN(lng)) {
      return res
        .status(400)
        .json({ error: "lat and lng query paremeters are required" })
    }
    try {
      const nearbyTrees = await treeCollection
        .find({
          location: {
            $near: {
              $geometry: { type: "Point", coordinates: [lng, lat] },
              $maxDistance: radius,
            },
          },
        })
        .limit(1000)
        .toArray()

      res.json(nearbyTrees)
    } catch (err) {
      console.error("query failed:", err)
      res.status(500).json({ error: "failed to query nearby trees" })
    }
  })

  router.get("/in-bounds", async (req, res) => {
    const north = parseFloat(req.query.north)
    const south = parseFloat(req.query.south)
    const east = parseFloat(req.query.east)
    const west = parseFloat(req.query.west)

    if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
      return res
        .status(400)
        .json({ error: "north,south,east,west query parements are required" })
    }

    try {
      const treesInBounds = await treeCollection
        .find({
          location: {
            $geoWithin: {
              $geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [west, south],
                    [east, south],
                    [east, north],
                    [west, north],
                    [west, south],
                  ],
                ],
              },
            },
          },
        })
        .limit(5000)
        .toArray()

      res.json(treesInBounds)
    } catch (err) {
      console.error("query failed:", err)
      res.status(500).json({ error: "failed to query trees in bounds" })
    }
  })

  return router
}
