const express = require("express")
const router = express.Router()
const feedbackController = require("../controllers/feedback.controller")
const auth = require("../middleware/auth")

// Public routes
router.get("/provider/:providerId", feedbackController.getProviderFeedback)
router.get("/service/:serviceId", feedbackController.getServiceFeedback)

// Protected routes - require authentication
router.use(auth)
router.post("/", feedbackController.createFeedback)

module.exports = router
