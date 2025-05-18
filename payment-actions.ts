"use server"

import { getCurrentUser } from "../auth/auth"
import { getCollection } from "../db/mongodb"
import { ObjectId } from "mongodb"
import Stripe from "stripe"

// Initialize Stripe with placeholder key (will be updated later)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "a", {
  apiVersion: "2023-10-16",
})

interface PaymentInitiationParams {
  bookingId: string
  amount: number
  description: string
}

export async function initiatePayment({ bookingId, amount, description }: PaymentInitiationParams) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { error: "You must be logged in to make a payment" }
    }

    // Get the booking details
    const bookingsCollection = await getCollection("bookings")
    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(bookingId),
      customerId: user.id,
    })

    if (!booking) {
      return { error: "Booking not found or you don't have permission" }
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: description,
            },
            unit_amount: amount * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/bookings?success=true&booking=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/services/${booking.serviceId}?canceled=true`,
      metadata: {
        bookingId,
        customerId: user.id,
      },
    })

    // Update the booking with the payment session ID
    await bookingsCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          paymentSessionId: session.id,
          paymentStatus: "pending",
          updatedAt: new Date(),
        },
      },
    )

    return { sessionId: session.id }
  } catch (error) {
    console.error("Error initiating payment:", error)
    return { error: "Failed to initiate payment" }
  }
}

export async function handlePaymentWebhook(event: any) {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        const bookingId = session.metadata.bookingId
        const customerId = session.metadata.customerId

        // Update the booking status
        const bookingsCollection = await getCollection("bookings")
        await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId), customerId },
          {
            $set: {
              paymentStatus: "completed",
              status: "confirmed",
              updatedAt: new Date(),
            },
          },
        )
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return { received: true }
  } catch (error) {
    console.error("Error handling payment webhook:", error)
    return { error: "Failed to process payment webhook" }
  }
}
