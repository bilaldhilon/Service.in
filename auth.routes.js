const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const auth = require("../middleware/auth")

// Authentication routes
router.post("/register/customer", authController.registerCustomer)
router.post("/register/provider", authController.registerProvider)
router.post("/login", authController.login)
router.post("/admin-login", authController.adminLogin)
router.get("/logout", authController.logout)
router.post("/forgot-password", authController.forgotPassword)
router.post("/reset-password", authController.resetPassword)
router.get("/me", auth, authController.getMe)
router.put("/profile", auth, authController.updateProfile)

module.exports = router
