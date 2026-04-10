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

  const fetchMyMissions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/organizer-events/${user.email}`);
      setMyEvents(res.data);
    } catch (err) {
      console.error("Panel Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchMyMissions();
  }, [user]);

  const handleDelete = async (eventId) => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/events/${eventId}`);
      if (res.data.success) {
        showToast("MISSION ABORTED & SCRUBBED", "success");
        setMyEvents(myEvents.filter(e => e.Id !== eventId && e.id !== eventId));
        setDeleteConfirm(null);
      }
    } catch (err) {
      showToast("ABORT FAILED", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-purple-600 font-sporty animate-pulse text-2xl uppercase">Loading Command Center...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-sharp">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-sporty uppercase italic leading-none">
            ORGANIZER <span className="text-purple-600">HUB</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.5em] mt-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-purple-500" /> Manage Your Active Deployments
          </p>
        </div>
        <button 
          onClick={() => navigate('/host-event')} 
          className="px-8 py-4 bg-purple-600 hover:bg-white hover:text-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-purple-600/20"
        >
          <Zap size={16} fill="currentColor" /> DEPLOY NEW MISSION
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myEvents.length > 0 ? myEvents.map((event, i) => (
          <motion.div 
            key={event.Id || event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 h-full flex flex-col justify-between hover:bg-white/[0.05] hover:border-purple-500/30 transition-all relative overflow-hidden">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center font-black italic text-xl">
                    {event.Title?.[0] || event.Name?.[0]}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/host-event?edit=${event.Id || event.id}`); }}
                      className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg transition-all"
                      title="Edit Mission"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(event.Id || event.id); }}
                      className="p-2 bg-white/5 hover:bg-red-600 rounded-lg transition-all"
                      title="Abort Mission"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div onClick={() => navigate(`/organizer/event/${event.Id || event.id}`)} className="cursor-pointer">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-purple-500 transition-colors">
                    {event.Title || event.Name}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {event.start_time?.split('T')[0]}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> TRACKING APPLICANTS</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => navigate(`/organizer/event/${event.Id || event.id}`)}
                className="flex justify-between items-center pt-6 border-t border-white/5 cursor-pointer"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">View Applied Users</span>
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ArrowRight size={18} />
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 text-7xl font-black opacity-[0.02] font-sporty italic group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                INTEL
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[50px]">
            <LayoutGrid size={48} className="mx-auto mb-4 text-gray-800" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No Missions Found Under Your Command</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-slate-900 border border-red-500/20 p-10 rounded-[40px] text-center"
            >
              <div className="w-20 h-20 bg-red-600/10 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-3xl font-black uppercase italic mb-4">Abort Mission?</h2>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-10 leading-relaxed">
                This action is irreversible. All mission data and registration intelligence will be permanently scrubbed.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 py-5 bg-red-600 hover:bg-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Scrub Data"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerPanel;
