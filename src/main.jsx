import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import SavedTreesProvider from "./context/SavedTreesProvider.jsx"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SavedTreesProvider>
        <App />
      </SavedTreesProvider>
    </AuthProvider>
  </StrictMode>,
)
