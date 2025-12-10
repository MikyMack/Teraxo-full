
const express = require('express');
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");

// Admin Dashboard
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/admin_dashboard');
});

// Admin Login
router.get('/login', (req, res) => {
    res.render('admin/admin_login');
});

// Admin Login POST
router.post('/login', (req, res) => {
    // For demo purposes, using hardcoded credentials
    // In production, you should validate against database
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        req.session.user = { username, isAdmin: true };
        return res.redirect('/admin/dashboard');
    }
    
    res.render('admin/admin_login', { error: 'Invalid credentials' });
});

// Admin Products
router.get('/products', isAdmin, (req, res) => {
    res.render('admin/admin_products');
});

// Admin Blogs
router.get('/blogs', isAdmin, (req, res) => {
    res.render('admin/admin_blogs');
});

// Admin Banner
router.get('/banner', isAdmin, (req, res) => {
    res.render('admin/admin_banner');
});

// Admin Testimonials
router.get('/testimonials', isAdmin, (req, res) => {
    res.render('admin/admin_testimonials');
});

// Admin Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

module.exports = router;


