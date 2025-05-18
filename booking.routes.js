const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/booking.controller")
const auth = require("../middleware/auth")

// All booking routes require authentication
router.use(auth)

router.post("/", bookingController.createBooking)
router.get("/customer", bookingController.getCustomerBookings)
router.get("/provider", bookingController.getProviderBookings)
router.put("/:id/status", bookingController.updateBookingStatus)

module.exports = router
