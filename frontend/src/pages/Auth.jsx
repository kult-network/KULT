import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2, User, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

import { API_BASE_URL } from '../config/api';

const Auth = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
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
    if (!email) return showToast('ENTER EMAIL ADDRESS', 'error');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showToast('INVALID EMAIL FORMAT', 'error');
    }

    if (authMode === 'signup' && !name.trim()) {
      return showToast('ENTER YOUR NAME', 'error');
    }

    setLoading(true);

    try {
      const action = authMode === 'signup' ? 'signup' : 'login';

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/send-otp`,
        {
          email,
          action,
          name: name.trim() || undefined,
        }
      );

      if (res.data.success) {
        setOtpSent(true);
        setCountdown(60);
        showToast('CHECK YOUR EMAIL 📨', 'success');
      }
    } catch (err) {
      console.error("SEND OTP ERROR:", err);
      showToast(
        err?.response?.data?.error?.toUpperCase() ||
        err.message ||
        'FAILED TO SEND CODE',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return showToast('ENTER 6-DIGIT CODE', 'error');
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          email,
          otp,
          name: name.trim() || undefined,
        }
      );

      if (res.data.success) {
        if (authMode === 'signup') {
          showToast('ACCOUNT CREATED! PLEASE LOGIN', 'success');
          setTimeout(() => {
            switchMode('login');
          }, 2000);
        } else {
          const userData = {
            id: res.data.user.id,
            email: res.data.user.email,
            name: res.data.user.name || name || email.split('@')[0],
            role: res.data.user.role,
          };

          localStorage.setItem('kult_token', res.data.token);
          localStorage.setItem('kult_user', JSON.stringify(userData));

          showToast('LOGIN SUCCESS 🚀', 'success');

          setTimeout(() => {
            window.location.href = '/';
          }, 1200);
        }
      }
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      const errorData = err.response?.data || {};

      if (errorData.needsSignup) {
        showToast('ACCOUNT NOT FOUND - SIGN UP', 'error');
        setTimeout(() => switchMode('signup'), 1500);
      } else {
        showToast(
          errorData.error?.toUpperCase() ||
          'VERIFICATION FAILED',
          'error'
        );
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
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-[#050505] p-4 sm:p-6 md:p-8">
      {/* Background Orbs - Hidden or scaled on small screens for better performance and less clutter */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-purple-600/10 sm:bg-purple-600/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-pink-600/10 sm:bg-pink-600/20 blur-[80px] sm:blur-[120px] rounded-full pointer-events-none" />

      <Toast
        isVisible={toast.show}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 flex flex-col items-center"
      >
        <div className="w-full backdrop-blur-xl bg-white/5 border border-white/10 p-6 xs:p-8 md:p-10 rounded-[2rem] xs:rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative w-full">
            <header className="text-center mb-8 md:mb-10">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-12 h-12 xs:w-16 xs:h-16 rounded-xl xs:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 xs:mb-6 shadow-lg shadow-purple-500/20"
              >
                <Zap className="text-white w-6 h-6 xs:w-8 xs:h-8 fill-white" />
              </motion.div>
              <h1 className="text-3xl xs:text-4xl font-bold tracking-tight text-white mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-white/40 font-medium text-sm xs:text-base px-2">
                {otpSent 
                  ? `Verify your email to ${authMode === 'login' ? 'access' : 'create'} your ID`
                  : authMode === 'login' 
                    ? 'Enter your credentials to access your KULT ID' 
                    : 'Join the KULT community today'}
              </p>
            </header>

            <AnimatePresence mode="wait">
              {!otpSent ? (
                <motion.div
                  key="form-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 w-full"
                >
                  {authMode === 'signup' && (
                    <div className="relative group w-full">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 xs:py-4 bg-white/5 border border-white/10 rounded-xl xs:rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all text-sm xs:text-base"
                      />
                    </div>
                  )}

                  <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 xs:py-4 bg-white/5 border border-white/10 rounded-xl xs:rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all text-sm xs:text-base"
                    />
                  </div>

                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 p-3 xs:p-4 rounded-xl xs:rounded-2xl font-bold text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 mt-2"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span className="text-sm xs:text-base">{authMode === 'login' ? 'Sign In' : 'Get Started'}</span>
                          <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>

                  <div className="pt-4 xs:pt-6 text-center">
                    <button
                      onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-white/40 hover:text-white text-xs xs:text-sm font-medium transition-colors inline-flex items-center gap-2"
                    >
                      {authMode === 'login' ? (
                        <>New here? <span className="text-purple-400">Create an account</span></>
                      ) : (
                        <>Already have an account? <span className="text-purple-400">Sign in</span></>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 w-full"
                >
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex gap-3 justify-center w-full">
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full max-w-[180px] xs:max-w-[200px] py-3 xs:py-4 bg-white/5 border border-white/10 rounded-xl xs:rounded-2xl text-white text-center text-2xl xs:text-3xl font-bold tracking-[0.3em] xs:tracking-[0.5em] placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
                      />
                    </div>
                    <p className="text-white/40 text-xs xs:text-sm text-center px-4">
                      Enter the 6-digit code sent to <span className="text-white/80 break-all">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-3 w-full">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full bg-white text-black p-3 xs:p-4 rounded-xl xs:rounded-2xl font-bold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span className="text-sm xs:text-base">Verify Identity</span>
                          <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between px-1 xs:px-2">
                      <button
                        onClick={() => setOtpSent(false)}
                        className="text-white/40 hover:text-white text-[10px] xs:text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4" />
                        Change Email
                      </button>

                      <button
                        onClick={resendOtp}
                        disabled={countdown > 0}
                        className="text-white/40 hover:text-white disabled:hover:text-white/40 text-[10px] xs:text-sm font-medium transition-colors"
                      >
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend Code"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-6 md:mt-8 text-white/20 text-[10px] xs:text-xs font-medium uppercase tracking-widest px-4">
          Secure Access • KULT Network © 2026
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
