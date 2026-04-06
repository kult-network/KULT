import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import { API_BASE_URL } from './config/api';
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
    const colorPalettes = [
      { primary: '#111827', secondary: '#374151', accent: '#7c3aed', accentBg: 'rgba(124, 58, 237, 0.08)', accentBorder: 'rgba(124, 58, 237, 0.24)', shadow: 'rgba(124, 58, 237, 0.16)', border: '#ddd6fe' },
      { primary: '#0f172a', secondary: '#475569', accent: '#06b6d4', accentBg: 'rgba(6, 182, 212, 0.1)', accentBorder: 'rgba(6, 182, 212, 0.24)', shadow: 'rgba(6, 182, 212, 0.18)', border: '#bae6fd' },
      { primary: '#1f2937', secondary: '#4b5563', accent: '#ec4899', accentBg: 'rgba(236, 72, 153, 0.1)', accentBorder: 'rgba(236, 72, 153, 0.24)', shadow: 'rgba(236, 72, 153, 0.18)', border: '#fed7e2' },
      { primary: '#111827', secondary: '#6b7280', accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.1)', accentBorder: 'rgba(34, 197, 94, 0.24)', shadow: 'rgba(34, 197, 94, 0.16)', border: '#bbf7d0' },
      { primary: '#0f172a', secondary: '#64748b', accent: '#f97316', accentBg: 'rgba(249, 115, 22, 0.1)', accentBorder: 'rgba(249, 115, 22, 0.24)', shadow: 'rgba(249, 115, 22, 0.18)', border: '#fed7aa' },
      { primary: '#111827', secondary: '#536471', accent: '#38bdf8', accentBg: 'rgba(56, 189, 248, 0.12)', accentBorder: 'rgba(56, 189, 248, 0.24)', shadow: 'rgba(56, 189, 248, 0.16)', border: '#bae6fd' },
      { primary: '#1f2937', secondary: '#475569', accent: '#f59e0b', accentBg: 'rgba(245, 158, 11, 0.1)', accentBorder: 'rgba(245, 158, 11, 0.24)', shadow: 'rgba(245, 158, 11, 0.18)', border: '#fde68a' },
      { primary: '#111827', secondary: '#57606f', accent: '#8b5cf6', accentBg: 'rgba(139, 92, 246, 0.08)', accentBorder: 'rgba(139, 92, 246, 0.24)', shadow: 'rgba(139, 92, 246, 0.16)', border: '#ddd6fe' },
      { primary: '#0f172a', secondary: '#475569', accent: '#f43f5e', accentBg: 'rgba(244, 63, 94, 0.1)', accentBorder: 'rgba(244, 63, 94, 0.24)', shadow: 'rgba(244, 63, 94, 0.18)', border: '#fecdd3' },
      { primary: '#111827', secondary: '#4b5563', accent: '#0ea5e9', accentBg: 'rgba(14, 165, 233, 0.1)', accentBorder: 'rgba(14, 165, 233, 0.24)', shadow: 'rgba(14, 165, 233, 0.18)', border: '#bfdbfe' },
      { primary: '#1f2937', secondary: '#64748b', accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.08)', accentBorder: 'rgba(34, 197, 94, 0.24)', shadow: 'rgba(34, 197, 94, 0.18)', border: '#dcfce7' },
      { primary: '#111827', secondary: '#475569', accent: '#f97316', accentBg: 'rgba(249, 115, 22, 0.08)', accentBorder: 'rgba(249, 115, 22, 0.24)', shadow: 'rgba(249, 115, 22, 0.18)', border: '#fed7aa' }
    ];
    const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    const root = document.documentElement.style;
    root.setProperty('--text-primary', palette.primary);
    root.setProperty('--text-secondary', palette.secondary);
    root.setProperty('--accent-color', palette.accent);
    root.setProperty('--accent', palette.accent);
    root.setProperty('--accent-border', palette.accentBorder);
    root.setProperty('--accent-bg', palette.accentBg);
    root.setProperty('--shadow-color', palette.shadow);
    root.setProperty('--border-color', palette.border);
    root.setProperty('--border', palette.border);
    root.setProperty('--text-h', palette.primary);
    root.setProperty('--bg-soft', 'rgba(248, 250, 252, 1)');

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u); 
        try {
          const res = await axios.get(`${API_BASE_URL}/api/user-role/${u.email}`);
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
    <div className="h-screen flex items-center justify-center font-black text-purple-600 animate-pulse uppercase tracking-[0.5em] text-2xl bg-[var(--body-bg)]">
      Syncing Neural Identity...
    </div>
  );
  return (
    <div className="min-h-screen bg-[var(--body-bg)] flex flex-col text-[var(--text-primary)]">
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
