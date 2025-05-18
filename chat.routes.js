const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth")
const Message = require("../models/Message")
const User = require("../models/User")
const mongoose = require("mongoose")

// Get all conversations for the current user
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    // Find all messages where the user is either sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: mongoose.Types.ObjectId(userId) }, { receiverId: mongoose.Types.ObjectId(userId) }],
        },
      },
      // Sort by timestamp descending
      { $sort: { timestamp: -1 } },
      // Group by conversation (the other user)
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", mongoose.Types.ObjectId(userId)] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$content" },
          timestamp: { $first: "$timestamp" },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$receiverId", mongoose.Types.ObjectId(userId)] }, { $eq: ["$read", false] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    // Get user details for each conversation
    const conversations = await Promise.all(
      messages.map(async (message) => {
        const otherUser = await User.findById(message._id).select("name role")

        return {
          id: message._id.toString(),
          name: otherUser ? otherUser.name : "Unknown User",
          role: otherUser ? otherUser.role : "unknown",
          lastMessage: message.lastMessage,
          timestamp: message.timestamp,
          unread: message.unread,
        }
      }),
    )

    res.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ error: "Failed to fetch conversations" })
  }
})

// Get messages between current user and another user
router.get("/messages/:userId", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id
    const otherUserId = req.params.userId

    // Find all messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .lean()

    // Mark unread messages as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: currentUserId,
        read: false,
      },
      { $set: { read: true } },
    )

    res.json(
      messages.map((message) => ({
        id: message._id.toString(),
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString(),
        content: message.content,
        timestamp: message.timestamp,
        read: message.read,
      })),
    )
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

module.exports = router
