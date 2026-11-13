import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const STATUS_COLORS = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-purple-100 text-purple-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS = {
    Pending: "text-yellow-600",
    Paid: "text-green-600",
    Refunded: "text-gray-500",
};

const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(null);
    const [editData, setEditData] = useState({}); // Track local changes before saving

    useEffect(() => { fetchOrders(); }, []);

    async function fetchOrders() {
        try {
            setLoading(true);
            const res = await axiosClient.get("/orders");
            setOrders(res.data || []);
            // Initialize edit data
            const initialEdits = {};
            (res.data || []).forEach(o => {
                initialEdits[o.orderId] = {
                    status: o.status,
                    paymentStatus: o.paymentStatus,
                    courierService: o.courierService || "",
                    trackingNumber: o.trackingNumber || "",
                    adminNotes: o.adminNotes || ""
                };
            });
            setEditData(initialEdits);
        } catch {
            toast.error("Failed to load orders!");
        } finally {
            setLoading(false);
        }
    }

    const handleFieldChange = (orderId, field, value) => {
        setEditData(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [field]: value
            }
        }));
    };

    async function saveOrderChanges(orderId) {
        try {
            const updates = editData[orderId];
            await axiosClient.put(`/orders/${orderId}/status`, updates);
            toast.success(`✅ Order ${orderId} updated!`);
            
            // Sync the main orders list with the saved data
            setOrders(prev => prev.map(o =>
                o.orderId === orderId ? { ...o, ...updates } : o
            ));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed!");
        }
    }

    const filtered = orders
        .filter(o => filter === "all" || o.status === filter)
        .filter(o => 
            o.orderId.toLowerCase().includes(search.toLowerCase()) ||
            o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
            (o.shippingAddress?.firstName + " " + o.shippingAddress?.lastName).toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

    // Calculate Summary Stats
    const summary = {
        total: orders.length,
        pending: orders.filter(o => o.status === "Pending").length,
        revenue: orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0),
        todayCount: orders.filter(o => new Date(o.orderedAt).toDateString() === new Date().toDateString()).length
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-primary z-10 px-8 pt-8 pb-4 border-b border-secondary/10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-secondary">Orders 📦</h1>
                        <p className="text-secondary/50 text-sm">{orders.length} total orders</p>
                    </div>
                    <button onClick={fetchOrders} className="text-xs text-accent hover:underline font-semibold flex items-center gap-1">
                        🔄 Refresh List
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total Orders", value: summary.total, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Pending", value: summary.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
                        { label: "Today's", value: summary.todayCount, color: "text-purple-600", bg: "bg-purple-50" },
                        { label: "Gross Revenue", value: `Rs.${summary.revenue.toLocaleString()}`, color: "text-green-600", bg: "bg-green-50" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} p-3 rounded-2xl border border-secondary/5`}>
                            <p className="text-[10px] font-black uppercase text-secondary/40 tracking-wider mb-1">{s.label}</p>
                            <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <input 
                            type="text" 
                            placeholder="Search by ID, email or name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border-2 border-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                        />
                    </div>
                    {/* Filter Tabs */}
                    <div className="flex gap-2 flex-wrap justify-center">
                        {["all", ...ALL_STATUSES].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border-2 ${filter === s
                                        ? "bg-accent text-white border-accent shadow-md"
                                        : "bg-white border-secondary/10 text-secondary/40 hover:border-accent hover:text-accent"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto hide-scroll-track px-8 py-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-secondary/40">
                        <p className="text-5xl mb-3">📦</p>
                        <p className="font-medium">No orders found</p>
                    </div>
                ) : (
                    filtered.map(order => {
                        const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
                        const pc = PAYMENT_COLORS[order.paymentStatus] || PAYMENT_COLORS.Pending;
                        const isOpen = expanded === order._id;
                        const currentEdits = editData[order.orderId] || {};

                        return (
                            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                                {/* Order Row */}
                                <div
                                    onClick={() => setExpanded(isOpen ? null : order._id)}
                                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-secondary/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-lg">📦</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-secondary text-sm font-mono">{order.orderId}</p>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc}`}>{order.status}</span>
                                            </div>
                                            <p className="text-xs text-secondary/50 mt-0.5">
                                                {order.userEmail} · {order.items?.length} item(s) ·{" "}
                                                {new Date(order.orderedAt).toLocaleDateString("en-GB")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="font-extrabold text-accent">Rs. {order.totalAmount?.toLocaleString()}</p>
                                            <p className={`text-xs font-semibold ${pc}`}>{order.paymentStatus}</p>
                                        </div>
                                        <span className="text-secondary/30">{isOpen ? "▲" : "▼"}</span>
                                    </div>
                                </div>

                                {/* Expanded */}
                                {isOpen && (
                                    <div className="border-t border-secondary/10 p-5 space-y-4 bg-secondary/5">
                                        {/* Items */}
                                        <div>
                                            <p className="text-xs font-bold text-secondary/40 uppercase mb-2">Items</p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-secondary/10">
                                                        {item.image && (
                                                            <img src={item.image} alt={item.name}
                                                                className="w-8 h-8 object-contain rounded-lg"
                                                                onError={e => e.target.style.display = "none"} />
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-semibold text-secondary">{item.name}</p>
                                                            <p className="text-xs text-secondary/40">×{item.quantity} · Rs. {item.price?.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping */}
                                        <div className="bg-white rounded-xl p-4 border border-secondary/10">
                                            <p className="text-xs font-bold text-secondary/40 uppercase mb-2">Shipping Address</p>
                                            <p className="text-sm font-semibold text-secondary">
                                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                            </p>
                                            <p className="text-xs text-secondary/50">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                                            <p className="text-xs text-secondary/50">📞 {order.shippingAddress?.phone}</p>
                                        </div>

                                        {/* Edit Controls */}
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex-1 min-w-[140px]">
                                                <p className="text-xs font-bold text-secondary/40 mb-1">Order Status</p>
                                                <select
                                                    value={currentEdits.status}
                                                    onChange={e => handleFieldChange(order.orderId, 'status', e.target.value)}
                                                    className="w-full text-sm border-2 border-secondary/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                                                >
                                                    {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex-1 min-w-[140px]">
                                                <p className="text-xs font-bold text-secondary/40 mb-1">Payment Status</p>
                                                <select
                                                    value={currentEdits.paymentStatus}
                                                    onChange={e => handleFieldChange(order.orderId, 'paymentStatus', e.target.value)}
                                                    className="w-full text-sm border-2 border-secondary/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                                                >
                                                    {["Pending", "Paid", "Refunded"].map(s => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Tracking & Notes */}
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-3 bg-white p-3 rounded-xl border border-secondary/10">
                                                <div className="flex-1 min-w-[150px]">
                                                    <p className="text-xs font-bold text-secondary/40 mb-1">Courier Service</p>
                                                    <input
                                                        value={currentEdits.courierService}
                                                        onChange={e => handleFieldChange(order.orderId, 'courierService', e.target.value)}
                                                        placeholder="Ex: Koombiyo"
                                                        className="w-full text-sm border-2 border-secondary/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-[180px]">
                                                    <p className="text-xs font-bold text-secondary/40 mb-1">Tracking Number</p>
                                                    <input
                                                        value={currentEdits.trackingNumber}
                                                        onChange={e => handleFieldChange(order.orderId, 'trackingNumber', e.target.value)}
                                                        placeholder="Enter tracking #"
                                                        className="w-full text-sm border-2 border-secondary/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-secondary/10">
                                                <p className="text-xs font-bold text-secondary/40 mb-1">Admin Private Note</p>
                                                <textarea
                                                    value={currentEdits.adminNotes}
                                                    onChange={e => handleFieldChange(order.orderId, 'adminNotes', e.target.value)}
                                                    placeholder="Internal notes (Customer won't see this)"
                                                    rows={2}
                                                    className="w-full text-sm border-2 border-secondary/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <div className="pt-2 flex justify-end">
                                            <button
                                                onClick={() => saveOrderChanges(order.orderId)}
                                                className="bg-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                                            >
                                                💾 Save Changes
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
