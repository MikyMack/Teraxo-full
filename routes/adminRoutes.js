const express = require('express');
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");

// Admin Login - GET (public route, no authentication required)
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.user && req.session.user.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/admin_login', { error: req.query.error || null });
});

// Admin Login - POST (public route, handles authentication)
router.post('/login', (req, res) => {
    // For demo purposes, using hardcoded credentials
    // In production, you should validate against database
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '').trim();
    
    console.log('Login attempt:', { username, password, body: req.body });
    
    if (username === 'admin@teraxo.com' && password === 'admin123') {
        req.session.user = { username, isAdmin: true };
        // Save session before redirect
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('admin/admin_login', { error: 'Session error. Please try again.' });
            }
            console.log('Login successful, redirecting to dashboard');
            return res.redirect('/admin/dashboard');
        });
        return;
    }
    
    console.log('Invalid credentials');
    res.render('admin/admin_login', { error: 'Invalid credentials. Please check your email and password.' });
});

// Admin Dashboard - Protected route
router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/admin_dashboard');
});

// Admin Products - Protected route (UI only, no database integration)
router.get('/products', isAdmin, (req, res) => {
    const query = req.query || {};
    const page = parseInt(query.page) || 1;
    const limit = query.limit === 'all' ? null : parseInt(query.limit) || 20;
    
    // Render with empty/default data for UI only
    res.render('admin/admin_products', {
        products: [],
        categories: [],
        subcategories: [],
        childcategories: [],
        query: query,
        page: page,
        limit: limit || 20,
        total: 0,
        totalPages: 1
    });
});

// Admin Blogs - Protected route (UI only, no database integration)
router.get('/blogs', isAdmin, (req, res) => {
    try {
        res.render('admin/admin_blogs', { 
            blogs: [],
            categories: []
        });
    } catch (error) {
        console.error('Error rendering admin_blogs:', error);
        res.status(500).send('Error loading blogs page: ' + error.message);
    }
});
// Alias in case someone uses singular "/blog"
router.get('/blog', isAdmin, (req, res) => {
    try {
        res.render('admin/admin_blogs', { 
            blogs: [],
            categories: []
        });
    } catch (error) {
        console.error('Error rendering admin_blogs:', error);
        res.status(500).send('Error loading blogs page: ' + error.message);
    }
});

// Admin Banner - Protected route (UI only, no database integration)
router.get('/banner', isAdmin, (req, res) => {
    res.render('admin/admin_banner', { banners: [], posters: [] });
});

// Admin Testimonials - Protected route with database integration
router.get('/testimonials', isAdmin, async (req, res) => {
    try {
        const testimonialController = require("../controllers/testimonialController");
        // Create a mock request/response to use the controller method
        const mockReq = { params: {} };
        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    if (data.success) {
                        // Render the template with testimonials data
                        res.render('admin/admin_testimonials', { testimonials: data.testimonials });
                    } else {
                        // If there's an error, render with empty testimonials
                        res.render('admin/admin_testimonials', { testimonials: [] });
                    }
                }
            })
        };
        
        // Call the controller method
        await testimonialController.getAllTestimonials(mockReq, mockRes);
    } catch (error) {
        console.error('Error loading testimonials:', error);
        // If there's an error, render with empty testimonials
        res.render('admin/admin_testimonials', { testimonials: [] });
    }
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
