import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
const Notifications = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user-bookings/${user.email}`);
        setBookings(res.data);
      } catch (err) {
        console.error("Notification Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchMyBookings();
  }, [user]);
  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };
  return (
    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-black text-white">
        <h3 className="font-black uppercase tracking-tighter flex items-center gap-2">
          <Bell size={18} className="text-purple-400" /> Activity Feed
        </h3>
        <span className="text-[10px] font-bold bg-purple-600 px-2 py-1 rounded-full">
          {bookings.length} UPDATES
        </span>
      </div>
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center py-10 text-xs font-bold animate-pulse text-gray-400">SYNCING FEED...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center py-10 text-xs font-bold text-gray-400">NO RECENT ACTIVITY</p>
        ) : (
          bookings.map((b) => (
            <div key={b.Id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-xs uppercase tracking-tight text-black group-hover:text-purple-600">
                  {b.Event_Name || "Mission Registration"}
                </h4>
                <span className={`text-[8px] font-black px-2 py-1 rounded-lg border ${getStatusStyle(b.Status)}`}>
                  {b.Status || 'PENDING'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">
                {b.Status === 'Approved' 
                  ? "Access granted. Check your email for the entry pass." 
                  : "Your request is under review by the hub supervisor."}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default Notifications;