import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import { FaUsers, FaBox, FaShoppingCart, FaWallet, FaExclamationTriangle, FaClock, FaTag, FaStar } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const role = user?.role;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [overview, sales] = await Promise.all([
                axiosClient.get("/users/dashboard/overview"),
                axiosClient.get("/orders/analytics/sales")
            ]);
            setData(overview.data);
            setSalesData(sales.data);
        } catch (err) {
            toast.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-secondary/40 animate-pulse uppercase tracking-widest text-xs">Initializing Dashboard...</p>
        </div>
    );

    const { stats, statusDistribution, recentOrders, categoryDistribution, ratingDistribution, lowStockByCategory } = data;

    const pieData = Object.keys(statusDistribution).map(key => ({
        name: key,
        value: statusDistribution[key]
    }));

    const statCards = role === "productManager" 
        ? [
            { label: "Total Products", value: stats.totalProducts, icon: <FaBox />, color: "bg-orange-500", text: "text-orange-500" },
            { label: "Total Categories", value: stats.totalCategories || 0, icon: <FaTag />, color: "bg-blue-500", text: "text-blue-500" },
            { label: "Total Reviews", value: stats.totalReviews || 0, icon: <FaStar />, color: "bg-yellow-500", text: "text-yellow-500" },
            { label: "Low Stock", value: stats.lowStockCount, icon: <FaExclamationTriangle />, color: "bg-red-500", text: "text-red-500" },
        ]
        : [
            { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: <FaWallet />, color: "bg-blue-500", text: "text-blue-500" },
            { label: "Total Orders", value: stats.totalOrders, icon: <FaShoppingCart />, color: "bg-purple-500", text: "text-purple-500" },
            { label: "Total Products", value: stats.totalProducts, icon: <FaBox />, color: "bg-orange-500", text: "text-orange-500" },
            { label: "Active Users", value: stats.totalUsers, icon: <FaUsers />, color: "bg-green-500", text: "text-green-500" },
        ];

    return (
        <div className="w-full h-full overflow-y-auto bg-primary p-8 hide-scroll-track">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-secondary tracking-tight">Product Dashboard </h1>
                    <p className="text-secondary/50 font-medium">Real-time overview of TechShop operations</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-secondary/5 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-secondary">System Online</span>
                    </div>
                </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-secondary/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-current/20`}>
                                {card.icon}
                            </div>
                        </div>
                        <p className="text-secondary/40 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
                        <h2 className="text-2xl font-black text-secondary">{card.value}</h2>
                    </div>
                ))}
            </div>

            {/* Alerts Section */}
            {( (role !== "productManager" && stats.pendingOrders > 0) || stats.lowStockCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {role !== "productManager" && stats.pendingOrders > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-yellow-400 text-white rounded-xl flex items-center justify-center text-lg"><FaClock /></div>
                            <div>
                                <p className="text-xs font-bold text-yellow-800 uppercase">Pending Action</p>
                                <p className="text-sm font-bold text-yellow-700">{stats.pendingOrders} orders are waiting for processing</p>
                            </div>
                        </div>
                    )}
                    {stats.lowStockCount > 0 && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-400 text-white rounded-xl flex items-center justify-center text-lg"><FaExclamationTriangle /></div>
                            <div>
                                <p className="text-xs font-bold text-red-800 uppercase">Inventory Alert</p>
                                <p className="text-sm font-bold text-red-700">{stats.lowStockCount} products are running low on stock</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Charts Row */}
            {role !== "productManager" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Sales Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5">
                        <h3 className="text-lg font-black text-secondary mb-6">Revenue Growth (Last 7 Days)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="totalRevenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Pie */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5">
                        <h3 className="text-lg font-black text-secondary mb-6">Order Breakdown</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Orders Table */}
            {role !== "productManager" && (
                <div className="bg-white rounded-[32px] shadow-sm border border-secondary/5 overflow-hidden">
                    <div className="p-6 border-b border-secondary/5 flex justify-between items-center">
                        <h3 className="text-lg font-black text-secondary">Recent Transactions</h3>
                        <button className="text-accent text-sm font-bold hover:underline">View All Orders</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary/40 tracking-widest">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary/40 tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary/40 tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-secondary/40 tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/5">
                                {recentOrders.map((o) => (
                                    <tr key={o._id} className="hover:bg-primary/30 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-secondary">{o.orderId}</td>
                                        <td className="px-6 py-4 text-sm font-mediumtext-secondary/60">{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${o.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                                o.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-secondary text-right">Rs. {o.totalAmount?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {/* Product Analytics Row (Only for Product Managers) */}
            {role === "productManager" && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Category Distribution */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5">
                            <h3 className="text-lg font-black text-secondary mb-6">Category Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryDistribution?.map(c => ({ name: c._id, value: c.count }))}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryDistribution?.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5">
                            <h3 className="text-lg font-black text-secondary mb-6">Product Rating Analysis</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ratingDistribution?.map(r => ({ rating: `${r._id} Star`, count: r.count }))}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                        <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Stock Analysis by Category */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-secondary/5">
                        <h3 className="text-lg font-black text-secondary mb-6">Low Stock Analysis by Category</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={lowStockByCategory?.map(s => ({ category: s._id, lowStock: s.count }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                    <Bar dataKey="lowStock" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
