import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, Calendar, ArrowRight, ShieldCheck, Zap, Trash2, Edit3, AlertTriangle, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

const OrganizerPanel = ({ user }) => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE_URL}/api/organizer-events/${user.email}`)
        .then(res => setMyEvents(res.data))
        .catch(err => console.error("Panel Sync Error:", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (eventId) => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
      if (res.data.success) {
        showToast("Mission deleted successfully", "success");
        setMyEvents(myEvents.filter(e => e.Id !== eventId && e.id !== eventId));
        setDeleteConfirm(null);
      }
    } catch { showToast("Deletion failed", "error"); }
    finally { setIsDeleting(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#000] text-white font-medium">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans pb-24">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <div className="w-full bg-[#111111] border-b border-white/5 py-2 px-6 flex justify-between items-center text-[10px] font-medium tracking-wide uppercase text-[#888]">
          <span>Clearance: <span className="text-[#0070F3]">ARCHITECT</span></span>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 sm:px-8 py-12 w-full flex flex-col gap-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#222]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Organizer Dashboard</h1>
            <p className="text-[#A1A1AA] text-sm mt-1 flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#0070F3]" /> Manage your mission deployments</p>
          </div>
          <button onClick={() => navigate('/create-event')} className="px-6 py-3 bg-white text-black font-semibold text-sm rounded-lg hover:bg-[#EAEAEA] transition-all flex items-center gap-2 active:scale-95 shadow-[0_2px_10px_rgba(255,255,255,0.1)] outline-none">
            <Zap size={16} /> Deploy Mission
          </button>
        </header>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.length > 0 ? myEvents.map((event, i) => (
              <motion.div key={event.Id || event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-[#0a0a0a] border border-[#222] rounded-xl flex flex-col justify-between hover:border-[#333] transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-[#111] border border-[#333] rounded-lg flex items-center justify-center font-semibold text-white">
                      {event.Title?.[0] || event.Name?.[0]}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); navigate(`/host-event?edit=${event.Id || event.id}`); }} className="p-2 text-[#666] hover:bg-[#222] hover:text-white rounded-md transition-colors"><Edit3 size={14} /></button>
                       <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(event.Id || event.id); }} className="p-2 text-[#666] hover:bg-[#222] hover:text-red-500 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white line-clamp-1 cursor-pointer hover:text-[#0070F3] transition-colors" onClick={() => navigate(`/organizer/event/${event.Id || event.id}`)}>
                    {event.Title || event.Name}
                  </h3>
                  <div className="flex flex-col gap-2 text-[#888] text-xs font-medium">
                    <span className="flex items-center gap-2"><Calendar size={14} /> {event.start_time ? new Date(event.start_time).toLocaleDateString() : 'TBA'}</span>
                    <span className="flex items-center gap-2"><Users size={14} /> Collecting Applications</span>
                  </div>
                </div>

                <div onClick={() => navigate(`/organizer/event/${event.Id || event.id}`)} className="flex justify-between items-center px-6 py-4 border-t border-[#222] bg-[#111] cursor-pointer hover:bg-[#1a1a1a] transition-colors group">
                  <span className="text-sm font-semibold text-white">View Applicants</span>
                  <ArrowRight size={16} className="text-[#666] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center border border-dashed border-[#333] rounded-2xl bg-[#0a0a0a]">
                <LayoutGrid size={32} className="mx-auto mb-4 text-[#333]" />
                <p className="text-[#A1A1AA] font-medium text-sm">No active missions deployed under your jurisdiction.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm bg-[#0a0a0a] border border-[#333] p-8 rounded-2xl shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Mission?</h3>
              <p className="text-[#888] text-sm leading-relaxed mb-6">This action is irreversible. All mission data and registration intel will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={isDeleting} className="flex-1 py-3 bg-[#EF4444] hover:bg-[#DC2626] rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center">
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default OrganizerPanel;
