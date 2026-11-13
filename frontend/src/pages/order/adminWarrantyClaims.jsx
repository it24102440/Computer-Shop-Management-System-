import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function AdminWarrantyClaims() {
    const [claims, setClaims] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(null); // claimId
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [claimsRes, suppliersRes] = await Promise.all([
                axiosClient.get("/warranty"),
                axiosClient.get("/users?role=supplier")
            ]);
            setClaims(claimsRes.data);
            setSuppliers(suppliersRes.data);
        } catch (err) {
            toast.error("Failed to load warranty claims");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await axiosClient.put(`/warranty/admin/${id}`, editForm);
            toast.success("Claim updated!");
            setEditMode(null);
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-3xl font-extrabold text-secondary mb-1">🛡️ Warranty Claims</h1>
            <p className="text-secondary/50 text-sm mb-8">Manage customer product issues and supplier coordination</p>

            {loading ? (
                <div className="text-center py-20 text-secondary/30 text-4xl animate-pulse">⚙️</div>
            ) : claims.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-secondary/10">
                    <p className="text-5xl mb-4">✨</p>
                    <p className="font-bold text-secondary">No warranty claims yet!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {claims.map((c) => (
                        <div key={c._id} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                            c.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                            c.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                            'bg-blue-50 text-blue-600 border-blue-200'
                                        }`}>
                                            {c.status}
                                        </span>
                                        <span className="text-xs font-bold text-secondary/30">Claim #{c._id.slice(-6)}</span>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-secondary">{c.productId}</h3>
                                    <p className="text-sm text-accent font-bold">Type: {c.claimType}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-secondary">{c.customerId?.firstName} {c.customerId?.lastName}</p>
                                    <p className="text-xs text-secondary/40">{c.customerId?.email}</p>
                                </div>
                            </div>

                            <div className="bg-primary/50 p-4 rounded-xl mb-6">
                                <p className="text-[10px] uppercase font-bold text-secondary/40 mb-2">Description</p>
                                <p className="text-sm text-secondary italic">"{c.issueDescription}"</p>
                            </div>

                            {editMode === c._id ? (
                                <div className="space-y-4 bg-accent/5 p-6 rounded-2xl border-2 border-accent/20">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-secondary/40 mb-1 block">Status</label>
                                            <select 
                                                className="w-full h-10 border border-secondary/20 rounded-lg px-3 text-sm"
                                                value={editForm.status}
                                                onChange={e => setEditForm({...editForm, status: e.target.value})}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Sent to Supplier">Sent to Supplier</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-secondary/40 mb-1 block">Assign Supplier</label>
                                            <select 
                                                className="w-full h-10 border border-secondary/20 rounded-lg px-3 text-sm"
                                                value={editForm.supplierId}
                                                onChange={e => setEditForm({...editForm, supplierId: e.target.value})}
                                            >
                                                <option value="">Select Supplier</option>
                                                {suppliers.map(s => (
                                                    <option key={s._id} value={s._id}>{s.companyName || s.firstName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-secondary/40 mb-1 block">Admin Notes (Internal)</label>
                                        <textarea 
                                            className="w-full border border-secondary/20 rounded-lg p-3 text-sm"
                                            value={editForm.adminNotes}
                                            onChange={e => setEditForm({...editForm, adminNotes: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(c._id)} className="px-6 py-2 bg-accent text-white rounded-xl text-sm font-bold">Save Changes</button>
                                        <button onClick={() => setEditMode(null)} className="px-6 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-bold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="text-xs">
                                            <span className="text-secondary/40">Assigned To: </span>
                                            <span className="font-bold text-secondary">{c.supplierId?.companyName || "Unassigned"}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-secondary/40">Supplier Status: </span>
                                            <span className={`font-bold ${c.status === 'Completed' ? 'text-green-500' : 'text-blue-500'}`}>{c.status}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => { setEditMode(c._id); setEditForm({ status: c.status, supplierId: c.supplierId?._id || "", adminNotes: c.adminNotes || "" }); }}
                                        className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold hover:bg-accent transition-all"
                                    >
                                        Manage Claim
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
