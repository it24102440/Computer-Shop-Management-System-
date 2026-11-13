import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const PERIODS = [
    { key: "all", label: "All Time" },
    { key: "yearly", label: "This Year" },
    { key: "monthly", label: "This Month" },
    { key: "weekly", label: "This Week" },
];

const PAYMENT_STATUS = {
    Paid: { bg: "bg-green-100", text: "text-green-700", icon: "✅" },
    Pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: "⏳" },
    Refunded: { bg: "bg-gray-100", text: "text-gray-600", icon: "↩" },
};

const ORDER_STATUS = {
    Pending: { color: "text-yellow-600" },
    Processing: { color: "text-blue-600" },
    Shipped: { color: "text-purple-600" },
    Delivered: { color: "text-green-600" },
    Cancelled: { color: "text-red-600" },
};

function filterByPeriod(orders, period) {
    const now = new Date();
    return orders.filter(o => {
        const d = new Date(o.orderedAt);
        if (period === "monthly") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (period === "yearly") return d.getFullYear() === now.getFullYear();
        if (period === "weekly") {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return d >= startOfWeek;
        }
        return true;
    });
}

export default function MyPaymentHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("all");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        axiosClient.get("/orders/my-orders")
            .then(res => setOrders(res.data || []))
            .catch(() => toast.error("Failed to load payment history"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filterByPeriod(orders, period);

    // Stats
    const totalSpent = filtered.filter(o => o.paymentStatus === "Paid").reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = filtered.length;
    const paidOrders = filtered.filter(o => o.paymentStatus === "Paid").length;
    const pendingPayment = filtered.filter(o => o.paymentStatus === "Pending").length;
    const refundedOrders = filtered.filter(o => o.paymentStatus === "Refunded").length;
    const avgOrderValue = paidOrders > 0 ? Math.round(totalSpent / paidOrders) : 0;

    function handlePrint() { window.print(); }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar - hidden in print */}
            <nav className="bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between print:hidden">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent">TechShop</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Link to="/my-orders" className="text-primary/80 hover:text-accent text-sm font-medium transition-colors">
                        📦 My Orders
                    </Link>
                    <Link to="/profile" className="text-primary/80 hover:text-accent text-sm font-medium transition-colors">
                        👤 Profile
                    </Link>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto p-6 space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800">💳 Payment History</h1>
                        <p className="text-gray-400 text-sm mt-1">Your complete payment & order records</p>
                    </div>
                    <button onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md self-start">
                        🖨️ Generate Report (PDF)
                    </button>
                </div>

                {/* ── Print-only Header ── */}
                <div className="hidden print:block border-b-2 border-gray-800 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-extrabold">🖥️ TechShop</h1>
                            <p className="text-gray-500 text-xs">Payment History Report</p>
                            <p className="text-gray-500 text-xs">support@techshop.lk | www.techshop.lk</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                            <p className="text-gray-400 text-xs mt-1">Generated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                            <p className="text-gray-400 text-xs">Period: {PERIODS.find(p => p.key === period)?.label}</p>
                        </div>
                    </div>
                </div>

                {/* ── Period Filter ── */}
                <div className="flex gap-2 flex-wrap print:hidden">
                    {PERIODS.map(p => (
                        <button key={p.key} onClick={() => setPeriod(p.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p.key
                                ? "bg-blue-600 text-white shadow"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"}`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ── Summary Cards ── */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { label: "Total Spent", value: `Rs. ${totalSpent.toLocaleString()}`, icon: "💰", color: "from-blue-500 to-blue-700", textCol: "text-white" },
                                { label: "Total Orders", value: totalOrders, icon: "📦", color: "from-slate-600 to-slate-800", textCol: "text-white" },
                                { label: "Paid Orders", value: paidOrders, icon: "✅", color: "from-green-500 to-green-700", textCol: "text-white" },
                                { label: "Pending Payment", value: pendingPayment, icon: "⏳", color: "from-yellow-400 to-yellow-600", textCol: "text-white" },
                                { label: "Refunded", value: refundedOrders, icon: "↩", color: "from-gray-400 to-gray-600", textCol: "text-white" },
                                { label: "Avg Order Value", value: `Rs. ${avgOrderValue.toLocaleString()}`, icon: "📊", color: "from-purple-500 to-purple-700", textCol: "text-white" },
                            ].map(card => (
                                <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 shadow-md`}>
                                    <p className="text-2xl">{card.icon}</p>
                                    <p className={`text-xs font-semibold mt-2 opacity-80 ${card.textCol}`}>{card.label}</p>
                                    <p className={`font-extrabold text-lg mt-0.5 ${card.textCol}`}>{card.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Print-only stats table */}
                        <div className="hidden print:block bg-gray-50 rounded-xl p-4 mb-6">
                            <h2 className="font-extrabold text-gray-800 mb-3">Summary</h2>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div><span className="text-gray-400">Total Spent:</span><span className="font-bold ml-2">Rs. {totalSpent.toLocaleString()}</span></div>
                                <div><span className="text-gray-400">Total Orders:</span><span className="font-bold ml-2">{totalOrders}</span></div>
                                <div><span className="text-gray-400">Paid Orders:</span><span className="font-bold ml-2">{paidOrders}</span></div>
                                <div><span className="text-gray-400">Pending Payment:</span><span className="font-bold ml-2">{pendingPayment}</span></div>
                                <div><span className="text-gray-400">Refunded:</span><span className="font-bold ml-2">{refundedOrders}</span></div>
                                <div><span className="text-gray-400">Avg Order:</span><span className="font-bold ml-2">Rs. {avgOrderValue.toLocaleString()}</span></div>
                            </div>
                        </div>

                        {/* ── Payment Table ── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between print:border-b-2 print:border-gray-800">
                                <h2 className="font-extrabold text-gray-800">Transaction Records</h2>
                                <span className="text-gray-400 text-sm">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                            </div>

                            {filtered.length === 0 ? (
                                <div className="text-center py-16 text-gray-300 print:hidden">
                                    <p className="text-5xl mb-3">💳</p>
                                    <p className="font-semibold text-gray-400">No transactions for this period</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Order ID</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Items</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Method</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Order Status</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Payment</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                                                <th className="py-3 px-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider print:hidden">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filtered.map(order => {
                                                const pst = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.Pending;
                                                const ost = ORDER_STATUS[order.status] || ORDER_STATUS.Pending;
                                                return (
                                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                        {/* Date */}
                                                        <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                                                            {new Date(order.orderedAt).toLocaleDateString("en-GB", {
                                                                day: "2-digit", month: "short", year: "numeric"
                                                            })}
                                                        </td>

                                                        {/* Order ID */}
                                                        <td className="py-3 px-4">
                                                            <p className="font-mono font-bold text-gray-700 text-xs">{order.orderId}</p>
                                                        </td>

                                                        {/* Items */}
                                                        <td className="py-3 px-4">
                                                            <p className="text-gray-600 text-xs line-clamp-2 max-w-[160px]">
                                                                {order.items?.map(i => `${i.name} ×${i.quantity}`).join(", ")}
                                                            </p>
                                                        </td>

                                                        {/* Payment Method */}
                                                        <td className="py-3 px-4">
                                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                                {order.paymentMethod}
                                                            </span>
                                                        </td>

                                                        {/* Order Status */}
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs font-bold ${ost.color}`}>{order.status}</span>
                                                        </td>

                                                        {/* Payment Status */}
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${pst.bg} ${pst.text}`}>
                                                                {pst.icon} {order.paymentStatus}
                                                            </span>
                                                        </td>

                                                        {/* Amount */}
                                                        <td className="py-3 px-4 text-right">
                                                            <p className={`font-extrabold ${order.paymentStatus === "Paid" ? "text-blue-700" : "text-gray-400"}`}>
                                                                Rs. {order.totalAmount?.toLocaleString()}
                                                            </p>
                                                        </td>

                                                        {/* Invoice link */}
                                                        <td className="py-3 px-4 print:hidden">
                                                            <Link to={`/invoice/${order.orderId}`}
                                                                className="text-xs font-bold text-blue-600 hover:underline whitespace-nowrap">
                                                                🧾 View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>

                                        {/* Footer Totals row */}
                                        <tfoot>
                                            <tr className="bg-gray-50 border-t-2 border-gray-200">
                                                <td colSpan={6} className="py-3 px-4 text-xs font-extrabold text-gray-500 uppercase">
                                                    Total Paid ({paidOrders} orders)
                                                </td>
                                                <td className="py-3 px-4 text-right font-extrabold text-blue-700 text-base">
                                                    Rs. {totalSpent.toLocaleString()}
                                                </td>
                                                <td className="print:hidden" />
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* ── Print Footer ── */}
                        <div className="hidden print:block text-center text-xs text-gray-300 pt-4 border-t border-gray-200 mt-6">
                            <p>This is a computer-generated payment report from TechShop · www.techshop.lk</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
