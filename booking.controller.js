const Booking = require("../models/Booking")
const User = require("../models/User")
const Service = require("../models/Service")
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

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, date, time, address, notes } = req.body

    // Check if service and provider exist
    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    const provider = await User.findOne({
      _id: providerId,
      role: "provider",
      "providerDetails.status": "approved",
    })

    if (!provider) {
      return res.status(404).json({ message: "Provider not found or not approved" })
    }

    // Create booking
    const newBooking = new Booking({
      service: serviceId,
      provider: providerId,
      customer: req.user.id,
      date,
      time,
      address,
      notes,
      amount: service.price,
      status: "pending",
    })

    await newBooking.save()

    // Send booking notification to provider
    const providerMail = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: provider.email,
      subject: "New Booking Request - Service.in",
      html: `
        <h1>New Booking Request</h1>
        <p>You have a new booking request for ${service.name}.</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Address:</b> ${address}</p>
        <p><b>Notes:</b> ${notes || "None"}</p>
        <p>Please log in to your account to accept or decline this booking.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(providerMail)

    // Send confirmation to customer
    const customer = await User.findById(req.user.id)
    const customerMail = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject: "Booking Confirmation - Service.in",
      html: `
        <h1>Booking Confirmation</h1>
        <p>Your booking request has been submitted successfully.</p>
        <p><b>Service:</b> ${service.name}</p>
        <p><b>Provider:</b> ${provider.fullName}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
        <p><b>Address:</b> ${address}</p>
        <p>The service provider will confirm your booking soon.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    transporter.sendMail(customerMail)

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate("service", "name description")
      .populate("provider", "fullName")
      .sort("-createdAt")

    res.json({ bookings })
  } catch (error) {
    console.error("Get customer bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate("service", "name description")
      .populate("customer", "fullName")
      .sort("-createdAt")

    res.json({ bookings })
  } catch (error) {
    console.error("Get provider bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Make sure status is valid
    if (!["accepted", "rejected", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Find booking
    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check authorization - only the provider can update the booking status
    // or the customer can cancel the booking if it's pending or accepted
    if (
      (req.user.role === "provider" && booking.provider.toString() !== req.user.id) ||
      (req.user.role === "customer" && booking.customer.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Customers can only cancel bookings
    if (req.user.role === "customer" && status !== "cancelled") {
      return res.status(403).json({ message: "Customers can only cancel bookings" })
    }

    // Don't allow cancellation of completed bookings
    if (booking.status === "completed" && status === "cancelled") {
      return res.status(400).json({ message: "Cannot cancel completed booking" })
    }

    // Update booking status
    booking.status = status
    await booking.save()

    // Send notification to the customer
    const customer = await User.findById(booking.customer)
    const service = await Service.findById(booking.service)
    const provider = await User.findById(booking.provider)

    let subject, messageHtml

    if (status === "accepted") {
      subject = "Booking Accepted - Service.in"
      messageHtml = `
        <h1>Booking Accepted</h1>
        <p>Good news! Your booking request for ${service.name} has been accepted by ${provider.fullName}.</p>
        <p><b>Date:</b> ${booking.date}</p>
        <p><b>Time:</b> ${booking.time}</p>
        <p>Please make sure the address is accessible at the scheduled time.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `
    } else if (status === "rejected") {
      subject = "Booking Rejected - Service.in"
      messageHtml = `
        <h1>Booking Rejected</h1>
        <p>We're sorry to inform you that your booking request for ${service.name} has been rejected by the service provider.</p>
        <p>This could be due to scheduling conflicts or other issues.</p>
        <p>You can try booking with another service provider.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `
    } else if (status === "completed") {
      subject = "Service Completed - Service.in"
      messageHtml = `
        <h1>Service Completed</h1>
        <p>Your booking for ${service.name} has been marked as completed by ${provider.fullName}.</p>
        <p>If you're satisfied with the service, please leave a review!</p>
        <p>Thank you for using Service.in.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `
    } else if (status === "cancelled") {
      subject = "Booking Cancelled - Service.in"
      messageHtml = `
        <h1>Booking Cancelled</h1>
        <p>Your booking for ${service.name} has been cancelled.</p>
        <p>You can book again at any time from our website.</p>
        <p>Best regards,<br>The Service.in Team</p>
      `
    }

    const mailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: customer.email,
      subject,
      html: messageHtml,
    }

    transporter.sendMail(mailOptions)

    res.json({
      message: `Booking ${status} successfully`,
      booking,
    })
  } catch (error) {
    console.error("Update booking status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
