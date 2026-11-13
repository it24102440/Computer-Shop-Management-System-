import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { toast } from "react-hot-toast";
import { FaCloudUploadAlt, FaTimes, FaLayerGroup, FaPlus, FaCheckCircle } from "react-icons/fa";

export default function AdminAddProductModal({ isOpen, onClose, onSuccess }) {
    const [categories, setCategories] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const initialForm = {
        productid: "",
        name: "",
        description: "",
        altnames: "",
        price: "",
        labelledprice: "",
        category: "Other",
        brand: "",
        model: "",
        warranty: "No Warranty",
        stock: 0,
        supplier: "Unknown",
        isvisible: true,
    };

    const [form, setForm] = useState(initialForm);

    const [imageUrls, setImageUrls] = useState([]);
    const [attributes, setAttributes] = useState([{ name: "", value: "" }]);
    const [warrantyVal, setWarrantyVal] = useState("");
    const [warrantyUnit, setWarrantyUnit] = useState("Y");
    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setForm(initialForm);
            setImageUrls([]);
            setAttributes([{ name: "", value: "" }]);
            setWarrantyVal("");
            setWarrantyUnit("Y");

            axiosClient.get("/categories")
                .then(res => setCategories(res.data))
                .catch(err => console.error("Category fetch error", err));

            axiosClient.get("/suppliers")
                .then(res => setSuppliers(res.data))
                .catch(err => console.error("Supplier fetch error", err));
        }
    }, [isOpen]);

    const handleCategoryChange = (catName) => {
        const selectedCat = categories.find(c => c.name === catName);
        setForm(prev => ({
            ...prev,
            category: catName,
            brand: selectedCat?.brands?.[0] || ""
        }));

        if (selectedCat?.attributes) {
            setAttributes(selectedCat.attributes.map(attr => ({ name: attr, value: "" })));
        } else {
            setAttributes([{ name: "", value: "" }]);
        }
    };

    const handleAIDescription = async () => {
        if (!form.name) return toast.error("Enter product name first!");
        setSaving(true);
        try {
            const res = await axiosClient.get(`/ai/product-description?name=${encodeURIComponent(form.name)}`);
            if (res.data.success) {
                setForm(prev => ({ ...prev, description: res.data.description }));
                toast.success("AI Description Ready! ✨");
            }
        } catch (err) {
            toast.error("AI Generation failed. Check API Key.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        try {
            const uploaded = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append("image", file);
                const res = await axiosClient.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                uploaded.push(res.data.imageUrl);
            }
            setImageUrls(prev => [...prev, ...uploaded]);
            toast.success("Images uploaded!");
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleNameChange = (e) => {
        const val = e.target.value.slice(0, 50);
        setForm(prev => {
            const updated = { ...prev, name: val };
            // Auto generate SKU if it's empty or looks like a placeholder
            if (val.length > 2 && (!prev.productid || prev.productid.startsWith("PROD-TEMP"))) {
                const clean = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
                const rand = Math.floor(1000 + Math.random() * 9000);
                updated.productid = `PROD-${clean}-${rand}`;
            }
            return updated;
        });
    };

    const regenerateSKU = () => {
        const clean = (form.name || "ITEM").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
        const rand = Math.floor(1000 + Math.random() * 9000);
        setForm(prev => ({ ...prev, productid: `PROD-${clean}-${rand}` }));
    };

    const handleAddProduct = async () => {
        // Comprehensive Validation
        if (!form.name) return toast.error("Product Name is required");
        if (!form.productid) return toast.error("SKU Identification is required");
        if (!form.description) return toast.error("Description is required");
        if (!form.price) return toast.error("Actual Cost is required");
        if (!form.labelledprice) return toast.error("Retail Price is required");
        if (!form.category || form.category === "Other") return toast.error("Category is required");
        if (!form.brand) return toast.error("Brand is required");
        if (!form.stock && form.stock !== 0) return toast.error("Stock level is required");
        if (!form.supplier || form.supplier === "Unknown") return toast.error("Supplier is required");
        if (imageUrls.length === 0) return toast.error("At least one product image is required");

        // Validate specifications
        const invalidAttr = attributes.find(a => !a.name || !a.value);
        if (invalidAttr) return toast.error(`Please complete the specification: ${invalidAttr.name || "Unnamed field"}`);

        setSaving(true);
        try {
            const finalWarranty = (!warrantyVal || parseInt(warrantyVal) === 0) ? "No Warranty" : `${warrantyVal} ${warrantyUnit === "Y" ? "Year" : "Month"}${parseInt(warrantyVal) > 1 ? "s" : ""}`;

            await axiosClient.post("/products", {
                ...form,
                warranty: finalWarranty,
                altnames: form.altnames.split(",").map(n => n.trim()).filter(Boolean),
                price: Number(form.price),
                labelledprice: Number(form.labelledprice) || Number(form.price),
                stock: Number(form.stock),
                image: imageUrls.length > 0 ? imageUrls : ["/images/default.png"],
                attributes: attributes.filter(a => a.name && a.value),
            });
            toast.success("Product added! 🚀");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add product");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
            {/* Backdrop with extreme blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[12px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-[#f8fafc] w-full max-w-6xl h-full max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-500">

                {/* Header */}
                <div className="flex items-center justify-between px-10 py-6 border-b border-gray-100 bg-white/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                            <FaLayerGroup size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent/60">Inventory Manager</p>
                            <h2 className="text-2xl font-black text-secondary uppercase tracking-tighter">New Product Item</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Public</span>
                            <div className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${form.isvisible ? "bg-accent" : "bg-gray-300"}`}
                                onClick={() => setForm(p => ({ ...p, isvisible: !p.isvisible }))}>
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${form.isvisible ? "translate-x-5" : ""}`} />
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
                            <FaTimes size={20} />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Left Side: Forms */}
                        <div className="lg:col-span-7 space-y-8">

                            {/* Section: Essential Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-4 bg-accent rounded-full" />
                                    <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Product Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" value={form.name} onChange={handleNameChange}
                                            maxLength={50}
                                            placeholder="e.g. Minimalist Cashmere Overcoat"
                                            className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:border-accent outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center pr-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU Identification <span className="text-red-500">*</span></label>
                                            <button type="button" onClick={regenerateSKU} className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline">Regenerate</button>
                                        </div>
                                        <input
                                            type="text" value={form.productid} onChange={e => setForm(p => ({ ...p, productid: e.target.value.toUpperCase().slice(0, 15) }))}
                                            maxLength={15}
                                            placeholder="e.g. RA-MCO-1234"
                                            className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:border-accent outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description <span className="text-red-500">*</span></label>
                                        <button
                                            type="button"
                                            disabled={!form.name || saving}
                                            onClick={handleAIDescription}
                                            className="text-[9px] font-black text-accent uppercase tracking-widest flex items-center gap-1 hover:underline disabled:opacity-30 disabled:no-underline"
                                        >
                                            ✨ {saving ? "Generating..." : "Generate with AI"}
                                        </button>
                                    </div>
                                    <textarea
                                        value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Describe the silhouette, materials, and artisan techniques used..."
                                        className="w-full h-32 bg-white border border-gray-200 rounded-3xl px-5 py-4 text-sm focus:border-accent outline-none transition-all shadow-sm resize-none"
                                    />
                                </div>
                            </div>

                            {/* Section: Pricing & Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Actual Cost (LKR) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.price}
                                        onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm font-bold text-accent focus:border-accent outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Retail Price / MRP (LKR) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.labelledprice}
                                        onChange={e => setForm(p => ({ ...p, labelledprice: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm font-bold text-secondary focus:border-accent outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Minimal Profit/Loss Indicator */}
                            {form.labelledprice > 0 && (
                                <div className={`flex items-center gap-1.5 mt-1 ml-1 animate-in fade-in duration-300 ${form.labelledprice - form.price >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${form.labelledprice - form.price >= 0 ? "bg-green-500" : "bg-red-500"}`} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {form.labelledprice - form.price >= 0 ? "Profit" : "Loss"}:
                                        <span className="ml-1">Rs. {Math.abs(form.labelledprice - form.price).toLocaleString()}</span>
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Collection Category <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.category} onChange={e => handleCategoryChange(e.target.value)}
                                        className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:border-accent outline-none transition-all shadow-sm appearance-none font-bold text-secondary"
                                    >
                                        <option value="Other">Select Category</option>
                                        {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Available Brands <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                                        className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:border-accent outline-none transition-all shadow-sm appearance-none font-bold text-secondary"
                                    >
                                        <option value="">Select Brand</option>
                                        {categories.find(c => c.name === form.category)?.brands?.map(b => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Available Stock <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.stock}
                                        onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                                        placeholder="0"
                                        className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:border-accent outline-none transition-all shadow-sm font-bold text-secondary"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplier <span className="text-red-500">*</span></label>
                                    <select
                                        value={form.supplier}
                                        onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))}
                                        className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-sm focus:border-accent outline-none transition-all shadow-sm appearance-none font-bold text-secondary"
                                    >
                                        <option value="Unknown">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s.companyName}>{s.companyName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Warranty Period</label>
                                    <div className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:border-accent transition-all">
                                        <input
                                            type="number"
                                            min="0"
                                            value={warrantyVal}
                                            onChange={e => setWarrantyVal(e.target.value)}
                                            placeholder="0"
                                            className="flex-1 h-14 bg-transparent px-5 text-sm focus:outline-none font-bold text-secondary"
                                        />
                                        <div className="flex border-l border-gray-100">
                                            <select
                                                value={warrantyUnit}
                                                onChange={e => setWarrantyUnit(e.target.value)}
                                                className="h-14 bg-white px-4 text-[10px] font-black text-secondary outline-none cursor-pointer hover:bg-gray-50 transition-colors uppercase tracking-widest text-center"
                                            >
                                                <option value="M">M</option>
                                                <option value="Y">Y</option>
                                            </select>
                                        </div>
                                    </div>
                                    {parseInt(warrantyVal) === 0 && <p className="text-[9px] font-bold text-gray-400 mt-1 ml-1 uppercase tracking-widest">No Warranty</p>}
                                </div>
                            </div>

                            {/* Section: Specifications - Only show if category is selected */}
                            {form.category !== "Other" && form.category && (
                                <div className="bg-white/50 rounded-[32px] p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-accent rounded-full" />
                                            <h3 className="text-sm font-black text-secondary uppercase tracking-widest">Product Specifications</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {attributes.map((attr, i) => {
                                            const getUnit = (name) => {
                                                const n = name.toUpperCase();
                                                if (n.includes("RAM") || n.includes("ROM") || n.includes("STORAGE") || n.includes("SSD") || n.includes("HDD") || n.includes("MEMORY")) return "GB";
                                                if (n.includes("PROCESSOR") || n.includes("CPU") || n.includes("CLOCK") || n.includes("SPEED")) return "GHz";
                                                if (n.includes("DISPLAY") || n.includes("SCREEN") || n.includes("SIZE")) return "Inch";
                                                if (n.includes("WEIGHT")) return "kg";
                                                if (n.includes("VOLTAGE") || n.includes("POWER")) return "W";
                                                return null;
                                            };
                                            const unit = getUnit(attr.name);

                                            return (
                                                <div key={i} className="flex gap-3">
                                                    <input
                                                        value={attr.name}
                                                        readOnly
                                                        placeholder="Feature"
                                                        className="flex-1 h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-xs font-bold text-gray-400 outline-none cursor-not-allowed"
                                                    />
                                                    <div className="flex-[2] relative">
                                                        <input
                                                            value={unit ? attr.value.split(" ")[0].replace(/[^0-9.]/g, "") : attr.value}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const updated = [...attributes];
                                                                if (unit) {
                                                                    // Only allow digits for unit-based fields
                                                                    const raw = val.replace(/[^0-9.]/g, "");
                                                                    updated[i].value = raw ? `${raw} ${unit}` : "";
                                                                } else {
                                                                    // Allow full text for others (like VGA, Graphics, etc.)
                                                                    updated[i].value = val;
                                                                }
                                                                setAttributes(updated);
                                                            }}
                                                            placeholder={`Enter ${attr.name}...`}
                                                            className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 pr-12 text-xs focus:border-accent outline-none font-bold text-secondary"
                                                        />
                                                        {unit && (
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">
                                                                {unit}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Side: Imagery */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-0 space-y-6">
                                <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl min-h-[500px] flex flex-col border border-white/5">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                                            <FaCloudUploadAlt size={20} />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest">Product Imagery <span className="text-red-500">*</span></h3>
                                    </div>

                                    {/* Upload Area */}
                                    <label className={`flex-1 border-2 border-dashed border-accent/20 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-accent/5 transition-all group ${uploading ? "opacity-50" : ""}`}>
                                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <FaCloudUploadAlt size={30} className="text-accent" />
                                        </div>
                                        <p className="font-black text-sm uppercase tracking-tighter mb-1">Drop Images here</p>
                                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">or click to browse gallery (max 5)</p>
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>

                                    {/* Preview Grid */}
                                    {imageUrls.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 mt-6">
                                            {imageUrls.map((url, i) => (
                                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                                                    <img src={url} className="w-full h-full object-cover" />
                                                    <button onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-accent/20 text-accent rounded-lg flex items-center justify-center text-[10px] mt-0.5">ℹ️</div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-accent/60 mb-1">Upload Guidelines</p>
                                                <p className="text-[9px] text-white/30 leading-relaxed uppercase tracking-tighter">High-resolution JPG/PNG. 4:5 aspect ratio recommended. Max 5 images per product.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Action Buttons inside Modal */}
                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button onClick={onClose} className="px-8 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Discard</button>
                                    <button onClick={handleAddProduct} disabled={saving} className="px-10 py-3 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20">
                                        {saving ? "Processing..." : (
                                            <>Publish Product <FaPlus size={12} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
