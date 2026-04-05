import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Info, Zap } from 'lucide-react';
const CreateHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ Name: '', Location: '', Tagline: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://YOUR_BACKEND_URL`)}/api/hubs`, formData);
      alert("NEW HUB ACTIVATED! 🌍");
      navigate('/');
    } catch (err) {
      alert("Error creating hub");
    } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-[#fbfdff] p-12 font-sharp">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-[10px] tracking-widest uppercase text-gray-400 mb-12">
        <ArrowLeft size={16} /> BACK TO PANEL
      </button>
      <div className="max-w-xl mx-auto bg-white p-10 rounded-[40px] shadow-2xl border border-gray-50">
        <h1 className="text-4xl font-black font-sporty uppercase mb-8">INITIATE <span className="text-purple-600">HUB</span></h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Campus Name</label>
            <div className="flex items-center bg-gray-50 rounded-2xl p-4 gap-3">
              <Globe size={18} className="text-purple-600" />
              <input type="text" placeholder="e.g. LPU CENTRAL" className="bg-transparent w-full outline-none font-bold uppercase text-xs" 
                onChange={e => setFormData({...formData, Name: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Physical Location</label>
            <div className="flex items-center bg-gray-50 rounded-2xl p-4 gap-3">
              <MapPin size={18} className="text-purple-600" />
              <input type="text" placeholder="e.g. PUNJAB, INDIA" className="bg-transparent w-full outline-none font-bold uppercase text-xs" 
                onChange={e => setFormData({...formData, Location: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Hub Tagline</label>
            <div className="flex items-center bg-gray-50 rounded-2xl p-4 gap-3">
              <Info size={18} className="text-purple-600" />
              <input type="text" placeholder="e.g. THE VIBE CENTRAL" className="bg-transparent w-full outline-none font-bold uppercase text-xs" 
                onChange={e => setFormData({...formData, Tagline: e.target.value})} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-black text-white font-black uppercase rounded-2xl hover:bg-purple-600 transition-all shadow-xl flex items-center justify-center gap-2">
            {loading ? "SYNCING..." : "ACTIVATE GATEWAY"} <Zap size={18} fill="white" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default CreateHub;