import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaClock, FaList, FaExclamationTriangle, FaExchangeAlt, FaHistory, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";

import InvDashboard from "./invDashboard";
import InvPending from "./invPending";
import InvAllSupplies from "./invAllSupplies";
import InvLowStock from "./invLowStock";
import InvRequests from "./invRequests";
import InvLedger from "./invLedger";
import InvSuppliers from "./invSuppliers";

const navItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/inventory" },
    { label: "Pending Supplies", icon: <FaClock />, path: "/inventory/pending" },
    { label: "All Supplies", icon: <FaList />, path: "/inventory/supplies" },
    { label: "Low Stock Alert", icon: <FaExclamationTriangle />, path: "/inventory/low-stock" },
    { label: "Stock Requests", icon: <FaExchangeAlt />, path: "/inventory/requests" },
    { label: "Stock Ledger", icon: <FaHistory />, path: "/inventory/ledger" },
    { label: "Pending Suppliers", icon: <FaUserPlus />, path: "/inventory/suppliers" },
];

export default function InventoryManagerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    function handleLogout() {
        localStorage.clear();
        toast.success("Logged out!");
        navigate("/login");
    }

    return (
        <div className="w-full h-screen flex bg-secondary overflow-hidden">

            {/* ── Sidebar ── */}
            <aside className="w-[260px] h-screen flex flex-col bg-secondary flex-shrink-0">
                <div className="px-6 py-6 border-b border-white/10">
                    <h1 className="text-2xl font-extrabold text-white">🖥️ TechShop</h1>
                    <p className="text-white/40 text-xs mt-1">Inventory Portal</p>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center font-bold text-green-400 text-lg mb-2">
                        {user.firstName?.[0]?.toUpperCase() || "I"}
                    </div>
                    <p className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all
                                    ${isActive
                                        ? "bg-accent text-white shadow-lg shadow-accent/30"
                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-400 font-semibold text-sm transition-all"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 h-screen bg-primary rounded-l-[3rem] overflow-hidden flex flex-col shadow-2xl">
                {/* Top Header Bar */}
                <header className="px-10 py-6 border-b border-secondary/5 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                    <div>
                        <h2 className="text-xl font-black text-secondary">Inventory Management</h2>
                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em]">Live Supply & Stock Control</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs font-black text-secondary uppercase tracking-widest">{user.firstName} {user.lastName}</p>
                            <p className="text-[9px] font-bold text-accent uppercase tracking-tighter">Inventory Manager</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Routes>
                        <Route path="/" element={<InvDashboard />} />
                        <Route path="/pending" element={<InvPending />} />
                    <Route path="/supplies" element={<InvAllSupplies />} />
                    <Route path="/low-stock" element={<InvLowStock />} />
                    <Route path="/requests" element={<InvRequests />} />
                    <Route path="/ledger" element={<InvLedger />} />
                    <Route path="/suppliers" element={<InvSuppliers />} />
                </Routes>
                </div>
            </main>
        </div>
    );
}
