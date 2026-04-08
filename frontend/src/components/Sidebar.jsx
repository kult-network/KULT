import React, { useState, useEffect } from 'react';
import { X, User, Bell, Send, ChevronRight, Mail, Shield, LogOut, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// DIRECT NOCODB CONFIG
// Using the Table ID and Subdomain found in your logs for maximum reliability
const NOCO_URL = "https://app.nocodb.com/api/v2/tables/mvxwc3h19a4a0jw/records";
const NOCO_TOKEN = "nc_pat_mbLxWvXasyq6MXSzFGfGUZvM5VWFSxdvPY-f-Ymk"; 

const Sidebar = ({ isOpen, onClose, user, role, notifications = [] }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postData, setPostData] = useState({ category: 'DL_Events', title: '', message: '' });
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewAllCategory, setViewAllCategory] = useState(null);
  
  const toggleCategory = (categoryId) => {
    const isExpanding = !expandedCategories[categoryId];
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: isExpanding
    }));

    if (isExpanding) {
      // Mark all in this category as read
      const categoryNotifs = getNotificationsByCategory(categoryId);
      const newReadIds = categoryNotifs.map(n => n.id || n.Id).filter(id => !readNotifications.includes(id));
      if (newReadIds.length > 0) {
        const updatedRead = [...readNotifications, ...newReadIds];
        setReadNotifications(updatedRead);
        localStorage.setItem('read_notifications', JSON.stringify(updatedRead));
      }
    }
  };
  
  const getNotificationsByCategory = (categoryId) => {
    const allNotifs = notifications.length > 0 ? notifications : localNotifications;
    return allNotifs.filter(n => n.Category === categoryId);
  };

  const isPrivileged = role === 'ORGANIZER' || role === 'SUPERVISOR';

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen, notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(NOCO_URL, {
        headers: { 'xc-token': NOCO_TOKEN }
      });
      
      if (res.data && res.data.list) {
        setLocalNotifications(res.data.list);
      } else {
        setLocalNotifications([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      showToast('Offline: Notification feed unavailable', 'error');
    }
  };

  const handlePostNotification = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.message) {
      showToast('Title and Message are required', 'error');
      return;
    }
    setLoading(true);

    try {
      await axios.post(NOCO_URL, {
        Title: postData.title,
        Message: postData.message,
        Category: postData.category,
        // Author fields are excluded here since they don't exist in your NocoDB yet
      }, {
        headers: { 
          'xc-token': NOCO_TOKEN,
          'Content-Type': 'application/json'
        }
      });

      showToast('Broadcast sent successfully!', 'success');
      setPostData({ category: 'DL_Events', title: '', message: '' });
      setShowPostForm(false);
      fetchNotifications();
    } catch (err) {
      console.error("Post Error:", err.response?.data);
      const errorMsg = err.response?.data?.message || 'Check table columns';
      showToast(`Post failed: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'DL_Events', label: 'DL/Events', icon: '📚' },
    { id: 'Placements', label: 'Placements', icon: '💼' },
    { id: 'Startups', label: 'Startups/Stores', icon: '🚀' },
    { id: 'Misc', label: 'Miscellaneous', icon: '📌' },
  ];

  const getCategoryLabel = (id) => categories.find(c => c.id === id)?.label || id;
  const getCategoryIcon = (id) => categories.find(c => c.id === id)?.icon || '📢';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[400px] bg-[#0B0B0F] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 mt-20">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Toast Overlay */}
            <AnimatePresence>
              {toast.show && (
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className={`mx-4 mt-3 p-3 rounded-lg text-xs font-bold text-center border ${
                  toast.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {toast.msg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {['profile', 'notifications'].map((tab) => {
                const totalUnread = notifications.length > 0 
                  ? notifications.filter(n => !readNotifications.includes(n.id || n.Id)).length 
                  : localNotifications.filter(n => !readNotifications.includes(n.id || n.Id)).length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[2px] transition-all relative ${
                      activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/5' : 'text-gray-500'
                    }`}
                  >
                    {tab}
                    {tab === 'notifications' && totalUnread > 0 && (
                      <span className="absolute top-3 right-4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <span className="text-2xl font-black text-white">
                        {(user?.name || user?.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{user?.name || 'User'}</h3>
                      <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{role || 'MEMBER'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Mail size={12} className="text-purple-500 mb-2" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Email</p>
                      <p className="text-sm text-white truncate">{user?.email || 'N/A'}</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <ShieldCheck size={12} className="text-purple-500 mb-2" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Verification</p>
                      <p className="text-sm text-white">{role === 'SUPERVISOR' ? 'Primary Admin' : 'Authorized Personnel'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => { localStorage.clear(); window.location.reload(); }}
                    className="w-full mt-10 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Terminate Session
                  </button>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="p-4">
                  {isPrivileged && !showPostForm && (
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="w-full py-4 mb-6 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-500 shadow-xl shadow-purple-600/20 transition-all"
                    >
                      <Send size={14} /> New Broadcast
                    </button>
                  )}

                  {showPostForm && (
                    <motion.form
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-6 space-y-4"
                    >
                      <select
                        value={postData.category}
                        onChange={e => setPostData({...postData, category: e.target.value})}
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Subject Line"
                        value={postData.title}
                        onChange={e => setPostData({...postData, title: e.target.value})}
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-700 outline-none focus:border-purple-500"
                      />

                      <textarea
                        placeholder="Message content..."
                        value={postData.message}
                        onChange={e => setPostData({...postData, message: e.target.value})}
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white h-32 resize-none outline-none focus:border-purple-500"
                      />

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setShowPostForm(false)} className="flex-1 py-2 text-[10px] font-bold text-gray-500 uppercase">Cancel</button>
                        <button type="submit" onClick={handlePostNotification} disabled={loading} className="flex-1 py-2 bg-white text-black text-[10px] font-black uppercase rounded-xl">
                          {loading ? 'Sending...' : 'Publish'}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Categorized Notifications */}
                  <div className="space-y-4">
                    {categories.map((category) => {
                      const categoryNotifications = getNotificationsByCategory(category.id);
                      const unreadInCategory = categoryNotifications.filter(n => !readNotifications.includes(n.id || n.Id)).length;
                      const isExpanded = expandedCategories[category.id];
                      const displayNotifications = isExpanded && viewAllCategory !== category.id 
                        ? [...categoryNotifications].reverse().slice(0, 3) 
                        : [...categoryNotifications].reverse();
                      
                      return (
                        <div key={category.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{category.icon}</span>
                              <div className="relative">
                                <span className="text-sm font-bold text-white">{category.label}</span>
                                {unreadInCategory > 0 && (
                                  <span className="absolute -top-1 -right-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                )}
                              </div>
                              <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold">
                                {categoryNotifications.length}
                              </span>
                            </div>
                            <ChevronRight 
                              size={16} 
                              className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                            />
                          </button>
                          
                          {isExpanded && (
                            <div className="border-t border-white/5">
                              {categoryNotifications.length > 0 ? (
                                <>
                                  {displayNotifications.map((notif, i) => (
                                    <button
                                      key={notif.id || i}
                                      onClick={() => setSelectedNotification(notif)}
                                      className="w-full text-left p-4 pl-6 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group relative"
                                    >
                                      {!readNotifications.includes(notif.id || notif.Id) && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-purple-500 rounded-full" />
                                      )}
                                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                                        {notif.Title}
                                      </h4>
                                      <p className="text-[10px] text-gray-500 mt-1 truncate">
                                        {new Date(notif.CreatedAt || Date.now()).toLocaleDateString()}
                                      </p>
                                    </button>
                                  ))}
                                  
                                  {categoryNotifications.length > 3 && viewAllCategory !== category.id && (
                                    <button 
                                      onClick={() => setViewAllCategory(category.id)}
                                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-white hover:bg-purple-600/10 transition-all text-center"
                                    >
                                      View All ({categoryNotifications.length})
                                    </button>
                                  )}
                                  
                                  {viewAllCategory === category.id && (
                                    <button 
                                      onClick={() => setViewAllCategory(null)}
                                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all text-center"
                                    >
                                      Show Less
                                    </button>
                                  )}
                                </>
                              ) : (
                                <p className="p-4 pl-6 text-xs text-gray-600">No notifications</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {notifications.length === 0 && localNotifications.length === 0 && (
                      <div className="text-center py-24 text-gray-700">
                        <Bell size={40} className="mx-auto mb-4 opacity-10" />
                        <p className="text-xs font-bold uppercase tracking-widest">Clear for now</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Modal Overlay */}
          <AnimatePresence>
            {selectedNotification && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[200] flex items-center justify-center p-6"
                onClick={() => setSelectedNotification(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#0B0B0F] border border-white/10 w-full max-w-lg p-8 rounded-[2rem] relative shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <button onClick={() => setSelectedNotification(null)} className="absolute top-6 right-6 p-2 text-gray-600 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{getCategoryIcon(selectedNotification.Category)}</span>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-400/10 px-3 py-1 rounded-full">
                      {getCategoryLabel(selectedNotification.Category)}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-6 leading-tight tracking-tight">{selectedNotification.Title}</h3>
                  
                  <div className="bg-white/5 border border-white/5 p-6 rounded-2xl mb-8">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[35vh] overflow-y-auto custom-scrollbar">
                      {selectedNotification.Message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-black text-gray-500 uppercase tracking-[2px]">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                       {selectedNotification.AuthorName || "SYSTEM BROADCAST"}
                    </div>
                    <span>{new Date(selectedNotification.CreatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;