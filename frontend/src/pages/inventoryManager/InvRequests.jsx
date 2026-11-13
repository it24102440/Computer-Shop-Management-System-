import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function InvRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get("/inventory/requests")
            .then(res => setRequests(res.data || []))
            .catch(() => toast.error("Failed to load stock requests"))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-blue-100 text-blue-600 border-blue-200";
            case "accepted": return "bg-orange-100 text-orange-600 border-orange-200";
            case "fulfilled": return "bg-green-100 text-green-600 border-green-200";
            case "rejected": return "bg-red-100 text-red-600 border-red-200";
            default: return "bg-secondary/10 text-secondary border-secondary/20";
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-2xl font-extrabold text-secondary mb-1">📋 Stock Requests</h1>
            <p className="text-secondary/50 text-sm mb-6">Track formal stock requests sent to suppliers</p>

            {loading ? (
                <div className="text-center py-16 text-secondary/30">⏳ Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16 text-secondary/30">No requests sent yet.</div>
            ) : (
                <div className="space-y-4">
                    {requests.map((r) => (
                        <div key={r._id} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(r.status)}`}>
                                        {r.status}
                                    </span>
                                    <span className="text-secondary/30 text-xs">#{r._id.slice(-6)}</span>
                                </div>
                                <h3 className="text-lg font-extrabold text-secondary mb-1">{r.productId}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-secondary/30 text-[10px] uppercase font-bold tracking-wider">Supplier</span>
                                        <span className="text-sm font-bold text-secondary">{r.supplierId?.companyName || "Unknown"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-secondary/30 text-[10px] uppercase font-bold tracking-wider">Quantity</span>
                                        <span className="text-sm font-extrabold text-secondary">{r.quantity} units</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-secondary/30 text-[10px] uppercase font-bold tracking-wider">Date</span>
                                        <span className="text-sm font-bold text-secondary">{new Date(r.requestedDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {r.notes && (
                                    <p className="mt-4 text-xs text-secondary/60 bg-primary p-3 rounded-xl italic border border-secondary/5">" {r.notes} "</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
