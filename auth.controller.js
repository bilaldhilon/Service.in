const User = require("../models/User")
const jwt = require("jsonwebtoken")
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

exports.registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
    })

    await newUser.save()

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "30d" })

    // Send welcome email
    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Service.in",
      html: `
        <h1>Welcome to Service.in!</h1>
        <p>Thank you for registering as a customer. You can now book services from our verified professionals.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(mailOptions)

    // Return user data and token
    res.status(201).json({
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.registerProvider = async (req, res) => {
  try {
    const { fullName, email, password, phone, serviceType, experience, address, city } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "provider",
      providerDetails: {
        serviceType,
        experience,
        address,
        city,
        status: "pending",
      },
    })

    await newUser.save()

    // Send email to admin about new provider
    const adminMailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Provider Registration",
      html: `
        <h1>New Provider Registration</h1>
        <p>A new service provider has registered and is pending approval.</p>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Service:</b> ${serviceType}</p>
        <p>Please review their application in the admin dashboard.</p>
      `,
    }

    transporter.sendMail(adminMailOptions)

    // Send confirmation email to provider
    const providerMailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Application Received - Service.in",
      html: `
        <h1>Thank you for applying!</h1>
        <p>Your application as a service provider has been received. Our team will review your details and get back to you soon.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(providerMailOptions)

    // Return success message
    res.status(201).json({
      message: "Provider registration successful. Your application is pending approval.",
    })
  } catch (error) {
    console.error("Register provider error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check if provider is approved
    if (user.role === "provider" && user.providerDetails.status !== "approved") {
      return res.status(403).json({
        message:
          user.providerDetails.status === "pending"
            ? "Your application is pending approval"
            : "Your application has been rejected",
      })
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" })

    // Update last login
    user.lastLogin = Date.now()
    await user.save()

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find admin user
    const admin = await User.findOne({ email: username, role: "admin" })
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "24h" })

    // Update last login
    admin.lastLogin = Date.now()
    await admin.save()

    res.json({
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
      token,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.logout = (req, res) => {
  res.json({ message: "Logged out successfully" })
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

    // Save reset token to user
    user.resetToken = resetToken
    user.resetTokenExpire = Date.now() + 3600000 // 1 hour
    await user.save()

    // Send password reset email
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`
    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - Service.in",
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link is valid for 1 hour only.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    res.json({ message: "Password reset email sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Update password
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpire = undefined
    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" })
    }
    res.status(500).json({ message: "Server error" })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({ user })
  } catch (error) {
    console.error("Get me error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, city } = req.body

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        phone,
        $set: {
          "providerDetails.address": address,
          "providerDetails.city": city,
        },
      },
      { new: true },
    ).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ user: updatedUser })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
