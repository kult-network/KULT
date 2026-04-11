import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import { API_BASE_URL } from '../config/api';

const Auth = () => {
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showToast = (msg, type = 'success') => setToast({ show: true, msg, type });

  const resetForm = () => {
    setEmail('');
    setName('');
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
  };

  const switchMode = (mode) => {
    resetForm();
    setAuthMode(mode);
  };

  const handleSendOtp = async () => {
    if (!email) return showToast('Enter email address', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Invalid email format', 'error');
    if (authMode === 'signup' && !name.trim()) return showToast('Enter your name', 'error');
    setLoading(true);

    try {
      const action = authMode === 'signup' ? 'signup' : 'login';
      const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { email, action, name: name.trim() || undefined });
      if (res.data.success) {
        setOtpSent(true);
        setCountdown(60);
        showToast('Check your email inbox', 'success');
      }
    } catch (err) {
      showToast(err?.response?.data?.error || err.message || 'Failed to send code', 'error');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return showToast('Enter 6-digit code', 'error');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { email, otp, name: name.trim() || undefined });
      if (res.data.success) {
        if (authMode === 'signup') {
          showToast('Account created! Please login', 'success');
          setTimeout(() => switchMode('login'), 2000);
        } else {
          const userData = { id: res.data.user.id, email: res.data.user.email, name: res.data.user.name || name || email.split('@')[0], role: res.data.user.role };
          localStorage.setItem('kult_token', res.data.token);
          localStorage.setItem('kult_user', JSON.stringify(userData));
          showToast('Authentication complete', 'success');
          setTimeout(() => { window.location.href = '/'; }, 1200);
        }
      }
    } catch (err) {
      const errorData = err.response?.data || {};
      if (errorData.needsSignup) {
        showToast('Account not found - Switching to Sign Up', 'error');
        setTimeout(() => switchMode('signup'), 1500);
      } else {
        showToast(errorData.error || 'Verification failed', 'error');
      }
    } finally { setLoading(false); }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#333] px-4 py-3 rounded-lg outline-none focus:border-[#666] transition-colors text-sm text-white placeholder-[#666] font-medium";

  return (
    <div className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans flex items-center justify-center p-6 relative overflow-hidden">
      <Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      
      {/* Top Left Return Logo */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><Zap size={14} fill="black" stroke="black"/></div>
        <span className="font-semibold tracking-tight">KULT Network</span>
      </Link>

      <div className="w-full max-w-[400px] z-10 relative">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-[#111] border border-[#222] rounded-2xl shadow-2xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="text-center mb-8">
               <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">{authMode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
               <p className="text-[#888] text-sm">
                 {authMode === 'login' ? "Enter your email to sign in to your dashboard." : "Enter your details to register for the network."}
               </p>
            </div>

            <AnimatePresence mode="wait">
               {!otpSent ? (
                 <motion.div key="details-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="space-y-4 mb-6">
                      {authMode === 'signup' && (
                         <div className="space-y-1.5">
                           <label className="text-xs font-semibold text-[#888] ml-1">Full Name</label>
                           <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
                         </div>
                      )}
                      <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-[#888] ml-1">Email Address</label>
                         <input type="email" placeholder="name@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    
                    <button onClick={handleSendOtp} disabled={loading || !email} className="w-full py-3 bg-[#EDEDED] text-black font-semibold rounded-lg hover:bg-white transition-all flex items-center justify-center shadow-lg disabled:opacity-50 group">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <span className="flex items-center gap-2">Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>}
                    </button>
                 </motion.div>
               ) : (
                 <motion.form key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp}>
                    <div className="mb-6 space-y-4">
                       <div className="flex items-center gap-3 p-3 rounded-lg border border-[#333] bg-[#0a0a0a]">
                         <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center border border-[#333] shrink-0"><Zap size={12} className="text-[#A1A1AA]" /></div>
                         <div className="overflow-hidden">
                           <p className="text-xs text-[#888]">Security Code Sent To</p>
                           <p className="text-sm font-semibold truncate text-white">{email}</p>
                         </div>
                       </div>
                       
                       <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-[#888] ml-1">6-Digit OTP</label>
                         <input type="text" placeholder="000000" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className={`${inputClass} text-center tracking-[0.5em] text-lg font-mono placeholder:tracking-normal`} autoFocus />
                       </div>
                    </div>

                    <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3 mb-4 bg-[#EDEDED] text-black font-semibold rounded-lg hover:bg-white transition-all flex items-center justify-center disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify Identity"}
                    </button>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#333]">
                       <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-semibold text-[#888] hover:text-white transition-colors flex items-center gap-1"><ArrowLeft size={12}/> Edit details</button>
                       <button type="button" onClick={handleSendOtp} disabled={loading || countdown > 0} className="text-xs font-semibold text-[#888] hover:text-white transition-colors disabled:opacity-50">
                         {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                       </button>
                    </div>
                 </motion.form>
               )}
            </AnimatePresence>
            
            {!otpSent && (
              <div className="mt-6 pt-6 border-t border-[#333] text-center">
                 <p className="text-sm text-[#A1A1AA]">
                   {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{" "}
                   <button onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')} className="font-semibold text-white hover:text-gray-300 transition-colors">
                     {authMode === 'login' ? "Sign up" : "Sign in"}
                   </button>
                 </p>
              </div>
            )}
         </motion.div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.03]">
         <div className="absolute inset-0 border border-white/50 rounded-full scale-50" />
         <div className="absolute inset-0 border border-white/50 rounded-full scale-75" />
         <div className="absolute inset-0 border border-white/50 rounded-full scale-100" />
      </div>
    </div>
  );
};
export default Auth;
