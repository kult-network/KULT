import React from 'react';
import { Zap, LogOut, ShieldCheck, User as UserIcon, Crown, Star, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ROLE_ASSETS = {
  USER: {
    icon: <UserIcon size={18} />,
    label: 'OPERATIVE',
    avatarClasses: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-200 shadow-emerald-400/30',
    textClasses: 'text-emerald-300',
  },
  ORGANIZER: {
    icon: <Crown size={18} />,
    label: 'ARCHITECT',
    avatarClasses: 'border-violet-300/20 bg-violet-500/10 text-violet-200 shadow-violet-400/30',
    textClasses: 'text-violet-300',
  },
  SUPERVISOR: {
    icon: <Star size={18} />,
    label: 'SUPERVISOR',
    avatarClasses: 'border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-200 shadow-fuchsia-400/30',
    textClasses: 'text-fuchsia-300',
  }
};

const Header = ({ user, userData, role, onMenuClick, sidebarOpen, notifications = [] }) => {
  const navigate = useNavigate();
  const userRole = (role || 'USER').toUpperCase();
  const roleInfo = ROLE_ASSETS[userRole] || ROLE_ASSETS.USER;
  const isSupervisor = userRole === 'SUPERVISOR';
  const isOrganizer = userRole === 'ORGANIZER';

  // Calculate unread notifications
  const unreadCount = React.useMemo(() => {
    const saved = localStorage.getItem('read_notifications');
    const readIds = saved ? JSON.parse(saved) : [];
    return notifications.filter(n => !readIds.includes(n.id || n.Id)).length;
  }, [notifications]);
  
  // Get user data from props or localStorage
  const storedUser = userData || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('kult_user') || '{}') : {});
  const displayName = storedUser?.name || user?.name || user?.email?.split('@')[0] || "Operator";
  
  const renderAvatar = () => {
    if (user?.photoURL) {
      return (
        <div className={`w-10 h-10 rounded-xl overflow-hidden border ${roleInfo.avatarClasses} shadow-inner`}>
          <img 
            src={user.photoURL}
            alt={userData?.Name || 'User'} 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${roleInfo.avatarClasses}`}>
        {roleInfo.icon}
      </div>
    );
  };
  return (
    <nav className="w-full h-20 px-4 sm:px-6 md:px-12 flex justify-between items-center gap-3 bg-slate-950/90 backdrop-blur-2xl border border-white/10 z-[1000] shadow-2xl overflow-hidden">
      {/* Left side: Logo always */}
      <Link to="/" className="flex items-center gap-2 group shrink-0">
        <div className="p-2 bg-slate-900/90 text-white rounded-2xl group-hover:bg-purple-600 transition-all duration-300 shadow-2xl shadow-purple-500/10">
          <Zap size={20} fill="white" />
        </div>
        <h2 className={`font-clash-display text-[8px] xs:text-[10px] sm:text-sm md:text-xl lg:text-2xl tracking-tighter uppercase italic neon-text ${sidebarOpen ? 'hidden md:block' : ''}`}>
          KULT<br className="md:hidden" /><span className="hidden md:inline"> </span><span className="text-gradient non-italic">GATEWAY</span>
        </h2>
      </Link>

      {/* Right side: User info / Login / Menu Button */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Menu Button - visible when sidebar is closed */}
        {onMenuClick && (
          <button 
            onClick={() => onMenuClick(true)}
            className={`w-10 h-10 bg-white/5 rounded-xl items-center justify-center border border-white/10 hover:border-purple-400 hover:bg-purple-500/10 transition-all group shrink-0 relative ${sidebarOpen ? 'hidden' : 'flex'}`}
            title="Menu"
          >
            <Menu size={18} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-slate-950 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            )}
          </button>
        )}
        
        {!user ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="px-3 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 bg-purple-600 text-white font-black text-[10px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl hover:bg-violet-500 transition-all shadow-xl flex items-center gap-2 shrink-0"
          >
            <span className="hidden sm:inline">LOGIN</span>
            <UserIcon size={14} />
          </motion.button>
        ) : (
          <>
            
            {/* Control Gateway - Only on desktop */}
            {isSupervisor && (
              <Link to="/supervisor" className="hidden lg:block shrink-0">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl active:scale-95"
                  title="Control Gateway"
                >
                  <ShieldCheck size={18} strokeWidth={2.5} />
                </motion.button>
              </Link>
            )}

            {/* Organizer Hub - Only on desktop */}
            {isOrganizer && (
              <Link to="/organizer" className="hidden lg:block shrink-0">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl active:scale-95"
                  title="Organizer Hub"
                >
                  <Crown size={18} strokeWidth={2.5} />
                </motion.button>
              </Link>
            )}
            
            {/* User info & Logout - Only on desktop */}
            <div className={`hidden lg:flex items-center gap-3 pl-4 border-l border-white/10 shrink-0`}>
              <div className="text-right">
                <p className="text-sm font-semibold tracking-normal text-white leading-tight mb-0.5">
                   {displayName}
                </p>
                <p className={`text-[10px] font-medium uppercase tracking-[0.2em] flex items-center justify-end gap-2 opacity-90 ${roleInfo.textClasses}`}>
                   <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px] ${roleInfo.textClasses.replace('text-', 'bg-')} `}></span>
                   {roleInfo.label}
                </p>
              </div>
              <div className="shrink-0">
                {renderAvatar()}
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('kult_token');
                  localStorage.removeItem('kult_user');
                  window.location.reload();
                }}
                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:border-red-400 hover:bg-red-500/10 transition-all group"
                title="Logout"
              >
                <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
export default Header;