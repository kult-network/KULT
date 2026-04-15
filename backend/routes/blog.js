const express = require('express');
const router = express.Router();
const axios = require('axios');
const slugify = require('slugify');

const NOCO_BASE_URL = process.env.NOCO_BASE_URL;
const HEADERS = { 'xc-token': process.env.NOCO_TOKEN };
const TABLE_ID_BLOGS = process.env.TABLE_ID_BLOGS || "m_your_blog_table_id";

// POST /api/blogs (Create)
router.post('/', async (req, res) => {
    try {
        const { title, content, description, keywords, image } = req.body;
        const slug = slugify(title, { lower: true, strict: true });
        
        const response = await axios.post(`${NOCO_BASE_URL}/${TABLE_ID_BLOGS}`, {
            Title: title,
            Content: content,
            Description: description,
            Keywords: keywords,
            Slug: slug,
            Image: image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop'
        }, { headers: HEADERS });

        res.status(201).json({ success: true, data: response.data });
    } catch (err) {
        console.error("NocoDB Blog Post Error:", err.response?.data || err.message);
        res.status(400).json({ success: false, error: "Failed to create blog entry" });
    }
});

// GET /api/blogs (List)
router.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_BLOGS}`, {
            headers: HEADERS,
            params: { sort: '-Id', limit: 100 }
        });
        const list = response.data.list || response.data || [];
        res.status(200).json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
    }
});

// GET /api/blogs/:slug (Single)
router.get('/:slug', async (req, res) => {
    try {
        const response = await axios.get(`${NOCO_BASE_URL}/${TABLE_ID_BLOGS}`, {
            headers: HEADERS,
            params: { where: `(Slug,eq,${req.params.slug})` }
        });
        const list = response.data.list || response.data || [];
        const blog = Array.isArray(list) ? list[0] : list;
        
        if (!blog) {
            return res.status(404).json({ success: false, error: 'Blog post not found' });
        }
        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
