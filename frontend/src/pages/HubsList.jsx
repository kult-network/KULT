import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import {
  Globe, Zap, ArrowRight, Activity,
  MessageSquare, TrendingUp
} from 'lucide-react';

const RANDOM_TAGLINES = [
  "SYSTEM CONFIGURATION: OPTIMAL", "NEURAL NETWORK SYNCED",
  "SCANNING CAMPUS NODES...", "WELCOME TO THE KULT ECOSYSTEM",
  "ENCRYPTED GATEWAY ACTIVE", "ACCESSING ACADEMIC GRID",
  "PROTOCOLS INITIALIZED"
];

const HUB_COLORS = [
  { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-100", shadow: "shadow-purple-200" },
  { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100", shadow: "shadow-blue-200" },
  { bg: "bg-pink-600", text: "text-pink-600", light: "bg-pink-50", border: "border-pink-100", shadow: "shadow-pink-200" },
  { bg: "bg-cyan-500", text: "text-cyan-500", light: "bg-cyan-50", border: "border-cyan-100", shadow: "shadow-cyan-200" },
  { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-50", border: "border-orange-100", shadow: "shadow-orange-200" },
  { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50", border: "border-emerald-100", shadow: "shadow-emerald-200" },
];

const HubsList = ({ user }) => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemMsg] = useState(() => RANDOM_TAGLINES[Math.floor(Math.random() * RANDOM_TAGLINES.length)]);
  const [activities, setActivities] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [voted, setVoted] = useState(false);

  const _navigate = useNavigate();

  const getHubAbbreviation = (name) => {
    if (!name) return "HUB";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.substring(0, 3).toUpperCase();
    return words.map(word => word[0]).join('').toUpperCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resHubs = await axios.get(`${API_BASE_URL}/api/hubs`);
        const data = resHubs.data.list || resHubs.data;
        const parsedHubs = Array.isArray(data) ? data : [];
        setHubs(parsedHubs);
        console.log(`🔒 GATEWAY OVERRIDE: Forcing hubs visible for everyone. Hubs loaded: ${parsedHubs.length}`);
      } catch {
        setHubs([]);
        console.error("Failed to fetch hubs");
      }

      // Add a tiny delay to respect rate limits
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

      setLoading(false);
    };

    fetchData();
  }, [user]);

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
    } catch (e) { console.error("❌ Vote Error:", e.message); }
  };

  return (
    <div className="min-h-screen bg-[var(--body-bg)] font-sharp pb-20 selection:bg-purple-600 selection:text-white text-[var(--text-primary)]">

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER SECTION */}
        <header className="mb-20 px-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <p className="text-[10px] font-black tracking-[0.5em] text-[var(--accent-color)] uppercase">{systemMsg}</p>
          </div>
          <h1 className="text-[2.8rem] sm:text-[3.4rem] md:text-[5.8rem] font-black font-sporty tracking-tight uppercase leading-[0.95] mb-4 text-gradient max-w-4xl">
            NETWORK <span className="text-gradient italic">ACCESS</span>
          </h1>
          {loading && (
            <div className="mt-8 rounded-[40px] border border-white/10 bg-slate-950/80 shadow-2xl p-16 text-center text-white/80">
              <div className="inline-flex items-center justify-center gap-3 mb-4 text-sm font-black uppercase tracking-[0.35em]">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> LOADING HUB GRID...
              </div>
              <p className="text-sm text-gray-400">The hub feed is initializing in the background. Stay ready.</p>
            </div>
          )}
        </header>

        {/* PULSE & VIBE CHECK SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 px-2">

          {/* NETWORK PULSE */}
          <div className="lg:col-span-2 ambient-card text-white p-10 rounded-[50px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-green-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Network Pulse Feed</span>
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <div className="space-y-5 max-h-[300px] overflow-y-auto pr-4">
              {activities.length > 0 ? activities.map((act, i) => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex items-center gap-4 text-[11px] font-bold border-b border-white/5 pb-4 last:border-0 hover:translate-x-2 transition-transform">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full shadow-[0_0_8px_#9333ea]"></div>
                  <span className="uppercase tracking-wider text-gray-300">{act.Log}</span>
                </motion.div>
              )) : <p className="text-[10px] font-black uppercase tracking-widest text-gray-800 py-10">Signals searching...</p>}
            </div>
          </div>

          {/* VIBE CHECK (POLLS) */}
          <div className="ambient-card p-10 rounded-[50px] text-white relative overflow-hidden flex flex-col justify-between border border-[rgba(255,255,255,0.12)]">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare size={18} className="text-cyan-200" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Vibe Check</span>
              </div>
              <h3 className="text-3xl font-black uppercase italic leading-tight mb-10 text-white/90">
                {activePoll ? activePoll.Question : "NO ACTIVE MISSION"}
              </h3>
            </div>

            {activePoll && (
              <div>
                {!voted ? (
                  <div className="space-y-4">
                    <button onClick={() => handleVote('VotesA')} className="w-full py-5 bg-[var(--accent-bg)] hover:bg-[var(--accent-color)] text-[var(--accent-color)] hover:text-white border border-[var(--accent-border)] rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                      {activePoll.OptionA}
                    </button>
                    <button onClick={() => handleVote('VotesB')} className="w-full py-5 bg-[var(--accent-bg)] hover:bg-[var(--accent-color)] text-[var(--accent-color)] hover:text-white border border-[var(--accent-border)] rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">
                      {activePoll.OptionB}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between text-[10px] font-black">
                      <span>RESULTS DEPLOYED</span>
                      <span>{Math.round((activePoll.VotesA / (activePoll.VotesA + activePoll.VotesB || 1)) * 100)}% MATCH</span>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(activePoll.VotesA / (activePoll.VotesA + activePoll.VotesB || 1)) * 100}%` }}
                        className="h-full bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* HUBS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-2">
          {loading ? (
            <div className="col-span-full py-40 text-center opacity-80">
              <div className="inline-flex items-center justify-center gap-3 mb-4 text-lg font-black uppercase tracking-[0.2em] text-white">
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" /> LOADING HUBS...
              </div>
              <p className="text-sm text-gray-400">This area will populate as soon as your hub data arrives.</p>
            </div>
          ) : hubs.length > 0 ? hubs.map((hub, index) => {
            const color = HUB_COLORS[index % HUB_COLORS.length];
            return (
              <motion.div key={hub.id || hub.Id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link to={`/hub/${hub.id || hub.Id}`}>
                  <div className={`p-8 md:p-10 min-h-[520px] md:h-[500px] bg-[var(--card-bg)] rounded-[40px] md:rounded-[60px] border-2 border-[var(--border-color)] shadow-xl shadow-[0_40px_80px_-20px_var(--shadow-color)] flex flex-col justify-between overflow-hidden group hover:${color.shadow} transition-all`}>
                    <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                      <div className="flex justify-between gap-4 flex-shrink-0">
                        <div className={`w-16 h-16 rounded-[24px] ${color.light} flex items-center justify-center flex-shrink-0`}>
                          <Globe size={28} className={color.text} />
                        </div>
                        <span className={`text-[8px] font-black uppercase px-3 py-2 ${color.bg} text-white rounded-full flex-shrink-0`}>LIVE</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-3xl font-black font-sporty uppercase text-white group-hover:text-[var(--accent-color)] transition-colors line-clamp-3 break-words">{getHubAbbreviation(hub.Name)}</h3>
                        <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-3 line-clamp-2">{hub.Tagline}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center gap-4 flex-shrink-0 mt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex-1 truncate">Gateway Access</span>
                      <div className={`w-14 h-14 ${color.bg} text-white rounded-[22px] flex items-center justify-center group-hover:translate-x-2 transition-transform flex-shrink-0`}><ArrowRight size={24} /></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          }) : (
            <div className="col-span-full py-40 text-center opacity-20">
              <Zap size={64} className="mx-auto mb-4 text-purple-400" />
              <p className="font-black text-2xl uppercase tracking-widest text-purple-300">No Nodes Found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HubsList;
