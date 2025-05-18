const Service = require("../models/Service")
const User = require("../models/User")
const mongoose = require("mongoose")

exports.getAllServices = async (req, res) => {
  try {
    const { category } = req.query

    const query = {}
    if (category) {
      query.category = category
    }

    const services = await Service.find(query)
      .populate("provider", "fullName providerDetails.rating")
      .sort("-createdAt")

    res.json({ services })
  } catch (error) {
    console.error("Get all services error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params

    const service = await Service.findById(id).populate("provider", "fullName phone email providerDetails")

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    res.json({ service })
  } catch (error) {
    console.error("Get service by id error:", error)
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid service ID" })
    }
    res.status(500).json({ message: "Server error" })
  }
}

exports.createService = async (req, res) => {
  try {
    const { name, description, category, price } = req.body

    // Check if user is a provider and approved
    const provider = await User.findOne({
      _id: req.user.id,
      role: "provider",
      "providerDetails.status": "approved",
    })

    if (!provider) {
      return res.status(403).json({
        message: "Only approved providers can create services",
      })
    }

    // Create service
    const newService = new Service({
      name,
      description,
      category,
      price,
      provider: req.user.id,
    })

    await newService.save()

    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    })
  } catch (error) {
    console.error("Create service error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, price } = req.body

    // Find service and check if it belongs to the current user
    const service = await Service.findOne({
      _id: id,
      provider: req.user.id,
    })

    if (!service) {
      return res.status(404).json({
        message: "Service not found or you are not authorized",
      })
    }

    // Update service
    service.name = name
    service.description = description
    service.category = category
    service.price = price

    await service.save()

    res.json({
      message: "Service updated successfully",
      service,
    })
  } catch (error) {
    console.error("Update service error:", error)
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid service ID" })
    }
    res.status(500).json({ message: "Server error" })
  }
}

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params

    // Find service and check if it belongs to the current user
    const service = await Service.findOne({
      _id: id,
      provider: req.user.id,
    })

    if (!service) {
      return res.status(404).json({
        message: "Service not found or you are not authorized",
      })
    }

    await service.remove()

    res.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Delete service error:", error)
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid service ID" })
    }
    res.status(500).json({ message: "Server error" })
  }
}

exports.getProviderServices = async (req, res) => {
  try {
    const { providerId } = req.params

    const services = await Service.find({ provider: providerId }).populate("provider", "fullName")

    res.json({ services })
  } catch (error) {
    console.error("Get provider services error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
