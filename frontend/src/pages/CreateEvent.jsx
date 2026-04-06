import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Clock, Ticket, User, Loader2, Image as ImageIcon, Plus, Trash2, ChevronDown, IndianRupee } from 'lucide-react';
import Toast from '../components/Toast'; 
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
    axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://kult-production.up.railway.app`)}/api/hubs`).then(res => {
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
        UPI_ID: formData.UPI_ID,
        DL_Protocol: formData.dl_provided ? "YES" : "NO",
        Hub_ID: formData.Hubs[0],
        Organizer_Email: "commander@kult.network", 
        Itinerary: showItinerary ? JSON.stringify(itinerary.filter(i => i.time || i.activity)) : null,
        Poster: poster || null,
        Redirect_Link: formData.Redirect_Link || ""
      };
      console.log("🚀 Syncing Mission:", payload.Name);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://kult-production.up.railway.app`)}/api/events`, payload);
      if (res.data.success) {
        showToast("MISSION DEPLOYED TO LIVE FEED! 🛰️", "success");
        setTimeout(() => navigate(`/hub/${formData.Hubs[0]}`), 2000);
      }
    } catch (err) {
      console.error("❌ deployment fail:", err.response?.data);
      showToast("DEPLOYMENT FAILED", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#fbfdff] pb-20 font-sharp pt-12 px-6">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <main className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase text-gray-400 mb-8 transition-all hover:text-black">
          <ArrowLeft size={16} /> EXIT COMMAND
        </button>
        <header className="mb-12">
          <h1 className="text-6xl md:text-7xl font-black font-sporty uppercase leading-none tracking-tighter">
            HOST <span className="text-purple-600 italic">EVENT</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] mt-4">Mission Deployment | Campus Network Broadcast</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-12 rounded-[55px] shadow-2xl border border-gray-50 relative overflow-hidden">
          <div className="space-y-3 pb-4">
            <label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Mission Poster / Visual Identity
            </label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="poster-upload" />
            <label 
              htmlFor="poster-upload" 
              className={`w-full ${posterPreview ? 'h-80' : 'h-48'} border-2 border-dashed border-gray-100 rounded-[35px] flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all overflow-hidden bg-gray-50/50 group relative`}
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
            <select className="p-5 bg-gray-50 rounded-2xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500" value={formData.Hubs[0] || ""} onChange={(e) => setFormData({...formData, Hubs: [parseInt(e.target.value)]})} required>
              <option value="">-- CHOOSE CAMPUS --</option>
              {hubs.map(hub => <option key={hub.id || hub.Id} value={hub.id || hub.Id}>{hub.Name}</option>)}
            </select>
            <input type="text" placeholder="MISSION NAME" className="p-5 bg-gray-50 rounded-2xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500" value={formData.Title} onChange={e => setFormData({...formData, Title: e.target.value})} required />
          </div>
          <textarea placeholder="INPUT MISSION BRIEFING..." className="w-full p-5 bg-gray-50 rounded-3xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none" value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select className="p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none uppercase" value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})}>
              <option value="Guest Lectures">Guest Lectures</option>
              <option value="Workshops">Workshops</option>
              <option value="Concert">Concert</option>
              <option value="Fun">Fun</option>
              <option value="Misc">Misc</option>
            </select>
            <select className="p-5 bg-purple-50 rounded-2xl font-black text-xs outline-none uppercase text-purple-700 border border-purple-100" value={formData.dl_provided ? "YES" : "NO"} onChange={e => setFormData({...formData, dl_provided: e.target.value === "YES"})}>
              <option value="NO">NO (Standard)</option>
              <option value="YES">YES (Duty Leave Provided)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <select className="p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none uppercase" value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                <option value="FREE">Free Access</option>
                <option value="PAID">Paid Access</option>
            </select>
            <input type="text" placeholder="COMMANDER NAME (Host)" className="p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none uppercase" value={formData.Speaker} onChange={e => setFormData({...formData, Speaker: e.target.value})} required />
          </div>
          {priceType === "PAID" && (
            <input type="text" placeholder="YOURNAME@UPI" className="w-full p-5 bg-purple-50 border border-purple-100 rounded-2xl font-black text-xs uppercase outline-none focus:ring-2 focus:ring-purple-500" value={formData.UPI_ID} onChange={e => setFormData({...formData, UPI_ID: e.target.value})} required />
          )}
          <input type="url" placeholder="POST-REGISTRATION REDIRECT LINK (OPTIONAL)" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xs outline-none focus:ring-2 focus:ring-purple-500" value={formData.Redirect_Link} onChange={e => setFormData({...formData, Redirect_Link: e.target.value})} />
          <div className="grid grid-cols-2 gap-6 pb-4">
                <input type="datetime-local" className="p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-purple-500" onChange={e => setFormData({...formData, start_time: e.target.value})} required />
                <input type="datetime-local" className="p-5 bg-gray-50 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-purple-500" onChange={e => setFormData({...formData, end_time: e.target.value})} required />
          </div>
          <div className="pt-6 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => setShowItinerary(!showItinerary)}
              className="flex items-center justify-between w-full p-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 hover:text-black transition-all"
            >
              <span>{showItinerary ? "- Hide Itinerary" : "+ Add Itinerary (Timeline)"}</span>
              <ChevronDown className={`transition-transform ${showItinerary ? 'rotate-180' : ''}`} size={16} />
            </button>
            <AnimatePresence>
              {showItinerary && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-4">
                  {itinerary.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input type="text" placeholder="10:00 AM" className="w-1/3 p-4 bg-gray-50 rounded-xl font-bold text-[10px]" value={slot.time} onChange={(e) => handleItineraryChange(index, 'time', e.target.value)} />
                      <input type="text" placeholder="Activity Title" className="w-full p-4 bg-gray-50 rounded-xl font-bold text-[10px]" value={slot.activity} onChange={(e) => handleItineraryChange(index, 'activity', e.target.value)} />
                      {itinerary.length > 1 && <button type="button" onClick={() => removeSlot(index)} className="p-3 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>}
                    </div>
                  ))}
                  <button type="button" onClick={addTimelineSlot} className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:border-purple-600 hover:text-purple-600">+ Add Slot</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="submit" disabled={loading} className="w-full py-6 bg-black text-white font-black font-sporty uppercase rounded-[30px] hover:bg-purple-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-2xl shadow-purple-600/20">
            {loading ? <><Loader2 className="animate-spin" /> DEPLOYING ASSETS...</> : <>PUSH TO LIVE FEED <Zap size={20} fill="white" /></>}
          </button>
        </form>
      </main>
    </div>
  );
};
export default CreateEvent;