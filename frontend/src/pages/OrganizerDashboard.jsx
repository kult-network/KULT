import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Eye, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import Toast from '../components/Toast';
const OrganizerDashboard = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/bookings/event/${eventId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.list || [];
      setBookings(data);
    } catch (_err) {
      console.error("❌ Fetch Error:", _err);
      setToast({ show: true, msg: "Failed to load intel", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchBookings();
  }, [eventId, fetchBookings]);
  const handleStatusUpdate = async (id, newStatus) => {
    if (!id) {
      console.error("❌ Error: Booking ID is missing!");
      setToast({ show: true, msg: "INVALID BOOKING ID", type: 'error' });
      return;
    }
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/bookings/${id}`, { 
        Status: newStatus 
      });
      if (res.data.success) {
        setToast({ show: true, msg: `USER ${newStatus.toUpperCase()}!`, type: 'success' });
        fetchBookings(); 
      }
    } catch (err) {
      console.error("❌ Patch Action Failed:", err.response?.data || err.message);
      setToast({ show: true, msg: "ACTION FAILED", type: 'error' });
    }
  };
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a] font-sporty text-purple-600 animate-pulse uppercase tracking-widest text-2xl">
      Accessing Database...
    </div>
  );
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sharp overflow-x-hidden">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 uppercase font-black text-[10px] tracking-[0.4em] transition-all group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> TERMINAL EXIT
        </button>
        <div className="px-6 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full text-purple-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
           <ShieldCheck size={14} /> MISSION CONTROL GATEWAY
        </div>
      </div>
      <header className="max-w-7xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-black font-sporty uppercase italic leading-none tracking-tighter text-white neon-glow">
          <span className="text-purple-400">OPERATIONAL</span> <span className="text-purple-600">INTEL</span>
        </h1>
        <p className="text-purple-300 font-bold uppercase text-[10px] tracking-[0.5em] mt-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
          Validating Network Registrations & Access Requests
        </p>
      </header>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {bookings.length > 0 ? bookings.map((user, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05 }}
              key={user.Id || i} 
              className="bg-white/[0.02] border border-white/5 rounded-[35px] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-lg shadow-purple-600/20">
                  {user.Name?.[0] || '?'}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-purple-300 uppercase tracking-widest">Identify</p>
                    <p className="text-xs font-black uppercase text-purple-100 truncate">{user.Name || 'Anonymous'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-purple-300 uppercase tracking-widest">Student ID</p>
                    <p className="text-xs font-black uppercase text-purple-400">{user.StudentID || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-purple-300 uppercase tracking-widest">Stream/Year</p>
                    <p className="text-xs font-black uppercase text-purple-100">{user.Stream} - {user.Year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-purple-300 uppercase tracking-widest">Status</p>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg border ${
                      user.Status === 'Approved' ? 'border-green-500/50 text-green-500 bg-green-500/10' : 
                      user.Status === 'Rejected' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 
                      'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
                    } uppercase`}>
                      {user.Status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                {user.Payment_Screenshot && user.Payment_Screenshot.length > 0 && (
                  <button 
                    onClick={() => {
                      const img = user.Payment_Screenshot[0];
                      setSelectedImage(img.url || `https://app.nocodb.com/${img.path}`);
                    }}
                    className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-purple-600 hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all border border-white/5"
                  >
                    <Eye size={16} /> VIEW PROOF
                  </button>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(user.Id, 'Approved')} 
                    className="p-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-90"
                    title="Approve Access"
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(user.Id, 'Rejected')} 
                    className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all shadow-lg shadow-red-600/20 active:scale-90"
                    title="Reject Access"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[50px]">
              <AlertCircle size={48} className="text-gray-800 mb-4" />
              <div className="opacity-20 uppercase font-black tracking-[0.5em] text-sm">No Intelligence Data Found</div>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[300] bg-black/98 flex items-center justify-center p-4 md:p-12 backdrop-blur-xl"
          >
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute top-10 right-10 p-4 bg-slate-950/95 text-white rounded-full hover:bg-purple-600 hover:text-white transition-all shadow-2xl"
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              src={selectedImage} 
              className="max-w-full max-h-full rounded-3xl shadow-2xl border border-white/10 object-contain" 
              alt="Verification Proof" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default OrganizerDashboard;