import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://kult-production.up.railway.app`)}/api/user-role`, {
        email: user.email,
        name: fullName, 
        role: 'USER'
      });
      navigate('/'); 
    } catch (err) { alert(err.message); }
  };
  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4 p-10">
      <input type="text" placeholder="FULL NAME" className="p-4 bg-gray-100 rounded-xl font-bold uppercase" onChange={(e) => setFullName(e.target.value)} required />
      <input type="email" placeholder="EMAIL" className="p-4 bg-gray-100 rounded-xl" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="PASSWORD" className="p-4 bg-gray-100 rounded-xl" onChange={(e) => setPassword(e.target.value)} required />
      <button className="bg-black text-white p-4 rounded-xl font-black uppercase">CREATE ACCOUNT</button>
    </form>
  );
};
export default Signup;