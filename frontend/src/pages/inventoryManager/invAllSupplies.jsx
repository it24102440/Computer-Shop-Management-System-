import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const STATUS_STYLES = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "⏳ Pending" },
    approved: { bg: "bg-green-100", text: "text-green-700", label: "✅ Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-700", label: "❌ Rejected" },
};

export default function InvAllSupplies() {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        axiosClient.get("/inventory/")
            .then(res => setSupplies(res.data || []))
            .catch(() => toast.error("Failed to load supplies"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === "all" ? supplies : supplies.filter(s => s.status === filter);

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-2xl font-extrabold text-secondary mb-1">All Supplies 📋</h1>
            <p className="text-secondary/50 text-sm mb-6">Complete history of all supply requests</p>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {["all", "pending", "approved", "rejected"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f
                                ? "bg-accent text-white shadow"
                                : "bg-white text-secondary/60 border border-secondary/10 hover:bg-accent/10"
                            }`}
                    >
                        {f === "all" ? "All" : STATUS_STYLES[f]?.label}
                    </button>
                ))}
                <span className="ml-auto text-xs text-secondary/40 self-center">{filtered.length} records</span>
            </div>

            {loading ? (
                <div className="text-center py-16 text-secondary/30"><p className="text-4xl mb-2">⏳</p><p>Loading...</p></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-secondary/30"><p className="text-4xl mb-2">📋</p><p>No supplies found</p></div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(s => {
                        const st = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
                        return (
                            <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm border border-secondary/10 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-secondary/5 rounded-xl overflow-hidden flex-shrink-0 border border-secondary/10">
                                        {s.productDetails?.image?.[0] ? (
                                            <img 
                                                src={s.productDetails.image[0]} 
                                                alt={s.productDetails.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "/images/default.png"; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-secondary/20">
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-extrabold text-secondary text-sm">
                                                {s.productDetails?.name || "Unknown Product"}
                                            </p>
                                            <span className="text-secondary/30 text-[9px] font-bold px-1.5 py-0.5 bg-secondary/5 rounded">
                                                {s.productId}
                                            </span>
                                        </div>
                                        <p className="text-secondary/50 text-[10px] mt-0.5">
                                            Qty: <span className="font-bold">{s.quantity}</span> · Rs. {s.pricePerUnit?.toLocaleString()}/unit · Total: <span className="text-green-600 font-bold">Rs. {(s.quantity * s.pricePerUnit).toLocaleString()}</span>
                                        </p>
                                        {s.supplierId && (
                                            <p className="text-secondary/40 text-[10px] mt-0.5">
                                                By: <span className="font-medium text-secondary/60">{s.supplierId.firstName} {s.supplierId.lastName}</span>
                                                {s.supplierId.companyName && ` (${s.supplierId.companyName})`}
                                            </p>
                                        )}
                                        <p className="text-secondary/30 text-[9px] font-medium">📅 {new Date(s.suppliedDate).toLocaleDateString("en-GB")}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${st.bg} ${st.text}`}>
                                    {st.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
