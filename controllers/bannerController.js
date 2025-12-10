const mongoose = require("mongoose");
const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");

// Helper to delete old images
const deleteImage = (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (err) {
    console.error("Error deleting image:", err);
  }
};

// =============================
// CREATE BANNER
// =============================
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, link, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const image = req.file.filename;

    const banner = new Banner({
      title,
      subtitle,
      description,
      link,
      isActive: isActive !== undefined ? isActive : true,
      image,
    });

    await banner.save();

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.error("Create Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating banner",
      error: error.message,
    });
  }
};

// =============================
// GET ALL BANNERS
// =============================
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Get Banners Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving banners",
      error: error.message,
    });
  }
};

// =============================
// GET BANNER BY ID
// =============================
exports.getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid banner ID" });

    const banner = await Banner.findById(id);

    if (!banner)
      return res.status(404).json({ success: false, message: "Banner not found" });

    return res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error("Get Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving banner",
      error: error.message,
    });
  }
};

// =============================
// UPDATE BANNER
// =============================
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid banner ID" });

    const banner = await Banner.findById(id);

    if (!banner)
      return res.status(404).json({ success: false, message: "Banner not found" });

    const { title, subtitle, description, link, isActive } = req.body;

    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.description = description || banner.description;
    banner.link = link || banner.link;
    banner.isActive = isActive !== undefined ? isActive : banner.isActive;

    // Replace image if new one uploaded
    if (req.file) {
      deleteImage(path.join("uploads", banner.image));
      banner.image = req.file.filename;
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating banner",
      error: error.message,
    });
  }
};

// =============================
// DELETE BANNER
// =============================
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid banner ID" });

    const banner = await Banner.findById(id);

    if (!banner)
      return res.status(404).json({ success: false, message: "Banner not found" });

    deleteImage(path.join("uploads", banner.image));

    await Banner.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting banner",
      error: error.message,
    });
  }
};

// =============================
// TOGGLE BANNER STATUS
// =============================
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid banner ID" });

    const banner = await Banner.findById(id);

    if (!banner)
      return res.status(404).json({ success: false, message: "Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      banner,
    });
  } catch (error) {
    console.error("Toggle Banner Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error toggling banner status",
      error: error.message,
    });
  }
};
