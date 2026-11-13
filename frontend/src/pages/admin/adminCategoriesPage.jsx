import { useState, useEffect } from "react";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { FaPlus, FaTrash, FaTag, FaEdit } from "react-icons/fa";
import { confirmToast } from "../../utils/confirmToast";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editCatId, setEditCatId] = useState(null);
    const [newCat, setNewCat] = useState({ name: "", description: "", attributes: [""], brands: [""] });

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAICatDescription = async () => {
        if (!newCat.name) return toast.error("Enter name first!");
        setLoading(true);
        try {
            const res = await axiosClient.get(`/ai/category-description?name=${encodeURIComponent(newCat.name)}`);
            if (res.data.success) {
                setNewCat(prev => ({ ...prev, description: res.data.description }));
                toast.success("AI Description Crafted! ✨");
            }
        } catch (err) {
            toast.error("AI Generation failed.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get("/categories");
            setCategories(res.data);
        } catch (err) {
            toast.error("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...newCat,
                attributes: newCat.attributes.filter(a => a.trim()),
                brands: newCat.brands.filter(b => b.trim())
            };

            if (isEditing) {
                await axiosClient.put(`/categories/${editCatId}`, data);
                toast.success("Category updated!");
            } else {
                await axiosClient.post("/categories", data);
                toast.success("Category created!");
            }

            setNewCat({ name: "", description: "", attributes: [""], brands: [""] });
            setShowModal(false);
            setIsEditing(false);
            setEditCatId(null);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} category`);
        }
    };

    const handleEditClick = (cat) => {
        setNewCat({
            name: cat.name,
            description: cat.description || "",
            attributes: cat.attributes.length > 0 ? cat.attributes : [""],
            brands: cat.brands.length > 0 ? cat.brands : [""]
        });
        setEditCatId(cat._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await axiosClient.delete(`/categories/${id}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (err) {
            toast.error("Failed to delete category");
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-secondary uppercase tracking-tighter">Category Management</h2>

                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                >
                    <FaPlus /> Create Category
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Category Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Specs Template</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Available Brands</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {categories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-gray-50/30 transition-colors group">
                                        {/* Identity */}
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent text-lg">
                                                    <FaTag size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-secondary">{cat.name}</p>
                                                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-wider">{cat.slug}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="px-6 py-5">
                                            <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">
                                                {cat.description || "—"}
                                            </p>
                                        </td>

                                        {/* Specs */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1 max-w-[250px]">
                                                {(cat.attributes || []).length > 0 ? (
                                                    cat.attributes.map((attr, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-md border border-blue-100">
                                                            {attr}
                                                        </span>
                                                    ))
                                                ) : <span className="text-gray-300 text-[10px]">No template</span>}
                                            </div>
                                        </td>

                                        {/* Brands */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-1 max-w-[250px]">
                                                {(cat.brands || []).length > 0 ? (
                                                    cat.brands.map((brand, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase rounded-md border border-gray-200">
                                                            {brand}
                                                        </span>
                                                    ))
                                                ) : <span className="text-gray-300 text-[10px]">Generic</span>}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(cat)}
                                                    className="w-9 h-9 bg-secondary/5 text-secondary/40 rounded-xl flex items-center justify-center hover:bg-accent hover:text-white transition-all"
                                                    title="Edit Category"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
                                                    className="w-9 h-9 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                    title="Delete Category"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="text-4xl">📁</div>
                                                <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs">No categories established yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => {
                        setShowModal(false);
                        setIsEditing(false);
                    }} />
                    <div className="relative bg-[#f8fafc] border border-gray-100 p-10 rounded-[40px] w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-secondary uppercase tracking-tighter">
                                    {isEditing ? "Modify Category" : "Create New Category"}
                                </h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
                                    {isEditing ? `Updating ${newCat.name}` : "Establish a new product classification"}
                                </p>
                            </div>
                            <button onClick={() => {
                                setShowModal(false);
                                setIsEditing(false);
                            }} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left Side: Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newCat.name}
                                        onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-[20px] p-5 text-secondary font-bold focus:border-accent outline-none transition-all placeholder:text-gray-200 shadow-sm"
                                        placeholder="e.g. High-End Laptops"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center pr-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                                        <button
                                            type="button"
                                            onClick={handleAICatDescription}
                                            disabled={!newCat.name || loading}
                                            className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline disabled:opacity-30"
                                        >
                                            ✨ {loading ? "..." : "Generate AI"}
                                        </button>
                                    </div>
                                    <textarea
                                        value={newCat.description}
                                        onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-[24px] p-5 text-secondary focus:border-accent outline-none transition-all h-40 resize-none text-sm placeholder:text-gray-200 shadow-sm"
                                        placeholder="Briefly describe what belongs in this collection..."
                                    />
                                </div>

                            </div>

                            {/* Right Side: Attributes & Brands */}
                            <div className="space-y-8">
                                {/* Section: Features */}
                                <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-accent rounded-full" />
                                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Specs</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewCat(p => ({ ...p, attributes: [...p.attributes, ""] }))}
                                            className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline"
                                        >
                                            + Add Field
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                        {newCat.attributes.map((attr, i) => (
                                            <div key={i} className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                                                <input
                                                    value={attr}
                                                    onChange={(e) => {
                                                        const updated = [...newCat.attributes];
                                                        updated[i] = e.target.value;
                                                        setNewCat(p => ({ ...p, attributes: updated }));
                                                    }}
                                                    placeholder="e.g. GPU Type"
                                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-secondary text-xs focus:border-accent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewCat(p => ({ ...p, attributes: p.attributes.filter((_, idx) => idx !== i) }))}
                                                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Brands */}
                                <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-gray-200 rounded-full" />
                                            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest">Available Brands</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNewCat(p => ({ ...p, brands: [...p.brands, ""] }))}
                                            className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:underline hover:text-accent transition-all"
                                        >
                                            + Add Brand
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                        {newCat.brands.map((brand, i) => (
                                            <div key={i} className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                                                <input
                                                    value={brand}
                                                    onChange={(e) => {
                                                        const updated = [...newCat.brands];
                                                        updated[i] = e.target.value;
                                                        setNewCat(p => ({ ...p, brands: updated }));
                                                    }}
                                                    placeholder="e.g. ASUS ROG"
                                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-secondary text-xs focus:border-accent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewCat(p => ({ ...p, brands: p.brands.filter((_, idx) => idx !== i) }))}
                                                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Full Width Bottom Buttons */}
                                <div className="col-span-full flex justify-end gap-2 pt-6 border-t border-gray-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setIsEditing(false);
                                        }}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-400 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 bg-accent text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:scale-105 shadow-lg shadow-accent/20 active:scale-95 transition-all"
                                    >
                                        {isEditing ? "Update Category" : "Establish Category"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
