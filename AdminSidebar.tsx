"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminSidebarProps {
  activePage: string
}

export default function AdminSidebar({ activePage }: AdminSidebarProps) {
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    // In a real app, you would clear the auth token/session
    console.log("Logging out...")
    router.push("/auth/admin-login")
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      <div className="sidebar-menu">
        <ul>
          <li>
            <Link href="/admin/dashboard" className={activePage === "dashboard" ? "active" : ""}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className={activePage === "users" ? "active" : ""}>
              <i className="bi bi-people"></i> Users
            </Link>
          </li>
          <li>
            <Link href="/admin/providers" className={activePage === "providers" ? "active" : ""}>
              <i className="bi bi-person-badge"></i> Service Providers
            </Link>
          </li>
          <li>
            <Link href="/admin/services" className={activePage === "services" ? "active" : ""}>
              <i className="bi bi-list-check"></i> Services
            </Link>
          </li>
          <li>
            <Link href="/admin/bookings" className={activePage === "bookings" ? "active" : ""}>
              <i className="bi bi-calendar-check"></i> Bookings
            </Link>
          </li>
          <li>
            <Link href="/admin/reviews" className={activePage === "reviews" ? "active" : ""}>
              <i className="bi bi-star"></i> Reviews
            </Link>
          </li>
          <li>
            <Link href="/admin/reports" className={activePage === "reports" ? "active" : ""}>
              <i className="bi bi-graph-up"></i> Reports
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className={activePage === "settings" ? "active" : ""}>
              <i className="bi bi-gear"></i> Settings
            </Link>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setShowLogoutConfirm(true)
              }}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded-md" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
