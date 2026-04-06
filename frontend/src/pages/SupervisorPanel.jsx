import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { Zap, Key, Copy, Check, Globe, Plus, ArrowLeft, Loader2, ShieldAlert, MessageSquare, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast'; 
const SupervisorPanel = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [newlyGeneratedToken, setNewlyGeneratedToken] = useState(""); 
  const [newHub, setNewHub] = useState({ Name: '', Location: '', Tagline: '' });
  const [pollData, setPollData] = useState({ Question: '', OptionA: '', OptionB: '' });
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
  };
  const fetchTokens = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tokens`);
      const data = Array.isArray(res.data) ? res.data : res.data.list || [];
      setTokens([...data]); 
    } catch (err) { console.error("❌ Vault Sync Fail", err); }
  };
  useEffect(() => { fetchTokens(); }, []);
  const generateToken = async () => {
    setLoading(true);
    setNewlyGeneratedToken(""); 
    try {
      const res = await axios.post(`${API_BASE_URL}/api/tokens/generate`);
      if (res.data.success) {
        setNewlyGeneratedToken(res.data.token); 
        fetchTokens();
        showToast("ACCESS KEY ENCRYPTED 🔑", "success");
      }
    } catch { showToast("ENCRYPTION FAILED", "error"); }
    finally { setLoading(false); }
  };
  const handleAddHub = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/hubs`, newHub);
      showToast(`HUB ONLINE: ${newHub.Name.toUpperCase()}`, "success");
      setNewHub({ Name: '', Location: '', Tagline: '' });
    } catch { showToast("HUB DEPLOYMENT FAILED", "error"); }
    finally { setLoading(false); }
  };
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollData.Question || !pollData.OptionA || !pollData.OptionB) return showToast("FILL ALL FIELDS", "error");
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/polls`, { ...pollData, VotesA: 0, VotesB: 0 });
      showToast("VIBE CHECK BROADCASTED! 🛰️", "success");
      setPollData({ Question: '', OptionA: '', OptionB: '' });
    } catch { showToast("POLL BROADCAST FAILED", "error"); }
    finally { setLoading(false); }
  };
  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(txt);
    showToast("KEY COPIED TO CLIPBOARD", "success");
    setTimeout(() => setCopied(""), 2000);
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sharp relative overflow-x-hidden">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-16 relative z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-white uppercase font-black text-[10px] tracking-[0.4em] transition-all">
          <ArrowLeft size={16} /> EXIT COMMAND
        </button>
        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] tracking-widest border border-red-500/20 px-4 py-2 rounded-full bg-red-500/5 backdrop-blur-md">
          <ShieldAlert size={14} /> RESTRICTED OVERSIGHT ACCESS
        </div>
      </div>
      <header className="max-w-7xl mx-auto mb-20 relative z-10">
        <h1 className="text-7xl font-black font-sporty uppercase italic tracking-tighter leading-none">
          CONTROL <span className="text-purple-600">PANEL</span>
        </h1>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.6em] mt-4">Administrative Oversight & Network Management</p>
      </header>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 pb-20">
        <section className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 backdrop-blur-3xl shadow-2xl space-y-10">
          <div className="flex items-center gap-3">
            <div className="p-4 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20"><Globe size={24} /></div>
            <h2 className="text-2xl font-black uppercase italic">Initialize Hub</h2>
          </div>
          <form onSubmit={handleAddHub} className="space-y-6">
            <input className="w-full bg-black/50 border border-white/5 p-5 rounded-2xl outline-none focus:border-purple-600 font-bold uppercase text-[11px] tracking-widest" placeholder="HUB IDENTITY (e.g. DTU)" value={newHub.Name} onChange={e => setNewHub({...newHub, Name: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <input className="bg-black/50 border border-white/5 p-5 rounded-2xl outline-none focus:border-purple-600 font-bold uppercase text-[11px]" placeholder="GEO LOCATION" value={newHub.Location} onChange={e => setNewHub({...newHub, Location: e.target.value})} required />
              <input className="bg-black/50 border border-white/5 p-5 rounded-2xl outline-none focus:border-purple-600 font-bold uppercase text-[11px]" placeholder="TAGLINE" value={newHub.Tagline} onChange={e => setNewHub({...newHub, Tagline: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-6 bg-white text-black font-black uppercase rounded-2xl hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : <>ACTIVATE NODE PROTOCOL <Plus size={18} /></>}
            </button>
          </form>
        </section>
        <section className="bg-white/[0.02] p-10 rounded-[50px] border border-white/5 backdrop-blur-3xl shadow-2xl space-y-8 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="p-4 bg-yellow-500 text-black rounded-2xl shadow-lg shadow-yellow-500/20"><Key size={24} /></div>
            <h2 className="text-2xl font-black uppercase italic">Access Vault</h2>
          </div>
          <button onClick={generateToken} disabled={loading} className="w-full py-6 bg-purple-600 text-white font-black uppercase rounded-2xl hover:bg-purple-700 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 shadow-purple-600/20 mb-4">
            {loading ? <Loader2 className="animate-spin" /> : <><Zap size={18} fill="white" /> GENERATE ENCRYPTED KEY</>}
          </button>
          <AnimatePresence>
            {newlyGeneratedToken && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, height: 0 }}
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="p-8 bg-purple-600 rounded-3xl border-2 border-white/20 shadow-2xl shadow-purple-600/30 text-center relative overflow-hidden"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-200 mb-3">Provisioned Identity Key</p>
                <h2 className="text-4xl font-black font-sporty tracking-[0.2em] text-white mb-4 select-all italic">{newlyGeneratedToken}</h2>
                <button 
                  onClick={() => copyToClipboard(newlyGeneratedToken)}
                  className="px-6 py-2 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2 mx-auto"
                >
                  {copied === newlyGeneratedToken ? <Check size={14} /> : <Copy size={14} />}
                  {copied === newlyGeneratedToken ? "SECURED" : "COPY KEY"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1 space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
            {tokens.map((t, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-black/40 rounded-3xl border border-white/5 group hover:border-purple-600/50 transition-all">
                <div>
                  <p className="font-mono text-xl font-black text-purple-400 group-hover:text-white uppercase">{t.Token}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest mt-1 text-gray-600">● {t.Status === 'Used' ? `EXPENDED BY ${t.UsedBy || 'MEMBER'}` : 'READY FOR CLEARANCE'}</p>
                </div>
                <button onClick={() => copyToClipboard(t.Token)} className={`p-4 rounded-2xl transition-all ${copied === t.Token ? 'bg-green-500' : 'bg-white/5 hover:bg-white/10 text-gray-500'}`}>
                  {copied === t.Token ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="lg:col-span-2 bg-gradient-to-r from-purple-900/10 to-transparent p-12 rounded-[60px] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-white text-black rounded-2xl shadow-xl shadow-white/10"><BarChart3 size={24} /></div>
            <div>
               <h2 className="text-3xl font-black uppercase italic leading-none">Initialize Vibe Check</h2>
               <p className="text-[9px] font-black uppercase tracking-widest text-purple-500 mt-2">Global Network Poll | 24-Hour Expiry Protocol</p>
            </div>
          </div>
          <form onSubmit={handleCreatePoll} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-600 ml-2 uppercase tracking-widest">Network Question</label>
                <textarea className="w-full bg-black/40 border border-white/5 p-6 rounded-3xl outline-none focus:border-purple-600 font-bold uppercase text-[12px] h-32 resize-none" placeholder="What is the network mood?" value={pollData.Question} onChange={e => setPollData({...pollData, Question: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-6 flex flex-col justify-between">
              <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-600 ml-2 uppercase tracking-widest">Option Alpha</label>
                   <input className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-purple-600 font-bold uppercase text-[11px]" placeholder="YES / READY" value={pollData.OptionA} onChange={e => setPollData({...pollData, OptionA: e.target.value})} required />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-600 ml-2 uppercase tracking-widest">Option Beta</label>
                   <input className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl outline-none focus:border-purple-600 font-bold uppercase text-[11px]" placeholder="NO / STANDBY" value={pollData.OptionB} onChange={e => setPollData({...pollData, OptionB: e.target.value})} required />
                 </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-6 bg-purple-600 text-white font-black uppercase rounded-3xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95">
                {loading ? <Loader2 className="animate-spin" /> : <>BROADCAST POLL <Zap size={20} fill="currentColor" /></>}
              </button>
            </div>
          </form>
          <MessageSquare className="absolute -bottom-10 -right-10 text-white/[0.02] w-64 h-64" />
        </section>
      </div>
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
};
export default SupervisorPanel;