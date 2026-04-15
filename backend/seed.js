const mongoose = require('mongoose');
const Blog = require('./models/Blog');
require('dotenv').config();

const blogs = [
    {
        title: "How to Build a High-Performance Student Networking Platform in India",
        description: "Explore the architectural requirements and networking protocols for building a student networking platform in India.",
        keywords: "student networking platform india, engineering students, technical networking",
        content: `# Building the Future of Student Networking\n\nIndia is home to one of the largest engineering student populations in the world. However, the infrastructure for technical networking remains fragmented...`,
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
    },
    {
        title: "The Rise of the AI Student Community: Decoding the Next Decade",
        description: "Why joining an AI student community is the most critical move for aspiring engineers in 2024.",
        keywords: "AI student community, machine learning students, technical intelligence",
        content: `# The Intelligence Explosion\n\nArtificial Intelligence is no longer just a buzzword. It is the core operating system of the next decade...`,
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Why KULT is the Only College Networking App You Need in 2024",
        description: "Compared to traditional social media, KULT is a high-octane terminal for college networking and intelligence scaling.",
        keywords: "college networking app, campus app, student productivity",
        content: `# Beyond Social Media\n\nTraditional college apps are built for distraction. KULT is built for execution...`,
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");
        await Blog.deleteMany();
        await Blog.insertMany(blogs);
        console.log("Seed successful.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
