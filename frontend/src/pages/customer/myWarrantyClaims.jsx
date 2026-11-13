import { useEffect, useState } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function MyWarrantyClaims() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get("/warranty")
            .then(res => setClaims(res.data || []))
            .catch(() => toast.error("Failed to load claims"))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Approved": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Repairing": case "Replaced": return "bg-orange-100 text-orange-700 border-orange-200";
            case "Completed": return "bg-green-100 text-green-700 border-green-200";
            case "Rejected": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-secondary/10 text-secondary border-secondary/20";
        }
    };

    return (
        <div className="min-h-screen bg-primary">
            <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent">TechShop</span>
                </Link>
                <Link to="/my-orders" className="text-primary/80 hover:text-accent text-sm font-semibold transition-colors">
                    ← Back to Orders
                </Link>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-extrabold text-secondary mb-2">My Warranty Claims 🛡️</h1>
                <p className="text-secondary/50 mb-8">Track status of your product repairs and replacements</p>

                {loading ? (
                    <div className="text-center py-20 text-secondary/30 text-4xl animate-pulse">⏳</div>
                ) : claims.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-secondary/10">
                        <p className="text-7xl mb-4">🏠</p>
                        <p className="text-xl font-semibold mb-2">No claims submitted yet</p>
                        <Link to="/my-orders" className="text-accent font-bold hover:underline">View your orders to start a claim</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map(c => (
                            <div key={c._id} className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                            <span className="text-secondary/30 text-xs">#{c._id.slice(-6)}</span>
                                        </div>
                                        <h3 className="text-lg font-extrabold text-secondary">{c.productId}</h3>
                                        <p className="text-xs text-secondary/40">Claim Type: <span className="text-accent font-bold uppercase">{c.claimType}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-secondary/30 uppercase">Submitted On</p>
                                        <p className="text-sm font-bold text-secondary">{new Date(c.submissionDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="bg-primary/50 p-4 rounded-xl border border-secondary/5 mb-4">
                                    <p className="text-[10px] font-bold text-secondary/30 uppercase mb-1">Issue Reported</p>
                                    <p className="text-sm text-secondary italic">"{c.issueDescription}"</p>
                                </div>

                                {c.supplierNotes && (
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
                                        <span className="text-lg">💬</span>
                                        <div>
                                            <p className="text-[10px] font-bold text-orange-700 uppercase mb-1">Supplier Note</p>
                                            <p className="text-sm text-orange-800 font-medium">"{c.supplierNotes}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
