import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { ShieldCheck, Zap, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast'; 

const VerifyToken = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanToken = token.trim().toUpperCase();
    if (!cleanToken) return showToast("Input token required", "error");
    
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('kult_user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      const res = await axios.post(`${API_BASE_URL}/api/verify-organizer`, {
        email: userData?.email, name: userData?.name || userData?.email?.split('@')[0], token: cleanToken 
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('kult_token')}` } });
      
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => window.location.href = "/", 3000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Invalid or expired key";
      showToast(errMsg, "error");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-6 font-sans">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-8 p-4 bg-green-500/10 rounded-full">
          <CheckCircle2 size={64} className="text-green-500" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Clearance Granted</h1>
        <p className="text-[#A1A1AA] text-sm">Role upgraded to Organizer. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] flex items-center justify-center p-6 relative font-sans">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-[#888] hover:text-white transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Return to Network
      </Link>

      <div className="max-w-[400px] w-full bg-[#111] border border-[#222] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#0a0a0a] border border-[#333] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Verify Credential</h1>
          <p className="text-[#888] text-sm leading-relaxed">Enter your unique organizational key to upgrade your network clearance.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input 
            type="text" placeholder="KULT-XXXX-XXXX"
            className="w-full bg-[#0a0a0a] border border-[#333] px-4 py-4 rounded-xl outline-none focus:border-[#666] transition-colors font-mono text-center tracking-[0.2em] uppercase text-white"
            value={token} onChange={(e) => setToken(e.target.value.toUpperCase())} autoFocus
          />
          <button type="submit" disabled={loading || !token} className="w-full py-4 bg-[#EDEDED] text-black font-semibold rounded-xl hover:bg-white transition-all shadow-lg flex items-center justify-center disabled:opacity-50 mt-4 active:scale-95">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Validate Identity"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#222] text-center flex flex-col items-center gap-3">
           <ShieldAlert size={16} className="text-[#666]" />
           <p className="text-xs text-[#666] leading-relaxed">Clearance upgrades are strictly logged. Distribution of unauthorized keys will result in immediate network expulsion.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyToken;
