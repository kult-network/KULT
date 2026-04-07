import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
const Onboarding = () => {
  const { state } = useLocation();
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const handleFinish = async () => {
    if(!name) return alert("Please enter your name!");
    try {
      await axios.post(`${API_BASE_URL}/api/user-role`, {
        email: state.email,
        name: name,
        role: 'USER'
      });
      navigate('/');
    } catch (err) { console.error(err); }
  };
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[var(--body-bg)] p-6 font-sharp text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-purple-700 via-slate-950 to-slate-950" />
      <div className="relative z-10 max-w-xl w-full bg-slate-950/95 border border-white/10 p-10 rounded-[50px] shadow-2xl">
        <h1 className="text-5xl font-black font-sporty mb-4 uppercase text-center leading-none">
          WHO ARE <span className="text-purple-400">YOU?</span>
        </h1>
      <p className="text-gray-400 font-bold mb-10 tracking-[0.3em] text-[10px] uppercase">Verify your identity in the network</p>
      <input 
        type="text" 
        placeholder="ENTER FULL NAME" 
        className="w-full max-w-sm p-6 bg-slate-900 rounded-[30px] font-black uppercase text-center outline-none focus:ring-4 focus:ring-purple-500/20 transition-all mb-6 border border-white/10 text-white"
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleFinish} className="w-full max-w-sm py-6 bg-purple-600 text-white font-black uppercase rounded-[30px] shadow-2xl hover:bg-violet-500 transition-all tracking-widest active:scale-95">
        COMPLETE REGISTRATION
      </button>
    </div>
  </div>
  );
};
export default Onboarding;