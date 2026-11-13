import { getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const firebaseApp =
  getApps()[0] ??
  initializeApp({
    projectId: "treespotter-ella",
  })

export const firebaseAuth = getAuth(firebaseApp)
