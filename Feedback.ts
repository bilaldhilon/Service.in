export interface Feedback {
  id: string
  customerId: string // Reference to the customer
  providerId: string // Reference to the provider
  bookingId: string // Reference to the booking
  rating: number
  comment: string
  createdAt: Date
}
