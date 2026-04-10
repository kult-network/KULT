import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Zap, X } from 'lucide-react';
const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          className="fixed top-6 sm:top-24 right-4 sm:right-8 left-4 sm:left-auto z-[999] flex items-center gap-4 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 min-w-0 sm:min-w-[300px]"
        >
          <div className={`p-2 rounded-xl ${type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">System Notification</p>
            <p className="text-xs font-bold uppercase tracking-tight">{message}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-purple-600 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Toast;