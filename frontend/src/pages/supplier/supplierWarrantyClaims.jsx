import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function SupplierWarrantyClaims() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await axiosClient.get("/warranty");
            setClaims(res.data);
        } catch (err) {
            toast.error("Failed to load assigned claims");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await axiosClient.put(`/warranty/supplier/${id}`, editForm);
            toast.success("Claim updated successfully!");
            setEditMode(null);
            fetchClaims();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-3xl font-extrabold text-secondary mb-1">🛡️ Assigned Warranty Claims</h1>
            <p className="text-secondary/50 text-sm mb-8">Manage repairs and replacements assigned by Admin</p>

            {loading ? (
                <div className="text-center py-20 text-secondary/30 text-4xl animate-pulse">🛠️</div>
            ) : claims.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-secondary/10">
                    <p className="text-5xl mb-4">🏠</p>
                    <p className="font-bold text-secondary">No claims assigned to you yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {claims.map((c) => (
                        <div key={c._id} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                            c.status === 'Repairing' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                            c.status === 'Replaced' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                            c.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' :
                                            'bg-blue-50 text-blue-600 border-blue-200'
                                        }`}>
                                            {c.status}
                                        </span>
                                        <span className="text-xs font-bold text-secondary/30">ID: #{c._id.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-secondary">{c.productId}</h3>
                                    <p className="text-sm text-accent font-bold">Type: {c.claimType}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-secondary">Submission Date</p>
                                    <p className="text-xs text-secondary/40">{new Date(c.submissionDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="bg-primary/50 p-4 rounded-xl mb-6">
                                <p className="text-[10px] uppercase font-bold text-secondary/40 mb-2">Issue Reported by Customer</p>
                                <p className="text-sm text-secondary italic">"{c.issueDescription}"</p>
                            </div>

                            {editMode === c._id ? (
                                <div className="space-y-4 bg-accent/5 p-6 rounded-2xl border-2 border-accent/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-secondary/40 mb-1 block">Work Status</label>
                                            <select 
                                                className="w-full h-10 border border-secondary/20 rounded-lg px-3 text-sm"
                                                value={editForm.status}
                                                onChange={e => setEditForm({...editForm, status: e.target.value})}
                                            >
                                                <option value="Approved">Received Item</option>
                                                <option value="Repairing">Repairing</option>
                                                <option value="Replaced">Item Replaced</option>
                                                <option value="Completed">Ready for Delivery</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-secondary/40 mb-1 block">Your Notes (Visible to Customer)</label>
                                        <textarea 
                                            className="w-full border border-secondary/20 rounded-lg p-3 text-sm"
                                            value={editForm.supplierNotes}
                                            onChange={e => setEditForm({...editForm, supplierNotes: e.target.value})}
                                            placeholder="Update customer on progress..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(c._id)} className="px-6 py-2 bg-accent text-white rounded-xl text-sm font-bold">Update Status</button>
                                        <button onClick={() => setEditMode(null)} className="px-6 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-bold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center bg-secondary p-4 rounded-xl text-white">
                                    <div className="text-xs">
                                        <span className="text-white/40">Status: </span>
                                        <span className="font-bold">{c.status}</span>
                                    </div>
                                    <button 
                                        onClick={() => { setEditMode(c._id); setEditForm({ status: c.status, supplierNotes: c.supplierNotes || "" }); }}
                                        className="px-4 py-2 bg-white text-secondary rounded-xl text-xs font-bold hover:bg-accent hover:text-white transition-all shadow-lg"
                                    >
                                        Update Progress
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
