const { Product } = require("../models/Product.model");
const asyncHandler = require("express-async-handler");

// @desc    Generate dynamic sitemap.xml
// @route   GET /sitemap.xml (or /api/sitemap.xml)
// @access  Public
const generateSitemap = asyncHandler(async (req, res) => {
  // 1. Define your base URL (Frontend URL)
  const BASE_URL = "https://www.shoppina.tn";

  // 2. Fetch all visible products from database
  const products = await Product.find({ isVisible: true }).select("_id updatedAt");

  // 3. Define static pages (Matching your React routes)
  const staticPages = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/help-faq",
    "/customer-service",
    "/delivery-payment",
    "/return-policy",
  ];

  // 4. Start building the XML string
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  staticPages.forEach((page) => {
    xml += `
    <url>
      <loc>${BASE_URL}${page}</loc>
      <changefreq>daily</changefreq>
      <priority>${page === "" ? "1.0" : "0.8"}</priority>
    </url>`;
  });

  // Add dynamic product pages
  products.forEach((product) => {
    xml += `
    <url>
      <loc>${BASE_URL}/product/${product._id}</loc>
      <lastmod>${product.updatedAt.toISOString().split("T")[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`;
  });

  xml += `</urlset>`;

  // 5. Send as XML header
  res.header("Content-Type", "application/xml");
  res.status(200).send(xml);
});

module.exports = { generateSitemap };