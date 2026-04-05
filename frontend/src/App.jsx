import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import Header from './components/Header';
import HubsList from './pages/HubsList';
import HubDetails from './pages/HubDetails';
import Auth from './pages/Auth';
import CreateEvent from './pages/CreateEvent';
import CreateHub from './pages/CreateHub'; 
import VerifyToken from './pages/VerifyToken';
import SupervisorPanel from './pages/SupervisorPanel'; 
import Onboarding from './pages/Onboarding';
import OrganizerDashboard from './pages/OrganizerDashboard';
const RoleProtectedRoute = ({ children, user, role, allowedRoles }) => {
  if (!user) return <Navigate to="/auth" />;
  const userRole = role?.toUpperCase();
  if (allowedRoles) {
    const requiredRoles = allowedRoles.map(r => r.toUpperCase());
    if (!requiredRoles.includes(userRole)) return <Navigate to="/" />;
  }
  return children;
};
function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload(); 
    } catch (error) {
      console.error("❌ Logout Failed:", error.message);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u); 
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? `http://${window.location.hostname}:5001` : `https://YOUR_BACKEND_URL`)}/api/user-role/${u.email}`);
          if (res.data && res.data.Role) {
            setRole(res.data.Role.toUpperCase());
          } else {
            setRole('USER');
          }
        } catch (err) {
          console.error("Role Sync Error:", err);
          setRole('USER'); 
        }
      } else {
        setUser(null);
        setRole('GUEST'); 
      }
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);
  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-purple-600 animate-pulse uppercase tracking-[0.5em] text-2xl bg-[#fbfdff]">
      Syncing Neural Identity...
    </div>
  );
  return (
    <div className="min-h-screen bg-[#fbfdff] flex flex-col">
      <Header 
        user={user} 
        role={role} 
        handleLogout={handleLogout} 
        navigate={navigate} 
      />
      <main className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<HubsList user={user} role={role} handleLogout={handleLogout} />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/hub/:id" element={
            <RoleProtectedRoute user={user} role={role}>
              <HubDetails user={user} role={role} />
            </RoleProtectedRoute>
          } />
          <Route path="/verify-token" element={
            <RoleProtectedRoute user={user} role={role}>
              <VerifyToken />
            </RoleProtectedRoute>
          } />
          <Route path="/create-event" element={
            <RoleProtectedRoute user={user} role={role} allowedRoles={['ORGANIZER', 'SUPERVISOR']}>
              <CreateEvent />
            </RoleProtectedRoute>
          } />
          <Route path="/organizer-dashboard/:eventId" element={
            <RoleProtectedRoute user={user} role={role} allowedRoles={['ORGANIZER', 'SUPERVISOR']}>
              <OrganizerDashboard />
            </RoleProtectedRoute>
          } />
          <Route path="/supervisor" element={
            <RoleProtectedRoute user={user} role={role} allowedRoles={['SUPERVISOR']}>
              <SupervisorPanel />
            </RoleProtectedRoute>
          } />
          <Route path="/create-hub" element={
            <RoleProtectedRoute user={user} role={role} allowedRoles={['SUPERVISOR']}>
              <CreateHub />
            </RoleProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
