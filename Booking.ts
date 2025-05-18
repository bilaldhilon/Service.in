export interface Booking {
  id: string
  customerId: string // Reference to the customer
  providerId: string // Reference to the provider
  serviceId: string // Reference to the service
  date: string
  time: string
  address: string
  price: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}
