import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Zap, User, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from '../components/Toast'; 
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const navigate = useNavigate();
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
  };
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast(`WELCOME BACK, ${userCredential.user.email.split('@')[0].toUpperCase()}! 🛰️`, 'success');
        setTimeout(() => navigate('/'), 1500);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://YOUR_BACKEND_URL`)}/api/user-role`, {
          email: user.email,
          name: fullName,
          role: 'USER'
        });
        await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://YOUR_BACKEND_URL`)}/api/send-welcome-email`, {
          email: user.email,
          name: fullName
        });
        showToast('KULT ID ACTIVATED! CHECK YOUR EMAIL 📧', 'success');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) { 
      const errorMsg = err.code?.includes('auth/') ? err.code.replace('auth/', '').replace(/-/g, ' ') : err.message;
      showToast(errorMsg.toUpperCase(), 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogle = async () => {
    try { 
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      showToast(`SYNCING GOOGLE IDENTITY... 🛰️`, 'success');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://YOUR_BACKEND_URL`)}/api/user-role/${user.email}`);
      if (!res.data.id || res.data.Role === 'USER') {
        await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://YOUR_BACKEND_URL`)}/api/user-role`, {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'USER'
        });
        setTimeout(() => navigate('/'), 1000); 
      } else {
        setTimeout(() => navigate('/'), 1000); 
      }
    } catch (e) { 
      showToast("GOOGLE AUTH PROTOCOL FAILED", "error");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfdff] font-sharp p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-5 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-5 -ml-48 -mb-48"></div>
      <Toast 
        isVisible={toast.show} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 md:p-14 bg-white border border-gray-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[50px] text-center relative z-10"
      >
        <div className="inline-flex p-5 bg-black text-white rounded-[25px] mb-8 shadow-2xl group hover:rotate-12 transition-transform">
          <Zap size={32} fill="white" className="group-hover:text-purple-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-black italic uppercase mb-10 leading-none tracking-tighter">
          KULT <span className="text-purple-600">ID</span>
        </h1>
        <form onSubmit={handleAuth} className="space-y-5 text-left">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Identify Yourself</label>
              <div className="relative">
                <User className="absolute left-5 top-5 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="FULL NAME" 
                  className="w-full p-5 pl-14 bg-gray-50 rounded-[22px] font-bold outline-none uppercase text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all border border-transparent focus:border-purple-500/30" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Email Gateway</label>
            <div className="relative">
              <Mail className="absolute left-5 top-5 text-gray-300" size={18} />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full p-5 pl-14 bg-gray-50 rounded-[22px] font-bold outline-none uppercase text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all border border-transparent focus:border-purple-500/30" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-5 text-gray-300" size={18} />
              <input 
                type="password" 
                placeholder="PASSWORD" 
                className="w-full p-5 pl-14 bg-gray-50 rounded-[22px] font-bold outline-none uppercase text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all border border-transparent focus:border-purple-500/30" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>
          <button 
            disabled={loading}
            className="w-full py-6 bg-black text-white font-black italic rounded-[25px] hover:bg-purple-600 transition-all uppercase shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] active:scale-95 mt-6 flex items-center justify-center gap-3 tracking-widest text-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'ACTIVATE SESSION' : 'INITIATE JOIN')}
          </button>
        </form>
        <div className="my-10 flex items-center gap-4 text-gray-100">
          <hr className="flex-1" /> 
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">OR</span> 
          <hr className="flex-1" />
        </div>
        <button 
          onClick={handleGoogle} 
          className="w-full py-5 border-2 border-gray-100 rounded-[25px] font-black text-[10px] flex items-center justify-center gap-4 hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="Google" /> 
          Google Identity Sync
        </button>
        <p 
          className="mt-10 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:text-purple-600 transition-colors tracking-[0.2em]" 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "No Identity? Join the Kult" : "Existing Member? Authenticate"}
        </p>
      </motion.div>
    </div>
  );
};
export default Auth;