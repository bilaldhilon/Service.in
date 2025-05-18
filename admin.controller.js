const User = require("../models/User")
const Booking = require("../models/Booking")
const Service = require("../models/Service")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

exports.getDashboardStats = async (req, res) => {
  try {
    // Get count of users, providers, and completed bookings
    const totalUsers = await User.countDocuments({ role: "customer" })
    const totalProviders = await User.countDocuments({
      role: "provider",
      "providerDetails.status": "approved",
    })

    const completedBookings = await Booking.countDocuments({ status: "completed" })

    // Calculate total revenue
    const bookings = await Booking.find({ status: "completed" })
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.amount, 0)

    // Get recent provider applications
    const recentProviders = await User.find({
      role: "provider",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    })
      .select("fullName email providerDetails.serviceType providerDetails.city providerDetails.status createdAt")
      .sort("-createdAt")
      .limit(10)

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate("customer", "fullName")
      .populate("provider", "fullName")
      .populate("service", "name")
      .sort("-createdAt")
      .limit(10)

    res.json({
      stats: {
        totalUsers,
        totalProviders,
        completedBookings,
        totalRevenue,
      },
      recentProviders,
      recentBookings,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getProviders = async (req, res) => {
  try {
    const { status } = req.query
    const query = { role: "provider" }

    if (status) {
      query["providerDetails.status"] = status
    }

    const providers = await User.find(query)
      .select("fullName email phone providerDetails createdAt lastLogin")
      .sort("-createdAt")

    res.json({ providers })
  } catch (error) {
    console.error("Get providers error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("fullName email phone createdAt lastLogin")
      .sort("-createdAt")

    res.json({ customers })
  } catch (error) {
    console.error("Get customers error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "fullName")
      .populate("provider", "fullName")
      .populate("service", "name")
      .sort("-createdAt")

    res.json({ bookings })
  } catch (error) {
    console.error("Get bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.approveProvider = async (req, res) => {
  try {
    const { id } = req.params

    // Find provider
    const provider = await User.findOne({
      _id: id,
      role: "provider",
      "providerDetails.status": "pending",
    })

    if (!provider) {
      return res.status(404).json({ message: "Provider not found or already processed" })
    }

    // Update status
    provider.providerDetails.status = "approved"
    await provider.save()

    // Send approval email
    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: provider.email,
      subject: "Provider Application Approved - Service.in",
      html: `
        <h1>Congratulations!</h1>
        <p>Your application to become a service provider on Service.in has been approved!</p>
        <p>You can now log in and start receiving bookings.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(mailOptions)

    res.json({ message: "Provider approved successfully", provider })
  } catch (error) {
    console.error("Approve provider error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.rejectProvider = async (req, res) => {
  try {
    const { id } = req.params

    // Find provider
    const provider = await User.findOne({
      _id: id,
      role: "provider",
      "providerDetails.status": "pending",
    })

    if (!provider) {
      return res.status(404).json({ message: "Provider not found or already processed" })
    }

    // Update status
    provider.providerDetails.status = "rejected"
    await provider.save()

    // Send rejection email
    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: provider.email,
      subject: "Provider Application Status - Service.in",
      html: `
        <h1>Application Update</h1>
        <p>Thank you for your interest in becoming a service provider on Service.in.</p>
        <p>After reviewing your application, we regret to inform you that we are unable to approve your request at this time.</p>
        <p>If you have any questions or would like more information about our decision, please contact our support team.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(mailOptions)

    res.json({ message: "Provider rejected successfully" })
  } catch (error) {
    console.error("Reject provider error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.addAdmin = async (req, res) => {
  try {
    const { name, email, role, password } = req.body

    // Check if admin already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new admin user
    const newAdmin = new User({
      fullName: name,
      email,
      password: hashedPassword,
      role: "admin",
      adminRole: role,
    })

    await newAdmin.save()

    // Send welcome email
    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Account Created - Service.in",
      html: `
        <h1>Welcome to Service.in Admin Team!</h1>
        <p>Your admin account has been created. You can now log in to the admin dashboard.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Role:</b> ${role}</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(mailOptions)

    res.status(201).json({
      message: "Admin user created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.adminRole,
      },
    })
  } catch (error) {
    console.error("Add admin error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateGeneralSettings = async (req, res) => {
  try {
    const { siteName, siteDescription, contactEmail, contactPhone, address, maintenanceMode } = req.body

    // For simplicity, we'll just return success
    // In a real app, these would be saved to a Settings collection

    res.json({
      message: "Settings updated successfully",
      settings: {
        siteName,
        siteDescription,
        contactEmail,
        contactPhone,
        address,
        maintenanceMode,
      },
    })
  } catch (error) {
    console.error("Update general settings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Find admin
    const admin = await User.findById(req.user.id)
    if (!admin) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    admin.password = hashedPassword
    await admin.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Update password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateNotificationSettings = async (req, res) => {
  try {
    const {
      newUserNotification,
      newProviderNotification,
      newBookingNotification,
      newReviewNotification,
      notificationEmail,
    } = req.body

    // For simplicity, we'll just return success
    // In a real app, these would be saved to the admin user profile

    res.json({
      message: "Notification settings updated successfully",
      settings: {
        newUserNotification,
        newProviderNotification,
        newBookingNotification,
        newReviewNotification,
        notificationEmail,
      },
    })
  } catch (error) {
    console.error("Update notification settings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
