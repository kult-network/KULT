import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
const Onboarding = () => {
  const { state } = useLocation();
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const handleFinish = async () => {
    if(!name) return alert("Please enter your name!");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://kult-production.up.railway.app`)}/api/user-role`, {
        email: state.email,
        name: name,
        role: 'USER'
      });
      navigate('/');
    } catch (err) { console.error(err); }
  };
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 font-sharp">
      <h1 className="text-5xl font-black font-sporty mb-4 uppercase text-center leading-none">
        WHO ARE <span className="text-purple-600">YOU?</span>
      </h1>
      <p className="text-gray-400 font-bold mb-10 tracking-[0.3em] text-[10px] uppercase">Verify your identity in the network</p>
      <input 
        type="text" 
        placeholder="ENTER FULL NAME" 
        className="w-full max-w-sm p-6 bg-gray-50 rounded-[30px] font-black uppercase text-center outline-none focus:ring-4 focus:ring-purple-100 transition-all mb-6 border-2 border-transparent focus:border-purple-200"
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleFinish} className="w-full max-w-sm py-6 bg-black text-white font-black uppercase rounded-[30px] shadow-2xl hover:bg-purple-600 transition-all tracking-widest active:scale-95">
        COMPLETE REGISTRATION
      </button>
    </div>
  );
};
export default Onboarding;