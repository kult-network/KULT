import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Zap, User, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from '../components/Toast'; 
import { API_BASE_URL } from '../config/api';

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

  // 🛰️ HANDLE REDIRECT RESULT (For Mobile)
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await syncUser(user);
        }
      } catch (err) {
        if (err.code !== 'auth/unauthorized-domain') {
           console.error("Redirect Error:", err);
        }
      }
    };
    checkRedirect();
  }, []);

  const syncUser = async (user) => {
    showToast(`SYNCING GOOGLE IDENTITY... 🛰️`, 'success');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user-role/${user.email}`);
      if (!res.data.id || res.data.Role === 'USER') {
        await axios.post(`${API_BASE_URL}/api/user-role`, {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'USER'
        });
      }
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setTimeout(() => navigate('/'), 1000);
    }
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
        await axios.post(`${API_BASE_URL}/api/user-role`, {
          email: user.email,
          name: fullName,
          role: 'USER'
        });
        showToast('KULT ID ACTIVATED!', 'success');
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try { 
      if (isMobile) {
        // 📱 USE REDIRECT FOR MOBILE
        await signInWithRedirect(auth, googleProvider);
      } else {
        // 💻 USE POPUP FOR LAPTOP
        const result = await signInWithPopup(auth, googleProvider);
        await syncUser(result.user);
      }
    } catch (err) { 
      showToast("GOOGLE AUTH PROTOCOL FAILED", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sharp p-6 relative overflow-hidden text-white">
      <Toast 
        isVisible={toast.show} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 bg-slate-900 border border-white/10 rounded-[50px] text-center relative z-10"
      >
        <div className="inline-flex p-5 bg-black text-white rounded-[25px] mb-8 shadow-2xl group hover:rotate-12 transition-transform">
          <Zap size={32} fill="white" className="group-hover:text-purple-400" />
        </div>
        <h1 className="text-5xl font-black italic uppercase mb-10 leading-none tracking-tighter">
          KULT <span className="text-purple-600">ID</span>
        </h1>
        <form onSubmit={handleAuth} className="space-y-5 text-left">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Identify Yourself</label>
              <input type="text" placeholder="FULL NAME" className="w-full p-5 bg-slate-800 rounded-[22px] font-bold outline-none uppercase text-xs" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
             <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Email Gateway</label>
             <input type="email" placeholder="EMAIL ADDRESS" className="w-full p-5 bg-slate-800 rounded-[22px] font-bold outline-none uppercase text-xs" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
             <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Security Key</label>
             <input type="password" placeholder="PASSWORD" className="w-full p-5 bg-slate-800 rounded-[22px] font-bold outline-none uppercase text-xs" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="w-full py-6 bg-purple-600 text-white font-black italic rounded-[25px] hover:bg-purple-500 transition-all uppercase mt-6 flex items-center justify-center gap-3 tracking-widest text-xs">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'ACTIVATE SESSION' : 'INITIATE JOIN')}
          </button>
        </form>
        <div className="my-10 flex items-center gap-4 text-gray-100">
          <hr className="flex-1 opacity-20" /> <span className="text-[9px] font-black uppercase tracking-[0.4em]">OR</span> <hr className="flex-1 opacity-20" />
        </div>
        <button onClick={handleGoogle} className="w-full py-5 border-2 border-white/10 rounded-[25px] font-black text-[10px] flex items-center justify-center gap-4 hover:bg-white/5 transition-all uppercase tracking-widest">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="Google" /> 
          Google Identity Sync
        </button>
        <p className="mt-10 text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:text-purple-600 tracking-[0.2em]" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "No Identity? Join the Kult" : "Existing Member? Authenticate"}
        </p>
      </motion.div>
    </div>
  );
};
export default Auth;