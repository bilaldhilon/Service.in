"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CustomerSidebarProps {
  activePage: string
}

export default function CustomerSidebar({ activePage }: CustomerSidebarProps) {
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    // In a real app, you would clear the auth token/session
    console.log("Logging out...")
    router.push("/auth/customer-login")
  }

  return (
    <div className="dashboard-sidebar">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-white">Customer Panel</h3>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/customer/dashboard"
              className={`flex items-center gap-2 p-2 rounded-md ${
                activePage === "dashboard" ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <i className="bi bi-speedometer2"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/customer/bookings"
              className={`flex items-center gap-2 p-2 rounded-md ${
                activePage === "bookings" ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <i className="bi bi-calendar-check"></i> My Bookings
            </Link>
          </li>
          <li>
            <Link
              href="/customer/services"
              className={`flex items-center gap-2 p-2 rounded-md ${
                activePage === "services" ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <i className="bi bi-list-check"></i> Services
            </Link>
          </li>
          <li>
            <Link
              href="/customer/profile"
              className={`flex items-center gap-2 p-2 rounded-md ${
                activePage === "profile" ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <i className="bi bi-person"></i> My Profile
            </Link>
          </li>
          <li>
            <Link
              href="/customer/feedback"
              className={`flex items-center gap-2 p-2 rounded-md ${
                activePage === "feedback" ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <i className="bi bi-star"></i> My Feedback
            </Link>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-2 p-2 rounded-md text-gray-300 hover:bg-gray-700"
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
