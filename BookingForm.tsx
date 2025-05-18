"use client"

import type React from "react"

import { useState } from "react"
import { createBooking } from "@/lib/actions/booking-actions"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { initiatePayment } from "@/lib/actions/payment-actions"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface BookingFormProps {
  serviceId: string
  providerName: string
  serviceName: string
}

export default function BookingForm({ serviceId, providerName, serviceName }: BookingFormProps) {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [address, setAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create a booking first
      const formData = new FormData()
      formData.append("serviceId", serviceId)
      formData.append("date", date)
      formData.append("time", time)
      formData.append("address", address)

      const result = await createBooking(formData)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.success && result.booking) {
        // Initiate payment
        const paymentResult = await initiatePayment({
          bookingId: result.booking.id,
          amount: result.booking.price,
          description: `Booking for ${serviceName} with ${providerName}`,
        })

        if (paymentResult.error) {
          setError(paymentResult.error)
          setIsSubmitting(false)
          return
        }

        if (paymentResult.sessionId) {
          // Redirect to Stripe checkout
          const stripe = await stripePromise
          if (stripe) {
            const { error } = await stripe.redirectToCheckout({
              sessionId: paymentResult.sessionId,
            })

            if (error) {
              setError(error.message || "Payment failed. Please try again.")
            }
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error mb-4">
          <div className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 mx-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              ></path>
            </svg>
            <label>{error}</label>
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <div className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 mx-2 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <label>{success}</label>
          </div>
        </div>
      )}

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Date</span>
        </label>
        <input
          type="date"
          className="input input-bordered"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Time</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        >
          <option value="">Select a time</option>
          <option value="09:00">09:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="13:00">01:00 PM</option>
          <option value="14:00">02:00 PM</option>
          <option value="15:00">03:00 PM</option>
          <option value="16:00">04:00 PM</option>
          <option value="17:00">05:00 PM</option>
        </select>
      </div>

      <div className="form-control mb-6">
        <label className="label">
          <span className="label-text">Address</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          placeholder="Enter your full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        ></textarea>
      </div>

      <button
        type="submit"
        className={`btn btn-primary w-full ${isSubmitting ? "loading" : ""}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Book Now"}
      </button>
    </form>
  )
}
