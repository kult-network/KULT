import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Kultist from './components/Chatbot';
import HubsList from './pages/HubsList';
import HubDetails from './pages/HubDetails';
import Auth from './pages/Auth';
import CreateEvent from './pages/CreateEvent';
import CreateHub from './pages/CreateHub'; 
import VerifyToken from './pages/VerifyToken';
import SupervisorPanel from './pages/SupervisorPanel'; 
import Onboarding from './pages/Onboarding';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerPanel from './pages/OrganizerPanel';

import { motion, AnimatePresence } from 'framer-motion';

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
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('kult_token');
      if (token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('kult_token');
      localStorage.removeItem('kult_user');
      setUser(null);
      setRole(null);
      window.location.reload(); 
    }
  };

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const NOCO_URL = "https://app.nocodb.com/api/v2/tables/mvxwc3h19a4a0jw/records";
        const NOCO_TOKEN = "nc_pat_mbLxWvXasyq6MXSzFGfGUZvM5VWFSxdvPY-f-Ymk";
        const res = await axios.get(NOCO_URL, {
          headers: { 'xc-token': NOCO_TOKEN }
        });
        if (res.data && res.data.list) {
          setNotifications(res.data.list);
        }
      } catch (err) {
        console.error("Global notification fetch error:", err);
      }
    };
    fetchAllNotifications();
    const interval = setInterval(fetchAllNotifications, 300000); // Increased to 5 minutes to prevent background activity
    return () => clearInterval(interval);
  }, []);

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
    
    // Persist palette to avoid "flicker" on background refresh
    let paletteIndex = localStorage.getItem('kult_palette_index');
    if (paletteIndex === null) {
      paletteIndex = Math.floor(Math.random() * colorPalettes.length);
      localStorage.setItem('kult_palette_index', paletteIndex);
    }
    const palette = colorPalettes[parseInt(paletteIndex)];
    
    const root = document.documentElement.style;
    root.setProperty('--text-primary', palette.primary);
    root.setProperty('--text-secondary', palette.secondary);
    root.setProperty('--accent-color', palette.accent);
    root.setProperty('--accent', palette.accent);
    root.setProperty('--accent-border', palette.accentBorder);
    root.setProperty('--accent-bg', palette.accentBg);
    root.setProperty('--shadow-color', palette.shadow);
    root.setProperty('--card-bg', 'rgba(255, 255, 255, 0.82)');
    root.setProperty('--border-color', palette.border);
    root.setProperty('--border', palette.border);
    root.setProperty('--text-h', palette.primary);
    root.setProperty('--bg-soft', 'rgba(248, 250, 252, 1)');
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('kult_token');
      const storedUser = localStorage.getItem('kult_user');
      
      if (token && storedUser) {
        try {
          // Immediately set user from local storage to prevent blank screen
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setRole(userData.role || 'USER');

          const res = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.valid) {
            setRole(res.data.user.role || userData.role || 'USER');
          } else {
            localStorage.removeItem('kult_token');
            localStorage.removeItem('kult_user');
            setUser(null);
            setRole(null);
          }
        } catch (err) {
          // Silent fail on background check to avoid interruption
          console.error("Auth verify error:", err);
        }
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (minLoadingTimePassed) {
      setLoading(false);
    }
  }, [minLoadingTimePassed]);

  useEffect(() => {
    // Reduced forced loader time from 2000ms to 500ms for snappier mobile experience
    const timer = setTimeout(() => setMinLoadingTimePassed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="h-screen flex items-center justify-center bg-[#050505] z-[9999] fixed inset-0"
        >
          <div className="loader-ring">
            <div className="loader-orbit loader-orbit--one">
              <div className="loader-orbit loader-orbit--two">
                <div className="loader-center">
                  <div className="loader-node loader-node--a"></div>
                  <div className="loader-node loader-node--b"></div>
                  <div className="loader-node loader-node--c"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="main-app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="min-h-screen bg-[var(--body-bg)] flex flex-col text-[var(--text-primary)]"
        >
          <Header 
            user={user} 
            role={role} 
            handleLogout={handleLogout} 
            navigate={navigate} 
            onMenuClick={(shouldOpen) => setSidebarOpen(shouldOpen === undefined ? !sidebarOpen : shouldOpen)}
            sidebarOpen={sidebarOpen}
            notifications={notifications}
          />
          <Kultist />
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            user={user}
            role={role}
            notifications={notifications}
          />
          <main className="flex-1 pt-4 md:pt-8">
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
              <Route path="/organizer" element={
                <RoleProtectedRoute user={user} role={role} allowedRoles={['ORGANIZER', 'SUPERVISOR']}>
                  <OrganizerPanel user={user} />
                </RoleProtectedRoute>
              } />
              <Route path="/organizer/event/:eventId" element={
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default App;
