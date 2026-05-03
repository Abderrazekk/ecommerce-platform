const { Product } = require("../models/Product.model");
const asyncHandler = require("express-async-handler");

// @desc    Generate dynamic sitemap.xml
// @route   GET /sitemap.xml (or /api/sitemap.xml)
// @access  Public
const generateSitemap = asyncHandler(async (req, res) => {
  // 1. EXACTLY matches your domain (with 'www' and ONE 'p')
  const BASE_URL = "https://www.shopina.tn";

  // 2. Fetch all visible products from database
  const products = await Product.find({ isVisible: true }).select(
    "_id updatedAt",
  );

  // 3. Define static pages (Added missing legal routes from App.jsx)
  const staticPages = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/help-faq",
    "/customer-service",
    "/delivery-payment",
    "/return-policy",
    "/terms-conditions",
    "/privacy-policy",
    "/legal-notice",
  ];

  // 4. Start building the XML string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static pages
  staticPages.forEach((page) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page}</loc>\n`;
    xml += `    <changefreq>${page === "" ? "daily" : "monthly"}</changefreq>\n`;
    xml += `    <priority>${page === "" ? "1.0" : "0.8"}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add dynamic product pages
  products.forEach((product) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/product/${product._id}</loc>\n`;
    xml += `    <lastmod>${product.updatedAt.toISOString().split("T")[0]}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  // 5. Send as XML header
  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

module.exports = { generateSitemap };
