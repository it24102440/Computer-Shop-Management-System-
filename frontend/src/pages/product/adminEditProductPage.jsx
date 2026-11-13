import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function AdminEditProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        productid: "", name: "", description: "", altnames: "",
        price: "", labelledprice: "", category: "Other",
        brand: "Generic", warranty: "No Warranty", model: "", stock: 0, isvisible: true,
    });
    const [imageUrls, setImageUrls] = useState([]);

    useEffect(() => {
        axiosClient.get(`/products/${id}`)
            .then(res => {
                const p = res.data;
                setForm({
                    productid: p.productid || "",
                    name: p.name || "",
                    description: p.description || "",
                    altnames: (p.altnames || []).join(", "),
                    price: p.price || "",
                    labelledprice: p.labelledprice || "",
                    category: p.category || "Other",
                    brand: p.brand || "Generic",
                    warranty: p.warranty || "No Warranty",
                    model: p.model || "",
                    stock: p.stock || 0,
                    isvisible: p.isvisible !== false,
                });
                setImageUrls(p.image || []);
            })
            .catch(() => toast.error("Failed to load product"))
            .finally(() => setLoading(false));
    }, [id]);

    function handleChange(e) {
        const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm(prev => ({ ...prev, [e.target.name]: val }));
    }

    async function handleImageUpload(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        try {
            const uploaded = [];
            for (const file of files) {
                const fd = new FormData();
                fd.append("image", file);
                const res = await axiosClient.post("/upload", fd, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                uploaded.push(res.data.imageUrl);
            }
            setImageUrls(prev => [...prev, ...uploaded]);
            toast.success(`${uploaded.length} image(s) uploaded!`);
        } catch (err) {
            toast.error("Upload failed: " + (err?.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    }

    async function handleSave() {
        if (!form.name || !form.price) {
            toast.error("Name and Price are required!");
            return;
        }
        try {
            setSaving(true);
            await axiosClient.put(`/products/${id}`, {
                ...form,
                altnames: form.altnames.split(",").map(s => s.trim()).filter(Boolean),
                price: Number(form.price),
                labelledprice: Number(form.labelledprice) || Number(form.price),
                stock: Number(form.stock),
                image: imageUrls,
            });
            toast.success("Product updated! ✅");
            navigate("/admin/products");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll-track p-8">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate("/admin/products")} className="text-secondary/50 hover:text-accent text-sm font-semibold">
                    ← Back
                </button>
                <h1 className="text-2xl font-extrabold text-secondary">Edit Product ✏️</h1>
            </div>

            <div className="max-w-3xl space-y-6">
                {/* Images */}
                <div className="bg-white rounded-2xl p-5 border border-secondary/10">
                    <p className="font-bold text-secondary mb-3">Product Images</p>
                    <label className={`flex items-center justify-center w-full h-12 border-2 border-dashed border-accent/40 rounded-xl cursor-pointer hover:bg-accent/5 transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                        <span className="text-sm font-semibold text-accent">
                            {uploading ? "⏳ Uploading..." : "📸 Upload more images"}
                        </span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                            {imageUrls.map((url, i) => (
                                <div key={i} className="relative group w-20 h-20">
                                    <img src={url} alt={`img-${i}`} className="w-full h-full object-cover rounded-xl border-2 border-secondary/10" />
                                    <button onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Fields */}
                <div className="bg-white rounded-2xl p-5 border border-secondary/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: "productid", label: "Product ID", disabled: true },
                            { name: "name", label: "Product Name *" },
                            { name: "model", label: "Model" },
                            { name: "warranty", label: "Warranty" },
                            { name: "altnames", label: "Alt Names (comma separated)", full: true },
                        ].map(f => (
                            <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                                <label className="block text-sm font-bold text-secondary mb-1">{f.label}</label>
                                <input name={f.name} value={form[f.name]} onChange={handleChange}
                                    disabled={f.disabled}
                                    className="w-full h-11 border-2 border-secondary/20 rounded-xl px-4 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:bg-secondary/5 disabled:text-secondary/40" />
                            </div>
                        ))}

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-secondary mb-1">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                                className="w-full border-2 border-secondary/20 rounded-xl px-4 py-3 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
                        </div>

                        {[
                            { name: "price", label: "Price (Rs.) *", type: "number" },
                            { name: "labelledprice", label: "Labelled Price (Rs.)", type: "number" },
                            { name: "stock", label: "Stock Qty", type: "number" },
                        ].map(f => (
                            <div key={f.name}>
                                <label className="block text-sm font-bold text-secondary mb-1">{f.label}</label>
                                <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                                    className="w-full h-11 border-2 border-secondary/20 rounded-xl px-4 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-bold text-secondary mb-1">Category</label>
                            <select name="category" value={form.category} onChange={handleChange}
                                className="w-full h-11 border-2 border-secondary/20 rounded-xl px-3 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white">
                                {["Laptop", "Desktop", "Monitor", "Accessory", "Other"].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-secondary mb-1">Brand</label>
                            <select name="brand" value={form.brand} onChange={handleChange}
                                className="w-full h-11 border-2 border-secondary/20 rounded-xl px-3 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white">
                                {["Generic", "Dell", "HP", "Lenovo", "Apple", "Asus", "Acer"].map(b => <option key={b}>{b}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-secondary mb-1">Visibility</label>
                            <select name="isvisible" value={form.isvisible} onChange={e => setForm(p => ({ ...p, isvisible: e.target.value === "true" }))}
                                className="w-full h-11 border-2 border-secondary/20 rounded-xl px-3 text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white">
                                <option value="true">Visible</option>
                                <option value="false">Hidden</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={saving}
                        className="px-8 h-12 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-60">
                        {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                    <button onClick={() => navigate("/admin/products")}
                        className="px-8 h-12 bg-secondary/10 text-secondary rounded-xl font-bold hover:bg-secondary/20 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
