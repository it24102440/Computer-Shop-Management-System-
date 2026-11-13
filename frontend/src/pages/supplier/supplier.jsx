import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaPlus, FaList, FaTruckLoading, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";

import SupplierDashboardHome from "./supplierDashboard";
import SupplierAddSupply from "./supplierAddSupply";
import SupplierMySupplies from "./supplierMySupplies";
import SupplierRequests from "./supplierRequests";
import SupplierWarrantyClaims from "./supplierWarrantyClaims";

const navItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/supplier" },
    { label: "Add Supply", icon: <FaPlus />, path: "/supplier/add" },
    { label: "My Supplies", icon: <FaList />, path: "/supplier/supplies" },
    { label: "Stock Requests", icon: <FaTruckLoading />, path: "/supplier/requests" },
    { label: "Warranty Claims", icon: <span>🛡️</span>, path: "/supplier/warranty" },
];

export default function SupplierPage() {
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
                    <p className="text-white/40 text-xs mt-1">Supplier Portal</p>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center font-bold text-accent text-lg mb-2">
                        {user.firstName?.[0]?.toUpperCase() || "S"}
                    </div>
                    <p className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                </div>

                {/* Nav Links */}
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

            {/* ── Main Content ── */}
            <main className="flex-1 h-screen bg-primary rounded-l-[24px] overflow-hidden">
                <Routes>
                    <Route path="/" element={<SupplierDashboardHome />} />
                    <Route path="/add" element={<SupplierAddSupply />} />
                    <Route path="/supplies" element={<SupplierMySupplies />} />
                    <Route path="/requests" element={<SupplierRequests />} />
                    <Route path="/warranty" element={<SupplierWarrantyClaims />} />
                </Routes>
            </main>
        </div>
    );
}
