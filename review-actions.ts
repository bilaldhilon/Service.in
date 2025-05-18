"use server"

import { getCurrentUser } from "../auth/auth"
import { getCollection } from "../db/mongodb"
import { ObjectId } from "mongodb"

export async function createReview(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "customer") {
      return { error: "Only customers can leave reviews" }
    }

    const serviceId = formData.get("serviceId") as string
    const rating = Number.parseInt(formData.get("rating") as string)
    const comment = formData.get("comment") as string

    if (!serviceId || isNaN(rating) || !comment) {
      return { error: "All fields are required" }
    }

    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" }
    }

    // Check if the customer has a completed booking for this service
    const bookingsCollection = await getCollection("bookings")
    const completedBooking = await bookingsCollection.findOne({
      customerId: user.id,
      serviceId,
      status: "completed",
    })

    if (!completedBooking) {
      return { error: "You can only review services you have used" }
    }

    // Check if the customer has already reviewed this service
    const reviewsCollection = await getCollection("reviews")
    const existingReview = await reviewsCollection.findOne({
      customerId: user.id,
      serviceId,
    })

    if (existingReview) {
      return { error: "You have already reviewed this service" }
    }

    // Create the review
    const review = {
      customerId: user.id,
      customerName: user.name,
      serviceId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await reviewsCollection.insertOne(review)

    // Update the provider's rating
    const servicesCollection = await getCollection("services")
    const service = await servicesCollection.findOne({ _id: new ObjectId(serviceId) })

    if (service) {
      const usersCollection = await getCollection("users")
      const provider = await usersCollection.findOne({ _id: new ObjectId(service.providerId) })

      if (provider) {
        const totalReviews = (provider.totalReviews || 0) + 1
        const totalRating = (provider.rating || 0) * (provider.totalReviews || 0) + rating
        const newRating = totalRating / totalReviews

        await usersCollection.updateOne(
          { _id: new ObjectId(service.providerId) },
          {
            $set: {
              rating: Number.parseFloat(newRating.toFixed(1)),
              totalReviews,
              updatedAt: new Date(),
            },
          },
        )
      }
    }

    return {
      success: true,
      review: {
        id: result.insertedId.toString(),
        ...review,
      },
    }
  } catch (error) {
    console.error("Error creating review:", error)
    return { error: "Failed to create review" }
  }
}

export async function getReviewsByServiceId(serviceId: string) {
  try {
    const reviewsCollection = await getCollection("reviews")
    const reviews = await reviewsCollection.find({ serviceId }).sort({ createdAt: -1 }).toArray()

    return reviews.map((review) => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      customerName: review.customerName,
      createdAt: review.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return []
  }
}
