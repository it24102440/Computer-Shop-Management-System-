import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function InvLedger() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get("/inventory/ledger")
            .then(res => setLogs(res.data || []))
            .catch(() => toast.error("Failed to load stock ledger"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-2xl font-extrabold text-secondary mb-1">🏦 Stock Movement Ledger</h1>
            <p className="text-secondary/50 text-sm mb-6">Complete history of stock IN / OUT movements</p>

            {loading ? (
                <div className="text-center py-16 text-secondary/30">⏳ Loading...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-16 text-secondary/30">No history found yet.</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-secondary/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary text-white">
                            <tr>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Product</th>
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4 text-center">Quantity</th>
                                <th className="px-6 py-4 text-right">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/5">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-primary transition-colors">
                                    <td className="px-6 py-4 text-secondary/50 text-xs">
                                        {new Date(log.date).toLocaleString("en-GB")}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-secondary">{log.productId}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold ${
                                            log.type === "IN" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                        }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-extrabold text-secondary">
                                        {log.type === "IN" ? "+" : "-"}{log.quantity}
                                    </td>
                                    <td className="px-6 py-4 text-right text-secondary/50 text-xs italic">
                                        {log.source}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
