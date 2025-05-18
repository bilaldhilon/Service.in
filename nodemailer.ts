import nodemailer from "nodemailer"

// Create a transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "m.bilal9806@gmail.com", // sender email
    pass: process.env.EMAIL_PASSWORD || "", // password from environment variable
  },
})

// Function to send email
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: '"Service.in" <m.bilal9806@gmail.com>',
      to,
      subject,
      html,
    })

    console.log("Message sent: %s", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Function to send contact form email
export async function sendContactFormEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `

  return sendEmail({
    to: "f223406@cfd.nu.edu.pk", // receiver email
    subject: `Contact Form: ${subject}`,
    html,
  })
}

// Function to send feedback email
export async function sendFeedbackEmail({
  name,
  email,
  serviceType,
  rating,
  feedback,
}: {
  name: string
  email: string
  serviceType: string
  rating: number
  feedback: string
}) {
  const html = `
    <h2>New Feedback Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Service Type:</strong> ${serviceType}</p>
    <p><strong>Rating:</strong> ${rating}/5</p>
    <p><strong>Feedback:</strong></p>
    <p>${feedback}</p>
  `

  return sendEmail({
    to: "f223406@cfd.nu.edu.pk", // receiver email
    subject: `Feedback: ${serviceType} Service`,
    html,
  })
}

// Function to send booking confirmation email
export async function sendBookingConfirmationEmail({
  customerName,
  customerEmail,
  serviceType,
  providerName,
  bookingDate,
  bookingTime,
  address,
  price,
}: {
  customerName: string
  customerEmail: string
  serviceType: string
  providerName: string
  bookingDate: string
  bookingTime: string
  address: string
  price: string
}) {
  const html = `
    <h2>Booking Confirmation</h2>
    <p>Dear ${customerName},</p>
    <p>Your booking has been confirmed. Here are the details:</p>
    <p><strong>Service:</strong> ${serviceType}</p>
    <p><strong>Provider:</strong> ${providerName}</p>
    <p><strong>Date:</strong> ${bookingDate}</p>
    <p><strong>Time:</strong> ${bookingTime}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Price:</strong> ${price}</p>
    <p>Thank you for choosing Service.in!</p>
  `

  return sendEmail({
    to: customerEmail,
    subject: `Booking Confirmation: ${serviceType} Service`,
    html,
  })
}
