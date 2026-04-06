import React from 'react';
import { Zap, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react'; 
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
const Header = ({ user, userData, role }) => {
  const navigate = useNavigate();
  const userRole = role?.toUpperCase();
  const isSupervisor = userRole === 'SUPERVISOR';
  return (
    <nav className="fixed top-0 left-0 w-full h-20 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-[1000] shadow-sm">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 bg-black text-white rounded-xl group-hover:bg-purple-600 transition-all duration-300 shadow-lg shadow-black/10">
          <Zap size={20} fill="white" />
        </div>
        <h2 className="font-sporty font-black text-2xl tracking-tighter uppercase italic">
          KULT <span className="text-purple-600 non-italic">NETWORK</span>
        </h2>
      </Link>
      <div className="flex items-center gap-4 md:gap-6">
        {!user ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-black text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-purple-600 transition-all shadow-xl flex items-center gap-2"
          >
            LOGIN ACCESS <UserIcon size={14} />
          </motion.button>
        ) : (
          <div className="flex items-center gap-4 md:gap-6">
            {isSupervisor && (
              <Link to="/supervisor" className="hidden sm:block">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:translate-y-0.5"
                >
                  <ShieldCheck size={14} strokeWidth={3} /> CONTROL PANEL
                </motion.button>
              </Link>
            )}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
              <div className="text-right hidden md:block">
                <p className="text-[11px] font-black uppercase tracking-widest text-black leading-none mb-1">
                   {userData?.Name || user?.displayName?.split(' ')[0] || "OPERATOR"}
                </p>
                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-tighter flex items-center justify-end gap-1.5 opacity-80">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                   {userRole || 'USER'} SYNCED
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-50 shadow-inner">
                <img 
                  src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all group"
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