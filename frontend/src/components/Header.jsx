import React from 'react';
import { Zap, LogOut, ShieldCheck, User as UserIcon, Crown, Star } from 'lucide-react'; 
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
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

const Header = ({ user, userData, role }) => {
  const navigate = useNavigate();
  const userRole = (role || 'USER').toUpperCase();
  const roleInfo = ROLE_ASSETS[userRole] || ROLE_ASSETS.USER;
  const isSupervisor = userRole === 'SUPERVISOR';
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
    <nav className="fixed top-0 left-0 w-full h-20 px-4 sm:px-6 md:px-12 flex flex-wrap justify-between items-center gap-3 bg-slate-950/90 backdrop-blur-2xl border border-white/10 z-[1000] shadow-2xl">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 bg-slate-900/90 text-white rounded-2xl group-hover:bg-purple-600 transition-all duration-300 shadow-2xl shadow-purple-500/10">
          <Zap size={20} fill="white" />
        </div>
        <h2 className="font-sporty font-black text-xl md:text-2xl tracking-tighter uppercase italic neon-text">
          KULT <span className="text-gradient non-italic">GATEWAY</span>
        </h2>
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        {!user ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-purple-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-violet-500 transition-all shadow-xl flex items-center gap-2"
          >
            LOGIN ACCESS <UserIcon size={14} />
          </motion.button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 md:gap-6">
            {isSupervisor && (
              <Link to="/supervisor" className="hidden sm:block">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl active:translate-y-0.5"
                >
                  <ShieldCheck size={14} strokeWidth={3} /> CONTROL GATEWAY
                </motion.button>
              </Link>
            )}
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-semibold tracking-normal text-white leading-tight mb-0.5">
                   {userData?.Name || user?.displayName?.split(' ')[0] || "Operator"}
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
                onClick={() => signOut(auth)}
                className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:border-red-400 hover:bg-red-500/10 transition-all group"
                title="Terminate Session"
              >
                <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Header;