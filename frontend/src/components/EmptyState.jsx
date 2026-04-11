import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyState = ({ title, message, actionText, onAction, icon: Icon = Sparkles }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-[#333] rounded-2xl w-full my-8 bg-[#0a0a0a]"
  >
    <div className="w-16 h-16 rounded-full bg-[#111] border border-[#222] flex items-center justify-center mb-6">
      <Icon className="text-[#888] w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-[#888] max-w-md mx-auto mb-8 text-sm leading-relaxed">
      {message}
    </p>
    {actionText && onAction && (
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className="px-6 py-3 bg-[#EDEDED] text-black rounded-lg font-semibold text-sm hover:bg-white transition-all shadow-md"
      >
        {actionText}
      </motion.button>
    )}
  </motion.div>
);
