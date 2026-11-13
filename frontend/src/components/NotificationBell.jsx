import { useState, useEffect } from "react";
import { FaBell, FaCheckDouble, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { toast } from "react-hot-toast";

export default function NotificationBell({ lightMode = false }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds for new alerts
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get("/notifications");
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error("Notifications fetch error", err);
        }
    };

    const markAllRead = async () => {
        try {
            await axiosClient.put("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to mark all as read");
        }
    };

    const deleteOne = async (e, id) => {
        e.stopPropagation(); // Just in case
        try {
            await axiosClient.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => notifications.find(n => n._id === id && !n.isRead) ? prev - 1 : prev);
            toast.success("Notification removed");
        } catch (err) {
            toast.error("Failed to delete notification");
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative
                    ${lightMode 
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" 
                        : "bg-white border border-secondary/10 text-secondary hover:bg-secondary/5"}`}
            >
                <FaBell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-primary animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-secondary/5 z-[500] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-secondary/5 flex justify-between items-center bg-secondary/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Notifications</h3>
                        <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline flex items-center gap-1">
                            <FaCheckDouble size={10} /> Mark all read
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center text-secondary/30 text-[10px] font-black uppercase tracking-widest">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n._id} 
                                    className={`p-5 border-b border-secondary/5 group relative transition-colors ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                                >
                                    <div className="flex items-start gap-3 pr-6">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-secondary leading-tight">{n.title}</p>
                                            <p className="text-[10px] text-secondary/60 leading-relaxed">{n.message}</p>
                                            <p className="text-[8px] font-bold text-secondary/30 uppercase tracking-tighter">
                                                {new Date(n.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => deleteOne(e, n._id)}
                                        className="absolute top-5 right-5 w-6 h-6 bg-secondary/5 text-secondary/20 hover:bg-red-50 hover:text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        title="Remove Notification"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
