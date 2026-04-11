import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { Globe, Zap, ArrowRight, Activity, MessageSquare, Calendar, Clock, Building2, Terminal, Code2, ShieldAlert } from 'lucide-react';
import { useSEO } from '../utils/seo';
import { SkeletonList } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { timeAgo, parseActivityStr } from '../utils/format';

const HubsList = ({ user, role }) => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const navigate = useNavigate();

  useSEO('Network Pulse', 'The operating system for unified campus intelligence and missions.');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scroll') === 'communities') {
      setTimeout(() => {
        document.getElementById('communities-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHubs, resAct, resPoll] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/hubs`),
          axios.get(`${API_BASE_URL}/api/activity`),
          axios.get(`${API_BASE_URL}/api/polls/active`)
        ]);

        if (resHubs.status === 'fulfilled') setHubs(Array.isArray(resHubs.value.data.list || resHubs.value.data) ? (resHubs.value.data.list || resHubs.value.data) : []);
        if (resAct.status === 'fulfilled') setActivities(Array.isArray(resAct.value.data.list || resAct.value.data) ? (resAct.value.data.list || resAct.value.data) : []);
        
        if (resPoll.status === 'fulfilled' && resPoll.value.data) {
          setActivePoll(resPoll.value.data);
          if (localStorage.getItem(`voted_${resPoll.value.data.id || resPoll.value.data.Id}`)) setVoted(true);
        }
      } catch (err) {
        console.error("Data synchronization error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVote = async (option) => {
    if (!activePoll || voted) return;
    const pollId = activePoll.id || activePoll.Id;
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/polls/${pollId}/vote`, { option });
      if (res.data.success) {
        setVoted(true);
        localStorage.setItem(`voted_${pollId}`, 'true');
        const updated = await axios.get(`${API_BASE_URL}/api/polls/active`);
        setActivePoll(updated.data);
      }
    } catch (e) { console.error("Vote Error:", e); }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getShortName = (name) => {
    if (!name) return 'HUB';
    if (name.toLowerCase().includes('lovely professional university')) return 'LPU';
    if (name.toLowerCase().includes('delhi technological university')) return 'DTU';
    const words = name.trim().split(/\s+/);
    return words.length === 1 ? name.substring(0, 4).toUpperCase() : words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] pb-32 font-sans selection:bg-[#EDEDED] selection:text-black">
      
      <main className="max-w-[1200px] mx-auto px-6 sm:px-8 py-16 w-full flex flex-col gap-24">
        
        {/* 
          ========================================================================
          STEP 2: HERO SECTION REDESIGN (STRIPE/VERCEL INSPIRED)
          ========================================================================
        */}
        <section className="relative w-full flex flex-col lg:flex-row items-center gap-16 overflow-hidden">
          {/* Abstract Grid Background inside Hero */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
          
          <div className="relative z-10 w-full lg:w-3/5 flex flex-col items-start text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="px-3 py-1 bg-white/5 text-[#EDEDED] border border-white/10 rounded-full text-xs font-semibold tracking-wide mb-8 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0070F3] animate-pulse"></span> 
                KULT NETWORK IS LIVE
              </span>
              
              <h1 className="text-[44px] md:text-[60px] lg:text-[72px] font-bold tracking-tight text-white leading-[1.05] mb-6">
                The Operating System<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EDEDED] to-[#666666]">for Campus Networks.</span>
              </h1>
              
              <p className="text-[#888] text-lg md:text-xl mb-10 leading-relaxed font-medium max-w-2xl">
                Scale your technical communities seamlessly. Deploy missions, analyze pulse metrics, and synchronize engineering intelligence across global architectural hubs.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                {/* PRIMARY CTA: Bold, High Contrast */}
                <button 
                  onClick={() => document.getElementById('communities-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="w-full sm:w-auto bg-[#EDEDED] hover:bg-white text-black px-8 py-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_24px_rgba(255,255,255,0.1)]"
                >
                  Explore Sectors <ArrowRight size={16} />
                </button>
                {/* SECONDARY CTA: Subtle Outline */}
                <button 
                  onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="w-full sm:w-auto bg-transparent border border-[#333] hover:border-[#666] hover:bg-white/5 text-white px-8 py-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95 outline-none"
                >
                  About KULT Network <Globe size={16} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* SaaS DASHBOARD PREVIEW UI ELEMENT */}
          <div className="relative z-10 w-full lg:w-2/5 hidden lg:block perspective-1000">
            <motion.div 
              initial={{ opacity: 0, rotateY: -10, x: 20 }} 
              animate={{ opacity: 1, rotateY: -5, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl overflow-hidden shadow-[#0070F3]/10"
            >
              <div className="bg-[#111] border-b border-[#222] px-4 py-3 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                <div className="w-3 h-3 rounded-full bg-[#333]"></div>
                <div className="w-3 h-3 rounded-full bg-[#333]"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                   <div className="w-32 h-4 bg-[#222] rounded animate-pulse"></div>
                   <div className="w-8 h-8 rounded-full bg-[#0070F3]/20 flex items-center justify-center"><Activity size={12} className="text-[#0070F3]"/></div>
                </div>
                <div className="space-y-4">
                  <div className="w-full h-12 bg-gradient-to-r from-[#111] to-transparent rounded border border-[#222] flex items-center px-4">
                    <div className="w-2/3 h-2 bg-[#222] rounded"></div>
                  </div>
                  <div className="w-full h-12 bg-gradient-to-r from-[#111] to-transparent rounded border border-[#222] flex items-center px-4">
                    <div className="w-1/2 h-2 bg-[#222] rounded"></div>
                  </div>
                  <div className="w-full h-12 bg-gradient-to-r from-[#111] to-transparent rounded border border-[#222] flex items-center px-4">
                    <div className="w-3/4 h-2 bg-[#222] rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>


        {/* 
          ========================================================================
          STEP 4: NOTION-STYLE NETWORK HUBS GRID
          ========================================================================
        */}
        <section id="communities-section">
          <div className="flex justify-between items-end mb-8 border-b border-[#222] pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Network Sectors</h2>
              <p className="text-sm text-[#A1A1AA] font-light">Explore integrated campus databases.</p>
            </div>
          </div>
          
          <div className={`grid ${loading || hubs.length === 0 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4 md:gap-6`}>
            {loading ? (
              <div className="col-span-full"><SkeletonList count={2} /></div>
            ) : hubs.length > 0 ? hubs.map((hub) => (
              <motion.div key={hub.id || hub.Id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Link to={`/hub/${hub.id || hub.Id}`} className="block h-full outline-none">
                  <div className="group relative w-full h-full bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#0070F3]/40 hover:shadow-[0_0_30px_rgba(0,112,243,0.1)] hover:-translate-y-1">
                    {/* Hover Gradient Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,112,243,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="p-6 relative z-10 flex flex-col h-full">
                      {/* Top Row: Icon and Status */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#111] to-[#050505] border border-white/10 flex items-center justify-center shadow-inner group-hover:border-[#0070F3]/40 group-hover:text-[#0070F3] transition-all duration-300 text-[#888]">
                          <Code2 size={18} strokeWidth={1.5} />
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[9px] font-bold tracking-widest text-green-500 uppercase leading-none mt-[1px]">Active</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="mt-auto">
                        <h4 className="text-xl font-semibold text-white tracking-tight mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#A1A1AA] transition-colors">{getShortName(hub.Name)}</h4>
                        <p className="text-xs text-[#888] font-medium tracking-wide line-clamp-1">{hub.Name}</p>
                      </div>
                    </div>

                    {/* Accent Line Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0070F3] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                  </div>
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-full"><EmptyState title="No Sectors Online" message="Network is currently dormant." icon={Globe} /></div>
            )}
          </div>
        </section>

        {/* 
          ========================================================================
          STEP 5: STRIPE-STYLE SPLIT METRICS (PERFECT SPACING)
          ========================================================================
        */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Module 1: Network Log */}
          <div className="group relative bg-[#050505] border border-white/5 rounded-2xl flex flex-col h-[420px] overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(79,70,229,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <Activity size={14} />
                </div>
                <h3 className="text-sm font-semibold tracking-wide text-[#EDEDED]">Context Stream</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-[#888] tracking-widest uppercase items-center gap-1.5 hidden sm:flex">
                  Users Online: <span className="text-white font-mono font-medium">1,402</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest hidden sm:inline-block">Syncing</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar relative z-10">
              {loading ? (
                 <SkeletonList count={3} />
              ) : activities.length > 0 ? activities.slice(0, 10).map((act, i) => {
                const parsed = parseActivityStr(act.Log);
                let subjectDisplay = parsed.subject;
                if (act.Log.toLowerCase().includes('joined')) {
                  subjectDisplay = "A new user joined the network";
                }
                
                return (
                  <div key={i} className="flex gap-4 px-4 py-3 hover:bg-white/[0.03] rounded-xl transition-all border border-transparent hover:border-white/5 cursor-default">
                    <div className="mt-1.5 flex-shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 shadow-[0_0_8px_rgba(79,70,229,0.6)]"></div></div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-white font-medium truncate">{subjectDisplay}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">{parsed.action}</span>
                        <span className="text-[#333]">•</span>
                        <span className="text-[10px] text-[#666]">{timeAgo(act.CreatedAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="h-full flex items-center justify-center"><EmptyState title="Quiet" message="No pulse detected." /></div>
              )}
            </div>
          </div>

          {/* Module 2: Vibe Check / Intel */}
          <div className="group relative bg-[#050505] border border-white/5 rounded-2xl flex flex-col h-[420px] overflow-hidden transition-all duration-300 hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(244,63,94,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             
             <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400 group-hover:text-rose-300 transition-colors">
                  <ShieldAlert size={14} />
                </div>
                <h3 className="text-sm font-semibold tracking-wide text-[#EDEDED]">Threat Intelligence</h3>
              </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col relative z-10">
              {activePoll ? (
                <>
                  <p className="text-lg font-medium text-[#EDEDED] mb-10 leading-relaxed max-w-sm">{activePoll.Question}</p>
                  <div className="mt-auto space-y-3">
                    {!voted ? (
                      <>
                        <button onClick={() => handleVote('VotesA')} className="w-full text-left px-5 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#444] rounded-xl text-sm font-medium transition-all group flex justify-between">
                          <span className="text-[#A1A1AA] group-hover:text-white transition-colors">{activePoll.OptionA}</span>
                          <ArrowRight size={16} className="text-[#444] group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"/>
                        </button>
                        <button onClick={() => handleVote('VotesB')} className="w-full text-left px-5 py-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#444] rounded-xl text-sm font-medium transition-all group flex justify-between">
                          <span className="text-[#A1A1AA] group-hover:text-white transition-colors">{activePoll.OptionB}</span>
                          <ArrowRight size={16} className="text-[#444] group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"/>
                        </button>
                      </>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-[#A1A1AA]">
                            <span>{activePoll.OptionA}</span>
                            <span className="text-white">{Math.round((activePoll.VotesA / (activePoll.VotesA + activePoll.VotesB || 1)) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(activePoll.VotesA / (activePoll.VotesA + activePoll.VotesB || 1)) * 100}%` }} className="h-full bg-white" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-[#888]">
                            <span>{activePoll.OptionB}</span>
                            <span className="text-[#888]">{Math.round((activePoll.VotesB / (activePoll.VotesA + activePoll.VotesB || 1)) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(activePoll.VotesB / (activePoll.VotesA + activePoll.VotesB || 1)) * 100}%` }} className="h-full bg-[#444]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                 <div className="h-full flex items-center justify-center text-[#555] text-sm font-medium">No intelligence reports available.</div>
              )}
            </div>
            {/* Subtle bottom gradient map for depth */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#111111]/80 to-transparent pointer-events-none z-0"></div>
          </div>
        </section>

        {/* 
          ========================================================================
          STEP 6: ABOUT & SUPPORT INFRASTRUCTURE
          ========================================================================
        */}
        <section id="about-section" className="bg-[#050505] border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden group hover:border-[#333] transition-colors duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            {/* Left Col: About & Links */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-4 flex items-center gap-2">
                <Globe className="text-[#888]" size={20} /> About KULT Network
              </h2>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8 max-w-md">
                KULT is an advanced operating system built to scale technical campus communities. By unifying engineering intelligence, hacking missions, and network metrics across global architectural hubs, we empower student organizers to operate at industrial speeds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSd6VvqS5cPwxqNqjJ1M5lap4JNmib0WAL8QuRcQlV-uVATnbQ/viewform?usp=publish-editor"
                  target="_blank" rel="noopener noreferrer"
                  className="bg-white text-black hover:bg-[#EAEAEA] px-5 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Submit Feedback
                </a>
                <a 
                  href="mailto:support@kultnetwork.in"
                  className="bg-transparent border border-[#333] hover:border-[#666] hover:bg-white/5 text-white px-5 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Terminal size={16} className="text-[#888]" /> support@kultnetwork.in
                </a>
              </div>
            </div>

            {/* Right Col: Organizer Access Steps */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <ShieldAlert className="text-[#888]" size={16} /> Acquiring Organizer Protocols
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-[#0A0A0A] border border-white/5 p-4 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/20">01</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Create an Identity Node</h4>
                    <p className="text-xs text-[#888] leading-relaxed">Sign up onto the KULT OS platform using your standard university credentials to generate a base user identity.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-[#0A0A0A] border border-white/5 p-4 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/20">02</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Establish Hub Affiliation</h4>
                    <p className="text-xs text-[#888] leading-relaxed">Join your specific university sector organically. Build a baseline reputation within the network.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-[#0A0A0A] border border-white/5 p-4 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/20">03</div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Request Elevation Clearance</h4>
                    <p className="text-xs text-[#888] leading-relaxed">Contact your local <b className="text-white">SUPERVISOR</b> or email Support. Upon verification of your technical club leadership, your clearance is artificially elevated to <b className="text-white">ORGANIZER</b>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </main>
    </div>
  );
};

export default HubsList;