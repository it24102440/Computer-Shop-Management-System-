import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const roleLabels = {
    admin: { label: "Admin", color: "bg-red-100 text-red-700", icon: "🛡️" },
    supplier: { label: "Supplier", color: "bg-yellow-100 text-yellow-700", icon: "📦" },
    inventoryManager: { label: "Inventory Manager", color: "bg-purple-100 text-purple-700", icon: "🗂️" },
    customer: { label: "Customer", color: "bg-green-100 text-green-700", icon: "🛒" },
};

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
    const [addresses, setAddresses] = useState([]);
    const [loadingAddr, setLoadingAddr] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) {
            navigate("/login");
            return;
        }
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setForm({
            firstName: parsed.firstName || "",
            lastName: parsed.lastName || "",
            phone: parsed.phone || "",
        });
        fetchAddresses();
    }, []);

    async function fetchAddresses() {
        try {
            setLoadingAddr(true);
            const res = await axiosClient.get("/users/addresses");
            setAddresses(res.data);
        } catch (err) {
            console.error("Failed to load addresses");
        } finally {
            setLoadingAddr(false);
        }
    }

    async function handleDeleteAddress(id) {
        if (!window.confirm("Remove this address?")) return;
        try {
            await axiosClient.delete(`/users/addresses/${id}`);
            toast.success("Address removed!");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to remove address");
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSave() {
        if (!form.firstName || !form.lastName) {
            toast.error("First Name and Last Name are required!");
            return;
        }
        try {
            setLoading(true);
            const res = await axiosClient.put("/users/profile", form);
            // update localStorage
            const updated = { ...user, ...form };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser(updated);
            setEditMode(false);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data?.message || "Update failed!";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    const { logout } = useAuth();
    function handleLogout() {
        logout();
    }

    if (!user) return null;

    const role = roleLabels[user.role] || roleLabels.customer;

    return (
        <div className="min-h-screen bg-primary flex flex-col">
            {/* ── Navbar ── */}
            <nav className="bg-secondary px-8 py-4 flex items-center justify-between shadow-lg">
                <button onClick={() => navigate("/")} className="text-accent font-extrabold text-xl flex items-center gap-2">
                    🖥️ TechShop
                </button>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                >
                    Logout
                </button>
            </nav>

            {/* ── Content ── */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-lg">
                    {/* Profile Card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Header Banner */}
                        <div className="h-32 bg-gradient-to-r from-secondary to-accent relative">
                            <div className="absolute -bottom-12 left-8">
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-5xl">
                                    {user.firstName?.[0]?.toUpperCase() || "👤"}
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="pt-16 px-8 pb-8">
                            {/* Name + Role */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-extrabold text-secondary">
                                        {user.firstName} {user.lastName}
                                    </h1>
                                    <p className="text-secondary/50 text-sm">{user.email}</p>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${role.color}`}>
                                    {role.icon} {role.label}
                                </span>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4">
                                {/* First Name */}
                                <div>
                                    <label className="text-xs font-semibold text-secondary/50 uppercase tracking-wider">First Name</label>
                                    {editMode ? (
                                        <input
                                            name="firstName"
                                            value={form.firstName}
                                            onChange={handleChange}
                                            className="mt-1 w-full h-11 border-2 border-secondary/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
                                        />
                                    ) : (
                                        <p className="mt-1 text-secondary font-medium">{user.firstName}</p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="text-xs font-semibold text-secondary/50 uppercase tracking-wider">Last Name</label>
                                    {editMode ? (
                                        <input
                                            name="lastName"
                                            value={form.lastName}
                                            onChange={handleChange}
                                            className="mt-1 w-full h-11 border-2 border-secondary/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
                                        />
                                    ) : (
                                        <p className="mt-1 text-secondary font-medium">{user.lastName}</p>
                                    )}
                                </div>

                                {/* Email (read-only) */}
                                <div>
                                    <label className="text-xs font-semibold text-secondary/50 uppercase tracking-wider">Email Address</label>
                                    <p className="mt-1 text-secondary/60 font-medium">{user.email}</p>
                                    <p className="text-xs text-secondary/30">Email cannot be changed</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-xs font-semibold text-secondary/50 uppercase tracking-wider">Phone Number</label>
                                    {editMode ? (
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className="mt-1 w-full h-11 border-2 border-secondary/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent text-secondary"
                                        />
                                    ) : (
                                        <p className="mt-1 text-secondary font-medium">{user.phone || "—"}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex gap-3">
                                {editMode ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex-1 h-11 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-60"
                                        >
                                            {loading ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode(false);
                                                setForm({
                                                    firstName: user.firstName || "",
                                                    lastName: user.lastName || "",
                                                    phone: user.phone || "",
                                                });
                                            }}
                                            className="flex-1 h-11 border-2 border-secondary/20 text-secondary rounded-xl font-bold hover:bg-secondary/5 transition"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="flex-1 h-11 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/80 transition"
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Quick links */}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => navigate("/my-orders")}
                                    className="h-11 border-2 border-secondary/20 text-secondary rounded-xl font-bold hover:bg-secondary/5 transition text-sm flex items-center justify-center gap-2"
                                >
                                    📦 My Orders
                                </button>
                                <button
                                    onClick={() => navigate("/payment-history")}
                                    className="h-11 border-2 border-accent/30 text-accent rounded-xl font-bold hover:bg-accent/5 transition text-sm flex items-center justify-center gap-2"
                                >
                                    💳 Payment History
                                </button>
                            </div>

                            {/* Back to Home */}
                                <button
                                    onClick={() => navigate("/")}
                                    className="mt-3 w-full h-11 border-2 border-accent/20 text-accent/60 rounded-xl font-bold hover:bg-black/5 transition"
                                >
                                    ← Back to Home
                                </button>
                            </div>

                            {/* Saved Addresses Section */}
                            <div className="mt-8 border-t border-secondary/10 pt-8 px-8 pb-10 bg-primary/20">
                                <h2 className="text-sm font-black text-secondary/40 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    🏠 Saved Shipping Addresses
                                </h2>

                                {loadingAddr ? (
                                    <div className="py-10 text-center animate-pulse text-xs font-bold text-secondary/30 uppercase">Loading addresses...</div>
                                ) : addresses.length === 0 ? (
                                    <div className="py-10 text-center border-2 border-dashed border-secondary/10 rounded-2xl">
                                        <p className="text-xs font-bold text-secondary/30 uppercase">No addresses saved yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map(addr => (
                                            <div key={addr._id} className="bg-white p-4 rounded-2xl shadow-sm border border-secondary/5 flex items-center justify-between group hover:border-accent/30 transition-all">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-accent/10 text-accent rounded-md">{addr.label}</span>
                                                        {addr.isDefault && <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-100 text-green-700 rounded-md">Default</span>}
                                                    </div>
                                                    <p className="text-sm font-black text-secondary truncate">{addr.firstName} {addr.lastName}</p>
                                                    <p className="text-xs text-secondary/40 truncate">{addr.address}, {addr.city}</p>
                                                    <p className="text-[10px] text-secondary/30 font-bold mt-1">📞 {addr.phone}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
}
