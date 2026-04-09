import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Zap, Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';

// ✅ FIX: Use Vite env directly (NO external config file needed)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

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

  // ✅ DEBUG (remove later)
  console.log("API BASE URL:", API_BASE_URL);

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

  // ✅ SEND OTP
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

  // ✅ VERIFY OTP
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
        const userData = {
          id: res.data.user.id,
          email: res.data.user.email,
          name:
            res.data.user.name ||
            name ||
            email.split('@')[0],
          role: res.data.user.role,
        };

        localStorage.setItem('kult_token', res.data.token);
        localStorage.setItem('kult_user', JSON.stringify(userData));

        showToast('LOGIN SUCCESS 🚀', 'success');

        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white">
      <Toast
        isVisible={toast.show}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md p-8 bg-slate-900 rounded-3xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          KULT ID
        </h1>

        {!otpSent ? (
          <>
            {authMode === 'signup' && (
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 bg-slate-800 rounded"
              />
            )}

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-3 bg-slate-800 rounded"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-purple-600 p-3 rounded"
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-3 bg-slate-800 rounded text-center"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-purple-600 p-3 rounded"
            >
              Verify
            </button>

            <button
              onClick={resendOtp}
              disabled={countdown > 0}
              className="mt-3 text-sm"
            >
              {countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;