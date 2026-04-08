import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
  };

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
    if (!email) {
      showToast('ENTER EMAIL ADDRESS', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('INVALID EMAIL FORMAT', 'error');
      return;
    }
    
    if (authMode === 'signup' && !name.trim()) {
      showToast('ENTER YOUR NAME', 'error');
      return;
    }

    setLoading(true);
    try {
      const action = authMode === 'signup' ? 'signup' : 'login';
      const res = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { 
        email,
        action,
        name: name.trim() || undefined
      });
      
      if (res.data.success) {
        setOtpSent(true);
        setCountdown(60);
        showToast(authMode === 'signup' ? 'VERIFICATION CODE SENT 📨' : 'CHECK YOUR EMAIL 📨', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error?.toUpperCase() || 'FAILED TO SEND CODE', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      showToast('ENTER 6-DIGIT CODE', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { 
        email, 
        otp,
        name: name.trim() || undefined
      });
      
      if (res.data.success) {
        const userData = {
          id: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.name || name || email.split('@')[0],
          role: res.data.user.role
        };
        
        localStorage.setItem('kult_token', res.data.token);
        localStorage.setItem('kult_user', JSON.stringify(userData));
        
        if (res.data.action === 'signup') {
          showToast('KULT ID ACTIVATED! 🚀', 'success');
        } else {
          showToast(`WELCOME BACK, ${userData.name?.toUpperCase() || email.split('@')[0].toUpperCase()}! 🛰️`, 'success');
        }
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    } catch (err) {
      const errorData = err.response?.data || {};
      
      if (errorData.needsSignup) {
        showToast('ACCOUNT NOT FOUND - SIGN UP FIRST', 'error');
        setTimeout(() => switchMode('signup'), 2000);
      } else {
        showToast(errorData.error?.toUpperCase() || 'VERIFICATION FAILED', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
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
        {otpSent && (
          <button 
            onClick={() => setOtpSent(false)}
            className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Zap size={20} />
          </button>
        )}

        <div className="inline-flex p-5 bg-black text-white rounded-[25px] mb-8 shadow-2xl group hover:rotate-12 transition-transform">
          <Zap size={32} fill="white" className="group-hover:text-purple-400" />
        </div>
        
        <h1 className="text-5xl font-black italic uppercase mb-10 leading-none tracking-tighter">
          KULT <span className="text-purple-600">ID</span>
        </h1>

        {!otpSent ? (
          <div className="space-y-5 text-left">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold uppercase tracking-wider">
                {authMode === 'login' ? 'LOGIN' : 'JOIN KULT'}
              </h2>
              <p className="text-gray-400 text-xs mt-2">
                {authMode === 'login' 
                  ? 'Enter your email to receive a code'
                  : 'Enter your details to create an account'
                }
              </p>
            </div>
            
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Your Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="FULL NAME" 
                    className="w-full p-5 pl-12 bg-slate-800 rounded-[22px] font-bold outline-none uppercase text-xs" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Email Gateway</label>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full p-5 bg-slate-800 rounded-[22px] font-bold outline-none uppercase text-xs" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <button 
              disabled={loading} 
              onClick={handleSendOtp}
              className="w-full py-6 bg-purple-600 text-white font-black italic rounded-[25px] hover:bg-purple-500 transition-all uppercase mt-6 flex items-center justify-center gap-3 tracking-widest text-xs"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'login' ? 'SEND CODE' : 'CONTINUE')}
            </button>
          </div>
        ) : (
          <div className="space-y-5 text-left">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-purple-600/20 rounded-full mb-6">
                <Zap className="text-purple-400" size={32} />
              </div>
              <div className="flex flex-col items-center justify-center w-full mb-4">
                <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400 leading-none text-center pl-[0.4em]">
                  VERIFY IDENTITY
                </h2>
              </div>
              <p className="text-gray-400 text-xs mt-2">Enter the 6-digit code sent to</p>
              <p className="text-purple-400 text-sm font-bold">{email}</p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 ml-4 uppercase tracking-[0.3em]">Verification Code</label>
                <input 
                  type="text" 
                  placeholder="000000" 
                  className="w-full p-5 bg-slate-800 rounded-[22px] font-bold outline-none text-center text-2xl tracking-[0.5em]" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  maxLength={6}
                  autoFocus
                />
              </div>
              
              <button 
                disabled={loading} 
                type="submit"
                className="w-full py-6 bg-purple-600 text-white font-black italic rounded-[25px] hover:bg-purple-500 transition-all uppercase mt-6 flex items-center justify-center gap-3 tracking-widest text-xs"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'VERIFY & CONTINUE'}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <button 
                onClick={resendOtp}
                disabled={countdown > 0}
                className={`text-xs uppercase tracking-widest ${countdown > 0 ? 'text-gray-500' : 'text-purple-400 hover:text-purple-300'}`}
              >
                {countdown > 0 ? `RESEND IN ${countdown}s` : 'RESEND CODE'}
              </button>
            </div>
          </div>
        )}

        <div className="my-10 flex items-center gap-4 text-gray-100">
          <hr className="flex-1 opacity-20" /> <span className="text-[9px] font-black uppercase tracking-[0.4em]">OR</span> <hr className="flex-1 opacity-20" />
        </div>

        <p className="text-[10px] font-black text-gray-400 uppercase cursor-pointer hover:text-purple-600 tracking-[0.2em]" onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')}>
          {authMode === 'login' ? "New to Kult? Join Us" : "Already a Member? Login"}
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
