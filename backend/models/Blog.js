const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    description: {
        type: String,
        required: [true, 'Meta description is required']
    },
    keywords: {
        type: String,
        required: [true, 'Keywords are required']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop'
    },
    author: {
        type: String,
        default: 'KULT Command'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate slug before saving
BlogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Blog', BlogSchema);
