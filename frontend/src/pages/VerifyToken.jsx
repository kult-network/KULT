import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { auth } from '../firebase';
import { ShieldCheck, Zap, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Toast from '../components/Toast'; 
const VerifyToken = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const navigate = useNavigate();
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
  };
  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanToken = token.trim().toUpperCase();
    if (!cleanToken) return showToast("Bhai, token to daal!", "error");
    setLoading(true);
    try {
      const user = auth.currentUser;
      const res = await axios.post(`${API_BASE_URL}/api/verify-organizer`, {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        token: cleanToken 
      });
      if (res.data.success) {
        showToast("ACCESS GRANTED: ROLE UPGRADED! 👑", "success");
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/"; 
        }, 3000);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "INVALID OR EXPIRED TOKEN!";
      showToast(errMsg.toUpperCase(), "error");
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
          <div className="relative">
            <CheckCircle2 size={120} className="text-green-500 mb-8 relative z-10" />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-green-500 rounded-full blur-3xl opacity-20" />
          </div>
        </motion.div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-5xl md:text-7xl font-black text-white uppercase italic mb-4 tracking-tighter">CLEARANCE <span className="text-green-500">GRANTED</span></motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-gray-500 font-bold tracking-[0.5em] text-[10px] uppercase">Your role is now: <span className="text-white">ORGANIZER</span> | Redirecting...</motion.p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sharp">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-10 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-10 -ml-48 -mb-48"></div>
      <button onClick={() => navigate('/')} className="absolute top-10 left-6 md:left-10 flex items-center gap-2 text-gray-500 hover:text-white transition-all font-black text-[10px] tracking-[0.4em] uppercase">
        <ArrowLeft size={16} /> EXIT GATEWAY
      </button>
      <main className="max-w-md w-full relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block p-5 bg-purple-600/10 border border-purple-500/20 rounded-[30px] mb-8 shadow-2xl">
            <ShieldCheck size={48} className="text-purple-500" />
          </motion.div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-6 leading-none">ACTIVATE <span className="text-purple-600">ID</span></h1>
          <p className="text-gray-500 font-bold text-[10px] tracking-[0.3em] uppercase max-w-[250px] mx-auto leading-relaxed">INPUT YOUR UNIQUE ORGANIZER ACCESS KEY</p>
        </div>
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="KULT-XXXX-XXXX"
              className="w-full bg-white/[0.03] border border-white/10 p-7 rounded-[30px] outline-none focus:border-purple-600 focus:bg-white/[0.07] transition-all font-mono text-2xl text-center tracking-[0.3em] uppercase"
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())} 
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-6 bg-white text-black font-black uppercase italic rounded-[30px] hover:bg-purple-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" /> : <>ACTIVATE CLEARANCE <Zap size={20} fill="currentColor" /></>}
          </button>
        </form>
        <div className="mt-12 p-6 rounded-[25px] bg-white/[0.02] border border-white/5 flex items-start gap-4">
          <ShieldAlert size={18} className="text-gray-600 shrink-0 mt-1" />
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest leading-loose">Verification is permanent. One token per user identity. <br />Unauthorized attempts are logged by the <span className="text-purple-500">KULT Security Protocol</span>.</p>
        </div>
      </main>
    </div>
  );
};
export default VerifyToken;