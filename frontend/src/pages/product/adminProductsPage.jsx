import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaChartBar, FaExchangeAlt, FaBarcode, FaFilePdf, FaBell, FaCheckDouble } from "react-icons/fa";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { confirmToast } from "../../utils/confirmToast";
import AdminAddProductModal from "../../components/AdminAddProductModal";
import AdminEditProductModal from "../../components/AdminEditProductModal";
import NotificationBell from "../../components/NotificationBell";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminProductsPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEditProduct, setSelectedEditProduct] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    useEffect(() => {
        fetchProducts();
    }, [page, search]); // Re-fetch on page or search change

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/products?page=${page}&limit=8&search=${search}`);
            setProducts(res.data.products);
            setTotalPages(res.data.pages);
            setTotalItems(res.data.total);
        } catch (error) {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        const loadingToast = toast.loading("Preparing Full Inventory Ledger...");
        try {
            // Fetch ALL products for export
            const res = await axiosClient.get(`/products?limit=1000`);
            const allProducts = res.data.products || [];

            if (allProducts.length === 0) {
                toast.error("No products found to export");
                toast.dismiss(loadingToast);
                return;
            }

            const doc = new jsPDF();

            // Header Section
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Product Details", 14, 25);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
            doc.text(`Total Items: ${allProducts.length}`, 160, 32);

            // Table Data Preparation
            const tableColumn = ["SKU", "Product Name", "Category", "Brand", "Supplier", "Cost", "Price", "Stock", "Status"];
            const tableRows = allProducts.map(p => {
                const stockStatus = Number(p.stock || 0) === 0 ? "Out of Stock" : Number(p.stock || 0) < 5 ? "Low Stock" : "Active";
                return [
                    p.productid || "-",
                    p.name || "Unnamed",
                    p.category || "Other",
                    p.brand || "-",
                    p.supplier || "-",
                    `Rs. ${Number(p.price || 0).toLocaleString()}`,
                    `Rs. ${Number(p.labelledprice || 0).toLocaleString()}`,
                    p.stock || 0,
                    stockStatus
                ];
            });

            // Draw Table
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    valign: 'middle'
                },
                didDrawPage: (data) => {
                    const str = `Page ${doc.internal.getNumberOfPages()}`;
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(str, 190, 285);
                }
            });

            doc.save(`Product_Ledger_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.dismiss(loadingToast);
            toast.success("Product Ledger Exported!");
        } catch (err) {
            console.error("PDF Export Error:", err);
            toast.dismiss(loadingToast);
            toast.error(`Export Failed: ${err.message || "Check Server"}`);
        }
    };

    async function handleDelete(id, name) {
        const confirmed = await confirmToast(`Delete "${name}"?`);
        if (!confirmed) return;
        try {
            setDeleting(id);
            await axiosClient.delete(`/products/${id}`);
            toast.success("Product deleted!");
            setProducts((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            toast.error("Delete failed!");
        } finally {
            setDeleting(null);
        }
    }

    const filtered = products.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-primary z-10 px-8 pt-8 pb-4 border-b border-secondary/10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-secondary">Products</h1>
                        <p className="text-secondary/50 text-sm">{totalItems} products total</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {/* Reusable Notification Bell */}
                        <NotificationBell />

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary/10 text-secondary rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <FaFilePdf className="text-red-500" /> Export Ledger
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-accent/20"
                        >
                            <FaPlus /> Add Product
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
                    <input
                        type="text"
                        placeholder="Search products by name, category, brand..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset to page 1 on search
                        }}
                        className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto hide-scroll-track px-8 py-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16 text-secondary/40">
                        <p className="text-5xl mb-3">📦</p>
                        <p className="font-medium">{search ? "No results found" : "No products yet"}</p>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-secondary/40 uppercase text-[10px] font-black tracking-[0.2em] border-b border-secondary/5">
                                    <th className="pb-4 pr-4">Collection Essence</th>
                                    <th className="pb-4 pr-4">Category</th>
                                    <th className="pb-4 pr-4">Price</th>
                                    <th className="pb-4 pr-4">Stock</th>
                                    <th className="pb-4 pr-4">Status</th>
                                    <th className="pb-4 pr-4">Created</th>
                                    <th className="pb-4 pr-4">Updated</th>
                                    <th className="pb-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary/5">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-blue-50/30 transition-colors group">
                                        {/* COLLECTION ESSENCE */}
                                        <td className="py-5 pr-4">
                                            <div
                                                className="flex items-center gap-4 cursor-pointer group/item"
                                                onClick={() => { setDetailProduct(product); setShowDetailModal(true); }}
                                            >
                                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                                                    {product.image?.[0] ? (
                                                        <img src={product.image[0]} className="w-full h-full object-cover" alt={product.name} />
                                                    ) : "📦"}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-secondary text-base tracking-tight leading-tight group-hover/item:text-accent transition-colors">{product.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{product.productid}</span>
                                                        <span className="text-secondary/30 text-[9px] font-bold uppercase tracking-widest">{product.model || product.brand || "E60477"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="py-5 pr-4">
                                            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                {product.category || "Other"}
                                            </span>
                                        </td>

                                        {/* PRICE */}
                                        <td className="py-5 pr-4">
                                            <span className="text-secondary/40 text-[10px] font-black mr-1">LKR</span>
                                            <span className="text-secondary font-black text-sm">{Number(product.price)?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </td>

                                        {/* STOCK */}
                                        <td className="py-5 pr-4">
                                            <span className="text-secondary font-bold text-sm">{product.stock}</span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-5 pr-4">
                                            {Number(product.stock) === 0 ? (
                                                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.1em]">Out of Stock</span>
                                            ) : Number(product.stock) < 5 ? (
                                                <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-[0.1em]">Low Stock</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.1em]">Active</span>
                                            )}
                                        </td>

                                        {/* CREATED */}
                                        <td className="py-5 pr-4">
                                            <span className="text-secondary/40 text-[11px] font-bold whitespace-nowrap">
                                                {new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </span>
                                        </td>

                                        {/* UPDATED */}
                                        <td className="py-5 pr-4">
                                            <span className="text-secondary/40 text-[11px] font-bold whitespace-nowrap">
                                                {new Date(product.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="py-5">
                                            <div className="flex items-center gap-4 text-gray-300">
                                                <button
                                                    onClick={() => {
                                                        setSelectedEditProduct(product);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="hover:text-blue-500 transition-colors"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id, product.name)}
                                                    disabled={deleting === product._id}
                                                    className="hover:text-red-500 transition-colors disabled:opacity-30"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Bar */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary/10">
                            <p className="text-secondary/40 text-xs font-bold uppercase tracking-widest">
                                Page <span className="text-secondary">{page}</span> of <span className="text-secondary">{totalPages}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-4 py-2 bg-white border border-secondary/10 rounded-xl text-xs font-black uppercase tracking-widest text-secondary hover:bg-secondary/5 disabled:opacity-30 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-4 py-2 bg-white border border-secondary/10 rounded-xl text-xs font-black uppercase tracking-widest text-secondary hover:bg-secondary/5 disabled:opacity-30 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Premium Add Product Modal */}
            <AdminAddProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setPage(1);
                    fetchProducts();
                }}
            />

            {/* Premium Edit Product Modal */}
            <AdminEditProductModal
                isOpen={showEditModal}
                product={selectedEditProduct}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedEditProduct(null);
                }}
                onSuccess={() => {
                    fetchProducts();
                }}
            />

            {/* PRODUCT DETAIL MODAL */}
            {showDetailModal && detailProduct && (
                <div className="fixed inset-0 bg-secondary/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 flex flex-col md:flex-row h-auto max-h-[90vh]">

                        {/* Close Button */}
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="absolute top-6 right-6 z-30 w-10 h-10 bg-secondary/5 hover:bg-secondary/10 rounded-full flex items-center justify-center text-secondary/40 hover:text-secondary transition-all"
                        >
                            ✕
                        </button>

                        {/* Left: Visual Section (Image & Basic Tags) */}
                        <div className="md:w-5/12 bg-secondary/5 p-10 flex flex-col items-center justify-center border-r border-secondary/5">
                            <div className="relative group w-full aspect-square max-w-[300px]">
                                <img
                                    src={detailProduct.image?.[0] || "/images/default.png"}
                                    alt={detailProduct.name}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-secondary/10 blur-2xl rounded-full"></div>
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                <span className="px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-full">{detailProduct.category}</span>
                                <span className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">{detailProduct.brand}</span>
                            </div>
                        </div>

                        {/* Right: Detailed Specification Form View */}
                        <div className="md:w-7/12 p-12 overflow-y-auto custom-scrollbar">
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.3em] mb-2">Product Specification</p>
                                <h2 className="text-4xl font-black text-secondary tracking-tight">{detailProduct.name}</h2>
                                <p className="text-secondary/40 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                                    SKU: {detailProduct.productid}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-secondary/5">
                                <div>
                                    <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-2">Current Pricing</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-secondary">Rs. {detailProduct.price?.toLocaleString()}</span>
                                        {detailProduct.labelledprice > detailProduct.price && (
                                            <span className="text-secondary/30 line-through text-sm font-bold">Rs. {detailProduct.labelledprice?.toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-2">Inventory Status</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-3xl font-black ${detailProduct.stock < 5 ? 'text-red-500' : 'text-secondary'}`}>{detailProduct.stock}</span>
                                        <span className="text-[10px] font-black text-secondary/30 uppercase tracking-widest">Units<br />Available</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Brand & Model Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 bg-secondary/5 rounded-3xl border border-secondary/5">
                                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-1">Manufacturer</p>
                                        <p className="text-base font-black text-secondary">{detailProduct.brand || "N/A"}</p>
                                    </div>
                                    <div className="p-5 bg-secondary/5 rounded-3xl border border-secondary/5">
                                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-1">Model Series</p>
                                        <p className="text-base font-black text-secondary">{detailProduct.model || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Warranty & Supplier */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 bg-secondary/5 rounded-3xl border border-secondary/5">
                                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-1">Warranty Period</p>
                                        <p className="text-base font-black text-secondary">{detailProduct.warranty || "No Warranty"}</p>
                                    </div>
                                    <div className="p-5 bg-secondary/5 rounded-3xl border border-secondary/5">
                                        <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-1">Source Supplier</p>
                                        <p className="text-base font-black text-secondary">{detailProduct.supplier || "Unknown"}</p>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div>
                                    <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest mb-3 ml-1">Technical Overview</p>
                                    <div className="p-6 bg-primary/30 rounded-3xl border border-secondary/5 text-sm text-secondary/60 font-medium leading-relaxed">
                                        {detailProduct.description || "Detailed technical specifications have not been provided for this item."}
                                    </div>
                                </div>

                                {/* System Logs */}
                                <div className="flex gap-4 p-5 bg-accent/5 rounded-3xl border border-accent/10">
                                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-lg">ℹ️</div>
                                    <div className="text-[10px] font-bold text-accent uppercase tracking-widest space-y-1">
                                        <p>Created: {new Date(detailProduct.createdAt).toLocaleString()}</p>
                                        <p>Last Activity: {new Date(detailProduct.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-12 flex justify-end gap-3">
                                <button
                                    onClick={() => navigate(`/print-barcode/${detailProduct.productid}`)}
                                    className="w-14 h-14 bg-primary text-secondary rounded-2xl border border-secondary/10 flex items-center justify-center hover:bg-white transition-all shadow-lg"
                                    title="Print Barcodes"
                                >
                                    <FaBarcode size={22} />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedEditProduct(detailProduct);
                                        setShowEditModal(true);
                                    }}
                                    className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center hover:bg-accent transition-all shadow-xl shadow-secondary/20"
                                    title="Update Product"
                                >
                                    <FaEdit size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleDelete(detailProduct._id, detailProduct.name);
                                    }}
                                    className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-100"
                                    title="Delete Product"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}