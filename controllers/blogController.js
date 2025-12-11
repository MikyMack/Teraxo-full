const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const slugify = require("../utils/slugify");
const fs = require("fs");
const path = require("path");

// Helper for deleting old images
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
// CREATE BLOG
// =============================
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      createdBy,
      date,
      description,
      moreDescription,
      quoteOfTheDay,
      subTitle,
      subDescription,
      tags,
      extraPoints,
      extraTitle,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const slug = slugify(title);

    const images = req.files ? req.files.map((file) => file.filename) : [];

    const blog = new Blog({
      title,
      createdBy,
      date,
      description,
      moreDescription,
      quoteOfTheDay,
      subTitle,
      subDescription,
      tags: tags ? tags.split(",") : [],
      extraPoints: extraPoints ? extraPoints.split(",") : [],
      extraTitle,
      slug,
      images,
      seoTitle,
      seoDescription,
      seoKeywords: seoKeywords ? seoKeywords.split(",") : []
    });

    await blog.save();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

// =============================
// GET ALL BLOGS
// =============================
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving blogs",
      error: error.message,
    });
  }
};

// =============================
// GET BLOG BY ID
// =============================
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid blog ID" });

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving blog",
      error: error.message,
    });
  }
};

// =============================
// UPDATE BLOG
// =============================
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid blog ID" });

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const {
      title,
      createdBy,
      date,
      description,
      moreDescription,
      quoteOfTheDay,
      subTitle,
      subDescription,
      tags,
      extraPoints,
      extraTitle,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    if (title) blog.title = title;
    if (title) blog.slug = slugify(title);

    blog.createdBy = createdBy || blog.createdBy;
    blog.date = date || blog.date;
    blog.description = description || blog.description;
    blog.moreDescription = moreDescription || blog.moreDescription;
    blog.quoteOfTheDay = quoteOfTheDay || blog.quoteOfTheDay;
    blog.subTitle = subTitle || blog.subTitle;
    blog.subDescription = subDescription || blog.subDescription;

    if (tags) blog.tags = tags.split(",");
    if (extraPoints) blog.extraPoints = extraPoints.split(",");
    blog.extraTitle = extraTitle || blog.extraTitle;

    blog.seoTitle = seoTitle || blog.seoTitle;
    blog.seoDescription = seoDescription || blog.seoDescription;
    if (seoKeywords) blog.seoKeywords = seoKeywords.split(",");

    // Handle new images
    if (req.files && req.files.length > 0) {
      blog.images.forEach((img) => {
        deleteImage(path.join("uploads", img));
      });

      blog.images = req.files.map((file) => file.filename);
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

// =============================
// DELETE BLOG
// =============================
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid blog ID" });

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    // delete images from local
    blog.images.forEach((img) => {
      deleteImage(path.join("uploads", img));
    });

    await Blog.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};
