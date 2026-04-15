import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, Share2, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import SEO from '../../components/seo/SEO';

const BlogDetail = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await axios.get(`/api/blogs/${slug}`);
                setBlog(res.data.data);
            } catch (err) {
                console.error('Error fetching blog:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-pulse text-purple-500 font-bold tracking-widest">DECRYPTING INTEL...</div>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-4">INTEL NOT FOUND</h1>
            <p className="text-gray-400 mb-8">This frequency has been scrubbed or never existed.</p>
            <Link to="/blog" className="px-6 py-3 bg-purple-600 rounded-full font-bold uppercase tracking-widest hover:bg-purple-700 transition-colors">
                Return to Feed
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <SEO 
                title={blog.Title || blog.title} 
                description={blog.Description || blog.description} 
                keywords={blog.Keywords || blog.keywords} 
                image={blog.Image || blog.image}
                slug={`blog/${blog.Slug || blog.slug}`}
            />

            <div className="max-w-4xl mx-auto">
                <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-purple-400 transition-colors mb-12 uppercase text-xs font-bold tracking-widest group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Intelligence Feed
                </Link>

                <motion.header 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
                        {blog.Title || blog.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-sm border-y border-zinc-800 py-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-purple-500" />
                            {new Date(blog.CreatedAt || blog.created_at || blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-purple-500" />
                            {blog.Author || blog.author || 'KULT Command'}
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <button className="hover:text-purple-400 transition-colors"><Twitter size={18} /></button>
                            <button className="hover:text-purple-400 transition-colors"><Facebook size={18} /></button>
                            <button className="hover:text-purple-400 transition-colors"><LinkIcon size={18} /></button>
                        </div>
                    </div>
                </motion.header>

                <div className="relative rounded-3xl overflow-hidden mb-16 aspect-video border border-zinc-800">
                    <img 
                        src={blog.Image || blog.image} 
                        alt={blog.Title || blog.title} 
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="prose prose-invert prose-purple max-w-none">
                    <ReactMarkdown className="leading-relaxed text-zinc-300 text-lg space-y-6">
                        {blog.Content || blog.content}
                    </ReactMarkdown>
                </div>

                <footer className="mt-20 pt-12 border-t border-zinc-800">
                    <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shrink-0">
                            🛡️
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Join the Intelligence Network</h3>
                            <p className="text-zinc-400 mb-0">
                                KULT is scaling the next generation of engineering talent. Connect with high-impact peers and unlock global technical missions.
                            </p>
                        </div>
                        <Link to="/signup" className="px-8 py-3 bg-white text-black rounded-full font-bold whitespace-nowrap hover:bg-zinc-200 transition-colors ml-auto">
                            JOIN NOW
                        </Link>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default BlogDetail;
