import React, { useState, useEffect } from 'react';
import { X, Bell, Send, ChevronRight, User as UserIcon, Shield, LogOut, ShieldCheck, ExternalLink, Crown, HelpCircle, Globe, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const NOCO_URL = "https://app.nocodb.com/api/v2/tables/mvxwc3h19a4a0jw/records";
const NOCO_TOKEN = "nc_pat_mbLxWvXasyq6MXSzFGfGUZvM5VWFSxdvPY-f-Ymk"; 

const Sidebar = ({ isOpen, onClose, user, role, notifications = [], readNotifications = [], setReadNotifications }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postData, setPostData] = useState({ category: 'DL_Events', title: '', message: '' });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedNotifs, setExpandedNotifs] = useState({});
  const [viewAllCategories, setViewAllCategories] = useState({});

  const isPrivileged = role === 'ORGANIZER' || role === 'SUPERVISOR';

  useEffect(() => {
    if (isOpen && notifications.length === 0) fetchNotifications();
  }, [isOpen, notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(NOCO_URL, { headers: { 'xc-token': NOCO_TOKEN } });
      if (res.data && res.data.list) setLocalNotifications(res.data.list);
    } catch (err) { console.error("Fetch failed:", err); }
  };

  const getNotificationsByCategory = (categoryId) => {
    const validNotifs = Array.isArray(notifications) ? notifications : [];
    const validLocal = Array.isArray(localNotifications) ? localNotifications : [];
    const allNotifs = validNotifs.length > 0 ? validNotifs : validLocal;
    return allNotifs.filter(n => n && n.Category === categoryId);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleNotif = (notif) => {
    const id = notif.id || notif.Id;
    setExpandedNotifs(prev => ({ ...prev, [id]: !prev[id] }));
    
    // Mark as read natively
    if (setReadNotifications && !readNotifications.includes(id)) {
      const updatedRead = [...readNotifications, id];
      setReadNotifications(updatedRead);
      localStorage.setItem('read_notifications', JSON.stringify(updatedRead));
    }
  };

  const handlePostNotification = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.message) return;
    setLoading(true);
    try {
      await axios.post(NOCO_URL, { Title: postData.title, Message: postData.message, Category: postData.category }, { headers: { 'xc-token': NOCO_TOKEN, 'Content-Type': 'application/json' } });
      setPostData({ category: 'DL_Events', title: '', message: '' });
      setShowPostForm(false);
      fetchNotifications();
    } catch (err) { console.error("Post Error:", err); } 
    finally { setLoading(false); }
  };

  const categories = [
    { id: 'DL_Events', label: 'DL/Events', icon: '📚' },
    { id: 'Placements', label: 'Placements', icon: '💼' },
    { id: 'Startups', label: 'Startups/Stores', icon: '🚀' },
    { id: 'Misc', label: 'Miscellaneous', icon: '📌' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sidebar-backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[1001]"
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="sidebar-panel"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
          className="fixed right-0 top-0 h-screen w-full sm:w-[380px] bg-[#0a0a0a] border-l border-[#222] z-[1002] flex flex-col shadow-2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-center px-6 py-4 border-b border-[#222] relative">
              <h2 className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Menu Interface</h2>
              <button onClick={onClose} className="absolute right-5 p-1.5 bg-transparent hover:bg-[#111] border border-transparent hover:border-[#333] rounded-lg transition-colors text-[#A1A1AA] hover:text-white outline-none">
                <X size={16} />
              </button>
            </div>

            {/* Profile Brief */}
            {user && (
              <div className="p-6 border-b border-[#222] flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-[#333] bg-[#111] overflow-hidden flex items-center justify-center shadow-lg">
                  {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-[#A1A1AA]" />}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm tracking-tight">{user.name || user.email?.split('@')[0]}</h3>
                  <div className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0070F3]/10 border border-[#0070F3]/20">
                     <p className="text-[10px] text-[#0070F3] font-bold uppercase tracking-widest">{role?.toUpperCase() || 'OPERATIVE'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tabs */}
            <div className="flex px-6 pt-4 border-b border-[#222] gap-6">
              <button onClick={() => setActiveTab('profile')} className={`pb-3 text-sm font-medium transition-colors border-b-2 inline-flex items-center gap-2 outline-none ${activeTab === 'profile' ? 'border-white text-white' : 'border-transparent text-[#A1A1AA] hover:text-[#EDEDED]'}`}>
                <UserIcon size={16} /> Directory
              </button>
              <button onClick={() => setActiveTab('notifications')} className={`pb-3 text-sm font-medium transition-colors border-b-2 inline-flex items-center gap-2 outline-none ${activeTab === 'notifications' ? 'border-white text-white' : 'border-transparent text-[#A1A1AA] hover:text-[#EDEDED]'}`}>
                <Bell size={16} /> Broadcasts
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              {activeTab === 'profile' ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#666] tracking-wider uppercase mb-3 px-2">Navigation</div>
                  <Link to="/" onClick={onClose} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#111] text-[#A1A1AA] hover:text-white border border-transparent hover:border-[#222] transition-colors group outline-none">
                    <span className="flex items-center gap-3 text-sm font-medium"><Globe size={18} /> Available Sectors</span>
                  </Link>

                  {(role === 'ORGANIZER' || role === 'SUPERVISOR') && (
                    <>
                      <Link to="/organizer" onClick={onClose} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-violet-900/10 text-[#A1A1AA] hover:text-violet-400 border border-transparent hover:border-violet-900/30 transition-colors group outline-none mt-2">
                        <span className="flex items-center gap-3 text-sm font-medium"><Crown size={18} /> Architect Hub</span>
                      </Link>
                      <Link to="/create-event" onClick={onClose} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#111] text-[#A1A1AA] hover:text-white border border-transparent hover:border-[#222] transition-colors group outline-none mt-2">
                        <span className="flex items-center gap-3 text-sm font-medium"><Zap size={18} /> Deploy Mission</span>
                      </Link>
                    </>
                  )}

                  {role === 'SUPERVISOR' && (
                    <Link to="/supervisor" onClick={onClose} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0070F3]/5 text-[#0070F3] border border-[#0070F3]/20 hover:border-[#0070F3]/40 transition-colors group outline-none mt-2">
                      <span className="flex items-center gap-3 text-sm font-medium"><ShieldCheck size={18} /> Master Oversight</span>
                      <ExternalLink size={14} className="opacity-50" />
                    </Link>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#222] space-y-2">
                    <div className="text-xs font-semibold text-[#666] tracking-wider uppercase mb-3 px-2">Resources</div>
                    {user && (
                      <button onClick={() => { localStorage.removeItem('kult_token'); localStorage.removeItem('kult_user'); window.location.reload(); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-900/10 text-red-500/80 hover:text-red-500 border border-transparent hover:border-red-900/30 transition-colors mt-2 text-sm font-medium outline-none">
                        <span className="flex items-center gap-3"><LogOut size={18} /> Disconnect</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isPrivileged && (
                    <button onClick={() => setShowPostForm(!showPostForm)} className="w-full p-3 mb-4 rounded-xl bg-white text-black font-semibold text-sm hover:bg-[#EAEAEA] border border-transparent transition-all flex items-center justify-center gap-2 active:scale-95 outline-none">
                      <Send size={16} /> Broadcast Message
                    </button>
                  )}

                  <AnimatePresence>
                    {showPostForm && (
                      <motion.div key="post-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                        <form onSubmit={handlePostNotification} className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-4">
                          <select className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-white focus:border-[#0070F3] outline-none transition-colors" value={postData.category} onChange={(e) => setPostData({...postData, category: e.target.value})}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                          <input type="text" placeholder="Title" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-white focus:border-[#0070F3] outline-none transition-colors" value={postData.title} onChange={(e) => setPostData({...postData, title: e.target.value})} required />
                          <textarea placeholder="Message" className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#333] text-sm text-white focus:border-[#0070F3] outline-none transition-colors resize-none h-24" value={postData.message} onChange={(e) => setPostData({...postData, message: e.target.value})} required />
                          <button type="submit" disabled={loading} className="w-full py-3 bg-[#0070F3] hover:bg-[#0051B3] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 outline-none">
                            {loading ? "Sending..." : "Deploy"}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    {categories.map((category) => {
                      const catNotifs = getNotificationsByCategory(category.id);
                      if (catNotifs.length === 0 && !isPrivileged) return null;
                      
                      const unread = catNotifs.filter(n => !readNotifications.includes(n.id || n.Id)).length;
                      const isDropdownOpen = expandedCategories[category.id];
                      const seeAll = viewAllCategories[category.id];
                      
                      const visibleNotifs = seeAll ? catNotifs : catNotifs.slice(0, 3);
                      
                      return (
                        <div key={category.id} className="border border-[#222] rounded-xl overflow-hidden bg-[#0a0a0a] transition-all">
                          <button onClick={() => toggleCategory(category.id)} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#111] transition-colors outline-none">
                            <span className="flex items-center gap-3 text-sm font-medium text-[#EDEDED]">
                              <span>{category.icon}</span> {category.label}
                            </span>
                            <div className="flex items-center gap-3">
                              {unread > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unread}</span>}
                              <ChevronRight size={16} className={`text-[#666] transition-transform duration-300 ${isDropdownOpen ? 'rotate-90' : ''}`} />
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div key={`cat-${category.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#222]">
                                <div className="bg-[#0a0a0a] flex flex-col">
                                  {visibleNotifs.length > 0 ? visibleNotifs.map((notif, i) => {
                                    const id = notif.id || notif.Id;
                                    const isRead = readNotifications.includes(id);
                                    const isExpanded = expandedNotifs[id];
                                    
                                    return (
                                      <button key={id || i} onClick={() => toggleNotif(notif)} className={`w-full text-left p-4 border-b border-[#222] last:border-b-0 transition-all outline-none ${!isRead ? 'bg-[#1a1a1a] border-l-2 border-l-red-500' : 'hover:bg-[#111]'}`}>
                                        <div className="flex justify-between items-center">
                                          <h4 className={`text-sm tracking-tight pr-4 ${!isRead ? 'font-bold text-white' : 'font-medium text-[#A1A1AA]'}`}>{notif.Title}</h4>
                                          {!isRead && <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>}
                                        </div>
                                        <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div key={`msg-${id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                              <p className="text-xs text-[#888] leading-relaxed mt-3 relative z-10 whitespace-pre-wrap">{notif.Message}</p>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </button>
                                    );
                                  }) : (
                                    <div className="p-4 text-xs font-medium text-[#666] text-center">No broadcasts inside module.</div>
                                  )}
                                  
                                  {catNotifs.length > 3 && (
                                    <div className="p-2 bg-[#111] border-t border-[#222]">
                                      <button onClick={(e) => { e.stopPropagation(); setViewAllCategories(prev => ({ ...prev, [category.id]: !seeAll })) }} className="w-full py-2 text-xs font-semibold text-[#0070F3] hover:text-[#3291FF] outline-none transition-colors">
                                        {seeAll ? 'Collapse List' : `View All (${catNotifs.length})`}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Bottom gradient fade for aesthetics */}
            <div className="h-6 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none absolute bottom-0 left-0 right-0 w-full" />
          </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Sidebar;