import { X } from "lucide-react"

import AuthPanel from "./AuthPanel"

export default function AuthDialog({ open, onClose }) {
  if (!open) {
    return null
  }

  return (
    <div className="auth-dialog-backdrop">
      <div className="auth-dialog">
        <button
          type="button"
          onClick={onClose}
          className="auth-dialog-close"
          aria-label="Close authentication"
        >
          <X size={18} />
        </button>

        <AuthPanel onAuthSuccess={onClose} />
      </div>
    </div>
  )
}
