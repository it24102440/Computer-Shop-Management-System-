import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

export default function BarcodePrintPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [count, setCount] = useState(40);
    const barcodeRefs = useRef([]);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    async function fetchProduct() {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/products/${id}`);
            const prod = res.data;
            setProduct(prod);
            // Default to stock but cap at 40 (one full A4) for better UX, or let them do more
            const defaultCount = Math.min(prod.stock, 40);
            setCount(defaultCount > 0 ? defaultCount : 1);
        } catch (err) {
            toast.error("Failed to load product for barcode");
            navigate("/admin/products");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (product && barcodeRefs.current.length > 0) {
            barcodeRefs.current.forEach((ref, i) => {
                if (ref && i < count) {
                    JsBarcode(ref, product.productid, {
                        format: "CODE128",
                        width: 1.5,
                        height: 40,
                        displayValue: false,
                        margin: 0
                    });
                }
            });
        }
    }, [product, count]);

    const handleCountChange = (e) => {
        const val = parseInt(e.target.value) || 0;
        if (val > product.stock) {
            toast.error(`Cannot exceed total stock (${product.stock})`);
            setCount(product.stock);
        } else {
            setCount(val);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-secondary animate-pulse">Syncing Inventory Data...</div>;
    if (!product) return null;

    return (
        <div className="bg-white min-h-screen">
            {/* Print Header (Hidden during print) */}
            <div className="bg-gray-100 p-4 flex justify-between items-center print:hidden border-b sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="font-bold text-lg text-secondary">Barcode Label Generator</h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">A4 Sheet | 5 Labels per Row</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Print Quantity:</label>
                        <input 
                            type="number" 
                            value={count}
                            onChange={handleCountChange}
                            max={product.stock}
                            min="1"
                            className="w-16 text-center font-black text-secondary focus:outline-none"
                        />
                        <span className="text-[10px] font-bold text-secondary/20 italic">Stock: {product.stock}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                    >
                        Back to Dashboard
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="px-8 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-xl shadow-secondary/20 hover:scale-105 transition-all"
                    >
                        🖨️ Print Labels
                    </button>
                </div>
            </div>

            {/* Labels Container (Simulated A4 Page) */}
            <div className="bg-secondary/5 py-10 print:bg-white print:py-0 min-h-screen">
                <div className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] print:shadow-none p-0 overflow-hidden">
                    <div className="grid grid-cols-5 gap-0">
                        {[...Array(count)].map((_, i) => (
                            <div 
                                key={i} 
                                className="border border-gray-100 p-3 flex flex-col items-center justify-center text-center overflow-hidden h-[36mm] w-full"
                            >
                                <p className="text-[10px] font-black uppercase leading-tight truncate w-full mb-1 text-black">
                                    {product.name}
                                </p>
                                <p className="text-[8px] font-bold text-gray-400 mb-1 tracking-tighter">
                                    SKU: {product.productid}
                                </p>
                                
                                <div className="flex items-center justify-center w-full overflow-hidden">
                                    <svg 
                                        ref={(el) => (barcodeRefs.current[i] = el)}
                                        className="w-full max-h-[35px]"
                                    ></svg>
                                </div>
                                
                                <p className="text-[11px] font-black mt-1 text-black">
                                    Rs. {product.price?.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .bg-secondary\\/5 {
                        background: white !important;
                        padding: 0 !important;
                    }
                }
                /* Hide scrollbar for a cleaner look */
                ::-webkit-scrollbar {
                    width: 0px;
                }
            `}</style>
        </div>
    );
}
