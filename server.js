const express = require("express")
const http = require("http")
const next = require("next")
const cors = require("cors")
const mongoose = require("mongoose")
const { initializeSocketServer } = require("./server/socket")
require("dotenv").config()

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  const httpServer = http.createServer(server)

  // Initialize Socket.IO
  const io = initializeSocketServer(httpServer)

  // Middleware
  server.use(cors())
  server.use(express.json())

  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

  // API routes
  server.use("/api/auth", require("./routes/auth.routes"))
  server.use("/api/services", require("./routes/service.routes"))
  server.use("/api/bookings", require("./routes/booking.routes"))
  server.use("/api/feedback", require("./routes/feedback.routes"))
  server.use("/api/contact", require("./routes/contact.routes"))

  // Next.js handler
  server.all("*", (req, res) => {
    return handle(req, res)
  })

  // Start server
  const PORT = process.env.PORT || 3000
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
