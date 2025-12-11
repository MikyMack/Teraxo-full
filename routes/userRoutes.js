const express = require('express');
const router = express.Router();

const Product = require("../models/Product");
const Blog = require("../models/Blog");
const Testimonial = require("../models/Testimonial");
const Banner = require("../models/Banner");

router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(10);
        const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 }).limit(4);
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(12);

        res.render('home', {
            testimonials,
            blogs,
            banners,
            products
        });
    } catch (err) {
        console.error("Error loading home page:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/company_overview', (req, res) => {
    res.render('company-overview');
});
router.get('/why_choose_us', (req, res) => {
    res.render('why-choose');
});
router.get('/products', async (req, res) => {
    try {
        let page = parseInt(req.query.page, 10) || 1;
        let limit = parseInt(req.query.limit, 12) || 12;
        if (page < 1) page = 1;

        const filter = { isActive: true };
        const totalProducts = await Product.countDocuments(filter);

        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('products', {
            products,
            page,
            totalPages,
            limit,
            totalProducts
        });
    } catch (err) {
        console.error("Error fetching products list:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/productDetails/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const product = await Product.findOne({ slug, isActive: true });
        if (!product) {
            return res.status(404).render('404', { message: 'Product not found' });
        }
        res.render('productDetails', { product });
    } catch (err) {
        console.error("Error fetching product details:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/footwear_industry', (req, res) => {
    res.render('industry-footwear');
});
router.get('/industry_signage', (req, res) => {
    res.render('industry-signage');
});
router.get('/industry_furniture', (req, res) => {
    res.render('industry-furniture');
});
router.get('/industry_automotive', (req, res) => {
    res.render('industry-automotive');
});
router.get('/industry_pvc', (req, res) => {
    res.render('industry-pvc');
});
router.get('/industry_packaging', (req, res) => {
    res.render('industry-packaging');
});
router.get('/industry_handicrafts', (req, res) => {
    res.render('industry-handicrafts');
});
router.get('/blogs', (req, res) => {
    res.render('blogs');
});
router.get('/blogDetails/:slug', (req, res) => {
    res.render('blogDetails');
});

module.exports = router;