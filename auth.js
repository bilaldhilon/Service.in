const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    // Get token from cookie or header
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    // const user = await User.findById(decoded.id).select("-password")

    // if (!user) {
    //   return res.status(401).json({ msg: "Token is not valid" })
    // }

    // req.user = user
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" })
  }
}

// Middleware to check if user is provider
const provider = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === "provider") {
      next()
    } else {
      res.status(403).json({ msg: "Access denied, provider role required" })
    }
  })
}

// Middleware to check if user is customer
const customer = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === "customer") {
      next()
    } else {
      res.status(403).json({ msg: "Access denied, customer role required" })
    }
  })
}

// Middleware to check if user is admin
const admin = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === "admin") {
      next()
    } else {
      res.status(403).json({ msg: "Access denied, admin role required" })
    }
  })
}

module.exports = { auth, provider, customer, admin }
