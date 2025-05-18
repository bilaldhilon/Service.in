"use server"

import { getCurrentUser } from "../auth/auth"
import { getCollection } from "../db/mongodb"
import { ObjectId } from "mongodb"
import { sendBookingConfirmationEmail } from "../api/nodemailer"
import { redirect } from "next/navigation"

export async function createBooking(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "You must be logged in to book a service" }
    }

    const serviceId = formData.get("serviceId") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const address = formData.get("address") as string

    if (!serviceId || !date || !time || !address) {
      return { error: "All fields are required" }
    }

    // Get the service details
    const servicesCollection = await getCollection("services")
    const service = await servicesCollection.findOne({ _id: new ObjectId(serviceId) })

    if (!service) {
      return { error: "Service not found" }
    }

    // Get the provider details
    const usersCollection = await getCollection("users")
    const provider = await usersCollection.findOne({ _id: new ObjectId(service.providerId) })

    if (!provider) {
      return { error: "Provider not found" }
    }

    // Create the booking
    const bookingsCollection = await getCollection("bookings")

    const booking = {
      customerId: user.id,
      providerId: service.providerId,
      serviceId,
      date,
      time,
      address,
      price: service.price,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await bookingsCollection.insertOne(booking)

    // Send confirmation email
    await sendBookingConfirmationEmail({
      customerName: user.name,
      customerEmail: user.email,
      serviceType: service.name,
      providerName: provider.name,
      bookingDate: date,
      bookingTime: time,
      address,
      price: `₨ ${service.price}`,
    })

    return {
      success: true,
      booking: {
        id: result.insertedId.toString(),
        ...booking,
      },
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return { error: "Failed to create booking" }
  }
}

export async function updateBookingStatus(formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "You must be logged in to update a booking" }
    }

    const bookingId = formData.get("bookingId") as string
    const status = formData.get("status") as string

    if (!bookingId || !status) {
      return { error: "Booking ID and status are required" }
    }

    const bookingsCollection = await getCollection("bookings")

    // Check if the booking exists and belongs to the user
    const query: any = { _id: new ObjectId(bookingId) }

    if (user.role === "customer") {
      query.customerId = user.id
    } else if (user.role === "provider") {
      query.providerId = user.id
    }

    const booking = await bookingsCollection.findOne(query)

    if (!booking) {
      return { error: "Booking not found or you don't have permission" }
    }

    // Update the booking status
    await bookingsCollection.updateOne({ _id: new ObjectId(bookingId) }, { $set: { status, updatedAt: new Date() } })

    return { success: true, message: "Booking status updated successfully" }
  } catch (error) {
    console.error("Error updating booking status:", error)
    return { error: "Failed to update booking status" }
  }
}

export async function getBookings() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/auth/customer-login")
    }

    const bookingsCollection = await getCollection("bookings")

    // Get bookings based on user role
    const query: any = {}

    if (user.role === "customer") {
      query.customerId = user.id
    } else if (user.role === "provider") {
      query.providerId = user.id
    }

    const bookings = await bookingsCollection.find(query).toArray()

    // Get service and user details for each booking
    const servicesCollection = await getCollection("services")
    const usersCollection = await getCollection("users")

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const service = await servicesCollection.findOne({ _id: new ObjectId(booking.serviceId) })

        let customer, provider

        if (user.role === "provider") {
          customer = await usersCollection.findOne({ _id: new ObjectId(booking.customerId) })
        } else if (user.role === "customer") {
          provider = await usersCollection.findOne({ _id: new ObjectId(booking.providerId) })
        }

        return {
          id: booking._id.toString(),
          date: booking.date,
          time: booking.time,
          address: booking.address,
          price: booking.price,
          status: booking.status,
          service: service
            ? {
                id: service._id.toString(),
                name: service.name,
                category: service.category,
              }
            : null,
          customer: customer
            ? {
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
              }
            : null,
          provider: provider
            ? {
                id: provider._id.toString(),
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
              }
            : null,
        }
      }),
    )

    return bookingsWithDetails
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}
