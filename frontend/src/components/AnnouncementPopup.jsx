import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Bell, Info, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AnnouncementPopup = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/notifications`);
        const data = res.data || [];
        const activeAnnouncements = data.filter(a => a.Status === 'Active' || a.Status === true);
        
        if (activeAnnouncements.length > 0) {
          setAnnouncements(activeAnnouncements);
          // Show the first one after a short delay
          setTimeout(() => setIsVisible(true), 2000);
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (currentIndex < announcements.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsVisible(true);
      }
    }, 500);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (announcements.length === 0 || currentIndex >= announcements.length) return null;

  const current = announcements[currentIndex];

  const getIcon = (category) => {
    switch (category?.toUpperCase()) {
      case 'URGENT': return <AlertTriangle className="text-red-500" size={24} />;
      case 'SYSTEM': return <Info className="text-blue-500" size={24} />;
      case 'EVENT': return <Bell className="text-purple-500" size={24} />;
      default: return <Megaphone className="text-purple-500" size={24} />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600" />
            
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    {getIcon(current.Category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                      {current.Category || 'ANNOUNCEMENT'}
                    </span>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white mt-1">
                      {current.Title}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="mb-8">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {current.Message}
                </p>
              </div>

              {/* Footer / Action */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1.5">
                  {announcements.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'w-6 bg-purple-500' : 'w-2 bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={currentIndex < announcements.length - 1 ? handleNext : handleClose}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                >
                  {currentIndex < announcements.length - 1 ? 'NEXT INTEL' : 'DISMISS'}
                </button>
              </div>
            </div>

            {/* Subtle Decorative Element */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementPopup;
