"use client"

import { useState, useEffect } from "react"
import { getReviewsByServiceId } from "@/lib/actions/review-actions"
import { getCurrentUser } from "@/lib/auth/auth"
import ReviewForm from "./ReviewForm"

interface Review {
  id: string
  rating: number
  comment: string
  customerName: string
  createdAt: string
}

export default function ServiceReviews({ serviceId }: { serviceId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [canReview, setCanReview] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        // Get reviews
        const reviewsData = await getReviewsByServiceId(serviceId)
        setReviews(reviewsData)

        // Get current user
        const userData = await getCurrentUser()
        setUser(userData)

        // Check if user can review (has completed booking for this service)
        if (userData && userData.role === "customer") {
          const hasCompletedBooking = await checkCompletedBooking(userData.id, serviceId)
          setCanReview(hasCompletedBooking)
        }
      } catch (error) {
        console.error("Error loading reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [serviceId])

  async function checkCompletedBooking(customerId: string, serviceId: string) {
    // This would be a server action to check if the customer has a completed booking for this service
    // For now, we'll just return true for demonstration
    return true
  }

  function handleReviewAdded(newReview: Review) {
    setReviews([newReview, ...reviews])
    setShowForm(false)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading reviews...</div>
  }

  return (
    <div>
      {canReview && !showForm && (
        <button className="btn btn-outline btn-primary mb-6" onClick={() => setShowForm(true)}>
          Write a Review
        </button>
      )}

      {showForm && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Write Your Review</h3>
          <ReviewForm serviceId={serviceId} onReviewAdded={handleReviewAdded} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this service!</div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{review.customerName}</div>
                  <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= review.rating ? "text-yellow-500" : "text-gray-300"}>
                      <i className="bi bi-star-fill"></i>
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
