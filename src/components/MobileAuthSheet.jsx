import { X } from "lucide-react"

import AuthPanel from "./AuthPanel"

export default function MobileAuthSheet({ open, onClose }) {
  if (!open) {
    return null
  }

  return (
    <div className="mobile-auth-panel">
      <div className="mobile-auth-toolbar">
        <button
          type="button"
          onClick={onClose}
          className="mobile-auth-close"
          aria-label="Close authentication"
        >
          <X size={18} />
        </button>
      </div>
      <AuthPanel onAuthSuccess={onClose} />
    </div>
  )
}
