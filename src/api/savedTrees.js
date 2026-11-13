const API_URL = import.meta.env.VITE_API_URL

export async function getSavedTrees() {
  const response = await fetch(`${API_URL}/api/saved-trees`, {
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to load saved trees")
  }

  return response.json()
}

export async function saveTree(treeId) {
  const response = await fetch(`${API_URL}/api/saved-trees/${treeId}`, {
    method: "PUT",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to save trees")
  }
  return response.json()
}

export async function removeSavedTree(treeId) {
  const response = await fetch(`${API_URL}/api/saved-trees/${treeId}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to remove saved trees")
  }
  return response.json()
}
