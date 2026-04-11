import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ImageIcon, Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import Toast from '../components/Toast'; 
import { API_BASE_URL } from '../config/api';
import { useSEO } from '../utils/seo';

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

  useSEO('Host Mission', 'Create and deploy a new mission to the KULT Network platform.');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/hubs`).then(res => setHubs(Array.isArray(res.data) ? res.data : res.data.list || []));

    if (editEventId) {
      const fetchEventDetails = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/events/${editEventId}`);
          const event = res.data;
          setFormData({
            Title: event.Title || event.Name || '', Speaker: event.Speaker || '', Category: event.Category || 'Workshops',
            Description: event.Description || '', Hubs: event.Hubs && event.Hubs.length > 0 ? [event.Hubs[0].Id || event.Hubs[0].id] : [],
            dl_provided: event.DL_Protocol === 'YES', start_time: event.start_time ? event.start_time.slice(0, 16) : '',
            end_time: event.end_time ? event.end_time.slice(0, 16) : '', Redirect_Link: event.Redirect_Link || ''
          });
          setPriceType(event.Price === 'Paid' || event.Price === 'PAID' ? 'PAID' : 'FREE');
          if (event.Poster) setPosterPreview(event.Poster);
          if (event.Itinerary) {
            try {
              const parsed = JSON.parse(event.Itinerary);
              if (Array.isArray(parsed) && parsed.length > 0) { setItinerary(parsed); setShowItinerary(true); }
            } catch (e) { console.error(e); }
          }
        } catch (err) { showToast("Failed to load mission data", "error"); }
      };
      fetchEventDetails();
    }
  }, [editEventId]);

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showToast("File too large (Max 5MB)", "error");
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file)); 
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = "dieejbvq8"; 
    const uploadPreset = "kult-network"; 
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
    if (!res.ok) throw new Error("Upload Failed");
    const fileData = await res.json();
    return fileData.secure_url; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Hubs[0]) return showToast("Select a Hub Access level", "error");
    if (priceType === "PAID" && !formData.Redirect_Link) return showToast("Enter a Redirect Link", "error");
    
    setLoading(true);
    try {
      let finalPosterUrl = "";
      if (posterFile) {
        showToast("Uploading visual assets...", "success");
        finalPosterUrl = await uploadToCloudinary(posterFile);
      }

      const payload = {
        Name: formData.Title, Description: formData.Description, Category: formData.Category, Speaker: formData.Speaker,
        start_time: formData.start_time, end_time: formData.end_time, Price: priceType, DL_Protocol: formData.dl_provided ? "YES" : "NO",
        Hub_ID: formData.Hubs[0], Organizer_Email: "commander@kult.network", Itinerary: showItinerary ? JSON.stringify(itinerary.filter(i => i.time || i.activity)) : null,
        Poster: finalPosterUrl || posterPreview, Redirect_Link: priceType === "PAID" ? formData.Redirect_Link : ""
      };

      if (editEventId) await axios.patch(`${API_BASE_URL}/api/events/${editEventId}`, payload);
      else await axios.post(`${API_BASE_URL}/api/events`, payload);

      showToast(editEventId ? "Mission Updated" : "Mission Deployed", "success");
      setTimeout(() => navigate(hubIdFromUrl ? `/hub/${hubIdFromUrl}` : '/organizer'), 2000);
    } catch (err) { showToast(editEventId ? "Update failed" : "Deployment failed", "error"); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#333] px-4 py-3 rounded-lg outline-none focus:border-[#666] transition-colors text-sm text-white placeholder-[#666]";
  const labelClass = "text-xs font-semibold text-[#888] mb-1.5 block ml-1";

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#A1A1AA] hover:text-white mb-8 transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Cancel Architecture
        </button>

        <header className="mb-10 pb-6 border-b border-[#222]">
          <h1 className="text-3xl font-bold tracking-tight text-white">{editEventId ? 'Reconfigure Mission' : 'Architect Mission'}</h1>
          <p className="text-[#888] text-sm mt-1">Design and deploy a new operational sequence to the network.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Core Configuration */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Core Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Mission Designation (Title)</label>
                <input className={inputClass} placeholder="e.g. Next.js Architecture Workshop" value={formData.Title} onChange={e => setFormData({ ...formData, Title: e.target.value })} required />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Briefing Document (Description)</label>
                <textarea className={`${inputClass} min-h-[120px] resize-none`} placeholder="Elaborate on the mission objectives..." value={formData.Description} onChange={e => setFormData({ ...formData, Description: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Category Vector</label>
                <select className={inputClass} value={formData.Category} onChange={e => setFormData({ ...formData, Category: e.target.value })}>
                  <option value="Workshops">Workshops</option>
                  <option value="Hackathons">Hackathons</option>
                  <option value="Seminars">Seminars</option>
                  <option value="Social">Social</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Lead Architect (Speaker)</label>
                <input className={inputClass} placeholder="Leave blank if N/A" value={formData.Speaker} onChange={e => setFormData({ ...formData, Speaker: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Hub Access Node</label>
                <select className={inputClass} value={formData.Hubs[0] || ''} onChange={e => setFormData({ ...formData, Hubs: [parseInt(e.target.value)] })} required>
                  <option value="">Select an operational hub</option>
                  {hubs.map(hub => <option key={hub.id || hub.Id} value={hub.id || hub.Id}>{hub.Name}</option>)}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${formData.dl_provided ? 'bg-[#0070F3]' : 'bg-[#333]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.dl_provided ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-medium text-white">Duty Leave (DL) Integration Ready</span>
                </label>
              </div>
            </div>
          </div>

          {/* Visual Assets Matrix */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Visual Architecture</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className={labelClass}>Mission Poster Matrix</label>
                <div className="mt-2 w-full h-48 border-2 border-dashed border-[#333] hover:border-[#0070F3] rounded-xl bg-[#111] flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group outline-none">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                  {posterPreview ? (
                    <>
                      <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-semibold flex items-center gap-2"><ImageIcon size={16} /> Re-upload Module</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-[#666] group-hover:text-[#0070F3] transition-colors">
                      <ImageIcon size={32} className="mb-3" />
                      <p className="text-sm font-medium">Click or drag asset to mount</p>
                      <p className="text-xs opacity-70 mt-1">1080x1080px ratio optimized</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Temporal Bounds */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Temporal Execution Bounds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Initialization Code (Start)</label>
                <input type="datetime-local" className={inputClass} value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>Termination Code (End)</label>
                <input type="datetime-local" className={inputClass} value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} required />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-[#EDEDED] text-black font-semibold rounded-lg hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
              {editEventId ? "Save Reconfiguration" : "Initialize Protocol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateEvent;