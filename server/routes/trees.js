import express from "express"

const router = express.Router()

//treeCollection is passed in because it's only available after
// the database connection succeed in server/index.js

export default function createTreesRouter(treeCollection) {
  router.get("/nearby", async (req, res) => {
    const lat = parseFloat(req.query.lat)
    const lng = parseFloat(req.query.lng)

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
              $maxDistance: 1000,
            },
          },
        })
        .limit(100)
        .toArray()

      res.json(nearbyTrees)
    } catch (err) {
      console.error("query failed:", err)
      res.status(500).json({ error: "failed to query nearby trees" })
    }
  })
  return router
}
