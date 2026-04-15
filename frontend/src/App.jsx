import React, { useEffect, useState, Suspense, lazy } from 'react';
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
import SEO from './components/seo/SEO';

const BlogList = lazy(() => import('./pages/blog/BlogList'));
const BlogDetail = lazy(() => import('./pages/blog/BlogDetail'));
const StudentNetworking = lazy(() => import('./pages/seo/StudentNetworking'));
const AICommunity = lazy(() => import('./pages/seo/AICommunity'));
const CollegeApp = lazy(() => import('./pages/seo/CollegeApp'));
const AdminBlog = lazy(() => import('./pages/blog/AdminBlog'));

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
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('read_notifications');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
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
    if (!user) return;
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
  }, [user]);

  // Global Swipe-to-Open/Close Sidebar Interceptor for Mobile Devices
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = e => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = e => {
      const touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      
      // Swipe Left Trigger (Open) - from rightmost 40px of screen
      if (swipeDistance < -50 && touchStartX > window.innerWidth - 40) {
        setSidebarOpen(true);
      }
      
      // Swipe Right Trigger (Close)
      if (swipeDistance > 50) {
        setSidebarOpen(prev => prev ? false : prev);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('kult_token');
        const userDataString = localStorage.getItem('kult_user');
        
        if (token && userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          setRole(userData.role || 'USER');
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem('kult_token');
        localStorage.removeItem('kult_user');
        setUser(null);
        setRole(null);
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
            readNotifications={readNotifications}
          />
          
          {user && (
            <>
              <Kultist />
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
                user={user}
                role={role}
                notifications={notifications}
                readNotifications={readNotifications}
                setReadNotifications={setReadNotifications}
              />
            </>
          )}

          <main className="flex-1">
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

              {/* BLOG & SEO ROUTES */}
              <Route path="/blog" element={
                <Suspense fallback={<div className="h-screen bg-black" />}><BlogList /></Suspense>
              } />
              <Route path="/blog/:slug" element={
                <Suspense fallback={<div className="h-screen bg-black" />}><BlogDetail /></Suspense>
              } />
              <Route path="/admin/blog" element={
                <RoleProtectedRoute user={user} role={role} allowedRoles={['SUPERVISOR']}>
                  <Suspense fallback={<div className="h-screen bg-black" />}><AdminBlog /></Suspense>
                </RoleProtectedRoute>
              } />
              <Route path="/student-networking-platform-india" element={
                <Suspense fallback={<div className="h-screen bg-black" />}><StudentNetworking /></Suspense>
              } />
              <Route path="/ai-student-community" element={
                <Suspense fallback={<div className="h-screen bg-black" />}><AICommunity /></Suspense>
              } />
              <Route path="/college-networking-app" element={
                <Suspense fallback={<div className="h-screen bg-black" />}><CollegeApp /></Suspense>
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
