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
router.get('/company_overview', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(8);
        const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
        res.render('company-overview', { testimonials, blogs });
    } catch (err) {
        console.error("Error loading company overview page:", err);
        res.status(500).send("Internal Server Error");
    }
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
router.get('/industry_interiors', (req, res) => {
    res.render('industry-interiors');
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
router.get('/blogs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limit);

        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('blogs', {
            blogs,
            page,
            totalPages,
            limit,
            totalBlogs
        });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/blogDetails/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).send("Blog not found");
        }
        res.render('blogDetails', { blog });
    } catch (err) {
        console.error("Error fetching blog details:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/contact', (req, res) => {
    res.render('contact');
});
router.get('/privacy', (req, res) => {
    res.render('privacy');
});
router.get('/terms', (req, res) => {
    res.render('terms');
});
router.get("/sitemap.xml", async (req, res) => {
    try {
        const domain = "https://teraxo.co.in";

        const staticUrls = [
            "",
            "/company_overview",
            "/why_choose_us",
            "/products",
            "/blogs",
            "/contact",
            "/privacy",
            "/terms",
            "/footwear_industry",
            "/industry_signage",
            "/industry_furniture",
            "/industry_interiors",
            "/industry_automotive",
            "/industry_pvc",
            "/industry_packaging",
            "/industry_handicrafts",
        ];

        const staticLinks = staticUrls
            .map(url => `
        <url>
            <loc>${domain}${url}</loc>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>
        `)
            .join("");

        const products = await Product.find({ isActive: true }).select("slug updatedAt");
        const blogs = await Blog.find().select("slug updatedAt");

        const productLinks = products
            .map(p => `
        <url>
            <loc>${domain}/productDetails/${p.slug}</loc>
            <lastmod>${p.updatedAt.toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.9</priority>
        </url>
        `)
            .join("");

        const blogLinks = blogs
            .map(b => `
        <url>
            <loc>${domain}/blogDetails/${b.slug}</loc>
            <lastmod>${b.updatedAt.toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>
        </url>
        `)
            .join("");

        // Remove any leading whitespace/newlines so the XML declaration is the first bytes sent
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticLinks}
${productLinks}
${blogLinks}
</urlset>`;

        res.header("Content-Type", "application/xml");
        res.send(sitemap);

    } catch (error) {
        console.error("Error generating sitemap:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/rss.xml", async (req, res) => {
    try {
        const domain = "https://teraxo.co.in";

        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .limit(20); // latest 20 blogs

        let feedItems = blogs.map(blog => `
            <item>
                <title><![CDATA[${blog.title}]]></title>
                <link>${domain}/blogDetails/${blog.slug}</link>
                <description><![CDATA[${blog.shortDescription || blog.description.slice(0, 150)}]]></description>
                <pubDate>${new Date(blog.createdAt).toUTCString()}</pubDate>
            </item>
        `).join("");

        // Remove leading whitespace/newlines so XML declaration is the very first thing sent
        const rssFeed =
`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Teraxo Blogs</title>
        <link>${domain}</link>
        <description>Latest updates and blogs from Teraxo Adhesive</description>
        ${feedItems}
    </channel>
</rss>`;

        res.set("Content-Type", "application/xml");
        res.send(rssFeed);

    } catch (err) {
        console.error("Error generating RSS feed:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/product-feed.xml", async (req, res) => {
    try {
        const domain = "https://teraxo.co.in";

        // Fetch only active products
        const products = await Product.find({ isActive: true })
            .sort({ updatedAt: -1 })
            .select("title slug description images updatedAt subDescription keyFeatures");

        const items = products.map(product => {
            const productUrl = `${domain}/productDetails/${product.slug}`;
            const imageUrl = product.images && product.images.length > 0 
                ? `${domain}/uploads/${product.images[0]}`
                : `${domain}/images/default-product.jpg`;

            return `
    <item>
        <title><![CDATA[${product.title}]]></title>
        <link>${productUrl}</link>
        <guid>${productUrl}</guid>
        <description><![CDATA[
            ${product.subDescription || product.description || ""}
            ${product.keyFeatures ? "<br><strong>Key Features:</strong><ul>" + product.keyFeatures.map(f => `<li>${f}</li>`).join("") + "</ul>" : ""}
        ]]></description>
        <enclosure url="${imageUrl}" type="image/jpeg" />
        <pubDate>${new Date(product.updatedAt).toUTCString()}</pubDate>
    </item>
            `;
        }).join("");

        // Ensure the XML declaration is at the absolute start of the response (no leading whitespace)
        const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Teraxo Products Feed</title>
        <link>${domain}</link>
        <description>Latest product updates from Teraxo Adhesive</description>
        ${items}
    </channel>
</rss>`;

        res.set("Content-Type", "application/xml");
        res.send(rssFeed);

    } catch (error) {
        console.error("Error generating product feed:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;