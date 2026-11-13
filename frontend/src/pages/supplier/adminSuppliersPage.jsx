import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function AdminSuppliersPage() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axiosClient.get("/users/suppliers/stats");
            setStats(res.data);
        } catch (err) {
            toast.error("Failed to load supplier performance stats");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-secondary">Supplier Management 📦</h1>
                    <p className="text-secondary/50 mt-1">Monitor supplier performance and supply history</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {stats.map((s) => (
                        <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-2xl font-bold border border-yellow-100">
                                        {s.company?.[0] || s.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-secondary">{s.company || "Independent Supplier"}</h3>
                                        <p className="text-sm font-semibold text-secondary/60">{s.name}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${s.isApproved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                    {s.isApproved ? "✓ Active" : "⏳ Pending"}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-primary/50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-secondary/40 tracking-wider">Supplies</p>
                                    <p className="text-lg font-extrabold text-secondary">{s.totalSupplies}</p>
                                </div>
                                <div className="bg-primary/50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-secondary/40 tracking-wider">Approved</p>
                                    <p className="text-lg font-extrabold text-green-600">{s.approvedCount}</p>
                                </div>
                                <div className="bg-primary/50 p-3 rounded-xl">
                                    <p className="text-[10px] uppercase font-bold text-secondary/40 tracking-wider">Total Value</p>
                                    <p className="text-lg font-extrabold text-accent">Rs. {(s.totalValue / 1000).toFixed(1)}k</p>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-secondary/5 pt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-secondary/40">Email:</span>
                                    <span className="text-secondary font-semibold">{s.email}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-secondary/40">Contact:</span>
                                    <span className="text-secondary font-semibold">{s.contact || "N/A"}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-secondary/40">Last Supplied:</span>
                                    <span className="text-secondary font-semibold">
                                        {s.lastSupplied ? new Date(s.lastSupplied).toLocaleDateString() : "Never"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
