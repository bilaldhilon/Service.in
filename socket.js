const { Server } = require("socket.io")
const { MongoClient, ObjectId } = require("mongodb")

// MongoDB connection with placeholder URI (will be updated later)
let db
const mongoClient = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/service-marketplace")

async function connectToMongo() {
  try {
    await mongoClient.connect()
    console.log("Connected to MongoDB")
    db = mongoClient.db()
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
}

connectToMongo()

// Initialize Socket.IO server
function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  // Store online users
  const onlineUsers = new Map()

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    const userRole = socket.handshake.query.userRole

    console.log(`User connected: ${userId} (${userRole})`)

    // Add user to online users
    onlineUsers.set(userId, socket.id)

    // Handle sending messages
    socket.on("send_message", async (message) => {
      try {
        // Save message to database
        const messagesCollection = db.collection("messages")
        const result = await messagesCollection.insertOne({
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          timestamp: new Date(),
          read: false,
        })

        message.id = result.insertedId.toString()

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(message.receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new_message", message)
        }

        // Send back to sender for confirmation
        socket.emit("message_sent", message)
      } catch (error) {
        console.error("Error saving message:", error)
        socket.emit("message_error", { error: "Failed to send message" })
      }
    })

    // Handle marking messages as read
    socket.on("mark_messages_read", async (data) => {
      try {
        // Update messages in database
        const messagesCollection = db.collection("messages")
        await messagesCollection.updateMany(
          {
            senderId: data.senderId,
            receiverId: data.receiverId,
            read: false,
          },
          {
            $set: { read: true },
          },
        )

        // Notify sender that messages were read
        const senderSocketId = onlineUsers.get(data.senderId)
        if (senderSocketId) {
          io.to(senderSocketId).emit("message_read", {
            senderId: data.senderId,
            receiverId: data.receiverId,
          })
        }
      } catch (error) {
        console.error("Error marking messages as read:", error)
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`)
      onlineUsers.delete(userId)
    })
  })

  return io
}

module.exports = { initializeSocketServer }
