import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function SupplierRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get("/inventory/requests")
            .then(res => setRequests(res.data || []))
            .catch(() => toast.error("Failed to load requests"))
            .finally(() => setLoading(false));
    }, []);

    async function updateStatus(id, status) {
        try {
            await axiosClient.put(`/inventory/requests/${id}`, { status });
            toast.success(`Request marked as ${status}`);
            setRequests(requests.map(r => r._id === id ? { ...r, status } : r));
        } catch (err) {
            toast.error("Failed to update status");
        }
    }

    const getStatusBadge = (status) => {
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
            <h1 className="text-2xl font-extrabold text-secondary mb-1">🚚 Stock Requests</h1>
            <p className="text-secondary/50 text-sm mb-6">Requests received from Inventory Managers</p>

            {loading ? (
                <div className="text-center py-16 text-secondary/30">⏳ Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16 text-secondary/30">No requests received yet.</div>
            ) : (
                <div className="space-y-4">
                    {requests.map((r) => (
                        <div key={r._id} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(r.status)}`}>
                                        {r.status}
                                    </span>
                                    <span className="text-secondary/30 text-xs text-secondary/50">Requested by: {r.inventoryManagerId?.firstName} {r.inventoryManagerId?.lastName}</span>
                                </div>
                                <h3 className="text-lg font-extrabold text-secondary mb-1">{r.productId}</h3>
                                <p className="text-sm font-bold text-secondary">Qty: <span className="text-accent underline decoration-2">{r.quantity}</span> units Needed</p>
                                
                                {r.notes && (
                                    <div className="mt-4 bg-orange-50 border border-orange-100 p-4 rounded-xl text-xs text-orange-800">
                                        <p className="font-bold mb-1 italic">Notes:</p>
                                        <p>{r.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col gap-2">
                                {r.status === "pending" && (
                                    <>
                                        <button 
                                            onClick={() => updateStatus(r._id, "accepted")}
                                            className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
                                        >
                                            Accept Order
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(r._id, "rejected")}
                                            className="px-6 py-2 border-2 border-red-100 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {r.status === "accepted" && (
                                    <button 
                                        onClick={() => updateStatus(r._id, "fulfilled")}
                                        className="px-6 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                                    >
                                        Mark as Fulfilled
                                    </button>
                                )}
                                {r.status === "fulfilled" && (
                                    <button disabled className="px-6 py-2 bg-green-50 text-green-400 rounded-xl text-sm font-bold opacity-60">
                                        ✓ Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
