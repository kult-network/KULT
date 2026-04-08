import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import {
  Globe, Zap, ArrowRight, Activity,
  MessageSquare, MapPin, Users, Calendar, Clock,
  Building2, Megaphone
} from 'lucide-react';

const HubsList = ({ user, role }) => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [showCommunitiesGlow, setShowCommunitiesGlow] = useState(false);
  const navigate = useNavigate();

  // Check URL params for scroll-to-communities
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scroll') === 'communities') {
      setShowCommunitiesGlow(!featuredEvent);
      setTimeout(() => {
        const communitiesSection = document.getElementById('communities-section');
        if (communitiesSection) {
          communitiesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [featuredEvent]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resHubs = await axios.get(`${API_BASE_URL}/api/hubs`);
        const data = resHubs.data.list || resHubs.data;
        setHubs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch hubs");
        setHubs([]);
      }

      await new Promise(r => setTimeout(r, 200));
      try {
        const resAct = await axios.get(`${API_BASE_URL}/api/activity`);
        const data = resAct.data;
        setActivities(Array.isArray(data) ? data : data.list || []);
      } catch {
        console.error("Activity fetch failed");
      }

      await new Promise(r => setTimeout(r, 200));
      try {
        const resPoll = await axios.get(`${API_BASE_URL}/api/polls/active`);
        if (resPoll.data) {
          setActivePoll(resPoll.data);
          const pollId = resPoll.data.id || resPoll.data.Id;
          if (localStorage.getItem(`voted_${pollId}`)) setVoted(true);
        }
      } catch {
        console.error("Poll fetch failed");
      }

      // Fetch featured event
      try {
        const resFeatured = await axios.get(`${API_BASE_URL}/api/featured-event`);
        setFeaturedEvent(resFeatured.data);
      } catch (err) {
        console.error("Failed to fetch featured event:", err);
      }

      setLoading(false);
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
    } catch (e) { console.error("Vote Error:", e.message); }
  };

  // Format date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Date TBA';
    }
  };

  // Format time for display
  const formatEventTime = (dateString) => {
    if (!dateString) return 'Time TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'Time TBA';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] pb-20 overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-4 md:py-8 w-full">
        
        {/* Hero Section - Only show if supervisor has set a featured event */}
        <section className="mb-8 md:mb-12">
          {featuredEvent && featuredEvent.Title ? (
            <div className="card-hero relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20"></div>
              <div className="absolute top-0 right-0 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-purple-500/20 rounded-full blur-2xl md:blur-3xl"></div>
              <div className="relative z-10">
                <span className="inline-block px-2 md:px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] md:text-xs font-medium rounded-full mb-3 md:mb-4">
                  Featured Event
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3">
                  {featuredEvent.Title}
                </h1>
                <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 max-w-full md:max-w-xl">
                  {featuredEvent.Description ? featuredEvent.Description.substring(0, 120) + '...' : 'Join us for an exciting event'}
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                    <Calendar size={14} md:size={16} />
                    <span>{formatEventDate(featuredEvent.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                    <Clock size={14} md:size={16} />
                    <span>{formatEventTime(featuredEvent.start_time)}</span>
                  </div>
                  {featuredEvent.Price && (
                    <span className={`px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium ${
                      featuredEvent.Price === 'Free' || featuredEvent.Price === 'FREE' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {featuredEvent.Price}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => {
                    const hubId = featuredEvent.Hubs?.[0]?.Id || featuredEvent.Hubs?.[0]?.id;
                    if (hubId) {
                      navigate(`/hub/${hubId}?event=${featuredEvent.Id || featuredEvent.id}`);
                    } else {
                      navigate(`/?event=${featuredEvent.Id || featuredEvent.id}`);
                    }
                  }}
                  className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm md:text-base font-semibold rounded-lg md:rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                  Register Now
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => {
                const communitiesSection = document.getElementById('communities-section');
                if (communitiesSection) {
                  communitiesSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="card-hero relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-12 text-center cursor-pointer hover:border-purple-500/40 transition-all border border-transparent"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20"></div>
              <div className="absolute top-0 right-0 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-purple-500/10 rounded-full blur-2xl md:blur-3xl"></div>
              <div className="relative z-10">
                <span className="inline-block px-2 md:px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] md:text-xs font-medium rounded-full mb-3 md:mb-4">
                  Welcome
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3">
                  Discover Events
                </h1>
                <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 max-w-full md:max-w-xl mx-auto">
                  Browse upcoming events and join communities that match your interests
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-400 text-xs md:text-sm">
                  <span>Click to browse communities</span>
                  <ArrowRight size={14} className="animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Communities Grid */}
        <section id="communities-section" className={`mb-12 ${showCommunitiesGlow ? 'animate-pulse-glow' : ''}`}>
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 text-center">Browse Communities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-4">
            {hubs.length > 0 ? hubs.map((hub, index) => {
              // Generate short name/abbreviation for all communities
              const getShortName = (name) => {
                if (!name) return 'HUB';
                // Special cases
                if (name.toLowerCase().includes('lovely professional university')) return 'LPU';
                if (name.toLowerCase().includes('indian institute of technology')) return 'IIT';
                if (name.toLowerCase().includes('national institute of technology')) return 'NIT';
                if (name.toLowerCase().includes('delhi technological university')) return 'DTU';
                if (name.toLowerCase().includes('thapar institute')) return 'TIET';
                if (name.toLowerCase().includes('birla institute')) return 'BITS';
                
                // For other names, take first letter of each word (max 4 chars)
                const words = name.trim().split(/\s+/);
                if (words.length === 1) {
                  return name.substring(0, 4).toUpperCase();
                }
                return words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
              };
              const displayName = getShortName(hub.Name);
              
              // Generate consistent gradient based on name
              const getGradient = (name) => {
                const colors = [
                  'from-purple-600/30 to-blue-600/30',
                  'from-pink-600/30 to-purple-600/30',
                  'from-blue-600/30 to-cyan-500/30',
                  'from-green-600/30 to-emerald-600/30',
                  'from-orange-600/30 to-yellow-500/30',
                  'from-red-600/30 to-pink-600/30',
                  'from-indigo-600/30 to-purple-600/30',
                  'from-cyan-500/30 to-blue-600/30',
                ];
                const hash = (name || '').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                return colors[hash % colors.length];
              };
              
              return (
                <motion.div
                  key={hub.id || hub.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/hub/${hub.id || hub.Id}`} className="block h-full">
                    <div className="card-dark p-4 md:p-5 text-center hover:border-purple-500/40 transition-all cursor-pointer group flex flex-col relative overflow-hidden w-full aspect-square rounded-2xl">
                      {/* Background Gradient - Round Square */}
                      <div className={`absolute -inset-4 rounded-2xl bg-gradient-to-br ${getGradient(hub.Name)} opacity-50`}></div>
                      <div className="absolute -top-6 -right-6 w-24 h-24 md:w-20 md:h-20 opacity-10 flex items-center justify-center">
                        <span className="text-5xl md:text-5xl font-black text-white hidden">{displayName}</span>
                      </div>
                      
                      {/* Content - Full grid width */}
                      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full py-6 md:py-2">
                        <div className="w-20 h-20 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-600/40 to-blue-600/40 flex items-center justify-center mb-3 md:mb-4 shadow-lg shadow-purple-500/20">
                          <Building2 size={32} md:size={20} className="text-white" />
                        </div>
                        <h4 className="text-lg md:text-sm font-semibold text-white group-hover:text-purple-400 transition-colors text-center">
                          {displayName}
                        </h4>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            }) : (
              <div className="col-span-full">
                <div className="card-dark p-6 md:p-8 text-center">
                  <Globe size={24} md:size={32} className="mx-auto mb-2 md:mb-3 text-gray-600" />
                  <p className="text-gray-400 text-sm md:text-base">No communities found</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Grid - Network Pulse & Vibe Check */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start mt-6 md:mt-8 justify-center">
          
          {/* Network Pulse */}
          <div className="md:col-span-2 relative overflow-hidden rounded-xl">
            {/* Background icon */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 opacity-5 pointer-events-none">
              <Activity size={100} md:size={150} className="text-green-400" strokeWidth={1} />
            </div>
            <div className="card-dark p-4 md:p-6 relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 shrink-0">
                <Activity size={16} md:size={18} className="text-green-400" />
                <h3 className="text-sm md:text-base font-semibold text-white flex-1 text-center">Network Pulse</h3>
              </div>
              <div className="space-y-2 md:space-y-3 overflow-y-auto pr-1 flex-1 max-h-[250px] custom-scrollbar">
                {activities.length > 0 ? activities.slice(0, 10).map((act, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3 py-2 md:py-3 border-b border-white/5 last:border-0">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                    <span className="text-[10px] md:text-xs text-gray-400 truncate">{act.Log}</span>
                  </div>
                )) : (
                  <p className="text-xs md:text-sm text-gray-600 py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Vibe Check */}
          <div className="relative overflow-hidden rounded-xl h-full">
            {/* Background icon */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 opacity-5 pointer-events-none">
              <MessageSquare size={100} md:size={120} className="text-cyan-400" strokeWidth={1} />
            </div>
            <div className="card-dark p-4 md:p-6 relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 shrink-0">
                <MessageSquare size={16} md:size={18} className="text-cyan-400" />
                <h3 className="text-sm md:text-base font-semibold text-white flex-1 text-center">Vibe Check</h3>
              </div>
              {activePoll ? (
                <div className="flex-1 flex flex-col">
                  <p className="text-xs md:text-sm text-gray-300 mb-4 line-clamp-3 italic">"{activePoll.Question}"</p>
                  <div className="mt-auto">
                    {!voted ? (
                      <div className="space-y-2">
                        <button 
                          onClick={() => handleVote('VotesA')} 
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] md:text-xs text-gray-300 transition-colors text-left px-3 font-bold uppercase tracking-widest"
                        >
                          {activePoll.OptionA}
                        </button>
                        <button 
                          onClick={() => handleVote('VotesB')} 
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] md:text-xs text-gray-300 transition-colors text-left px-3 font-bold uppercase tracking-widest"
                        >
                          {activePoll.OptionB}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          <span>Result Protocol</span>
                          <span>{Math.round((activePoll.VotesA / (activePoll.VotesA + activePoll.VotesB || 1)) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(activePoll.VotesA / (activePoll.VotesA + activePoll.VotesB || 1)) * 100}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-gray-600 italic">No active polls found.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .card-hero {
          background: rgba(20, 20, 25, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .card-dark {
          background: rgba(20, 20, 25, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .card-dark:hover {
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.15), 0 0 60px rgba(139, 92, 246, 0.05);
          transform: translateY(-2px);
        }
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-border:hover::before {
          opacity: 1;
        }
        
        /* Glow animation for communities section */
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.2);
          }
        }
        
        .animate-pulse-glow {
          animation: glow-pulse 2s ease-in-out infinite;
          border-radius: 24px;
          padding: 8px;
          background: rgba(139, 92, 246, 0.05);
        }
      `}</style>
    </div>
  );
};

export default HubsList;