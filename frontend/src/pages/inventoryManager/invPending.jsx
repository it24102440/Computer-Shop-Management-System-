import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function InvPending() {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);

    function fetchPending() {
        axiosClient.get("/inventory/pending")
            .then(res => setSupplies(res.data || []))
            .catch(() => toast.error("Failed to load pending supplies"))
            .finally(() => setLoading(false));
    }

    useEffect(() => { fetchPending(); }, []);

    async function handleApprove(id) {
        try {
            await axiosClient.put(`/inventory/approve/${id}`);
            toast.success("✅ Supply approved & stock updated!");
            fetchPending();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Approval failed");
        }
    }

    async function handleReject(id) {
        try {
            await axiosClient.put(`/inventory/reject/${id}`);
            toast.success("❌ Supply rejected");
            fetchPending();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Rejection failed");
        }
    }

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-2xl font-extrabold text-secondary mb-1">Pending Supplies ⏳</h1>
            <p className="text-secondary/50 text-sm mb-6">Review and approve or reject incoming supply requests</p>

            {loading ? (
                <div className="text-center py-16 text-secondary/30">
                    <p className="text-4xl mb-2">⏳</p><p>Loading...</p>
                </div>
            ) : supplies.length === 0 ? (
                <div className="text-center py-16 text-secondary/30">
                    <p className="text-4xl mb-2">🎉</p>
                    <p className="font-semibold">No pending supplies!</p>
                    <p className="text-sm mt-1">All supply requests are processed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {supplies.map(s => (
                        <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm border border-secondary/10">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                 {/* Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-16 h-16 bg-secondary/5 rounded-2xl overflow-hidden flex-shrink-0 border border-secondary/10">
                                        {s.productDetails?.image?.[0] ? (
                                            <img 
                                                src={s.productDetails.image[0]} 
                                                alt={s.productDetails.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "/images/default.png"; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-secondary/20">
                                                📦
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-extrabold text-secondary text-lg">
                                                {s.productDetails?.name || "Unknown Product"}
                                            </h3>
                                            <span className="bg-secondary/10 text-secondary/60 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                                ID: {s.productId}
                                            </span>
                                        </div>
                                        <p className="text-secondary/60 text-sm mt-1">
                                            Qty: <span className="font-bold text-secondary">{s.quantity}</span>
                                            {" · "}
                                            Price/Unit: <span className="font-bold text-secondary">Rs. {s.pricePerUnit?.toLocaleString()}</span>
                                            {" · "}
                                            Total: <span className="font-black text-green-600">Rs. {(s.quantity * s.pricePerUnit).toLocaleString()}</span>
                                        </p>
                                        {/* Supplier Info */}
                                        {s.supplierId && (
                                            <p className="text-secondary/40 text-xs mt-1">
                                                Supplier: <span className="font-semibold text-secondary/60">{s.supplierId.firstName} {s.supplierId.lastName}</span> · {s.supplierId.email}
                                                {s.supplierId.companyName && ` · ${s.supplierId.companyName}`}
                                            </p>
                                        )}
                                        {s.notes && (
                                            <p className="text-secondary/40 text-xs mt-1 italic">"{s.notes}"</p>
                                        )}
                                        <p className="text-secondary/30 text-[10px] mt-1 font-medium">
                                            📅 {new Date(s.suppliedDate).toLocaleString("en-GB")}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleApprove(s._id)}
                                        className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                                    >
                                        ✅ Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(s._id)}
                                        className="px-5 py-2.5 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
                                    >
                                        ❌ Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
