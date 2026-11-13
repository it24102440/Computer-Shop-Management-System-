import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function InvLowStock() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [thresholds, setThresholds] = useState({
        Laptop: 5, Desktop: 10, Monitor: 8, Accessories: 20, Other: 5
    });

    // Modals state
    const [showModal, setShowModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reqForm, setReqForm] = useState({ supplierId: "", quantity: 1, notes: "" });
    const [submitting, setSubmitting] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch dynamic thresholds first
            const tRes = await axiosClient.get("/inventory/thresholds");
            if (tRes.data) setThresholds(tRes.data);

            // Fetch products (backend will filter based on thresholds)
            const pRes = await axiosClient.get("/products/low-stock");
            setProducts(pRes.data || []);

            // Fetch suppliers
            const sRes = await axiosClient.get("/suppliers");
            setSuppliers(sRes.data || []);
        } catch (err) {
            toast.error("Failed to sync inventory data");
        } finally {
            setLoading(false);
        }
    };

    async function handleAlert(productId, productName) {
        let toastId;
        try {
            toastId = toast.loading(`Sending alert for ${productName}...`);
            await axiosClient.post("/inventory/alert-low-stock", { productid: productId });
            toast.success(`Alert sent to Suppliers & Admins!`, { id: toastId });
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to send alert", { id: toastId });
        }
    }

    async function handleUpdateThresholds(e) {
        e.preventDefault();
        try {
            setSubmitting(true);
            await axiosClient.put("/inventory/thresholds", thresholds);
            toast.success("Stock limits updated successfully!");
            setShowSettings(false);
            fetchData(); // Refresh list with new limits
        } catch (err) {
            toast.error("Failed to update stock limits");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleRequestSubmit(e) {
        e.preventDefault();
        if (!reqForm.supplierId || !reqForm.quantity) {
            toast.error("Please fill all details");
            return;
        }
        try {
            setSubmitting(true);
            await axiosClient.post("/inventory/requests", {
                productId: selectedProduct.productid,
                ...reqForm
            });
            toast.success(`Stock request sent to supplier!`);
            setShowModal(false);
            setReqForm({ supplierId: "", quantity: 1, notes: "" });
        } catch (err) {
            toast.error("Failed to send request");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8 bg-secondary/5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-secondary mb-1">⚠️ Low Stock Alerts</h1>
                    <p className="text-secondary/50 text-sm">Monitor and trigger restocking alerts based on your custom limits.</p>
                </div>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-white text-secondary border border-secondary/10 rounded-xl text-sm font-bold hover:bg-secondary hover:text-white transition-all flex items-center gap-2 shadow-sm"
                >
                    ⚙️ Stock Settings
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-secondary/30"><div className="animate-spin text-4xl mb-4">🌀</div><p>Syncing product stock...</p></div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-secondary/10 shadow-sm border-dashed">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                    <p className="font-extrabold text-secondary text-lg">Inventory is Healthy</p>
                    <p className="text-secondary/50 text-sm max-w-xs mx-auto mt-2">No products are currently below your specified stock limits.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {products.map(p => (
                        <div key={p._id} className="bg-white rounded-2xl p-4 shadow-sm border border-secondary/5 hover:border-orange-200 transition-all flex items-center justify-between group">
                                <div 
                                    className="flex items-center gap-4 cursor-pointer flex-1"
                                    onClick={() => { setDetailProduct(p); setShowDetailModal(true); }}
                                >
                                    <div className="relative">
                                        <img
                                            src={p.image?.[0] || "/images/default.png"}
                                            alt={p.name}
                                            className="w-16 h-16 rounded-2xl object-cover bg-secondary/5 group-hover:scale-105 transition-transform"
                                            onError={e => { e.target.src = "/images/default.png"; }}
                                        />
                                        <div className="absolute -top-2 -right-2 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                                            Low Stock
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-secondary group-hover:text-accent transition-colors">{p.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="bg-secondary/5 text-secondary/70 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{p.category}</span>
                                            <span className="text-secondary/40 text-[10px]">ID: {p.productid}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-xl font-black text-orange-600 leading-none">{p.stock} <span className="text-[10px] font-medium text-secondary/40">UNITS LEFT</span></p>
                                            <div className="h-4 w-px bg-secondary/10"></div>
                                            <div>
                                                <p className="text-xs font-bold text-secondary/60 italic">Limit set at {thresholds[p.category] || thresholds.Other}</p>
                                                <p className="text-[9px] text-secondary/30 font-black uppercase mt-0.5">Alert Triggered: {new Date(p.updatedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAlert(p.productid, p.name)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    title="Send Alert Email"
                                >
                                    📩 Alert
                                </button>
                                <button
                                    onClick={() => { setSelectedProduct(p); setShowModal(true); }}
                                    className="px-5 py-3 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-accent transition-all shadow-md shadow-secondary/10"
                                >
                                    + Request Stock
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SETTINGS MODAL */}
            {showSettings && (
                <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowSettings(false)} className="text-secondary/30 hover:text-secondary">✕</button>
                        </div>
                        <h2 className="text-2xl font-black text-secondary mb-2">Inventory Limits</h2>
                        <p className="text-secondary/50 text-sm mb-8">Change when to show alerts for each category.</p>

                        <form onSubmit={handleUpdateThresholds} className="space-y-4">
                            {Object.entries(thresholds).map(([cat, val]) => (
                                <div key={cat} className="flex items-center justify-between p-4 bg-secondary/5 rounded-2xl">
                                    <label className="font-bold text-secondary">{cat}</label>
                                    <input
                                        type="number"
                                        value={val}
                                        onChange={e => setThresholds({ ...thresholds, [cat]: parseInt(e.target.value) || 0 })}
                                        className="w-20 bg-white border border-secondary/10 rounded-xl px-3 py-2 text-center font-black text-secondary"
                                        min="0"
                                    />
                                </div>
                            ))}
                            <button
                                disabled={submitting}
                                className="w-full py-4 bg-secondary text-white rounded-2xl font-bold text-lg hover:bg-accent transition-all shadow-lg shadow-secondary/20 mt-4"
                            >
                                {submitting ? "Updating..." : "Save Configuration"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* REQUEST MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowModal(false)} className="text-secondary/30 hover:text-secondary">✕</button>
                        </div>
                        <h2 className="text-2xl font-black text-secondary mb-2">Request Stock</h2>
                        <p className="text-secondary/50 text-sm mb-6">Create a formal request for <b>{selectedProduct?.name}</b></p>
                        
                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1.5 ml-1">Select Supplier</label>
                                <select 
                                    className="w-full bg-secondary/5 border border-transparent rounded-2xl px-4 py-4 text-secondary font-bold focus:border-secondary outline-none transition-all"
                                    value={reqForm.supplierId}
                                    onChange={e => setReqForm({...reqForm, supplierId: e.target.value})}
                                >
                                    <option value="">Choose a Supplier</option>
                                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName || `${s.firstName} ${s.lastName}`}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1.5 ml-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-secondary/5 border border-transparent rounded-2xl px-4 py-4 text-secondary font-bold focus:border-secondary outline-none transition-all"
                                        value={reqForm.quantity}
                                        onChange={e => setReqForm({...reqForm, quantity: e.target.value})}
                                        min="1"
                                    />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold text-secondary/30 italic mt-3">Current Stock: {selectedProduct?.stock}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1.5 ml-1">Notes (Optional)</label>
                                <textarea 
                                    className="w-full bg-secondary/5 border border-transparent rounded-2xl px-4 py-4 text-secondary font-bold focus:border-secondary outline-none transition-all h-24 resize-none"
                                    placeholder="Any special instructions..."
                                    value={reqForm.notes}
                                    onChange={e => setReqForm({...reqForm, notes: e.target.value})}
                                />
                            </div>

                            <button 
                                className="w-full py-4 bg-secondary text-white rounded-2xl font-bold text-lg hover:bg-accent transition-all shadow-lg shadow-secondary/20 mt-2"
                                disabled={submitting}
                            >
                                {submitting ? "Sending..." : "Confirm Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* PRODUCT DETAIL MODAL */}
            {showDetailModal && detailProduct && (
                <div className="fixed inset-0 bg-secondary/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
                        <div className="absolute top-8 right-8 z-10">
                            <button onClick={() => setShowDetailModal(false)} className="w-10 h-10 bg-secondary/5 hover:bg-secondary/10 rounded-full flex items-center justify-center text-secondary/40 hover:text-secondary transition-all">✕</button>
                        </div>

                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left: Image Carousel/Section */}
                            <div className="md:w-2/5 bg-secondary/5 p-8 flex items-center justify-center border-r border-secondary/5">
                                <div className="relative group w-full aspect-square">
                                    <img 
                                        src={detailProduct.image?.[0] || "/images/default.png"} 
                                        alt={detailProduct.name} 
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-secondary/10 blur-xl rounded-full"></div>
                                </div>
                            </div>

                            {/* Right: Info Section */}
                            <div className="md:w-3/5 p-10 overflow-y-auto max-h-[80vh]">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full">{detailProduct.category}</span>
                                    <span className="px-3 py-1 bg-secondary/5 text-secondary/40 text-[10px] font-black uppercase tracking-widest rounded-full">SKU: {detailProduct.productid}</span>
                                </div>

                                <h2 className="text-3xl font-black text-secondary mb-4 leading-tight">{detailProduct.name}</h2>
                                
                                <div className="flex items-baseline gap-3 mb-8">
                                    <span className="text-3xl font-black text-secondary">Rs. {detailProduct.price?.toLocaleString()}</span>
                                    {detailProduct.labelledprice > detailProduct.price && (
                                        <span className="text-secondary/30 line-through font-bold">Rs. {detailProduct.labelledprice?.toLocaleString()}</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Current Stock</p>
                                        <p className="text-2xl font-black text-orange-600">{detailProduct.stock} Units</p>
                                    </div>
                                    <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/5">
                                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-1">Brand</p>
                                        <p className="text-lg font-black text-secondary">{detailProduct.brand}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-2 ml-1">Description</p>
                                        <p className="text-sm text-secondary/60 leading-relaxed font-medium bg-primary/20 p-4 rounded-2xl border border-secondary/5">
                                            {detailProduct.description || "No description available for this product."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-1 ml-1">Model</p>
                                            <p className="text-sm font-bold text-secondary">{detailProduct.model || "Standard"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-1 ml-1">Warranty</p>
                                            <p className="text-sm font-bold text-secondary">{detailProduct.warranty || "No Warranty"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button 
                                        onClick={() => { setShowDetailModal(false); setSelectedProduct(detailProduct); setShowModal(true); }}
                                        className="flex-1 py-4 bg-secondary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent hover:scale-[1.02] transition-all shadow-xl shadow-secondary/20"
                                    >
                                        Request Restock
                                    </button>
                                    <button 
                                        onClick={() => handleAlert(detailProduct.productid, detailProduct.name)}
                                        className="px-6 py-4 bg-primary text-secondary rounded-2xl font-black uppercase tracking-widest text-xs border border-secondary/10 hover:bg-white transition-all"
                                    >
                                        📩 Alert
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
