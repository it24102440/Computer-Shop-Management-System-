import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const STATUS_STYLES = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "⏳ Pending" },
    approved: { bg: "bg-green-100", text: "text-green-700", label: "✅ Approved" },
    rejected: { bg: "bg-red-100", text: "text-red-700", label: "❌ Rejected" },
};

export default function SupplierMySupplies() {
    const [supplies, setSupplies] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Edit Modal State
    const [showEdit, setShowEdit] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSupplies();
        fetchProducts();
    }, []);

    const fetchSupplies = () => {
        setLoading(true);
        axiosClient.get("/inventory/my-supplies")
            .then(res => setSupplies(res.data))
            .catch(() => toast.error("Failed to load supplies"))
            .finally(() => setLoading(false));
    };

    const fetchProducts = () => {
        axiosClient.get("/products")
            .then(res => setProducts(res.data || []))
            .catch(() => toast.error("Failed to load products"));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pending request?")) return;
        try {
            await axiosClient.delete(`/inventory/delete/${id}`);
            toast.success("Supply request deleted!");
            fetchSupplies();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to delete");
        }
    };

    const handleEditClick = (supply) => {
        setSelectedSupply({ ...supply });
        setShowEdit(true);
    };

    const handleUpdate = async () => {
        if (!selectedSupply.productId || !selectedSupply.quantity || !selectedSupply.pricePerUnit) {
            toast.error("Required fields missing");
            return;
        }
        try {
            setSubmitting(true);
            await axiosClient.put(`/inventory/update/${selectedSupply._id}`, {
                productId: selectedSupply.productId,
                quantity: Number(selectedSupply.quantity),
                pricePerUnit: Number(selectedSupply.pricePerUnit),
                notes: selectedSupply.notes,
                warranty: selectedSupply.warranty
            });
            toast.success("Supply request updated!");
            setShowEdit(false);
            fetchSupplies();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to update");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = filter === "all" ? supplies : supplies.filter(s => s.status === filter);

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8 relative">
            <h1 className="text-2xl font-extrabold text-secondary mb-1">My Supply Requests</h1>
            <p className="text-secondary/50 text-sm mb-6">Track the status of your submitted supplies</p>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {["all", "pending", "approved", "rejected"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f
                            ? "bg-accent text-white shadow"
                            : "bg-white text-secondary/60 border border-secondary/10 hover:bg-accent/10"
                            }`}
                    >
                        {f === "all" ? "All" : STATUS_STYLES[f]?.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-16 text-secondary/30">
                    <p className="text-4xl mb-2 animate-pulse">📋</p>
                    <p>Loading your requests...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-secondary/30">
                    <p className="text-4xl mb-2">📋</p>
                    <p>No supply requests found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(supply => {
                        const s = STATUS_STYLES[supply.status] || STATUS_STYLES.pending;
                        const date = new Date(supply.suppliedDate).toLocaleDateString("en-GB");
                        return (
                            <div
                                key={supply._id}
                                className="group bg-white rounded-2xl p-5 shadow-sm border border-secondary/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 transition-all hover:border-accent/40"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-2xl group-hover:bg-accent/20 transition-colors">
                                        📦
                                    </div>
                                    <div>
                                        <p className="font-bold text-secondary">Product: <span className="text-accent">{supply.productId}</span></p>
                                        <p className="text-secondary/50 text-xs mt-1">
                                            Qty: <span className="font-semibold">{supply.quantity}</span>
                                            {" · "}
                                            Price/Unit: <span className="font-semibold">Rs. {supply.pricePerUnit?.toLocaleString()}</span>
                                            {" · "}
                                            Date: {date}
                                        </p>
                                        {supply.notes && (
                                            <p className="text-secondary/40 text-xs mt-1 italic">"{supply.notes}"</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-extrabold text-secondary text-base">
                                            Rs. {(supply.quantity * supply.pricePerUnit).toLocaleString()}
                                        </p>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${s.bg} ${s.text}`}>
                                            {s.label}
                                        </span>
                                    </div>

                                    {supply.status === "pending" && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(supply)}
                                                className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm"
                                                title="Edit Request"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supply._id)}
                                                className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
                                                title="Delete Request"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && selectedSupply && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-extrabold text-secondary">✏️ Edit Supply Request</h2>
                                <p className="text-secondary/50 text-xs mt-1">Request ID: #{selectedSupply._id.slice(-6)}</p>
                            </div>
                            <button onClick={() => setShowEdit(false)} className="text-secondary/20 hover:text-red-500 text-2xl font-bold">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-secondary/40 uppercase mb-1.5">Product</label>
                                <select
                                    value={selectedSupply.productId}
                                    onChange={e => setSelectedSupply({ ...selectedSupply, productId: e.target.value })}
                                    className="w-full h-11 border-2 border-secondary/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent"
                                >
                                    {products.map(p => (
                                        <option key={p.productid} value={p.productid}>{p.name} ({p.productid})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-secondary/40 uppercase mb-1.5">Quantity</label>
                                    <input
                                        type="number"
                                        value={selectedSupply.quantity}
                                        onChange={e => setSelectedSupply({ ...selectedSupply, quantity: e.target.value })}
                                        className="w-full h-11 border-2 border-secondary/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary/40 uppercase mb-1.5">Price / Unit</label>
                                    <input
                                        type="number"
                                        value={selectedSupply.pricePerUnit}
                                        onChange={e => setSelectedSupply({ ...selectedSupply, pricePerUnit: e.target.value })}
                                        className="w-full h-11 border-2 border-secondary/10 rounded-xl px-4 text-sm focus:outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-secondary/40 uppercase mb-1.5">Notes</label>
                                <textarea
                                    value={selectedSupply.notes || ""}
                                    onChange={e => setSelectedSupply({ ...selectedSupply, notes: e.target.value })}
                                    rows={3}
                                    className="w-full border-2 border-secondary/10 rounded-xl p-4 text-sm focus:outline-none focus:border-accent resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowEdit(false)}
                                    className="flex-1 h-12 bg-secondary/10 text-secondary rounded-xl font-bold hover:bg-secondary/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={submitting}
                                    className="flex-1 h-12 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                                >
                                    {submitting ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
