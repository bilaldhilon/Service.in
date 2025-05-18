"use server"

import { getCurrentUser } from "../auth/auth"
import { getCollection } from "../db/mongodb"
import { ObjectId } from "mongodb"
import { redirect } from "next/navigation"

export async function createService(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "provider") {
      return { error: "Only service providers can create services" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const price = Number.parseFloat(formData.get("price") as string)

    if (!name || !description || !category || isNaN(price)) {
      return { error: "All fields are required" }
    }

    const servicesCollection = await getCollection("services")

    const service = {
      name,
      description,
      category,
      price,
      providerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await servicesCollection.insertOne(service)

    return {
      success: true,
      service: {
        id: result.insertedId.toString(),
        ...service,
      },
    }
  } catch (error) {
    console.error("Error creating service:", error)
    return { error: "Failed to create service" }
  }
}

export async function updateService(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "provider") {
      return { error: "Only service providers can update services" }
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const price = Number.parseFloat(formData.get("price") as string)

    if (!id || !name || !description || !category || isNaN(price)) {
      return { error: "All fields are required" }
    }

    const servicesCollection = await getCollection("services")

    // Check if the service exists and belongs to the provider
    const existingService = await servicesCollection.findOne({
      _id: new ObjectId(id),
      providerId: user.id,
    })

    if (!existingService) {
      return { error: "Service not found or you don't have permission" }
    }

    const updatedService = {
      name,
      description,
      category,
      price,
      updatedAt: new Date(),
    }

    await servicesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedService })

    return {
      success: true,
      service: {
        id,
        ...updatedService,
        providerId: user.id,
        createdAt: existingService.createdAt,
      },
    }
  } catch (error) {
    console.error("Error updating service:", error)
    return { error: "Failed to update service" }
  }
}

export async function deleteService(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "provider") {
      return { error: "Only service providers can delete services" }
    }

    const id = formData.get("id") as string

    if (!id) {
      return { error: "Service ID is required" }
    }

    const servicesCollection = await getCollection("services")

    // Check if the service exists and belongs to the provider
    const existingService = await servicesCollection.findOne({
      _id: new ObjectId(id),
      providerId: user.id,
    })

    if (!existingService) {
      return { error: "Service not found or you don't have permission" }
    }

    await servicesCollection.deleteOne({ _id: new ObjectId(id) })

    return { success: true, message: "Service deleted successfully" }
  } catch (error) {
    console.error("Error deleting service:", error)
    return { error: "Failed to delete service" }
  }
}

export async function getServices(category?: string) {
  try {
    const servicesCollection = await getCollection("services")

    const query: any = {}
    if (category) query.category = category

    const services = await servicesCollection.find(query).toArray()

    // Get provider details for each service
    const usersCollection = await getCollection("users")

    const servicesWithProviders = await Promise.all(
      services.map(async (service) => {
        const provider = await usersCollection.findOne({ _id: new ObjectId(service.providerId) })

        return {
          id: service._id.toString(),
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          provider: provider
            ? {
                id: provider._id.toString(),
                name: provider.name,
                rating: provider.rating || 0,
                totalReviews: provider.totalReviews || 0,
              }
            : null,
        }
      }),
    )

    return servicesWithProviders
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

export async function getProviderServices() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "provider") {
      redirect("/auth/provider-login")
    }

    const servicesCollection = await getCollection("services")

    const services = await servicesCollection.find({ providerId: user.id }).toArray()

    return services.map((service) => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      createdAt: service.createdAt,
    }))
  } catch (error) {
    console.error("Error fetching provider services:", error)
    return []
  }
}

export async function getServiceById(id: string) {
  try {
    const servicesCollection = await getCollection("services")
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) })

    if (!service) {
      return null
    }

    // Get provider details
    const usersCollection = await getCollection("users")
    const provider = await usersCollection.findOne({ _id: new ObjectId(service.providerId) })

    return {
      id: service._id.toString(),
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      provider: provider
        ? {
            id: provider._id.toString(),
            name: provider.name,
            rating: provider.rating || 0,
            totalReviews: provider.totalReviews || 0,
          }
        : null,
    }
  } catch (error) {
    console.error("Error fetching service:", error)
    return null
  }
}
