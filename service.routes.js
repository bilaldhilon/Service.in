const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/service.controller")
const auth = require("../middleware/auth")

// Public routes
router.get("/", serviceController.getAllServices)
router.get("/:id", serviceController.getServiceById)
router.get("/provider/:providerId", serviceController.getProviderServices)

// Protected routes - require authentication
router.use(auth)
router.post("/", serviceController.createService)
router.put("/:id", serviceController.updateService)
router.delete("/:id", serviceController.deleteService)

module.exports = router
