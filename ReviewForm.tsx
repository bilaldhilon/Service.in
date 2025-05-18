"use client"

import type React from "react"

import { useState } from "react"
import { createReview } from "@/lib/actions/review-actions"

interface ReviewFormProps {
  serviceId: string
  onReviewAdded: (review: any) => void
  onCancel: () => void
}

export default function ReviewForm({ serviceId, onReviewAdded, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("serviceId", serviceId)
      formData.append("rating", rating.toString())
      formData.append("comment", comment)

      const result = await createReview(formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.review) {
        onReviewAdded(result.review)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-2xl focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <span
                className={
                  hoveredRating >= star || (!hoveredRating && rating >= star) ? "text-yellow-500" : "text-gray-300"
                }
              >
                <i className="bi bi-star-fill"></i>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Your Review
        </label>
        <textarea
          id="comment"
          rows={4}
          className="textarea textarea-bordered w-full"
          placeholder="Share your experience with this service..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        ></textarea>
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className={`btn btn-primary ${isSubmitting ? "loading" : ""}`} disabled={isSubmitting}>
          Submit Review
        </button>
      </div>
    </form>
  )
}
