import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function InvDashboard() {
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, lowStock: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosClient.get("/inventory/"),
            axiosClient.get("/products/low-stock"),
        ]).then(([supRes, lowRes]) => {
            const supplies = supRes.data || [];
            setStats({
                pending: supplies.filter(s => s.status === "pending").length,
                approved: supplies.filter(s => s.status === "approved").length,
                rejected: supplies.filter(s => s.status === "rejected").length,
                lowStock: (lowRes.data || []).length,
            });
        }).catch(() => toast.error("Failed to load stats"))
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        { label: "Pending Supplies", value: stats.pending, icon: "⏳", color: "bg-yellow-100 text-yellow-700", link: "/inventory/pending" },
        { label: "Approved", value: stats.approved, icon: "✅", color: "bg-green-100 text-green-700", link: "/inventory/supplies" },
        { label: "Rejected", value: stats.rejected, icon: "❌", color: "bg-red-100 text-red-700", link: "/inventory/supplies" },
        { label: "Low Stock Items", value: stats.lowStock, icon: "⚠️", color: "bg-orange-100 text-orange-700", link: "/inventory/low-stock" },
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-secondary mb-1">Inventory Dashboard 📊</h1>
            <p className="text-secondary/50 text-sm mb-8">Manage supplies and monitor stock levels</p>

            {loading ? (
                <p className="text-secondary/40">Loading...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {cards.map(c => (
                        <Link key={c.label} to={c.link}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-secondary/10 hover:scale-[1.02] transition-all"
                        >
                            <p className="text-3xl mb-2">{c.icon}</p>
                            <p className={`text-2xl font-extrabold ${c.color.split(" ")[1]}`}>{c.value}</p>
                            <p className="text-secondary/50 text-xs mt-1">{c.label}</p>
                        </Link>
                    ))}
                </div>
            )}

            <div className="flex gap-3">
                <Link to="/inventory/pending"
                    className="px-5 py-3 bg-accent text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                >
                    ⏳ Review Pending
                </Link>
                <Link to="/inventory/low-stock"
                    className="px-5 py-3 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-200 transition-colors"
                >
                    ⚠️ Check Low Stock
                </Link>
            </div>
        </div>
    );
}
