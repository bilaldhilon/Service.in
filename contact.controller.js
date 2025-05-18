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

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Send email to admin
    const adminMailOptions = {
      from: `"Service.in Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Form: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    }

    await transporter.sendMail(adminMailOptions)

    // Send confirmation to user
    const userMailOptions = {
      from: `"Service.in" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting Service.in",
      html: `
        <h1>Thank You for Contacting Us</h1>
        <p>We have received your message and will get back to you soon.</p>
        <p><b>Subject:</b> ${subject}</p>
        <p>Best regards,<br>The Service.in Team</p>
      `,
    }

    await transporter.sendMail(userMailOptions)

    res.json({ message: "Your message has been sent. We will get back to you soon!" })
  } catch (error) {
    console.error("Send contact message error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
