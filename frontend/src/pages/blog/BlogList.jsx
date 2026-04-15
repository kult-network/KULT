import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Zap, Clock, User, ArrowRight } from 'lucide-react';
import SEO from '../../components/seo/SEO';

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await axios.get('/api/blogs');
                setBlogs(res.data.data);
            } catch (err) {
                console.error('Error fetching blogs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Zap className="text-purple-500 w-12 h-12" />
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <SEO 
                title="Intelligence Feed" 
                description="Explore the latest insights on student networking, AI communities, and college networking in India." 
                keywords="student networking blog, AI community insights, college networking india"
                slug="blog"
            />
            
            <div className="max-w-6xl mx-auto">
                <header className="mb-16 text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4"
                    >
                        Intelligence Feed
                    </motion.h1>
                    <p className="text-gray-400 text-lg">Missions, Insights, and Network Protocols.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.length > 0 ? blogs.map((blog, idx) => (
                        <motion.article 
                            key={blog._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all group"
                        >
                            <div className="aspect-video overflow-hidden">
                                <img 
                                    src={blog.Image || blog.image} 
                                    alt={blog.Title || blog.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-xs text-purple-400 mb-3 uppercase tracking-widest font-bold">
                                    <Clock size={12} />
                                    {new Date(blog.CreatedAt || blog.created_at || blog.createdAt).toLocaleDateString()}
                                </div>
                                <h2 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">
                                    {blog.Title || blog.title}
                                </h2>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                    {blog.Description || blog.description}
                                </p>
                                <Link 
                                    to={`/blog/${blog.Slug || blog.slug}`}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all"
                                >
                                    DECRYPT FULL INTEL <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.article>
                    )) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                            <Zap className="text-zinc-700 w-16 h-16 mx-auto mb-4" />
                            <p className="text-zinc-500">No signals detected on this frequency yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogList;
