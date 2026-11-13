import express from "express"
import { ObjectId } from "mongodb"
import requireAuth from "../middleware/requireAuth.js"

export default function createSavedTreesRouter({
  savedTreesCollection,
  treesCollection,
}) {
  const router = express.Router()

  router.use(requireAuth)

  router.get("/", async (req, res) => {
    const userId = req.userId

    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: "invalid session",
      })
    }

    try {
      const savedTrees = await savedTreesCollection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()

      const treeIds = savedTrees.map((savedTree) => savedTree.treeId)

      const trees = await treesCollection
        .find({ _id: { $in: treeIds } })
        .toArray()

      const treesById = new Map(
        trees.map((tree) => [tree._id.toString(), tree]),
      )
      const orderedTrees = savedTrees
        .map((savedTree) => treesById.get(savedTree.treeId.toString()))
        .filter((tree) => tree !== undefined)

      return res.status(200).json(orderedTrees)
    } catch (error) {
      console.error("failed to fetch saved trees", error)

      return res.status(500).json({
        error: "failed to fetch saved trees",
      })
    }
  })

  router.put("/:treeId", async (req, res) => {
    const { treeId } = req.params
    const userId = req.userId

    if (!ObjectId.isValid(treeId)) {
      return res.status(400).json({
        error: "invalid tree ID",
      })
    }

    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: "invalid session",
      })
    }

    const treeObjectId = new ObjectId(treeId)
    const userObjectId = new ObjectId(userId)

    try {
      const tree = await treesCollection.findOne(
        { _id: treeObjectId },
        { projection: { _id: 1 } },
      )

      if (!tree) {
        return res.status(404).json({
          error: "tree not found",
        })
      }

      await savedTreesCollection.updateOne(
        {
          userId: userObjectId,
          treeId: treeObjectId,
        },
        {
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true },
      )

      return res.status(200).json({
        treeId,
        saved: true,
      })
    } catch (error) {
      console.error("failed to save tree:", error)

      return res.status(500).json({
        error: "failed to save tree",
      })
    }
  })

  router.delete("/:treeId", async (req, res) => {
    const { treeId } = req.params
    const userId = req.userId

    if (!ObjectId.isValid(treeId)) {
      return res.status(400).json({
        error: "invalid tree id",
      })
    }
    if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: "invalid session",
      })
    }

    try {
      await savedTreesCollection.deleteOne({
        userId: new ObjectId(userId),
        treeId: new ObjectId(treeId),
      })
      return res.status(200).json({
        treeId,
        saved: false,
      })
    } catch (error) {
      console.error("failed to remove saved tree:", error)

      return res.status(500).json({
        error: "failed to remove saved tree",
      })
    }
  })

  return router
}
