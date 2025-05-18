export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string // In a real app, this would be hashed
  role: "customer" | "provider" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Customer extends User {
  role: "customer"
  address?: string
  city?: string
  bookings?: string[] // Array of booking IDs
}

export interface Provider extends User {
  role: "provider"
  serviceType: string
  experience: string
  address: string
  city: string
  isVerified: boolean
  rating: number
  totalReviews: number
  bookings?: string[] // Array of booking IDs
  services?: string[] // Array of service IDs
}

export interface Admin extends User {
  role: "admin"
  permissions: string[]
}
