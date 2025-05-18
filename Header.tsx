"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          ServiceHub
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-gray-700 hover:text-blue-600">
                Services <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/services/web-development" className="w-full">
                  Web Development
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services/graphic-design" className="w-full">
                  Graphic Design
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services/digital-marketing" className="w-full">
                  Digital Marketing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services" className="w-full">
                  All Services
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/providers" className="text-gray-700 hover:text-blue-600">
            Find Providers
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600">
            About
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600">
            Contact
          </Link>
        </nav>

        {/* Auth Buttons or User Menu */}
        <div className="hidden md:block">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button className="w-full text-left" onClick={() => setIsLoggedIn(false)}>
                    Sign Out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col space-y-4 p-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              Services
            </Link>
            <Link href="/providers" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              Find Providers
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  className="text-left text-gray-700 hover:text-blue-600"
                  onClick={() => {
                    setIsLoggedIn(false)
                    setIsMenuOpen(false)
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Button asChild variant="outline">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
