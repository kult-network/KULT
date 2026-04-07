import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Clock, Ticket, User, Loader2, Image as ImageIcon, Plus, Trash2, ChevronDown, IndianRupee } from 'lucide-react';
import Toast from '../components/Toast'; 
import { API_BASE_URL } from '../config/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hubIdFromUrl = searchParams.get('hubId');
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [poster, setPoster] = useState(null); 
  const [posterPreview, setPosterPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [priceType, setPriceType] = useState("FREE");
  const [showItinerary, setShowItinerary] = useState(false);
  const [itinerary, setItinerary] = useState([{ time: '', activity: '' }]);
  const [formData, setFormData] = useState({
    Title: '',
    Speaker: '',
    Category: 'Workshops', 
    Description: '', 
    Hubs: hubIdFromUrl ? [parseInt(hubIdFromUrl)] : [], 
    dl_provided: false,
    start_time: '',
    end_time: '',
    UPI_ID: '',
    Redirect_Link: ''
  });
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/hubs`).then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.list || [];
        setHubs(data);
    });
  }, []);
  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showToast("POSTER TOO LARGE (MAX 5MB)", "error");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result); 
        setPoster(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };
  const addTimelineSlot = () => setItinerary([...itinerary, { time: '', activity: '' }]);
  const removeSlot = (index) => setItinerary(itinerary.filter((_, i) => i !== index));
  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[index][field] = value;
    setItinerary(newItinerary);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Hubs[0]) return showToast("SELECT A HUB ACCESS!", "error");
    if (priceType === "PAID" && !formData.Redirect_Link) return showToast("ENTER A REDIRECT LINK FOR PAID EVENTS", "error");
    setLoading(true);
    try {
      const payload = {
        Name: formData.Title,
        Description: formData.Description,
        Category: formData.Category,
        Speaker: formData.Speaker,
        start_time: formData.start_time,
        end_time: formData.end_time,
        Price: priceType,
        DL_Protocol: formData.dl_provided ? "YES" : "NO",
        Hub_ID: formData.Hubs[0],
        Organizer_Email: "commander@kult.network",
        Itinerary: showItinerary ? JSON.stringify(itinerary.filter(i => i.time || i.activity)) : null,
        Poster: poster || null,
        Redirect_Link: priceType === "PAID" ? formData.Redirect_Link : ""
      };
      console.log("🚀 Syncing Mission:", payload.Name);
      const res = await axios.post(`${API_BASE_URL}/api/events`, payload);
      if (res.data.success) {
        showToast("MISSION DEPLOYED TO LIVE FEED! 🛰️", "success");
        setTimeout(() => {
          if (priceType === "PAID" && formData.Redirect_Link) {
            window.location.href = formData.Redirect_Link;
          } else {
            navigate(`/hub/${formData.Hubs[0]}`);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("❌ deployment fail:", err.response?.data);
      showToast("DEPLOYMENT FAILED", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[var(--body-bg)] pb-20 font-sharp pt-12 px-6 text-[var(--text-primary)]">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <main className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase text-purple-400 mb-8 transition-all hover:text-purple-300">
          <ArrowLeft size={16} /> EXIT COMMAND
        </button>
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black font-sporty uppercase leading-none tracking-tighter text-white neon-glow">
            HOST <span className="text-purple-400 italic">MISSION</span>
          </h1>
          <p className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.5em] mt-4">Mission Deployment | Campus Network Broadcast</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-950/95 p-8 md:p-12 rounded-[55px] shadow-2xl border border-white/10 relative overflow-hidden glass-panel">
          <div className="space-y-3 pb-4">
            <label className="text-[10px] font-black text-purple-300 ml-2 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Mission Poster / Visual Identity
            </label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="poster-upload" />
            <label 
              htmlFor="poster-upload" 
              className={`w-full ${posterPreview ? 'h-80' : 'h-48'} border-2 border-dashed border-white/10 rounded-[35px] flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all overflow-hidden bg-white/5 group relative`}
            >
              {posterPreview ? (
                <>
                  <img src={posterPreview} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black uppercase text-[10px] tracking-widest">Change Visual</div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 group-hover:text-purple-600 transition-all">
                  <Plus size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload Visual Asset</span>
                </div>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Campus Hub</label>
              <select className="w-full p-5 bg-slate-900 rounded-2xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500" value={formData.Hubs[0] || ""} onChange={(e) => setFormData({...formData, Hubs: [parseInt(e.target.value)]})} required>
                <option value="">-- CHOOSE CAMPUS --</option>
                {hubs.map(hub => <option key={hub.id || hub.Id} value={hub.id || hub.Id}>{hub.Name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Mission Name</label>
              <input type="text" className="w-full p-5 bg-slate-900 rounded-2xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500 text-purple-100" value={formData.Title} onChange={e => setFormData({...formData, Title: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Mission Briefing</label>
            <textarea placeholder="INPUT MISSION BRIEFING..." className="w-full p-5 bg-slate-900 rounded-3xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none text-purple-100" value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Category</label>
              <select className="w-full p-5 bg-slate-900 rounded-2xl font-bold text-xs outline-none uppercase text-purple-100" value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})}>
                <option value="Guest Lectures">Guest Lectures</option>
                <option value="Workshops">Workshops</option>
                <option value="Concert">Concert</option>
                <option value="Fun">Fun</option>
                <option value="Misc">Misc</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Duty Leave</label>
              <select className="w-full p-5 bg-slate-900 rounded-2xl font-black text-xs outline-none uppercase text-purple-100 border border-purple-500/20" value={formData.dl_provided ? "YES" : "NO"} onChange={e => setFormData({...formData, dl_provided: e.target.value === "YES"})}>
                <option value="NO">NO (Standard)</option>
                <option value="YES">YES (Duty Leave Provided)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Fee Type</label>
              <select className="w-full p-5 bg-slate-900 rounded-2xl font-bold text-xs outline-none uppercase text-purple-100" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                <option value="FREE">Free Access</option>
                <option value="PAID">Paid Access</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Commander Name (Host)</label>
              <input type="text" className="w-full p-5 bg-slate-900 rounded-2xl font-bold text-xs outline-none uppercase text-purple-100" value={formData.Speaker} onChange={e => setFormData({...formData, Speaker: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Start Time</label>
              <input type="datetime-local" className="w-full p-5 bg-slate-900 rounded-2xl font-bold text-xs text-purple-100 outline-none focus:ring-2 focus:ring-purple-500" onChange={e => setFormData({...formData, start_time: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">End Time</label>
              <input type="datetime-local" className="w-full p-5 bg-slate-900 rounded-2xl font-bold text-xs text-purple-100 outline-none focus:ring-2 focus:ring-purple-500" onChange={e => setFormData({...formData, end_time: e.target.value})} required />
            </div>
            <div className="space-y-2">
              {/* Empty column for balance */}
            </div>
          </div>
          {priceType === "PAID" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Payment Redirect Link</label>
              <input type="url" placeholder="PAID EVENT REDIRECT LINK" className="w-full p-5 bg-slate-900 border border-white/10 rounded-2xl font-black text-xs text-purple-100 outline-none focus:ring-2 focus:ring-purple-500" value={formData.Redirect_Link} onChange={e => setFormData({...formData, Redirect_Link: e.target.value})} required />
              <p className="text-[10px] text-purple-400 uppercase tracking-widest mt-1">After mission deployment, attendees will be redirected to this payment or registration gateway.</p>
            </div>
          )}
          <div className="pt-6 border-t border-white/10">
            <button 
              type="button"
              onClick={() => setShowItinerary(!showItinerary)}
              className="flex items-center justify-between w-full p-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 hover:text-purple-300 transition-all"
            >
              <span>{showItinerary ? "- Hide Itinerary" : "+ Add Itinerary (Timeline)"}</span>
              <ChevronDown className={`transition-transform ${showItinerary ? 'rotate-180' : ''}`} size={16} />
            </button>
            <AnimatePresence>
              {showItinerary && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-4">
                  {itinerary.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input type="text" placeholder="10:00 AM" className="w-1/3 p-4 bg-slate-900 rounded-xl font-bold text-[10px] text-purple-100" value={slot.time} onChange={(e) => handleItineraryChange(index, 'time', e.target.value)} />
                      <input type="text" placeholder="Activity Title" className="w-full p-4 bg-slate-900 rounded-xl font-bold text-[10px] text-purple-100" value={slot.activity} onChange={(e) => handleItineraryChange(index, 'activity', e.target.value)} />
                      {itinerary.length > 1 && <button type="button" onClick={() => removeSlot(index)} className="p-3 text-purple-400 hover:text-red-400"><Trash2 size={16}/></button>}
                    </div>
                  ))}
                  <button type="button" onClick={addTimelineSlot} className="w-full py-3 border border-dashed border-purple-400/30 rounded-xl text-[9px] font-black uppercase text-purple-300 hover:border-purple-400 hover:text-purple-200">+ Add Slot</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="submit" disabled={loading} className="w-full py-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black font-sporty uppercase rounded-[30px] hover:from-purple-500 hover:to-purple-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-2xl shadow-purple-600/20">
            {loading ? <><Loader2 className="animate-spin" /> DEPLOYING ASSETS...</> : <>PUSH TO LIVE FEED <Zap size={20} fill="white" /></>}
          </button>
        </form>
      </main>
    </div>
  );
};
export default CreateEvent;