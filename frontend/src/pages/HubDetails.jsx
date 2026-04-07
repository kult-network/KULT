import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Ticket, User, Zap, Plus, X, ShieldCheck,
  Clock, Mic2, BookOpen, Music, Layers, Info, Mail, Key, Image as ImageIcon, Calendar, ChevronRight, Loader2, CheckCircle2
} from 'lucide-react';
const RANDOM_TAGLINES = [
  "NEURAL INTERFACE ACTIVE", "GATEWAY TO THE KULT", "CYBERNETIC ECOSYSTEM LIVE",
  "DECENTRALIZE THE CAMPUS", "THE FUTURE IS ENCRYPTED", "SYNCING WITH DESTINY",
  "BEYOND THE GRID", "REVOLUTION STARTING NOW", "PROTOCOLS INITIALIZED"
];
const KULT_COLORS = [
  { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-100", shadow: "shadow-purple-200" },
  { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-100", shadow: "shadow-blue-200" },
  { bg: "bg-pink-600", text: "text-pink-600", light: "bg-pink-50", border: "border-pink-100", shadow: "shadow-pink-200" },
  { bg: "bg-cyan-500", text: "text-cyan-500", light: "bg-cyan-50", border: "border-cyan-100", shadow: "shadow-cyan-200" },
  { bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-50", border: "border-yellow-100", shadow: "shadow-yellow-200" },
  { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-50", border: "border-orange-100", shadow: "shadow-orange-200" },
];
const HubDetails = ({ user, role }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [randomTag, setRandomTag] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [regData, setRegData] = useState({ Name: '', StudentID: '', Stream: '', Year: '' });
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setRandomTag(RANDOM_TAGLINES[Math.floor(Math.random() * RANDOM_TAGLINES.length)]);
      const pEvents = axios.get(`${API_BASE_URL}/api/hubs/${id}/events`);
      const pHubs = axios.get(`${API_BASE_URL}/api/hubs`);
      const [resEvents, resHubs] = await Promise.allSettled([pEvents, pHubs]);
      if (resEvents.status === 'fulfilled') {
        const data = resEvents.value.data;
        setEvents(Array.isArray(data) ? data : data.list || []);
      }
      if (resHubs.status === 'fulfilled') {
        const data = resHubs.value.data;
        const foundHub = (Array.isArray(data) ? data : data.list || []).find(h => String(h.id || h.Id) === String(id));
        if (foundHub) setHubData(foundHub);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...regData,
      Event_ID: selectedEvent.id || selectedEvent.Id,
      Email: user?.email,
      Status: 'Pending',
      Payment_Screenshot: screenshot ? [{ path: screenshot, fileName: `ss_${Date.now()}.png` }] : []
    };
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, payload);
      setRegSuccess(true);
      
      if (selectedEvent.Redirect_Link) {
         setTimeout(() => {
             window.open(selectedEvent.Redirect_Link, '_blank');
         }, 1000); // Redirect after 1 second of showing success message
      }

      setTimeout(() => {
        setSelectedEvent(null);
        setShowRegForm(false);
        setRegSuccess(false);
        setRegData({ Name: '', StudentID: '', Stream: '', Year: '' });
        setScreenshot(null);
      }, 3000);
    } catch { alert("Registration failed. Network congestion."); } 
    finally { setSubmitting(false); }
  };
  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const renderItinerary = (data) => {
    try {
      return JSON.parse(data).map((slot, i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{slot.time}</span>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">{slot.activity}</span>
        </div>
      ));
    } catch { return null; }
  };
  return (
    <div className="min-h-screen bg-[var(--body-bg)] relative font-sharp selection:bg-purple-600 selection:text-white pb-20 text-[var(--text-primary)]">
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 backdrop-blur-3xl bg-black/90">
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0a] w-full max-w-6xl max-h-[90vh] rounded-[40px] md:rounded-[60px] border border-white/10 overflow-hidden relative shadow-2xl flex flex-col md:flex-row">
              <button onClick={() => { setSelectedEvent(null); setShowRegForm(false); }} className="absolute top-8 right-8 z-50 p-4 bg-white/5 hover:bg-white text-white hover:text-black rounded-full transition-all active:scale-90"><X size={24} /></button>
              <div className="w-full md:w-1/2 h-48 md:h-auto relative hidden md:block">
                {selectedEvent.Poster?.[0] ? <img src={selectedEvent.Poster[0].url || `https://app.nocodb.com${selectedEvent.Poster[0].path}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-900" />}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]"></div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-16 overflow-y-auto custom-scrollbar text-white">
                {regSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
                    <h2 className="text-4xl font-black uppercase font-sporty">Mission Locked</h2>
                    <p className="text-gray-400 text-xs tracking-widest uppercase">Identity registered. Awaiting manual validation.</p>
                  </div>
                ) : !showRegForm ? (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500 mb-4 block">Intelligence Brief</span>
                    <h2 className="text-4xl md:text-5xl font-black font-sporty uppercase mb-6 italic tracking-tighter leading-none">{selectedEvent.Title}</h2>
                    <p className="text-gray-400 text-sm font-bold mb-10 border-l-4 border-purple-600 pl-6 uppercase tracking-tighter leading-relaxed">{selectedEvent.Description || "Mission protocol details are classified."}</p>
                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">COMMANDER</p>
                        <p className="text-[10px] font-black uppercase tracking-tight">{selectedEvent.Speaker}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">ACCESS MODE</p>
                        <p className="text-[10px] font-black uppercase tracking-tight text-purple-400">{selectedEvent.Price === 'PAID' ? 'PAID ENTRY' : 'FREE ACCESS'}</p>
                      </div>
                    </div>
                    {selectedEvent.Itinerary && <div className="mb-10 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Mission Timeline</p>
                      {renderItinerary(selectedEvent.Itinerary)}
                    </div>}
                    <button onClick={() => setShowRegForm(true)} className="w-full py-6 bg-slate-900/95 text-white font-black font-sporty uppercase rounded-3xl hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xl">INITIALIZE ACCESS PROTOCOL</button>
                  </>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="mb-8">
                       <h2 className="text-3xl font-black uppercase font-sporty italic text-purple-500">Identity Sync</h2>
                       <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mt-2">Connecting to {selectedEvent.Title}</p>
                    </div>
                    <input placeholder="FULL NAME" className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase outline-none focus:border-purple-600" required onChange={e => setRegData({...regData, Name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="STUDENT ID" className="p-5 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase outline-none focus:border-purple-600" required onChange={e => setRegData({...regData, StudentID: e.target.value})} />
                      <input placeholder="YEAR (e.g. 2nd)" className="p-5 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase outline-none focus:border-purple-600" required onChange={e => setRegData({...regData, Year: e.target.value})} />
                    </div>
                    <input placeholder="STREAM / BRANCH" className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase outline-none focus:border-purple-600" required onChange={e => setRegData({...regData, Stream: e.target.value})} />
                    {selectedEvent.Price === 'PAID' && (
                      <div className="p-6 bg-purple-600/10 border border-purple-500/30 rounded-3xl space-y-4">
                        <div className="text-center">
                          <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mb-1">Payment Required</p>
                          <p className="text-[11px] font-black uppercase text-purple-400 tracking-widest">UPI ID: {selectedEvent.UPI_ID || 'CONTACT ADMIN'}</p>
                        </div>
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                          {screenshot ? (
                            <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-2"><CheckCircle2 size={16}/> SCREENSHOT ATTACHED</span>
                          ) : (
                            <><ImageIcon size={24} className="mb-2 text-gray-600" /><span className="text-[9px] font-black text-gray-500 uppercase">UPLOAD PAYMENT SCREENSHOT</span></>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} required />
                        </label>
                      </div>
                    )}
                    <button disabled={submitting} type="submit" className="w-full py-6 bg-purple-600 text-white font-black font-sporty uppercase rounded-3xl flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl shadow-purple-600/20">
                      {submitting ? <Loader2 className="animate-spin" /> : 'COMPLETE REGISTRATION'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-16 px-2">
          <Link to="/" className="flex items-center gap-3 font-black text-[10px] tracking-[0.4em] text-purple-400 hover:text-purple-300 transition-all uppercase"><ArrowLeft size={16} /> Exit Command</Link>
          {(role?.toUpperCase() === 'ORGANIZER' || role?.toUpperCase() === 'SUPERVISOR') && (
            <Link to={`/create-event?hubId=${id}`} className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 shadow-xl transition-all active:scale-95"><Plus size={16} strokeWidth={3} /> Host Mission</Link>
          )}
        </div>
        <header className="mb-24 px-2">
          <div className="flex flex-col gap-4">
            <h1 className="text-[2.8rem] sm:text-[3.5rem] md:text-[6.5rem] font-black font-sporty tracking-tight uppercase leading-[0.95] mb-2 text-gradient max-w-5xl">
              {hubData?.Name || "CAMPUS"} <span className="text-gradient italic">Hub</span>
            </h1>
            {loading ? (
              <span className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-black tracking-[0.5em] uppercase text-gray-400 border-l-4 border-black pl-6">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> SYNCING HUB DATA...
              </span>
            ) : (
              <p className="text-[10px] sm:text-[11px] font-black tracking-[0.5em] text-purple-600 uppercase border-l-4 border-black pl-6">{randomTag}</p>
            )}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-2">
          {loading ? (
            <div className="col-span-full rounded-[40px] md:rounded-[60px] border border-white/10 bg-slate-950/80 shadow-2xl p-16 text-center text-white/80">
              <div className="mb-4 inline-flex items-center justify-center gap-3 text-lg font-black uppercase tracking-[0.2em]">
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" /> LOADING HUB NODES...
              </div>
              <p className="text-sm text-gray-400">The mission grid is powering up. This will be ready in a moment.</p>
            </div>
          ) : events.length > 0 ? events.map((event, index) => {
            const color = KULT_COLORS[index % KULT_COLORS.length];
            const posterUrl = event.Poster?.[0] ? (event.Poster[0].url || `https://app.nocodb.com${event.Poster[0].path}`) : null;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`bg-slate-950/95 rounded-[40px] md:rounded-[60px] border-2 border-white/10 shadow-2xl overflow-hidden hover:${color.shadow} transition-all group flex flex-col h-auto md:h-[650px] relative`}>
                {(role?.toUpperCase() === 'ORGANIZER' || role?.toUpperCase() === 'SUPERVISOR') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/organizer-dashboard/${event.id || event.Id}`); }}
                    className="absolute top-6 right-20 z-50 p-3 bg-slate-950/95 backdrop-blur-md rounded-xl text-white hover:bg-black hover:text-white transition-all shadow-lg border border-white/10"
                    title="Mission Dashboard"
                  >
                    <ShieldCheck size={18} />
                  </button>
                )}
                <div className="h-52 md:h-64 relative bg-gray-100 overflow-hidden">
                  {posterUrl ? <img src={posterUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={40} /></div>}
                  <span className={`absolute top-6 left-6 text-[8px] font-black uppercase ${color.bg} text-white px-4 py-2 rounded-full tracking-widest shadow-lg`}>{event.Category}</span>
                </div>
                <div className="p-6 md:p-10 flex-grow flex flex-col">
                  <h3 className="text-3xl font-black font-sporty uppercase leading-none tracking-tighter mb-6 text-white group-hover:text-purple-400 transition-colors line-clamp-2">{event.Title}</h3>
                  <div className={`border-l-4 ${color.border} pl-6 space-y-3 mb-10`}>
                    <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Ticket size={14} className={color.text}/> {event.Price === 'PAID' ? 'PAID MISSION' : 'FREE ACCESS'}</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><User size={14} className={color.text}/> {event.Speaker}</p>
                  </div>
                  <button onClick={() => setSelectedEvent(event)} className={`w-full py-6 mt-auto border-2 ${color.border} ${color.text} font-black font-sporty uppercase rounded-[30px] hover:${color.bg} hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95`}>
                    View Mission <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full py-32 text-center opacity-20"><p className="font-sporty text-5xl uppercase tracking-[0.2em] text-purple-300">Zero Signals</p></div>
          )}
        </div>
        {role?.toUpperCase() === 'USER' && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-32 p-16 md:p-24 bg-black rounded-[70px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 lg:flex items-center justify-between gap-10 text-center lg:text-left">
              <div>
                <h2 className="text-6xl md:text-8xl font-black font-sporty uppercase italic mb-8 leading-[0.8]">Elevate <span className="text-purple-500">Access</span></h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] max-w-xl">Request administrative clearance to host missions in this hub node.</p>
              </div>
              <div className="mt-10 lg:mt-0 flex flex-col sm:flex-row gap-6">
                <a href={`mailto:support.kult@gmail.com?subject=KULT Node Access`} className="px-12 py-7 bg-slate-900/95 text-white rounded-[30px] font-black text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"><Mail size={20}/> Request Command</a>
                <Link to="/verify-token" className="px-12 py-7 bg-white/5 border border-white/10 rounded-[30px] font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"><Key size={20}/> Enter Token</Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none transition-transform group-hover:scale-125"></div>
          </motion.div>
        )}
      </main>
    </div>
  );
};
export default HubDetails;