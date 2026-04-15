const express = require('express');
const router = express.Router();
const axios = require('axios');

const NOCO_BASE_URL = process.env.NOCO_BASE_URL;
const HEADERS = { 'xc-token': process.env.NOCO_TOKEN };
const TABLE_ID_BLOGS = process.env.TABLE_ID_BLOGS;

router.get('/sitemap.xml', async (req, res) => {
    try {
        let blogs = [];
        if (TABLE_ID_BLOGS) {
            const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_BLOGS}`, {
                headers: HEADERS,
                params: { fields: 'Slug,updated_at', limit: 100 }
            });
            blogs = response.data.list || response.data || [];
        }

        const baseUrl = 'https://kultnetwork.in';
        const staticPages = [
            '',
            '/student-networking-platform-india',
            '/ai-student-community',
            '/college-networking-app',
            '/blog'
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
        });

        blogs.forEach(blog => {
            const lastMod = blog.updated_at ? blog.updated_at.split(' ')[0] : new Date().toISOString().split('T')[0];
            xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.Slug || blog.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (err) {
        console.error("Sitemap error:", err.message);
        res.status(500).end();
    }
});

module.exports = router;
