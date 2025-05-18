const Feedback = require("../models/Feedback")
const Booking = require("../models/Booking")
const User = require("../models/User")
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

exports.createFeedback = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body

    // Check if booking exists and belongs to the current user
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user.id,
      status: "completed",
    })

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or not completed",
      })
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({ booking: bookingId })
    if (existingFeedback) {
      return res.status(400).json({
        message: "Feedback already submitted for this booking",
      })
    }

    // Create feedback
    const newFeedback = new Feedback({
      booking: bookingId,
      service: booking.service,
      provider: booking.provider,
      customer: req.user.id,
      rating,
      comment,
    })

    await newFeedback.save()

    // Notify provider
    const provider = await User.findById(booking.provider)
    const customer = await User.findById(req.user.id)

    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: provider.email,
      subject: "New Feedback Received - Service.in",
      html: `
        <h1>New Feedback Received</h1>
        <p>${customer.fullName} has left a ${rating}-star review for your service.</p>
        <p><b>Comment:</b> ${comment}</p>
        <p>Keep up the good work!</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(mailOptions)

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    })
  } catch (error) {
    console.error("Create feedback error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getProviderFeedback = async (req, res) => {
  try {
    const { providerId } = req.params

    const feedback = await Feedback.find({ provider: providerId })
      .populate("customer", "fullName")
      .populate("service", "name")
      .sort("-createdAt")

    res.json({ feedback })
  } catch (error) {
    console.error("Get provider feedback error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getServiceFeedback = async (req, res) => {
  try {
    const { serviceId } = req.params

    const feedback = await Feedback.find({ service: serviceId })
      .populate("customer", "fullName")
      .populate("provider", "fullName")
      .sort("-createdAt")

    res.json({ feedback })
  } catch (error) {
    console.error("Get service feedback error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
