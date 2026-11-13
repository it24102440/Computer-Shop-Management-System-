import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const PAYMENT_STATUS = {
    Paid: { bg: "#dcfce7", color: "#16a34a", label: "✅ PAID" },
    Pending: { bg: "#fef9c3", color: "#ca8a04", label: "⏳ PENDING PAYMENT" },
    Refunded: { bg: "#f1f5f9", color: "#64748b", label: "↩ REFUNDED" },
};

const ORDER_STATUS = {
    Pending: { bg: "#fef9c3", color: "#ca8a04" },
    Processing: { bg: "#dbeafe", color: "#2563eb" },
    Shipped: { bg: "#ede9fe", color: "#7c3aed" },
    Delivered: { bg: "#dcfce7", color: "#16a34a" },
    Cancelled: { bg: "#fee2e2", color: "#dc2626" },
};

export default function InvoicePage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        axiosClient.get("/orders/my-orders")
            .then(res => {
                const found = res.data.find(o => o.orderId === orderId);
                if (found) setOrder(found);
                else toast.error("Invoice not found");
            })
            .catch(() => toast.error("Failed to load invoice"))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!order) return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <p className="text-6xl mb-4">🧾</p>
            <p className="text-xl font-semibold">Invoice not found</p>
            <Link to="/my-orders" className="mt-4 text-blue-600 hover:underline">← My Orders</Link>
        </div>
    );

    const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
    const shippingFee = order.totalAmount - subtotal;
    const tax = 0;
    const total = order.totalAmount;
    const pst = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.Pending;
    const ost = ORDER_STATUS[order.status] || ORDER_STATUS.Pending;

    const invoiceDate = new Date(order.orderedAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "long", year: "numeric"
    });
    const invoiceTime = new Date(order.orderedAt).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit"
    });

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            {/* Controls - print hidden */}
            <div className="max-w-3xl mx-auto mb-5 flex items-center gap-3 print:hidden">
                <Link to="/my-orders"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
                    ← My Orders
                </Link>
                <p className="text-gray-400 text-sm flex-1">Invoice #{order.orderId}</p>
                <button onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow">
                    🖨️ Print / Save PDF
                </button>
            </div>

            {/* Invoice Paper */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">

                {/* ── Header ── */}
                <div style={{ background: "linear-gradient(135deg, #01303f 0%, #014d6b 60%, #02a9f7 100%)" }}
                    className="px-8 py-8 text-white">
                    <div className="flex justify-between items-start gap-4">
                        {/* Company Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl">🖥️</span>
                                <h1 className="text-3xl font-extrabold tracking-wide">TechShop</h1>
                            </div>
                            <p className="text-blue-200 text-xs mt-1">Premium Computer Hardware & Accessories</p>
                            <div className="mt-3 space-y-0.5 text-xs text-blue-200">
                                <p>📍 No. 42, Tech Park, Colombo 03, Sri Lanka</p>
                                <p>📞 +94 11 234 5678</p>
                                <p>✉️ support@techshop.lk</p>
                                <p>🌐 www.techshop.lk</p>
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="text-right flex-shrink-0">
                            <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">TAX INVOICE</p>
                            <p className="text-2xl font-extrabold">{order.orderId}</p>
                            <div className="mt-3 space-y-1 text-xs text-blue-200">
                                <p>📅 {invoiceDate}</p>
                                <p>⏰ {invoiceTime}</p>
                            </div>
                            {/* Status badges */}
                            <div className="mt-3 flex flex-col gap-2 items-end">
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold"
                                    style={{ backgroundColor: pst.bg, color: pst.color }}>
                                    {pst.label}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-extrabold"
                                    style={{ backgroundColor: ost.bg, color: ost.color }}>
                                    📦 {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Customer + Shipping Info ── */}
                <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 border-b border-gray-100">
                    {/* Customer Details */}
                    <div>
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">👤 Customer Details</p>
                        <div className="space-y-1">
                            <p className="font-extrabold text-gray-800 text-base">
                                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            </p>
                            <p className="text-gray-500 text-sm">✉️ {order.userEmail}</p>
                            <p className="text-gray-500 text-sm">📞 {order.shippingAddress?.phone}</p>
                            {user.role && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full capitalize">
                                    {user.role}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">📍 Shipping Address</p>
                        <div className="space-y-1">
                            <p className="font-bold text-gray-700 text-sm">{order.shippingAddress?.address}</p>
                            <p className="text-gray-500 text-sm">{order.shippingAddress?.city}</p>
                            <p className="text-gray-400 text-xs mt-2">Payment Method</p>
                            <p className="font-bold text-gray-700 text-sm">💳 {order.paymentMethod}</p>
                        </div>
                    </div>
                </div>

                {/* ── Items Table ── */}
                <div className="px-8 py-6">
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">🛒 Order Items</p>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr style={{ backgroundColor: "#01303f" }} className="text-white">
                                <th className="text-left py-3 px-4 rounded-l-lg font-bold text-xs uppercase tracking-wider">#</th>
                                <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-wider">Product</th>
                                <th className="text-center py-3 px-4 font-bold text-xs uppercase tracking-wider">Qty</th>
                                <th className="text-right py-3 px-4 font-bold text-xs uppercase tracking-wider">Unit Price</th>
                                <th className="text-right py-3 px-4 rounded-r-lg font-bold text-xs uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items?.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 text-gray-400 font-mono text-xs">{i + 1}.</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name}
                                                    className="w-12 h-12 object-contain rounded-xl border border-gray-100 flex-shrink-0"
                                                    onError={e => e.target.style.display = "none"} />
                                            ) : (
                                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💻</div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-gray-400 text-xs">Unit price: Rs. {item.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full text-xs">×{item.quantity}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right text-gray-600 font-medium">
                                        Rs. {item.price?.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-4 text-right font-extrabold text-gray-800">
                                        Rs. {(item.price * item.quantity)?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Totals ── */}
                <div className="px-8 pb-6">
                    <div className="flex justify-end">
                        <div className="w-72 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal ({order.items?.length} items)</span>
                                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>🚚 Shipping Fee</span>
                                    <span className="font-medium">Rs. {shippingFee > 0 ? shippingFee.toLocaleString() : "0"}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Tax (0%)</span>
                                    <span>Rs. 0</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Discount</span>
                                    <span className="text-green-600 font-medium">Rs. 0</span>
                                </div>
                            </div>
                            <div className="border-t-2 border-dashed border-gray-200 mt-3 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-extrabold text-gray-800 text-base">Grand Total</span>
                                    <span className="font-extrabold text-xl text-blue-700">Rs. {total?.toLocaleString()}</span>
                                </div>
                                <div className="mt-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold"
                                        style={{ backgroundColor: pst.bg, color: pst.color }}>
                                        {pst.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div style={{ backgroundColor: "#01303f" }} className="px-8 py-5 text-center">
                    <p className="text-blue-200 text-xs mb-1">🎉 Thank you for shopping with TechShop!</p>
                    <p className="text-blue-300/60 text-xs">
                        This is a computer-generated invoice · support@techshop.lk · www.techshop.lk
                    </p>
                    <p className="text-blue-300/40 text-xs mt-1">
                        For returns & refunds: Call +94 11 234 5678 within 7 days of delivery.
                    </p>
                </div>
            </div>
        </div>
    );
}
