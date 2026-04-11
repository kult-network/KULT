import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
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
      setBookings(Array.isArray(res.data) ? res.data : res.data.list || []);
    } catch (_err) {
      setToast({ show: true, msg: "Failed to load intel", type: 'error' });
    } finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { if (eventId) fetchBookings(); }, [eventId, fetchBookings]);

  const handleStatusUpdate = async (id, newStatus) => {
    if (!id) return setToast({ show: true, msg: "INVALID BOOKING ID", type: 'error' });
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/bookings/${id}`, { Status: newStatus });
      if (res.data.success) {
        setToast({ show: true, msg: `User ${newStatus}!`, type: 'success' });
        fetchBookings(); 
      }
    } catch (err) { setToast({ show: true, msg: "Update failed", type: 'error' }); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading Verification Intelligence...</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans overflow-x-hidden pb-32">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <div className="w-full bg-[#111111] border-b border-white/5 py-2 px-6 flex justify-between items-center text-[10px] font-medium tracking-wide uppercase text-[#888]">
          <span className="flex items-center gap-2"><ShieldCheck size={12}/> Mission Tracking Protocol</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#A1A1AA] hover:text-white mb-4 transition-colors font-medium text-sm">
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Registration Intelligence</h1>
            <p className="text-[#888] text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#0070F3] rounded-full"></span> Verify and clear applicant access
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {bookings.length > 0 ? bookings.map((user, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={user.Id || i} 
              className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[#333] transition-all"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                <div className="w-12 h-12 bg-[#111] border border-[#333] rounded-full flex items-center justify-center font-semibold text-lg text-white shrink-0">
                  {user.Name?.[0] || '?'}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">Candidate</p>
                    <p className="text-sm font-medium text-white line-clamp-1">{user.Name || 'Anonymous'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">Identity ID</p>
                    <p className="text-sm font-medium text-[#A1A1AA]">{user.StudentID || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">Designation</p>
                    <p className="text-sm font-medium text-[#A1A1AA]">{user.Stream} - {user.Year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wider">Status</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md border ${
                      user.Status === 'Approved' ? 'border-green-500/20 text-green-500 bg-green-500/10' : 
                      user.Status === 'Rejected' ? 'border-red-500/20 text-red-500 bg-red-500/10' : 
                      'border-yellow-500/20 text-yellow-500 bg-yellow-500/10'
                    }`}>
                      {user.Status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t border-[#222] lg:border-t-0">
                {user.Payment_Screenshot && user.Payment_Screenshot.length > 0 && (
                  <button 
                    onClick={() => { const img = user.Payment_Screenshot[0]; setSelectedImage(img.url || `https://app.nocodb.com/${img.path}`); }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg text-xs font-semibold transition-colors flex-1 lg:flex-none h-10 line-clamp-1"
                  >
                    <Eye size={14} /> Review Proof
                  </button>
                )}
                <div className="flex gap-2">
                  <button onClick={() => handleStatusUpdate(user.Id, 'Approved')} className="w-10 h-10 flex items-center justify-center bg-[#111] hover:bg-green-500/10 border border-[#333] hover:border-green-500/50 text-[#888] hover:text-green-500 rounded-lg transition-colors" title="Grant Access"><Check size={16} /></button>
                  <button onClick={() => handleStatusUpdate(user.Id, 'Rejected')} className="w-10 h-10 flex items-center justify-center bg-[#111] hover:bg-red-500/10 border border-[#333] hover:border-red-500/50 text-[#888] hover:text-red-500 rounded-lg transition-colors" title="Deny Access"><X size={16} /></button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-24 text-center flex flex-col items-center justify-center border border-dashed border-[#333] rounded-2xl bg-[#0a0a0a]">
              <AlertCircle size={32} className="text-[#333] mb-4" />
              <div className="text-[#888] font-medium text-sm">No verification requests found for this mission.</div>
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
            <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 p-3 bg-[#111] border border-[#333] text-white rounded-lg hover:bg-[#222] transition-colors"><X size={20} /></button>
            <motion.img initial={{ scale: 0.95 }} animate={{ scale: 1 }} src={selectedImage} className="max-w-full max-h-[90vh] rounded-xl border border-[#222] object-contain shadow-2xl" alt="Verification Proof" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default OrganizerDashboard;