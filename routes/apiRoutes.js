const express = require("express");
const router = express.Router();
// Controllers
const productController = require("../controllers/productController");
const blogController = require("../controllers/blogController");
const testimonialController = require("../controllers/testimonialController");
const bannerController = require("../controllers/bannerController");
// Middleware
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");






// ---------------------------
// PRODUCT ROUTES
// ---------------------------
router.post("/admin-product", isAdmin, upload.array("images"), productController.createProduct);
router.get("/admin-product", isAdmin, productController.getAllProducts);
router.get("/admin-product/:id", isAdmin, productController.getProductById);
router.get("/admin-product/slug/:slug", isAdmin, productController.getProductBySlug);
router.put("/admin-product/:id", isAdmin, upload.array("images"), productController.updateProduct);
router.delete("/admin-product/:id", isAdmin, productController.deleteProduct);
router.patch("/admin-product/toggle/:id", isAdmin, productController.toggleProductStatus);

// ---------------------------
// BLOG ROUTES
// ---------------------------
router.post("/admin-blog", isAdmin, upload.array("images"), blogController.createBlog);
router.get("/admin-blog", isAdmin, blogController.getAllBlogs);
router.get("/admin-blog/:id", isAdmin, blogController.getBlogById);
router.put("/admin-blog/:id", isAdmin, upload.array("images"), blogController.updateBlog);
router.delete("/admin-blog/:id", isAdmin, blogController.deleteBlog);

// ---------------------------
// TESTIMONIAL ROUTES
// ---------------------------
router.post("/admin-testimonial", isAdmin, testimonialController.createTestimonial);
router.get("/admin-testimonial", isAdmin, testimonialController.getAllTestimonials);
router.get("/admin-testimonial/:id", isAdmin, testimonialController.getTestimonialById);
router.put("/admin-testimonial/:id", isAdmin, testimonialController.updateTestimonial);
router.delete("/admin-testimonial/:id", isAdmin, testimonialController.deleteTestimonial);

// ---------------------------
// BANNER ROUTES
// ---------------------------
router.post("/admin-banner", isAdmin, upload.single("image"), bannerController.createBanner);
router.get("/admin-banner", isAdmin, bannerController.getAllBanners);
router.get("/admin-banner/:id", isAdmin, bannerController.getBannerById);
router.put("/admin-banner/:id", isAdmin, upload.single("image"), bannerController.updateBanner);
router.delete("/admin-banner/:id", isAdmin, bannerController.deleteBanner);
router.patch("/admin-banner/toggle/:id", isAdmin, bannerController.toggleBannerStatus);

module.exports = router;
