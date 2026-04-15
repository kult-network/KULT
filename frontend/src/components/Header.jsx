import React from 'react';
import { Zap, LogOut, ShieldCheck, User as UserIcon, Crown, Star, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ROLE_ASSETS = {
  USER: {
    icon: <UserIcon size={16} />,
    label: 'Operative',
    avatarClasses: 'border-[#222] bg-[#111] text-[#A1A1AA]',
    textClasses: 'text-[#A1A1AA]',
  },
  ORGANIZER: {
    icon: <Crown size={16} />,
    label: 'Architect',
    avatarClasses: 'border-[#7928CA]/30 bg-[#7928CA]/10 text-[#7928CA]',
    textClasses: 'text-[#7928CA]',
  },
  SUPERVISOR: {
    icon: <Star size={16} />,
    label: 'Supervisor',
    avatarClasses: 'border-[#0070F3]/30 bg-[#0070F3]/10 text-[#0070F3]',
    textClasses: 'text-[#0070F3]',
  }
};

const Header = ({ user, userData, role, onMenuClick, sidebarOpen, notifications = [], readNotifications = [] }) => {
  const navigate = useNavigate();
  const userRole = (role || 'USER').toUpperCase();
  const roleInfo = ROLE_ASSETS[userRole] || ROLE_ASSETS.USER;
  const isSupervisor = userRole === 'SUPERVISOR';
  const isOrganizer = userRole === 'ORGANIZER';

  const unreadCount = React.useMemo(() => {
    const validReadNotifs = Array.isArray(readNotifications) ? readNotifications : [];
    const validNotifs = Array.isArray(notifications) ? notifications : [];
    return validNotifs.filter(n => n && !validReadNotifs.includes(n.id || n.Id)).length;
  }, [notifications, readNotifications]);
  
  const storedUser = userData || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('kult_user') || '{}') : {});
  const displayName = storedUser?.name || user?.name || user?.email?.split('@')[0] || "Operator";
  
  const renderAvatar = () => {
    if (user?.photoURL) {
      return (
        <div className={`w-9 h-9 rounded-full overflow-hidden border ${roleInfo.avatarClasses}`}>
          <img src={user.photoURL} alt={userData?.Name || 'User'} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${roleInfo.avatarClasses}`}>
        {roleInfo.icon}
      </div>
    );
  };
  
  return (
    <nav className="w-full h-20 px-6 lg:px-8 flex justify-between items-center bg-gradient-to-r from-[#0F172A] to-[#0B0F19] border-b border-[#1E293B] relative z-[1000] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* BRAND & LOGO */}
      <Link to="/" className="flex items-center gap-3 shrink-0 group outline-none">
        <div className="w-8 h-8 bg-white text-black rounded-lg group-hover:bg-[#EAEAEA] transition-colors flex items-center justify-center">
          <Zap size={16} fill="black" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          KULT Network
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6 ml-10 flex-1">
        <Link to="/blog" className="text-sm font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 group">
          <Zap size={14} className="text-purple-500 group-hover:animate-pulse" /> Intelligence Feed
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={() => onMenuClick(true)}
            className={`w-9 h-9 bg-transparent rounded-lg flex items-center justify-center border border-transparent hover:border-[#333] hover:bg-[#111] transition-all group shrink-0 relative ${sidebarOpen ? 'hidden' : 'flex'} outline-none`}
            title="Menu"
          >
            <Menu size={18} className="text-[#A1A1AA] group-hover:text-white transition-colors" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border border-[#111] rounded-full animate-pulse" />}
          </button>
        )}
        
        {!user ? (
          <button 
            onClick={() => navigate('/auth')}
            className="px-5 py-2 bg-white text-black font-medium text-sm rounded-lg hover:bg-[#EAEAEA] transition-transform active:scale-95 shadow-[0_2px_4px_rgba(0,0,0,0.1)] outline-none"
          >
            Sign In
          </button>
        ) : (
          <>
            {isSupervisor && (
              <Link to="/supervisor" className="hidden lg:block shrink-0 outline-none">
                <button className="w-9 h-9 bg-transparent hover:bg-[#111] text-[#A1A1AA] hover:text-white border border-transparent hover:border-[#333] rounded-lg flex items-center justify-center transition-all active:scale-95">
                  <ShieldCheck size={18} />
                </button>
              </Link>
            )}

            {isOrganizer && (
              <Link to="/organizer" className="hidden lg:block shrink-0 outline-none">
                <button className="w-9 h-9 bg-transparent hover:bg-[#111] text-[#A1A1AA] hover:text-white border border-transparent hover:border-[#333] rounded-lg flex items-center justify-center transition-all active:scale-95">
                  <Crown size={18} />
                </button>
              </Link>
            )}
            
            <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-[#333] shrink-0 ml-1">
              <div className="text-right flex flex-col justify-center">
                <p className="text-sm font-medium text-white leading-tight">
                   {displayName}
                </p>
                <p className={`text-xs font-medium flex items-center justify-end gap-1.5 mt-0.5 ${roleInfo.textClasses}`}>
                   {roleInfo.label}
                </p>
              </div>
              <div className="shrink-0 cursor-pointer">{renderAvatar()}</div>
              
              <div className="w-px h-5 bg-[#333] mx-1"></div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('kult_token');
                  localStorage.removeItem('kult_user');
                  window.location.reload();
                }}
                className="w-9 h-9 bg-transparent hover:bg-[#111] text-[#A1A1AA] hover:text-[#EF4444] border border-transparent hover:border-[#333] rounded-lg flex items-center justify-center transition-all group outline-none"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;