const Product = require("../models/Product");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");

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

    // -----------------------------------------------------
    // 1. BASIC REQUIRED FIELDS
    // -----------------------------------------------------
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    // -----------------------------------------------------
    // 2. IMAGES REQUIRED (based on your model)
    // -----------------------------------------------------
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    const images = req.files.map((file) => file.filename);

    // -----------------------------------------------------
    // 3. SLUG & SLUG UNIQUENESS CHECK
    // -----------------------------------------------------
    const slug = slugify(title.trim());
    const existingSlug = await Product.findOne({ slug });

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Another product with the same title already exists.",
      });
    }

    // -----------------------------------------------------
    // 4. ARRAY & JSON DATA PARSING
    // -----------------------------------------------------

    // availablePacks (Required array in model)
    let parsedAvailablePacks = [];
    if (availablePacks) {
      parsedAvailablePacks = Array.isArray(availablePacks)
        ? availablePacks.map((i) => i.trim())
        : availablePacks.split(",").map((i) => i.trim());
    }

    if (parsedAvailablePacks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one available pack is required.",
      });
    }

    // keyFeatures
    const parsedKeyFeatures = keyFeatures
      ? Array.isArray(keyFeatures)
        ? keyFeatures.map((i) => i.trim())
        : keyFeatures.split(",").map((i) => i.trim())
      : [];

    // SEO keywords
    const parsedSeoKeywords = seoKeywords
      ? Array.isArray(seoKeywords)
        ? seoKeywords.map((i) => i.trim())
        : seoKeywords.split(",").map((i) => i.trim())
      : [];

    // Questions & Answers
    let parsedQAs = [];
    if (questionsAndAnswers) {
      try {
        parsedQAs =
          typeof questionsAndAnswers === "string"
            ? JSON.parse(questionsAndAnswers)
            : questionsAndAnswers;

        if (!Array.isArray(parsedQAs)) {
          return res.status(400).json({
            success: false,
            message: "Q&A section must be an array.",
          });
        }

        // Validate each QA
        for (let qa of parsedQAs) {
          if (!qa.question?.trim() || !qa.answer?.trim()) {
            return res.status(400).json({
              success: false,
              message: "Each Q&A item must include a question and answer.",
            });
          }
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid format for Q&A section.",
        });
      }
    }

    // -----------------------------------------------------
    // 5. CREATE PRODUCT OBJECT
    // -----------------------------------------------------
    const newProduct = new Product({
      title: title.trim(),
      slug,
      description: description.trim(),
      subDescription: subDescription?.trim(),
      chemicalBase: chemicalBase?.trim(),
      appearance: appearance?.trim(),
      shelfLife: shelfLife?.trim(),
      availablePacks: parsedAvailablePacks,
      cureTime: cureTime?.trim(),
      keyFeatures: parsedKeyFeatures,
      applicationTips: applicationTips?.trim(),
      seoTitle: seoTitle?.trim(),
      seoKeywords: parsedSeoKeywords,
      seoDescription: seoDescription?.trim(),
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
      message: "Internal server error"
    });
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
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------
    // Validate ID
    // -----------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // -----------------------------
    // Extract fields from body
    // -----------------------------
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
      appendImages
    } = req.body;

    const updateData = {};

    // -----------------------------
    // Title & slug
    // -----------------------------
    if (title) {
      const newSlug = slugify(title);

      // ensure unique slug
      const exists = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Another product with this title already exists."
        });
      }

      updateData.title = title.trim();
      updateData.slug = newSlug;
    }

    // -----------------------------
    // Simple fields
    // -----------------------------
    if (description) updateData.description = description;
    if (subDescription) updateData.subDescription = subDescription;
    if (chemicalBase) updateData.chemicalBase = chemicalBase;
    if (appearance) updateData.appearance = appearance;
    if (shelfLife) updateData.shelfLife = shelfLife;
    if (cureTime) updateData.cureTime = cureTime;
    if (applicationTips) updateData.applicationTips = applicationTips;

    if (seoTitle) updateData.seoTitle = seoTitle;
    if (seoDescription) updateData.seoDescription = seoDescription;

    if (typeof isActive !== "undefined") {
      updateData.isActive = isActive === "true";
    }

    // -----------------------------
    // Arrays (packs, features, keywords)
    // -----------------------------
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

    // ⭐ FIXED CONDITION HERE ⭐
    if (typeof seoKeywords !== "undefined") {
      updateData.seoKeywords = Array.isArray(seoKeywords)
        ? seoKeywords
        : seoKeywords.split(",").map(i => i.trim());
    }

    // -----------------------------
    // Q&A JSON handling
    // -----------------------------
    if (typeof questionsAndAnswers !== "undefined") {
      try {
        updateData.questionsAndAnswers =
          typeof questionsAndAnswers === "string"
            ? JSON.parse(questionsAndAnswers)
            : questionsAndAnswers;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid format for Q&A section (expect JSON)."
        });
      }
    }

    // -----------------------------
    // Image handling
    // -----------------------------
    // -----------------------------
// REMOVE EXISTING IMAGES FROM SERVER
// -----------------------------
if (req.body.removedExistingImages) {
  let removedImages;
  try {
    removedImages = typeof req.body.removedExistingImages === 'string'
      ? JSON.parse(req.body.removedExistingImages)
      : req.body.removedExistingImages;
  } catch (err) {
    removedImages = [];
  }

  if (Array.isArray(removedImages) && removedImages.length > 0) {
    const fs = require('fs');
    const path = require('path');
    const uploadPath = path.join(__dirname, '..', 'uploads'); // adjust if your upload folder is different

    removedImages.forEach((imgName) => {
      const filePath = path.join(uploadPath, imgName);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Failed to delete image:', imgName, err);
        });
      }
    });

    // Remove from product.images array
    updateData.images = (product.images || []).filter(i => !removedImages.includes(i));
  }
}

    if (req.files?.length > 0) {
      const newImages = req.files.map(f => f.filename);

      updateData.images =
        appendImages === "true" || appendImages === true
          ? [...(product.images || []), ...newImages]
          : newImages; // overwrite
    }

    // -----------------------------
    // Required fields validation
    // -----------------------------
    const finalImages = updateData.images || product.images;
    const finalAvailablePacks = updateData.availablePacks || product.availablePacks;

    if (
      !(updateData.title || product.title) ||
      !(updateData.description || product.description) ||
      !finalImages || finalImages.length === 0 ||
      !finalAvailablePacks || finalAvailablePacks.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, images, availablePacks."
      });
    }

    // -----------------------------
    // Update product
    // -----------------------------
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error updating product:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
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

