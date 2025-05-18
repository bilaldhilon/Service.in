const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Service = require("../models/Service")
const Booking = require("../models/Booking")
const { auth, admin } = require("../middleware/auth")

const adminController = require("../controllers/admin.controller")
const adminAuth = require("../middleware/admin-auth")

// Add admin auth middleware to protect these routes
router.use(auth)
router.use(adminAuth)

// Admin routes
router.get("/dashboard-stats", adminController.getDashboardStats)
router.get("/providers", adminController.getProviders)
router.get("/customers", adminController.getCustomers)
router.get("/bookings", adminController.getBookings)
router.put("/provider/approve/:id", adminController.approveProvider)
router.put("/provider/reject/:id", adminController.rejectProvider)
router.post("/add-admin", adminController.addAdmin)
router.put("/settings/general", adminController.updateGeneralSettings)
router.put("/settings/password", adminController.updatePassword)
router.put("/settings/notifications", adminController.updateNotificationSettings)

// Get admin stats
router.get("/stats", auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalProviders = await User.countDocuments({ role: "provider" })
    const totalServices = await Service.countDocuments()
    const totalBookings = await Booking.countDocuments()

    res.json({
      stats: {
        totalUsers,
        totalProviders,
        totalServices,
        totalBookings,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

// Get provider verification requests
router.get("/verification-requests", auth, admin, async (req, res) => {
  try {
    const requests = await User.find({ role: "provider", isVerified: false }).select("-password")

    res.json({ requests })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

// Verify provider
router.put("/verify-provider/:id", auth, admin, async (req, res) => {
  try {
    const { isVerified } = req.body

    const provider = await User.findById(req.params.id)
    if (!provider) {
      return res.status(404).json({ msg: "Provider not found" })
    }

    provider.isVerified = isVerified
    await provider.save()

    res.json({ msg: `Provider ${isVerified ? "approved" : "rejected"}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

// Get all bookings for admin
router.get("/bookings_old", auth, admin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 })

    // Get service, customer, and provider details
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const service = await Service.findById(booking.serviceId)
        const customer = await User.findById(booking.customerId).select("name email phone")
        const provider = await User.findById(booking.providerId).select("name email phone")

        return {
          id: booking._id,
          date: booking.date,
          time: booking.time,
          address: booking.address,
          price: booking.price,
          status: booking.status,
          createdAt: booking.createdAt,
          service: service
            ? {
                id: service._id,
                name: service.name,
                category: service.category,
              }
            : null,
          customer: customer
            ? {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
              }
            : null,
          provider: provider
            ? {
                id: provider._id,
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
              }
            : null,
        }
      }),
    )

    res.json({ bookings: bookingsWithDetails })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

// Get popular services
router.get("/popular-services", auth, admin, async (req, res) => {
  try {
    // Get all bookings
    const bookings = await Booking.find()

    // Count bookings per service
    const serviceBookings = {}
    bookings.forEach((booking) => {
      const serviceId = booking.serviceId.toString()
      if (!serviceBookings[serviceId]) {
        serviceBookings[serviceId] = {
          count: 0,
          ratings: [],
        }
      }
      serviceBookings[serviceId].count += 1
    })

    // Get all services with booking counts
    const services = await Service.find()
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const serviceId = service._id.toString()
        const bookingsCount = serviceBookings[serviceId] ? serviceBookings[serviceId].count : 0

        // Get provider details
        const provider = await User.findById(service.providerId)
        const rating = provider ? provider.rating : 0

        return {
          id: service._id,
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          bookingsCount,
          rating,
        }
      }),
    )

    // Sort by booking count (most popular first)
    servicesWithStats.sort((a, b) => b.bookingsCount - a.bookingsCount)

    res.json({ services: servicesWithStats })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server error" })
  }
})

module.exports = router
