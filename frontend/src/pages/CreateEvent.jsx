import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, ImageIcon, Plus, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import Toast from '../components/Toast'; 
import { API_BASE_URL } from '../config/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hubIdFromUrl = searchParams.get('hubId');
  const editEventId = searchParams.get('edit');
  
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState(null);
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
    Redirect_Link: ''
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/hubs`).then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.list || [];
        setHubs(data);
    });

    if (editEventId) {
      const fetchEventDetails = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/events/${editEventId}`);
          const event = res.data;
          setFormData({
            Title: event.Title || event.Name || '',
            Speaker: event.Speaker || '',
            Category: event.Category || 'Workshops',
            Description: event.Description || '',
            Hubs: event.Hubs && event.Hubs.length > 0 ? [event.Hubs[0].Id || event.Hubs[0].id] : [],
            dl_provided: event.DL_Protocol === 'YES',
            start_time: event.start_time ? event.start_time.slice(0, 16) : '',
            end_time: event.end_time ? event.end_time.slice(0, 16) : '',
            Redirect_Link: event.Redirect_Link || ''
          });
          setPriceType(event.Price === 'Paid' || event.Price === 'PAID' ? 'PAID' : 'FREE');
          if (event.Poster) setPosterPreview(event.Poster);
          if (event.Itinerary) {
            try {
              const parsedItinerary = JSON.parse(event.Itinerary);
              if (Array.isArray(parsedItinerary) && parsedItinerary.length > 0) {
                setItinerary(parsedItinerary);
                setShowItinerary(true);
              }
            } catch (e) { console.error("Failed to parse itinerary", e); }
          }
        } catch (err) {
          console.error("Failed to fetch event details for edit", err);
          showToast("FAILED TO LOAD MISSION DATA", "error");
        }
      };
      fetchEventDetails();
    }
  }, [editEventId]);

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  // Handles Local Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showToast("POSTER TOO LARGE (MAX 5MB)", "error");
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file)); 
    }
  };

  // Uploads to Cloudinary (Solves the "Poster not visible" issue)
  const uploadToCloudinary = async (file) => {
    // ⚠️ CRUCIAL: Replace these with your unsigned preset credentials
    const cloudName = "dieejbvq8"; 
    const uploadPreset = "kult-network"; 
    
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data,
    });
    
    if (!res.ok) throw new Error("Cloudinary Upload Failed");
    
    const fileData = await res.json();
    return fileData.secure_url; // Returns the https link
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Hubs[0]) return showToast("SELECT A HUB ACCESS!", "error");
    if (priceType === "PAID" && !formData.Redirect_Link) return showToast("ENTER A REDIRECT LINK", "error");
    
    setLoading(true);
    try {
      let finalPosterUrl = "";

      // 1. Upload image if exists
      if (posterFile) {
        showToast("UPLOADING VISUALS...", "success");
        finalPosterUrl = await uploadToCloudinary(posterFile);
      }

      // 2. Prepare Payload
      // Matches NocoDB's default strict case sensitivity for internal IDs.
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
        Poster: finalPosterUrl || posterPreview, 
        Redirect_Link: priceType === "PAID" ? formData.Redirect_Link : ""
      };

      let res;
      if (editEventId) {
        res = await axios.patch(`${API_BASE_URL}/api/events/${editEventId}`, payload);
      } else {
        res = await axios.post(`${API_BASE_URL}/api/events`, payload);
      }

      if (res.data.success) {
        showToast(editEventId ? "MISSION UPDATED! 📝" : "MISSION DEPLOYED! 🛰️", "success");
        setTimeout(() => { navigate(editEventId ? -1 : `/hub/${formData.Hubs[0]}`); }, 1500);
      }
    } catch (err) {
      console.error(err);
      showToast("DEPLOYMENT FAILED", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...itinerary];
    newItinerary[index][field] = value;
    setItinerary(newItinerary);
  };

  // Helper for consistent input styles
  const inputStyles = "w-full p-5 bg-slate-900 rounded-2xl font-bold uppercase text-xs outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 border border-white/5 transition-all";
  const optionStyles = "bg-slate-900 text-white font-bold"; 

  return (
    <div className="min-h-screen bg-slate-950 pb-20 font-sharp pt-12 px-6 text-white">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <main className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase text-purple-400 mb-8 hover:text-purple-300">
          <ArrowLeft size={16} /> EXIT COMMAND
        </button>
        
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter text-white">
            HOST <span className="text-purple-400 italic">MISSION</span>
          </h1>
          <p className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.5em] mt-4">Mission Deployment | Campus Network Broadcast</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 p-8 md:p-12 rounded-[55px] shadow-2xl border border-white/10 relative overflow-hidden backdrop-blur-xl">
          
          {/* Poster Section */}
          <div className="space-y-3 pb-4">
            <label className="text-[10px] font-black text-purple-300 ml-2 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Mission Poster
            </label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="poster-upload" />
            <label htmlFor="poster-upload" className={`w-full ${posterPreview ? 'h-80' : 'h-48'} border-2 border-dashed border-white/10 rounded-[35px] flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-all overflow-hidden bg-slate-900 group relative`}>
              {posterPreview ? (
                <img src={posterPreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 text-white transition-all">
                  <Plus size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload Visual Asset</span>
                </div>
              )}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Campus Hub</label>
              <select className={inputStyles} value={formData.Hubs[0] || ""} onChange={(e) => setFormData({...formData, Hubs: [parseInt(e.target.value)]})} required>
                <option value="" className={optionStyles}>-- CHOOSE CAMPUS --</option>
                {hubs.map(hub => <option key={hub.id || hub.Id} value={hub.id || hub.Id} className={optionStyles}>{hub.Name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Mission Name</label>
              <input type="text" className={inputStyles} value={formData.Title} onChange={e => setFormData({...formData, Title: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Mission Briefing</label>
            <textarea placeholder="INPUT MISSION BRIEFING..." className={`${inputStyles} h-32 resize-none`} value={formData.Description} onChange={e => setFormData({...formData, Description: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Category</label>
              <select className={inputStyles} value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})}>
                <option value="Guest Lectures" className={optionStyles}>Guest Lectures</option>
                <option value="Workshops" className={optionStyles}>Workshops</option>
                <option value="Concert" className={optionStyles}>Concert</option>
                <option value="Fun" className={optionStyles}>Fun</option>
                <option value="Misc" className={optionStyles}>Misc</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Duty Leave</label>
              <select className={inputStyles} value={formData.dl_provided ? "YES" : "NO"} onChange={e => setFormData({...formData, dl_provided: e.target.value === "YES"})}>
                <option value="NO" className={optionStyles}>NO (Standard)</option>
                <option value="YES" className={optionStyles}>YES (Provided)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Fee Type</label>
              <select className={inputStyles} value={priceType} onChange={(e) => setPriceType(e.target.value)}>
                <option value="FREE" className={optionStyles}>Free Access</option>
                <option value="PAID" className={optionStyles}>Paid Access</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Commander Name</label>
              <input type="text" className={inputStyles} value={formData.Speaker} onChange={e => setFormData({...formData, Speaker: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Start Time</label>
              <input type="datetime-local" className={`${inputStyles} [color-scheme:dark]`} value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">End Time</label>
              <input 
                type="datetime-local" 
                className={`${inputStyles} [color-scheme:dark]`} 
                value={formData.end_time}
                onChange={e => setFormData({...formData, end_time: e.target.value})}
                required 
              />
            </div>
          </div>

          {priceType === "PAID" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Redirect Link</label>
              <input type="url" placeholder="https://..." className={inputStyles} value={formData.Redirect_Link} onChange={e => setFormData({...formData, Redirect_Link: e.target.value})} required />
            </div>
          )}

          <div className="pt-6 border-t border-white/10">
            <button type="button" onClick={() => setShowItinerary(!showItinerary)} className="flex items-center justify-between w-full p-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 hover:text-purple-300">
              <span>{showItinerary ? "- Hide Itinerary" : "+ Add Itinerary"}</span>
              <ChevronDown className={`transition-transform ${showItinerary ? 'rotate-180' : ''}`} size={16} />
            </button>
            <AnimatePresence>
              {showItinerary && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-4">
                  {itinerary.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input type="text" placeholder="10:00 AM" className="w-1/3 p-4 bg-slate-900 rounded-xl font-bold text-[10px] text-white border border-white/5" value={slot.time} onChange={(e) => handleItineraryChange(index, 'time', e.target.value)} />
                      <input type="text" placeholder="Activity" className="w-full p-4 bg-slate-900 rounded-xl font-bold text-[10px] text-white border border-white/5" value={slot.activity} onChange={(e) => handleItineraryChange(index, 'activity', e.target.value)} />
                      {itinerary.length > 1 && <button type="button" onClick={() => setItinerary(itinerary.filter((_, i) => i !== index))} className="text-red-400 hover:scale-110 transition-all"><Trash2 size={16}/></button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => setItinerary([...itinerary, { time: '', activity: '' }])} className="w-full py-3 border border-dashed border-purple-400/30 rounded-xl text-[9px] font-black uppercase text-purple-300 hover:border-purple-400 transition-all">+ Add Slot</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-purple-600 text-white font-black uppercase rounded-[30px] hover:bg-purple-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-purple-500/20">
            {loading ? <><Loader2 className="animate-spin" /> DEPLOYING MISSION...</> : <>PUSH TO LIVE FEED <Zap size={20} fill="white" /></>}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateEvent;