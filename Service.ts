export interface Service {
  id: string
  name: string
  description: string
  category: string
  price: number
  providerId: string // Reference to the provider
  createdAt: Date
  updatedAt: Date
}
