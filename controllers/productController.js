const Product = require("../models/Product");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");  
const fs = require("fs");
const path = require("path");

// create product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      subDescription,
      chemicalBase,
      appearance,
      shelfLife,
      availablePacks,
      cureTime,
      keyFeatures,
      applicationTips,
      seoTitle,
      seoKeywords,
      seoDescription,
      isActive,
      questionsAndAnswers,
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    const baseSlug = slugify(title.trim());

    // IMPORTANT: Use multer’s filename (corrected)
    const images = req.files.map(file => file.filename);

    const existingSlug = await Product.findOne({ slug: baseSlug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Another product with the same title already exists.",
      });
    }

    let parsedAvailablePacks = availablePacks
      ? Array.isArray(availablePacks)
        ? availablePacks
        : availablePacks.split(",").map(i => i.trim())
      : [];

    if (parsedAvailablePacks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one available pack is required.",
      });
    }

    const parsedKeyFeatures = keyFeatures
      ? Array.isArray(keyFeatures)
        ? keyFeatures
        : keyFeatures.split(",").map(i => i.trim())
      : [];

    const parsedSeoKeywords = seoKeywords
      ? Array.isArray(seoKeywords)
        ? seoKeywords
        : seoKeywords.split(",").map(i => i.trim())
      : [];

    let parsedQAs = [];
    if (questionsAndAnswers) {
      parsedQAs =
        typeof questionsAndAnswers === "string"
          ? JSON.parse(questionsAndAnswers)
          : questionsAndAnswers;
    }

    const newProduct = new Product({
      title: title.trim(),
      slug: baseSlug,
      description: description.trim(),
      subDescription,
      chemicalBase,
      appearance,
      shelfLife,
      availablePacks: parsedAvailablePacks,
      cureTime,
      keyFeatures: parsedKeyFeatures,
      applicationTips,
      seoTitle,
      seoKeywords: parsedSeoKeywords,
      seoDescription,
      isActive: isActive === "true" || isActive === true,
      images,
      questionsAndAnswers: parsedQAs,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};  

exports.updateProduct = async (req, res) => {
  console.log("Update Product Request Body:", req.body);

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      title,
      description,
      subDescription,
      chemicalBase,
      appearance,
      shelfLife,
      availablePacks,
      cureTime,
      keyFeatures,
      applicationTips,
      seoTitle,
      seoKeywords,
      seoDescription,
      isActive,
      questionsAndAnswers,
      appendImages,
      existingImages,          // NEW: array sent from frontend after removals
      removedExistingImages    // NEW: array of removed image names
    } = req.body;

    const updateData = {};

    // --- BASIC FIELDS ---
    if (title) {
      const newSlug = slugify(title, { lower: true });
      const exists = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (exists) {
        return res.status(400).json({ success: false, message: "Another product with this title already exists." });
      }
      updateData.title = title.trim();
      updateData.slug = newSlug;
    }

    if (description) updateData.description = description;
    if (subDescription) updateData.subDescription = subDescription;
    if (chemicalBase) updateData.chemicalBase = chemicalBase;
    if (appearance) updateData.appearance = appearance;
    if (shelfLife) updateData.shelfLife = shelfLife;
    if (cureTime) updateData.cureTime = cureTime;
    if (applicationTips) updateData.applicationTips = applicationTips;
    if (seoTitle) updateData.seoTitle = seoTitle;
    if (seoDescription) updateData.seoDescription = seoDescription;
    if (typeof isActive !== "undefined") updateData.isActive = isActive === "true";

    if (typeof availablePacks !== "undefined") {
      updateData.availablePacks = Array.isArray(availablePacks)
        ? availablePacks
        : availablePacks.split(",").map(i => i.trim());
    }

    if (typeof keyFeatures !== "undefined") {
      updateData.keyFeatures = Array.isArray(keyFeatures)
        ? keyFeatures
        : keyFeatures.split(",").map(i => i.trim());
    }

    if (typeof seoKeywords !== "undefined") {
      updateData.seoKeywords = Array.isArray(seoKeywords)
        ? seoKeywords
        : seoKeywords.split(",").map(i => i.trim());
    }

    if (typeof questionsAndAnswers !== "undefined") {
      updateData.questionsAndAnswers =
        typeof questionsAndAnswers === "string"
          ? JSON.parse(questionsAndAnswers)
          : questionsAndAnswers;
    }

    // --- IMAGE HANDLING ---
    // Start with frontend's existingImages (already reflects removals)
    let currentImages = [];
    if (existingImages) {
      try {
        currentImages = JSON.parse(existingImages);
      } catch { currentImages = []; }
    }

    // Delete removed images from server
    if (removedExistingImages) {
      try {
        const removedImages = JSON.parse(removedExistingImages);
        const uploadPath = path.join(__dirname, "..", "uploads");
        removedImages.forEach(img => {
          const filePath = path.join(uploadPath, img);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      } catch {}
    }

    // Add new uploaded files
    if (req.files?.length > 0) {
      const newImages = req.files.map(f => f.filename);
      updateData.images = appendImages === "true" ? [...currentImages, ...newImages] : newImages;
    } else {
      updateData.images = currentImages;
    }

    // --- FINAL VALIDATION ---
    const finalImages = updateData.images || [];
    const finalAvailablePacks = updateData.availablePacks || [];

    if (!finalImages.length) {
      return res.status(400).json({ success: false, message: "At least one product image is required." });
    }

    if (!finalAvailablePacks.length) {
      return res.status(400).json({ success: false, message: "At least one available pack is required." });
    }

    // --- UPDATE PRODUCT ---
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;

    const query = {};

    // Search (title + description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Active / Inactive filter
    if (typeof isActive !== "undefined") {
      query.isActive = isActive === "true";
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const count = await Product.countDocuments(query);

    return res.json({
      success: true,
      products,
      totalProducts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// get product by ID
exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// UPDATE PRODUCT



// delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 2. Delete image files
    if (Array.isArray(product.images) && product.images.length > 0) {
      const uploadPath = path.join(__dirname, "..", "uploads");

      product.images.forEach((img) => {
        const filePath = path.join(uploadPath, img);

        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", filePath, err);
          });
        }
      });
    }

    // 3. Delete product from DB
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting product:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Toggle product active/inactive
exports.toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Toggle isActive
    product.isActive = !product.isActive;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product has been ${product.isActive ? "activated" : "deactivated"}.`,
      product,
    });

  } catch (error) {
    console.error("Error toggling product status:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

