import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { confirmToast } from "../../utils/confirmToast";

const ROLE_COLORS = {
    admin: "bg-red-100 text-red-700",
    supplier: "bg-yellow-100 text-yellow-700",
    inventoryManager: "bg-purple-100 text-purple-700",
    customer: "bg-green-100 text-green-700",
};
const ROLE_ICONS = {
    admin: "🛡️",
    supplier: "📦",
    inventoryManager: "🗂️",
    customer: "🛒",
};

const EMPTY_FORM = {
    firstName: "", lastName: "", email: "",
    password: "", role: "supplier",
    companyName: "", contactNumber: "",
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [creating, setCreating] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await axiosClient.get("/users");
            setUsers(res.data);
        } catch {
            toast.error("Failed to load users!");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id, name) {
        const confirmed = await confirmToast(`Delete user "${name}"?`);
        if (!confirmed) return;
        try {
            await axiosClient.delete(`/users/${id}`);
            toast.success("User deleted!");
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch {
            toast.error("Delete failed!");
        }
    }

    async function handleApprove(id, name) {
        const confirmed = await confirmToast(`Approve user "${name}"?`, { confirmText: "Approve", icon: "✅", type: "success" });
        if (!confirmed) return;
        try {
            await axiosClient.patch(`/users/${id}/approve`);
            toast.success("User approved!");
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: true } : u));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Approval failed!");
        }
    }

    async function handleRoleChange(id, newRole, name) {
        const confirmed = await confirmToast(`Change "${name}" role to ${newRole}?`, { confirmText: "Update Role", icon: "🔄", type: "success" });
        if (!confirmed) return;
        try {
            await axiosClient.patch(`/users/${id}/role`, { role: newRole });
            toast.success(`Role updated to ${newRole}!`);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Role change failed!");
        }
    }

    async function handleToggleBlock(id, name, currentlyBlocked) {
        const action = currentlyBlocked ? "Unblock" : "Block";
        const confirmed = await confirmToast(`${action} user "${name}"?`, { 
            confirmText: action, 
            icon: currentlyBlocked ? "🔓" : "🚫", 
            type: currentlyBlocked ? "success" : "danger" 
        });
        if (!confirmed) return;
        try {
            const res = await axiosClient.patch(`/users/${id}/block`);
            toast.success(res.data.message);
            setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u));
            if (selectedUser) setSelectedUser(prev => ({ ...prev, isBlocked: res.data.isBlocked }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Action failed!");
        }
    }

    async function fetchInsights(user) {
        setSelectedUser(user);
        setLoadingInsights(true);
        setInsights(null);
        try {
            const res = await axiosClient.get(`/users/${user._id}/insights`);
            setInsights(res.data);
        } catch (err) {
            toast.error("Failed to fetch insights!");
        } finally {
            setLoadingInsights(false);
        }
    }

    async function handleCreateStaff(e) {
        e.preventDefault();
        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            toast.error("Please fill all required fields!");
            return;
        }
        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters!");
            return;
        }
        try {
            setCreating(true);
            await axiosClient.post("/users/create-staff", form);
            toast.success(`${form.role === "supplier" ? "Supplier" : "Inventory Manager"} account created! 🎉`);
            setShowModal(false);
            setForm(EMPTY_FORM);
            fetchUsers();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create account!");
        } finally {
            setCreating(false);
        }
    }

    const filtered = users
        .filter(u => filterRole === "all" || u.role === filterRole)
        .filter(u =>
            u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
        );

    const counts = {
        admin: users.filter(u => u.role === "admin").length,
        supplier: users.filter(u => u.role === "supplier").length,
        inventoryManager: users.filter(u => u.role === "inventoryManager").length,
        customer: users.filter(u => u.role === "customer").length,
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">

            <div className="sticky top-0 bg-primary z-10 px-8 pt-8 pb-4 border-b border-secondary/10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-secondary">Users & Staff</h1>
                        <p className="text-secondary/50 text-sm">{users.length} total users</p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md text-sm">
                        ➕ Create Staff Account
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                    {[
                        { key: "all", label: "All", count: users.length, color: "bg-gray-100 text-gray-600" },
                        { key: "admin", label: "🛡️ Admin", count: counts.admin, color: "bg-red-100 text-red-700" },
                        { key: "supplier", label: "📦 Supplier", count: counts.supplier, color: "bg-yellow-100 text-yellow-700" },
                        { key: "inventoryManager", label: "🗂️ Inventory", count: counts.inventoryManager, color: "bg-purple-100 text-purple-700" },
                        { key: "customer", label: "🛒 Customer", count: counts.customer, color: "bg-green-100 text-green-700" },
                    ].map(chip => (
                        <button key={chip.key} onClick={() => setFilterRole(chip.key)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border-2 ${filterRole === chip.key ? "border-accent " + chip.color : "border-transparent " + chip.color + " opacity-60"}`}>
                            {chip.label} ({chip.count})
                        </button>
                    ))}
                </div>

                <input type="text" placeholder="Search by name or email..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border-2 border-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                />
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-secondary/40">
                        <p className="text-5xl mb-3">👤</p>
                        <p className="font-medium">No users found</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-secondary/50 uppercase text-xs tracking-wider border-b border-secondary/10">
                                <th className="pb-3 pr-4">User</th>
                                <th className="pb-3 pr-4">Email</th>
                                <th className="pb-3 pr-4">Phone</th>
                                <th className="pb-3 pr-4">Role</th>
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5">
                            {filtered.map(user => (
                                <tr key={user._id} className="hover:bg-secondary/5 transition-colors">
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent flex-shrink-0 overflow-hidden border-2 border-accent/10">
                                                {user.image && user.image !== "/images/default.png" ? (
                                                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                                                ) : user.firstName?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-secondary truncate">{user.firstName} {user.lastName}</p>
                                                {user.companyName && (
                                                    <p className="text-[10px] text-secondary/40 font-bold uppercase">{user.companyName}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 text-secondary/60 text-xs font-medium">{user.email}</td>
                                    <td className="py-3 pr-4 text-secondary/60 text-xs font-mono">{user.contactNumber || "—"}</td>
                                    <td className="py-3 pr-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role] || ROLE_COLORS.customer}`}>
                                                    {ROLE_ICONS[user.role]} {user.role}
                                                </span>
                                                {user.isApproved === false && (
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse border border-red-300">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                                {user.isBlocked && (
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white border border-red-700">
                                                        🚫 Blocked
                                                    </span>
                                                )}
                                            </div>
                                            {user.isApproved !== false && user.role !== 'admin' && (
                                                <select 
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value, `${user.firstName} ${user.lastName}`)}
                                                    className="text-[10px] font-bold text-accent bg-accent/5 border-none rounded-md px-1 py-0.5 w-max focus:ring-1 focus:ring-accent outline-none"
                                                >
                                                    <option value="customer">Customer</option>
                                                    <option value="supplier">Supplier</option>
                                                    <option value="inventoryManager">Inv. Manager</option>
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchInsights(user)}
                                                className="px-3 py-1 bg-accent/5 text-accent rounded-lg hover:bg-accent hover:text-white text-[11px] font-black uppercase transition border border-accent/20"
                                            >
                                                Insights 📊
                                            </button>
                                            {user.isApproved === false && (
                                                <button
                                                    onClick={() => handleApprove(user._id, `${user.firstName} ${user.lastName}`)}
                                                    className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-[11px] font-black uppercase transition border border-green-200"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleToggleBlock(user._id, `${user.firstName} ${user.lastName}`, user.isBlocked)}
                                                    className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase transition border ${
                                                        user.isBlocked 
                                                        ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                                                        : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                                                    }`}
                                                >
                                                    {user.isBlocked ? "Unblock" : "Block"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                                                className="px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-[11px] font-black uppercase transition border border-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-800">➕ Create Staff Account</h2>
                                <p className="text-gray-400 text-xs mt-0.5">Create Supplier or Inventory Manager account</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                                className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Role *</label>
                                <div className="flex gap-3">
                                    {[
                                        { value: "supplier", label: "📦 Supplier", color: "border-yellow-400 bg-yellow-50 text-yellow-700" },
                                        { value: "inventoryManager", label: "🗂️ Inventory Manager", color: "border-purple-400 bg-purple-50 text-purple-700" },
                                    ].map(r => (
                                        <button type="button" key={r.value}
                                            onClick={() => setForm(f => ({ ...f, role: r.value }))}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${form.role === r.value ? r.color : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">First Name *</label>
                                    <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                        placeholder="John" required
                                        className="w-full h-10 border-2 border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Last Name *</label>
                                    <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                        placeholder="Doe" required
                                        className="w-full h-10 border-2 border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="staff@techshop.lk" required
                                    className="w-full h-10 border-2 border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Password * (min 6 chars)</label>
                                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••" required
                                    className="w-full h-10 border-2 border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                            </div>
                            {form.role === "supplier" && (
                                <div className="grid grid-cols-2 gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <div>
                                        <label className="text-xs font-bold text-yellow-700 mb-1 block">Company Name</label>
                                        <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                                            placeholder="ABC Ltd."
                                            className="w-full h-10 border-2 border-yellow-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-yellow-700 mb-1 block">Contact Number</label>
                                        <input value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))}
                                            placeholder="0711234567"
                                            className="w-full h-10 border-2 border-yellow-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                                    className="flex-1 h-11 border-2 border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating}
                                    className="flex-1 h-11 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-60">
                                    {creating ? "Creating..." : `Create ${form.role === "supplier" ? "Supplier" : "Inv. Manager"}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                    <div className="relative w-full max-w-md bg-primary shadow-2xl h-full flex flex-col animate-slide-in-right overflow-hidden">
                        <div className="p-6 border-b border-secondary/10 flex items-center justify-between bg-white">
                            <h2 className="text-xl font-black text-secondary">Customer Insights</h2>
                            <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full hover:bg-secondary/10 flex items-center justify-center font-bold">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-primary/40">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-secondary/5 flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-black text-accent overflow-hidden border-2 border-accent/10">
                                    {selectedUser.image && selectedUser.image !== "/images/default.png" ? (
                                        <img src={selectedUser.image} alt="" className="w-full h-full object-cover" />
                                    ) : selectedUser.firstName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-secondary text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                    <p className="text-xs text-secondary/40 font-bold uppercase tracking-wider">{selectedUser.role} · Member since {new Date(selectedUser.createdAt).getFullYear()}</p>
                                </div>
                            </div>
                            {loadingInsights ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-secondary/40 animate-pulse">Calculating behavior...</p>
                                </div>
                            ) : insights && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-accent text-white p-4 rounded-2xl shadow-lg shadow-accent/20">
                                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Total Spends</p>
                                            <p className="text-xl font-black">Rs.{insights.stats.totalSpent.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-secondary/5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-secondary/30 mb-1">Total Orders</p>
                                            <p className="text-xl font-black text-secondary">{insights.stats.totalOrders}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-secondary/5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-secondary/30 mb-1">Successful</p>
                                            <p className="text-xl font-black text-green-600">{insights.stats.successfulOrders}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-secondary/5 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-secondary/30 mb-1">Top Category</p>
                                            <p className="text-lg font-black text-accent truncate">{insights.stats.topCategory}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase text-secondary/40 tracking-wider mb-3 px-1">Recent Activity</p>
                                        <div className="space-y-2">
                                            {insights.recentOrders.length === 0 ? (
                                                <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-secondary/10">
                                                    <p className="text-xs font-bold text-secondary/30 tracking-wider uppercase">No order activity yet</p>
                                                </div>
                                            ) : insights.recentOrders.map(o => (
                                                <div key={o._id} className="bg-white p-3 rounded-xl border border-secondary/5 flex items-center justify-between hover:border-accent/40 transition-colors shadow-sm">
                                                    <div>
                                                        <p className="text-xs font-black text-secondary font-mono">{o.orderId}</p>
                                                        <p className="text-[10px] font-bold text-secondary/40">{new Date(o.orderedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-accent">Rs.{o.totalAmount.toLocaleString()}</p>
                                                        <p className={`text-[9px] font-black uppercase ${o.status === 'Cancelled' ? 'text-red-500' : 'text-green-500'}`}>{o.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-secondary/5 p-5 rounded-2xl space-y-4 border border-secondary/10">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">📧</span>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black uppercase text-secondary/40 leading-none mb-1">Official Email</p>
                                                <p className="text-xs font-bold text-secondary truncate">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">📞</span>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-secondary/40 leading-none mb-1">Contact Number</p>
                                                <p className="text-xs font-bold text-secondary font-mono">{selectedUser.contactNumber || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-6 bg-white border-t border-secondary/10 flex gap-3">
                           <button 
                                onClick={() => { setSelectedUser(null); handleToggleBlock(selectedUser._id, `${selectedUser.firstName} ${selectedUser.lastName}`, selectedUser.isBlocked); }}
                                className={`flex-1 h-11 rounded-xl font-black uppercase text-xs transition border ${selectedUser?.isBlocked ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}
                            >
                                {selectedUser?.isBlocked ? "🔓 Unblock" : "🚫 Block User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
