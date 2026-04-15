import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Shield, Target, Award, Globe, Users, ArrowRight } from 'lucide-react';
import SEO from '../../components/seo/SEO';

const SEOLanding = ({ title, description, keywords, slug, content }) => {
    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20">
            <SEO 
                title={title} 
                description={description} 
                keywords={keywords} 
                slug={slug}
            />

            <div className="max-w-6xl mx-auto px-6">
                <header className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase mb-6"
                    >
                        Intelligence Core :: Active
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black mb-10 leading-none tracking-tighter"
                    >
                        {title.toUpperCase()}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 text-xl md:text-2xl max-w-3xl font-medium"
                    >
                        {description}
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12 text-zinc-300">
                        {content.map((section, idx) => (
                            <section key={idx} className="space-y-6">
                                <h2 className="text-3xl font-bold text-white border-b border-zinc-900 pb-4 flex items-center gap-4">
                                    <span className="text-purple-500 text-sm font-mono opacity-50">0{idx + 1}</span>
                                    {section.heading}
                                </h2>
                                <div className="text-lg leading-relaxed space-y-4">
                                    {section.text.map((p, pIdx) => (
                                        <p key={pIdx}>{p}</p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-8">
                            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <Zap className="text-purple-500" /> Key Intel
                                </h3>
                                <ul className="space-y-4 text-zinc-400 text-sm">
                                    <li className="flex items-start gap-3">
                                        <Target className="text-purple-500 shrink-0" size={16} />
                                        <span>High-impact networking protocols for Indian engineers.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Globe className="text-purple-500 shrink-0" size={16} />
                                        <span>Decentralized access to global technical circles.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="text-purple-500 shrink-0" size={16} />
                                        <span>Curated missions and verified intelligence feeds.</span>
                                    </li>
                                </ul>
                                <Link 
                                    to="/signup" 
                                    className="mt-10 w-full py-4 bg-white text-black rounded-2xl font-black text-center block hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                                >
                                    INITIALIZE ACCESS <ArrowRight size={18} />
                                </Link>
                            </div>

                            <div className="p-1 border border-zinc-800 rounded-3xl overflow-hidden">
                                <div className="p-8 rounded-[1.4rem] bg-gradient-to-br from-purple-900/40 to-black">
                                    <Users className="text-purple-400 mb-6" size={32} />
                                    <h4 className="text-lg font-bold mb-2">Join 1,400+ Pioneers</h4>
                                    <p className="text-zinc-500 text-xs mb-0 leading-relaxed">
                                        The KULT Network is rapidly scaling across global technical hubs. Secure your node today.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SEOLanding;
