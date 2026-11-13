import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const STATUS_CONFIG = {
    Pending: { color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
    Processing: { color: "bg-blue-100 text-blue-700", icon: "🔄" },
    Shipped: { color: "bg-purple-100 text-purple-700", icon: "🚚" },
    Delivered: { color: "bg-green-100 text-green-700", icon: "✅" },
    Cancelled: { color: "bg-red-100 text-red-700", icon: "❌" },
};

const PAYMENT_CONFIG = {
    Pending: { color: "text-yellow-600", label: "💵 Pending" },
    Paid: { color: "text-green-600", label: "✅ Paid" },
    Refunded: { color: "text-gray-500", label: "↩ Refunded" },
};

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();
    
    // Warranty Modal
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [claimForm, setClaimForm] = useState({ issueDescription: "", claimType: "Repair" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axiosClient.get("/orders/my-orders")
            .then(res => setOrders(res.data || []))
            .catch(() => toast.error("Failed to load orders"))
            .finally(() => setLoading(false));
    }, []);

    function handleBuyAgain(items) {
        const cartItems = items.map(item => ({
            productid: item.productId,
            name: item.name,
            price: item.price,
            qty: item.quantity,
            image: [item.image]
        }));
        localStorage.setItem("cart", JSON.stringify(cartItems));
        toast.success("Items re-added to your cart!");
        navigate("/cart");
    }

    async function handleCancelOrder(orderId) {
        if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
        
        try {
            setLoading(true);
            await axiosClient.put(`/orders/${orderId}/cancel`);
            toast.success("Order cancelled and stock replenished!");
            
            // Update local state
            setOrders(prev => prev.map(o => 
                o.orderId === orderId ? { ...o, status: "Cancelled" } : o
            ));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to cancel order");
        } finally {
            setLoading(false);
        }
    }

    async function handleClaimSubmit(e) {
        e.preventDefault();
        try {
            setSubmitting(true);
            await axiosClient.post("/warranty", {
                orderId: selectedItem.order_id,
                productId: selectedItem.productId,
                ...claimForm
            });
            toast.success("Warranty claim submitted successfully!");
            setShowModal(false);
            setClaimForm({ issueDescription: "", claimType: "Repair" });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to submit claim");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-primary">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent">TechShop</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/payment-history" className="px-4 py-2 bg-accent/10 text-accent text-sm font-bold rounded-xl hover:bg-accent hover:text-white transition-colors">
                        💳 Payment History
                    </Link>
                    <Link to="/my-warranty" className="px-4 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-xl hover:bg-red-200 transition-colors">
                        🛡️ Warranty Claims
                    </Link>
                    <Link to="/products" className="text-primary/80 hover:text-accent text-sm font-semibold transition-colors">
                        🛍️ Continue Shopping
                    </Link>
                    <Link to="/cart" className="text-primary/80 hover:text-accent text-sm font-semibold transition-colors">
                        🛒 Cart
                    </Link>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-extrabold text-secondary mb-2">My Orders 📦</h1>
                <p className="text-secondary/50 mb-8">Track all your orders here</p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 text-secondary/30">
                        <p className="text-7xl mb-4">📦</p>
                        <p className="text-xl font-semibold mb-2">No orders yet</p>
                        <Link to="/products" className="inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 mt-4">
                            Start Shopping →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                            const py = PAYMENT_CONFIG[order.paymentStatus] || PAYMENT_CONFIG.Pending;
                            const isOpen = expanded === order._id;

                            return (
                                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                                    {/* Header */}
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : order._id)}
                                        className="w-full p-5 flex items-center justify-between gap-4 hover:bg-secondary/5 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-xl">
                                                {st.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-secondary text-sm">{order.orderId}</p>
                                                <p className="text-secondary/40 text-xs">
                                                    {new Date(order.orderedAt).toLocaleDateString("en-GB", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                    {" · "}
                                                    {order.items?.length} item(s)
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="font-extrabold text-secondary">Rs. {order.totalAmount?.toLocaleString()}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.color}`}>{order.status}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleBuyAgain(order.items); }}
                                                className="px-3 py-1 bg-accent text-white text-[10px] font-black uppercase rounded-lg hover:bg-orange-600 transition shadow-sm"
                                            >
                                                Buy Again 🔁
                                            </button>
                                            {order.status === "Pending" && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCancelOrder(order.orderId); }}
                                                    className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-red-600 transition shadow-sm"
                                                >
                                                    Cancel Order ❌
                                                </button>
                                            )}
                                            <span className="text-secondary/30 text-sm font-bold">{isOpen ? "▲" : "▼"}</span>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    {isOpen && (
                                        <div className="border-t border-secondary/10 p-6 space-y-6 bg-secondary/5">
                                            
                                            {/* ── Order Progress Stepper ── */}
                                            {order.status !== "Cancelled" && (
                                                <div className="bg-white p-6 rounded-2xl border border-secondary/10 shadow-sm">
                                                    <p className="text-[10px] font-black uppercase text-secondary/30 mb-6 tracking-widest text-center">Order Journey</p>
                                                    <div className="relative flex items-center justify-between">
                                                        {/* Line Background */}
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary/10 rounded-full" />
                                                        
                                                        {/* Dynamic Progress Line */}
                                                        <div 
                                                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full transition-all duration-1000"
                                                            style={{ 
                                                                width: order.status === "Pending" ? "0%" : 
                                                                       order.status === "Processing" ? "33%" : 
                                                                       order.status === "Shipped" ? "66%" : "100%" 
                                                            }}
                                                        />

                                                        {/* Steps */}
                                                        {["Pending", "Processing", "Shipped", "Delivered"].map((step, idx) => {
                                                            const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
                                                            const currentIdx = statuses.indexOf(order.status);
                                                            const isCompleted = currentIdx >= idx;
                                                            const isActive = currentIdx === idx;

                                                            return (
                                                                <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-4 ${
                                                                        isCompleted ? "bg-accent text-white border-accent scale-110" : "bg-white text-secondary/30 border-secondary/10"
                                                                    } ${isActive ? "ring-4 ring-accent/20 animate-pulse" : ""}`}>
                                                                        {isCompleted && step !== "Delivered" ? "✓" : (idx + 1)}
                                                                    </div>
                                                                    <p className={`text-[10px] font-black uppercase tracking-tighter ${isCompleted ? "text-secondary" : "text-secondary/30"}`}>
                                                                        {step}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    {order.status !== "Delivered" && (
                                                        <p className="text-center text-[11px] font-bold text-accent mt-6 py-2 bg-accent/5 rounded-xl border border-accent/10">
                                                            📅 Estimated Delivery: {new Date(new Date(order.orderedAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })} - {new Date(new Date(order.orderedAt).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Items */}
                                            <div>
                                                <p className="text-xs font-bold text-secondary/40 uppercase mb-3">Items</p>
                                                <div className="space-y-2">
                                                    {order.items?.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-primary rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                                ) : <span className="text-lg">💻</span>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-secondary">{item.name}</p>
                                                                <p className="text-xs text-secondary/40">×{item.quantity} · Rs. {item.price?.toLocaleString()} each</p>
                                                            </div>
                                                            <p className="text-sm font-bold text-secondary">Rs. {(item.price * item.quantity)?.toLocaleString()}</p>
                                                            {order.status === "Delivered" && (
                                                                <div className="flex gap-2 ml-4 flex-shrink-0">
                                                                    <button 
                                                                        onClick={() => navigate(`/products/${item.productId}`)}
                                                                        className="px-3 py-1 bg-accent/5 text-accent rounded-lg text-[10px] font-black uppercase hover:bg-accent hover:text-white transition-all border border-accent/20"
                                                                    >
                                                                        ⭐ Write Review
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => { setSelectedItem({...item, order_id: order._id}); setShowModal(true); }}
                                                                        className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-200"
                                                                    >
                                                                        🛡️ Claim Warranty
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Shipping + Payment Info */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-secondary/10">
                                                <div>
                                                    <p className="text-xs font-bold text-secondary/40 uppercase mb-2">Shipping To</p>
                                                    <p className="text-sm text-secondary font-semibold">
                                                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                                    </p>
                                                    <p className="text-xs text-secondary/50">{order.shippingAddress?.address}</p>
                                                    <p className="text-xs text-secondary/50">{order.shippingAddress?.city}</p>
                                                    <p className="text-xs text-secondary/50">📞 {order.shippingAddress?.phone}</p>
                                                    
                                                    {order.trackingNumber && (
                                                        <div className="mt-4 p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                                                            <p className="text-xs font-bold text-secondary/40 uppercase mb-1">Tracking Info 🚚</p>
                                                            <p className="text-sm font-bold text-accent">{order.courierService || "Standard Delivery"}</p>
                                                            <p className="text-xs font-mono font-bold text-secondary mt-1 tracking-widest bg-white px-2 py-1 inline-block rounded-lg shadow-sm border border-secondary/10 select-all">
                                                                {order.trackingNumber}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-secondary/40 uppercase mb-2">Payment</p>
                                                    <p className="text-sm text-secondary font-semibold">{order.paymentMethod}</p>
                                                    <p className={`text-sm font-bold mt-1 ${py.color}`}>{py.label}</p>
                                                    <div className="mt-2 pt-2 border-t border-secondary/10">
                                                        <div className="flex justify-between text-xs text-secondary/50">
                                                            <span>Subtotal</span>
                                                            <span>Rs. {(order.totalAmount - 500).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-secondary/50">
                                                            <span>Shipping</span><span>Rs. 500</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm font-extrabold text-secondary mt-1">
                                                            <span>Total</span>
                                                            <span className="text-accent">Rs. {order.totalAmount?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Invoice Button */}
                                            <div className="pt-3 border-t border-secondary/10">
                                                <Link
                                                    to={`/invoice/${order.orderId}`}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                                                >
                                                    🧾 View / Print Invoice
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Warranty Claim Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-xl font-extrabold text-secondary">🛡️ Warranty Claim</h1>
                                <p className="text-secondary/50 text-xs mt-1">Product: <span className="text-accent font-bold">{selectedItem?.name}</span></p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-secondary/20 hover:text-red-500 text-xl font-bold">✕</button>
                        </div>

                        <form onSubmit={handleClaimSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider mb-1.5">Claim Type</label>
                                <div className="flex gap-2">
                                    {["Repair", "Replacement"].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setClaimForm({ ...claimForm, claimType: t })}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${claimForm.claimType === t ? 'border-accent bg-accent/5 text-accent' : 'border-secondary/10 text-secondary/40 hover:border-secondary/20'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-extrabold text-secondary uppercase tracking-wider mb-1.5">Issue Description</label>
                                <textarea
                                    required
                                    className="w-full border-2 border-secondary/10 rounded-xl p-4 focus:outline-none focus:border-accent text-sm min-h-[120px]"
                                    placeholder="Please describe the issue in detail..."
                                    value={claimForm.issueDescription}
                                    onChange={e => setClaimForm({ ...claimForm, issueDescription: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-12 bg-secondary text-white rounded-xl font-bold hover:bg-accent transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "🚀 Submit Claim"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
