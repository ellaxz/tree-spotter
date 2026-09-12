import { X } from "lucide-react"

import AuthPanel from "./AuthPanel"

export default function MobileAuthSheet({ open, user, onClose, onLogout }) {
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

      {user ? (
        <div className="flex flex-col gap-1.5">
          <h2 className="mobile-account-title">Account</h2>
          <p className="mobile-account-email">{user.email}</p>

          <div className="mobile-account-actions">
            <button
              type="button"
              onClick={onLogout}
              className="mobile-account-logout"
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        <AuthPanel onAuthSuccess={onClose} />
      )}
    </div>
  )
}
