import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Zap, Key, Copy, Check, Globe, Plus, ArrowLeft, Loader2, ShieldAlert, MessageSquare, BarChart3, Star, Trash2, Edit3, AlertTriangle, Calendar, Users, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast'; 

const SupervisorPanel = () => {
  const [tokens, setTokens] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [newlyGeneratedToken, setNewlyGeneratedToken] = useState(""); 
  const [newHub, setNewHub] = useState({ Name: '', Location: '', Tagline: '' });
  const [pollData, setPollData] = useState({ Question: '', OptionA: '', OptionB: '' });
  const [selectedEventId, setSelectedEventId] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/hubs/0/events`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Failed to fetch events:", err);
      try {
        const res2 = await axios.get(`${API_BASE_URL}/api/hubs`);
        setEvents(Array.isArray(res2.data.list || res2.data) ? (res2.data.list || res2.data) : []);
      } catch (err2) { console.error("Fallback also failed"); }
    }
  };

  const fetchTokens = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tokens`);
      setTokens(Array.isArray(res.data) ? res.data : res.data.list || []); 
    } catch (err) { console.error("Vault Sync Fail", err); }
  };

  useEffect(() => {
    fetchEvents();
    fetchTokens();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
      if (res.data.success) {
        showToast("Mission Scrubbed", "success");
        setEvents(events.filter(e => e.Id !== eventId && e.id !== eventId));
        setDeleteConfirm(null);
      }
    } catch { showToast("Scrub failed", "error"); } 
    finally { setIsDeleting(false); }
  };

  const generateToken = async () => {
    setLoading(true);
    setNewlyGeneratedToken(""); 
    try {
      const res = await axios.post(`${API_BASE_URL}/api/tokens/generate`);
      if (res.data.success) {
        setNewlyGeneratedToken(res.data.token); 
        fetchTokens();
        showToast("Access Key Encrypted", "success");
      }
    } catch { showToast("Encryption failed", "error"); }
    finally { setLoading(false); }
  };

  const handleAddHub = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/hubs`, newHub);
      showToast(`Hub Online: ${newHub.Name}`, "success");
      setNewHub({ Name: '', Location: '', Tagline: '' });
    } catch { showToast("Deployment failed", "error"); }
    finally { setLoading(false); }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollData.Question || !pollData.OptionA || !pollData.OptionB) return showToast("Fill all fields", "error");
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/polls`, { ...pollData, VotesA: 0, VotesB: 0 });
      showToast("Vibe Check Broadcasted!", "success");
      setPollData({ Question: '', OptionA: '', OptionB: '' });
    } catch { showToast("Broadcast failed", "error"); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(txt);
    showToast("Key Copied", "success");
    setTimeout(() => setCopied(""), 2000);
  };

  const handleSetFeaturedEvent = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return showToast("Select an event", "error");
    setLoading(true);
    try {
      const token = localStorage.getItem('kult_token');
      await axios.post(`${API_BASE_URL}/api/featured-event`, { eventId: selectedEventId }, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Featured Event Updated!", "success");
    } catch { showToast("Update failed", "error"); } 
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#333] p-4 flex items-center rounded-lg outline-none focus:border-[#0070F3] transition-colors text-sm text-white placeholder-gray-500 font-medium";

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans pb-24">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      {/* CLI TOP BANNER */}
      <div className="w-full bg-[#111111] border-b border-white/5 py-2 px-6 flex justify-between items-center text-[10px] font-medium tracking-wide uppercase text-[#888]">
         <span>Clearance: <span className="text-red-500">SUPERVISOR - LEVEL 4</span></span>
         <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-white transition-colors"><ArrowLeft size={12} /> EXIT OVERSIGHT</button>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 w-full flex flex-col gap-12">
        
        <header className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#222] pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Control Gateway</h1>
            <p className="text-[#A1A1AA] text-base font-light">Administrative oversight and network orchestration dashboard.</p>
          </div>
          <button onClick={() => navigate('/create-event')} className="px-6 py-3 bg-[#0070F3] hover:bg-[#0051B3] text-white font-semibold text-sm rounded-lg transition-all flex items-center gap-2 shadow-[0_2px_10px_rgba(0,112,243,0.2)] outline-none active:scale-95">
            <Zap size={16} /> Deploy Mission
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Missions List */}
          <section className="lg:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden hover:border-[#333] transition-all relative">
             <div className="p-6 border-b border-[#222] flex items-center justify-between bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[#A1A1AA]" />
                <h2 className="text-base font-semibold tracking-tight text-white">Global Missions Tracker</h2>
              </div>
              <span className="text-xs font-semibold text-[#888] bg-[#111] px-3 py-1 rounded-full border border-[#333]">{events.length} Deployments</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-[#000]">
              {events.map((event, i) => (
                <motion.div key={event.Id || event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-[#0a0a0a] border border-[#222] rounded-xl p-5 hover:border-[#444] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-[#111] border border-[#333] text-white font-semibold rounded-lg flex items-center justify-center">
                      {event.Name?.[0] || event.Title?.[0]}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/host-event?edit=${event.Id || event.id}`)} className="p-2 text-[#666] hover:text-white hover:bg-[#222] rounded-md transition-all"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(event.Id || event.id)} className="p-2 text-[#666] hover:text-red-500 hover:bg-[#222] rounded-md transition-all"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h3 className="text-md font-semibold mb-3 line-clamp-1 text-white">{event.Name || event.Title}</h3>
                  <div className="flex flex-col gap-2 text-[#888] text-xs font-medium">
                    <span className="flex items-center gap-2"><Calendar size={12} /> {event.start_time ? new Date(event.start_time).toLocaleDateString() : 'TBA'}</span>
                    <span className="flex items-center gap-2"><Users size={12} /> {event.Organizer_Email?.split('@')[0] || "No Organizer"}</span>
                  </div>
                </motion.div>
              ))}
              {events.length === 0 && <div className="col-span-full p-8 text-center text-[#888] text-sm">No active missions deployed in the network.</div>}
            </div>
          </section>

          {/* Hub Deployment Engine */}
          <section className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden hover:border-[#333] transition-all">
             <div className="p-6 border-b border-[#222] flex items-center gap-3">
               <Building2 size={18} className="text-[#A1A1AA]" />
               <h2 className="text-base font-semibold tracking-tight text-white">Initialize Subnet Hub</h2>
             </div>
            <form onSubmit={handleAddHub} className="p-6 space-y-5 bg-[#000]">
              <input className={inputClass} placeholder="Hub Designation (e.g. DTU)" value={newHub.Name} onChange={e => setNewHub({...newHub, Name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input className={inputClass} placeholder="Geo Location" value={newHub.Location} onChange={e => setNewHub({...newHub, Location: e.target.value})} required />
                <input className={inputClass} placeholder="Tagline" value={newHub.Tagline} onChange={e => setNewHub({...newHub, Tagline: e.target.value})} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-[#EDEDED] text-black font-semibold rounded-lg hover:bg-white transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 mt-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Provision Network Node"}
              </button>
            </form>
          </section>

          {/* Access Vault Console */}
          <section className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden hover:border-[#333] transition-all flex flex-col">
             <div className="p-6 border-b border-[#222] flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Key size={18} className="text-[#A1A1AA]" />
                 <h2 className="text-base font-semibold tracking-tight text-white">Access Vault</h2>
               </div>
               <button onClick={generateToken} disabled={loading} className="py-1.5 px-4 bg-[#0070F3] text-white text-xs font-semibold rounded-md hover:bg-[#0051B3] transition-colors flex items-center gap-2">
                 {loading ? <Loader2 className="animate-spin" size={12}/> : <><Plus size={12}/> Issue Key</>}
               </button>
             </div>
            
            <div className="p-6 bg-[#000] flex-1 flex flex-col min-h-[300px]">
              <AnimatePresence>
                {newlyGeneratedToken && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                    <div className="p-6 bg-[#0070F3]/10 border border-[#0070F3]/20 rounded-xl text-center">
                      <p className="text-xs font-medium text-[#0070F3] mb-2 uppercase tracking-wide">Newly Provisioned Key</p>
                      <h2 className="text-2xl font-mono tracking-widest text-white mb-4 select-all">{newlyGeneratedToken}</h2>
                      <button onClick={() => copyToClipboard(newlyGeneratedToken)} className="px-5 py-2 bg-[#0070F3] text-white rounded-md text-xs font-semibold hover:bg-[#0051B3] transition-all flex items-center gap-2 mx-auto">
                        {copied === newlyGeneratedToken ? <Check size={14} /> : <Copy size={14} />} {copied === newlyGeneratedToken ? "Secured" : "Copy to Clipboard"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[220px]">
                {tokens.length === 0 ? (
                   <div className="h-full flex items-center justify-center text-[#555] text-sm">No clearance keys in vault.</div>
                ) : tokens.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-xl border border-[#222] hover:border-[#444] transition-all group">
                    <div>
                      <p className={`font-mono text-base font-medium ${t.Status === 'Used' ? 'text-[#666] line-through' : 'text-white'}`}>{t.Token}</p>
                      <p className="text-[10px] font-semibold text-[#888] mt-1">{t.Status === 'Used' ? `Expended by ${t.UsedBy || 'Unknown'}` : 'Awaiting Clearance'}</p>
                    </div>
                    <button onClick={() => copyToClipboard(t.Token)} className={`p-2 rounded-md transition-all ${copied === t.Token ? 'bg-green-500/10 text-green-500' : 'bg-[#111] hover:bg-[#222] text-[#888] hover:text-white border border-[#333]'}`}>
                      {copied === t.Token ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Featured Event Selector */}
          <section className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden hover:border-[#333] transition-all">
             <div className="p-6 border-b border-[#222] flex items-center gap-3">
               <Star size={18} className="text-[#A1A1AA]" />
               <h2 className="text-base font-semibold tracking-tight text-white">Priority Mission Highlight</h2>
             </div>
             <form onSubmit={handleSetFeaturedEvent} className="p-6 bg-[#000] space-y-4">
               <select className={`${inputClass} appearance-none`} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} required>
                  <option value="">Select a Mission to Feature</option>
                  {events.map(event => <option key={event.Id || event.id} value={event.Id || event.id}>{event.Name || event.Title}</option>)}
                </select>
                <button type="submit" disabled={loading} className="w-full py-4 bg-[#111] border border-[#333] text-white font-semibold rounded-lg hover:bg-[#222] hover:border-[#444] transition-all flex items-center justify-center">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Set Featured Status"}
                </button>
             </form>
          </section>

          {/* Vibe Check Broadcast */}
          <section className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden hover:border-[#333] transition-all">
            <div className="p-6 border-b border-[#222] flex items-center gap-3">
               <BarChart3 size={18} className="text-[#A1A1AA]" />
               <h2 className="text-base font-semibold tracking-tight text-white">Vibe Check Pulse</h2>
             </div>
             <form onSubmit={handleCreatePoll} className="p-6 bg-[#000] flex flex-col gap-4">
                <textarea className={`${inputClass} resize-none h-24`} placeholder="Network Query / Question" value={pollData.Question} onChange={e => setPollData({...pollData, Question: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                   <input className={inputClass} placeholder="Option Alpha" value={pollData.OptionA} onChange={e => setPollData({...pollData, OptionA: e.target.value})} required />
                   <input className={inputClass} placeholder="Option Beta" value={pollData.OptionB} onChange={e => setPollData({...pollData, OptionB: e.target.value})} required />
                </div>
                <button type="submit" disabled={loading} className="w-full mt-2 py-4 bg-[#7928CA] text-white font-semibold rounded-lg hover:bg-[#5E1A9E] transition-all flex items-center justify-center shadow-lg">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Broadcast Interface"}
                </button>
             </form>
          </section>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm bg-[#0a0a0a] border border-[#333] p-8 rounded-2xl shadow-2xl space-y-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Scrub?</h3>
                <p className="text-[#888] text-sm leading-relaxed">This permanently deletes the mission entry from the cloud. This action cannot be reversed.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button onClick={() => handleDeleteEvent(deleteConfirm)} disabled={isDeleting} className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center">
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Scrub"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default SupervisorPanel;
