import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function SupplierAddSupply() {
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [pricePerUnit, setPricePerUnit] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Load product list for dropdown
        axiosClient.get("/products")
            .then(res => setProducts(res.data || []))
            .catch(() => toast.error("Failed to load products"));
    }, []);

    async function handleSubmit() {
        if (!productId || !quantity || !pricePerUnit) {
            toast.error("Please fill all required fields!");
            return;
        }

        try {
            setLoading(true);
            await axiosClient.post("/inventory/add", {
                productId,
                quantity: Number(quantity),
                pricePerUnit: Number(pricePerUnit),
                notes,
            });
            toast.success("Supply request submitted! Waiting for approval.");
            navigate("/supplier/supplies");
        } catch (err) {
            const msg = err?.response?.data?.error || err.message;
            toast.error("Error: " + msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <h1 className="text-2xl font-extrabold text-secondary mb-1">Add Supply Request</h1>
            <p className="text-secondary/50 text-sm mb-8">Submit a new stock supply to the inventory manager</p>

            <div className="max-w-xl bg-white rounded-2xl shadow-sm border border-secondary/10 p-6 space-y-5">

                {/* Product Select */}
                <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Product *</label>
                    <select
                        value={productId}
                        onChange={e => setProductId(e.target.value)}
                        className="w-full h-11 border-2 border-secondary/20 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                    >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                            <option key={p.productid} value={p.productid}>
                                {p.name} ({p.productid})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Quantity *</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        placeholder="Ex: 50"
                        className="w-full h-11 border-2 border-secondary/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent text-secondary text-sm"
                    />
                </div>

                {/* Price Per Unit */}
                <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Price per Unit (Rs.) *</label>
                    <input
                        type="number"
                        min="0"
                        value={pricePerUnit}
                        onChange={e => setPricePerUnit(e.target.value)}
                        placeholder="Ex: 120000"
                        className="w-full h-11 border-2 border-secondary/20 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-accent text-secondary text-sm"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-bold text-secondary mb-2">Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any additional details..."
                        rows={3}
                        className="w-full border-2 border-secondary/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-secondary text-sm resize-none"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-12 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-60"
                >
                    {loading ? "Submitting..." : "Submit Supply Request"}
                </button>
            </div>
        </div>
    );
}
