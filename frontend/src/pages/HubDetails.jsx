import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Ticket, User, Zap, X, ShieldCheck, Clock, Layers, Info, Calendar, Loader2, CheckCircle2, Globe
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { EmptyState } from '../components/EmptyState';

const HubDetails = ({ user, role }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useState(() => Object.fromEntries(new URLSearchParams(window.location.search).entries()));
  const [events, setEvents] = useState([]);
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [regData, setRegData] = useState({ Name: '', StudentID: '', Stream: '', Year: '' });

  useSEO(hubData?.Name || 'Network Node', `Intelligence matrix for ${hubData?.Name || 'sector'}.`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEvents, resHubs] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/hubs/${id}/events`),
          axios.get(`${API_BASE_URL}/api/hubs`)
        ]);
        
        if (resEvents.status === 'fulfilled') setEvents(Array.isArray(resEvents.value.data) ? resEvents.value.data : resEvents.value.data.list || []);
        if (resHubs.status === 'fulfilled') {
          const foundHub = (Array.isArray(resHubs.value.data) ? resHubs.value.data : resHubs.value.data.list || []).find(h => String(h.id || h.Id) === String(id));
          if (foundHub) setHubData(foundHub);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (searchParams.event && events.length > 0) {
      const event = events.find(e => String(e.Id || e.id) === String(searchParams.event));
      if (event) { setSelectedEvent(event); window.history.replaceState({}, document.title, window.location.pathname); }
    }
  }, [events, searchParams]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...regData, Event_ID: selectedEvent.id || selectedEvent.Id, Email: user?.email, Status: 'Pending',
      Payment_Screenshot: screenshot ? [{ path: screenshot, fileName: `ss_${Date.now()}.png` }] : []
    };
    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, payload);
      setRegSuccess(true);
      if (selectedEvent.Redirect_Link) setTimeout(() => window.open(selectedEvent.Redirect_Link, '_blank'), 1000);
      setTimeout(() => {
        setSelectedEvent(null); setShowRegForm(false); setRegSuccess(false); setScreenshot(null);
        setRegData({ Name: '', StudentID: '', Stream: '', Year: '' });
      }, 3000);
    } catch { alert("Registration failed."); } 
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
        <div key={i} className="flex justify-between items-center py-3 border-b border-[#222] last:border-0">
          <span className="text-xs font-semibold text-[#888]">{slot.time}</span>
          <span className="text-sm font-medium text-white">{slot.activity}</span>
        </div>
      ));
    } catch { return null; }
  };

  const getPosterUrl = (event) => {
    const rawPoster = event.Poster || event.poster;
    if (typeof rawPoster === 'string' && rawPoster.startsWith('http')) return rawPoster;
    if (Array.isArray(rawPoster) && rawPoster[0]) return rawPoster[0].url || `https://app.nocodb.com${rawPoster[0].path}`;
    return null;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#000] text-white font-medium text-sm">Processing Network Node...</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans pb-32">
      <div className="w-full bg-[#111111] border-b border-[#222] py-2 px-6 flex justify-between items-center text-[10px] font-semibold text-[#888] uppercase tracking-wide">
        <span>Node: {hubData?.Location || "Unknown Sector"}</span>
        <span className="text-green-500">Connected</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Directory
        </Link>
        <header className="mb-12 border-b border-[#222] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">{hubData?.Name || 'Unnamed Sector'}</h1>
            <p className="text-[#A1A1AA] text-lg font-light">{hubData?.Tagline || 'A node in the network.'}</p>
          </div>
          <div className="flex items-center gap-2 text-[#888] text-sm bg-[#111] px-4 py-2 rounded-lg border border-[#222]">
            <Globe size={16} /> Operational
          </div>
        </header>
        
        <h2 className="text-xl font-bold text-white mb-6">Active Deployments</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? events.map((event, i) => (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={event.Id || event.id}
               className="bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden hover:border-[#444] transition-all flex flex-col group"
             >
               {getPosterUrl(event) ? (
                 <div className="w-full h-48 bg-[#111] relative overflow-hidden">
                   <img src={getPosterUrl(event)} alt={event.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                 </div>
               ) : (
                 <div className="w-full h-48 bg-[#111] border-b border-[#222] flex items-center justify-center">
                   <Layers size={32} className="text-[#333]" />
                 </div>
               )}
               <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#111] border border-[#333] text-[#A1A1AA] rounded">{event.Category}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${event.Price === 'PAID' ? 'bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                      {event.Price || 'FREE'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{event.Title}</h3>
                  <p className="text-[#888] text-sm line-clamp-2 font-light mb-6 flex-1">{event.Description}</p>
                  <button onClick={() => setSelectedEvent(event)} className="w-full py-3 bg-[#EDEDED] text-black text-sm font-semibold rounded-lg hover:bg-white transition-colors">
                    Access Details
                  </button>
               </div>
             </motion.div>
          )) : (
            <div className="col-span-full"><EmptyState title="No Active Missions" message="This sector is currently quiet." icon={ShieldCheck} /></div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[#0a0a0a] border border-[#333] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              
              <div className="p-4 border-b border-[#222] bg-[#111] flex justify-between items-center shrink-0">
                <span className="text-xs font-semibold text-[#666] tracking-wide uppercase">Details Protocol</span>
                <button onClick={() => { setSelectedEvent(null); setShowRegForm(false); }} className="p-2 text-[#666] hover:text-white transition-colors rounded-lg hover:bg-[#222]"><X size={16}/></button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#0a0a0a]">
                {!showRegForm ? (
                  <>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold tracking-tight text-white">{selectedEvent.Title}</h2>
                      <div className="flex flex-wrap gap-3">
                         <span className="text-xs font-medium bg-[#111] border border-[#333] text-[#A1A1AA] px-3 py-1.5 rounded-full flex items-center gap-2"><Calendar size={12}/>{selectedEvent.start_time ? new Date(selectedEvent.start_time).toLocaleDateString() : 'TBA'}</span>
                         <span className="text-xs font-medium bg-[#111] border border-[#333] text-[#A1A1AA] px-3 py-1.5 rounded-full flex items-center gap-2"><Clock size={12}/>{selectedEvent.start_time ? new Date(selectedEvent.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBA'}</span>
                      </div>
                      <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">{selectedEvent.Description}</p>
                    </div>
                    {selectedEvent.Itinerary && selectedEvent.Itinerary !== "null" && (
                      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
                         <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Layers size={14}/> Operational Itinerary</h3>
                         <div>{renderItinerary(selectedEvent.Itinerary)}</div>
                      </div>
                    )}
                    <button onClick={() => user ? setShowRegForm(true) : navigate('/auth')} className="w-full py-4 bg-[#0070F3] hover:bg-[#0051B3] text-white text-sm font-semibold rounded-xl transition-all shadow-lg active:scale-95">
                       {user ? "Initialize Participation" : "Authenticate to Participate"}
                    </button>
                  </>
                ) : !regSuccess ? (
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-white mb-1">Registration Protocol</h3>
                       <p className="text-[#888] text-sm">Validating credentials for {selectedEvent.Title}.</p>
                    </div>
                    <div className="space-y-4">
                      <input className="w-full bg-[#111] border border-[#333] p-4 flex items-center rounded-lg outline-none focus:border-[#666] transition-colors text-sm text-white placeholder-gray-500 font-medium" placeholder="Full Legal Name" value={regData.Name} onChange={e => setRegData({...regData, Name: e.target.value})} required />
                      <input className="w-full bg-[#111] border border-[#333] p-4 flex items-center rounded-lg outline-none focus:border-[#666] transition-colors text-sm text-white placeholder-gray-500 font-medium" placeholder="Registration ID / Code" value={regData.StudentID} onChange={e => setRegData({...regData, StudentID: e.target.value})} required />
                      <div className="grid grid-cols-2 gap-4">
                        <select className="w-full bg-[#111] border border-[#333] p-4 flex items-center rounded-lg outline-none focus:border-[#666] transition-colors text-sm text-white font-medium" value={regData.Stream} onChange={e => setRegData({...regData, Stream: e.target.value})} required>
                           <option value="">Stream Selection</option><option value="B.Tech">B.Tech</option><option value="M.Tech">M.Tech</option><option value="BCA">BCA</option><option value="MCA">MCA</option><option value="Other">Other</option>
                        </select>
                        <select className="w-full bg-[#111] border border-[#333] p-4 flex items-center rounded-lg outline-none focus:border-[#666] transition-colors text-sm text-white font-medium" value={regData.Year} onChange={e => setRegData({...regData, Year: e.target.value})} required>
                           <option value="">Year Selection</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option><option value="Alumni">Alumni</option>
                        </select>
                      </div>
                      {selectedEvent.Price === "PAID" && (
                         <div className="bg-[#111] border border-blue-500/30 p-5 rounded-xl space-y-4">
                            <p className="text-sm font-semibold text-white">Proof of Transaction Required</p>
                            <input type="file" accept="image/*" onChange={handleScreenshot} className="w-full text-sm text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#222] file:text-white hover:file:bg-[#333]" required />
                         </div>
                      )}
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-4 bg-[#EDEDED] text-black font-semibold text-sm rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                       {submitting ? <Loader2 className="animate-spin inline mr-2" size={16}/> : null} {submitting ? "Processing..." : "Submit Intelligence"}
                    </button>
                    <button type="button" onClick={() => setShowRegForm(false)} className="w-full py-1 text-[#666] hover:text-white text-xs font-semibold transition-colors mt-2 text-center">Cancel</button>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">Registration Validated</h3>
                    <p className="text-[#888] text-sm">Your clearance has been recorded in the central database.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HubDetails;