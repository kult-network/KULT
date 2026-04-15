import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Tag, Type, FileText, CheckCircle } from 'lucide-react';

const AdminBlog = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        description: '',
        keywords: '',
        image: ''
    });
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', msg: 'Broadcasting to network...' });
        try {
            await axios.post('/api/blogs', formData);
            setStatus({ type: 'success', msg: 'Intel successfully deployed to production.' });
            setFormData({ title: '', content: '', description: '', keywords: '', image: '' });
        } catch (err) {
            setStatus({ type: 'error', msg: 'Transmission failed. Inspect console.' });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Command Center // Blog Admin</h1>
                    <p className="text-zinc-500">Deploy high-octane technical intelligence to the KULT network.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <Type size={14} className="text-purple-500" /> Title
                            </label>
                            <input 
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Enter impactful title..."
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-purple-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <ImageIcon size={14} className="text-purple-500" /> Header Image URL
                            </label>
                            <input 
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                placeholder="https://unsplash.com/..."
                                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <FileText size={14} className="text-purple-500" /> Meta Description
                        </label>
                        <input 
                            required
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="SEO summary for Google search results..."
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <Tag size={14} className="text-purple-500" /> Keywords (comma separated)
                        </label>
                        <input 
                            required
                            type="text"
                            value={formData.keywords}
                            onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                            placeholder="ai, networking, engineering, india..."
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                            <FileText size={14} className="text-purple-500" /> Content (Markdown Supported)
                        </label>
                        <textarea 
                            required
                            rows={15}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            placeholder="# High-Octane Engineering..."
                            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 font-mono text-sm focus:border-purple-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="pt-6 flex items-center justify-between border-t border-zinc-800">
                        {status.msg && (
                            <div className={`text-sm flex items-center gap-2 ${status.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                {status.type === 'success' && <CheckCircle size={14} />}
                                {status.msg}
                            </div>
                        )}
                        <button 
                            type="submit"
                            className="ml-auto flex items-center gap-2 px-8 py-4 bg-purple-600 rounded-2xl font-black uppercase hover:bg-purple-500 transition-all active:scale-95"
                        >
                            <Save size={18} /> Deploy Intel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminBlog;
