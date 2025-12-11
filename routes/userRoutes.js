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
router.get('/products', (req, res) => {
    res.render('products');
});
router.get('/productDetails/:slug', (req, res) => {
    res.render('productDetails');
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
router.get('/contact', (req, res) => {
    res.render('contact');
});
router.get('/privacy', (req, res) => {
    res.render('privacy');
});
module.exports = router;