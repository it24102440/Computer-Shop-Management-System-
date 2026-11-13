import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(stored);
    }, []);

    function saveCart(updated) {
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
    }

    function updateQty(id, delta) {
        const updated = cart.map(item =>
            item._id === id
                ? { ...item, qty: Math.max(1, Math.min(item.qty + delta, item.stock)) }
                : item
        );
        saveCart(updated);
    }

    function removeItem(id) {
        saveCart(cart.filter(item => item._id !== id));
        toast.success("Item removed from cart");
    }

    function clearCart() {
        saveCart([]);
        toast.success("Cart cleared");
    }

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 0 ? 500 : 0;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-primary">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent">TechShop</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/products" className="text-primary/80 hover:text-accent text-sm font-medium">← Continue Shopping</Link>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-3xl font-extrabold text-secondary mb-8">🛒 Your Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-24 text-secondary/30">
                        <p className="text-7xl mb-4">🛒</p>
                        <p className="text-xl font-semibold mb-2">Your cart is empty</p>
                        <Link to="/products" className="mt-4 inline-block px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                            Shop Now →
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* ── Cart Items ── */}
                        <div className="flex-1 space-y-4">
                            {cart.map(item => (
                                <div key={item._id} className="group bg-white rounded-2xl p-5 shadow-sm border border-secondary/10 flex gap-5 items-center hover:border-accent/40 transition-all">
                                    {/* Image */}
                                    <div className="w-24 h-24 bg-primary rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2 relative">
                                        {item.image?.[0] ? (
                                            <img src={item.image[0]} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                                onError={e => { e.target.style.display = "none"; }} />
                                        ) : (
                                            <span className="text-4xl opacity-20">💻</span>
                                        )}
                                        {item.stock < 5 && (
                                            <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-black italic px-1.5 py-0.5 rounded-full animate-pulse">
                                                ONLY {item.stock} LEFT
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-black text-secondary text-base leading-tight line-clamp-2">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-secondary/30 bg-secondary/5 px-2 py-0.5 rounded-md">{item.brand}</span>
                                                    <span className="text-[10px] font-black uppercase text-accent/60 bg-accent/5 px-2 py-0.5 rounded-md">{item.category}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => removeItem(item._id)}
                                                className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-xs">
                                                ✕
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-1 border-2 border-secondary/5 rounded-xl p-1 bg-secondary/5">
                                                <button onClick={() => updateQty(item._id, -1)}
                                                    className="w-8 h-8 rounded-lg bg-white shadow-sm hover:bg-accent hover:text-white font-bold transition-all flex items-center justify-center text-sm">
                                                    −
                                                </button>
                                                <span className="w-10 text-center font-black text-secondary text-sm">{item.qty}</span>
                                                <button onClick={() => updateQty(item._id, 1)}
                                                    className="w-8 h-8 rounded-lg bg-white shadow-sm hover:bg-accent hover:text-white font-bold transition-all flex items-center justify-center text-sm">
                                                    +
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-secondary/30 uppercase leading-none mb-1">Subtotal</p>
                                                <p className="font-black text-secondary text-lg">Rs. {(item.price * item.qty).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-2">
                                <Link to="/products" className="text-secondary/40 hover:text-accent text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                    ← Keep Browsing
                                </Link>
                                <button onClick={clearCart} className="text-secondary/20 hover:text-red-500 text-xs font-black uppercase tracking-widest transition-all">
                                    🗑 Clear Entire Cart
                                </button>
                            </div>
                        </div>

                        {/* ── Order Summary ── */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-secondary/5 border border-secondary/10 sticky top-24">
                                <h2 className="text-sm font-black text-secondary/30 uppercase tracking-widest mb-6">Checkout Summary</h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-secondary/40">Subtotal ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                                        <span className="text-sm font-black text-secondary">Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-secondary/40">Delivery Service</span>
                                        <span className="text-sm font-black text-green-600">Rs. {shipping.toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="pt-4 mt-4 border-t-2 border-dashed border-secondary/10">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-accent uppercase leading-none mb-1">Total Payable</p>
                                                <p className="text-2xl font-black text-secondary leading-none">Rs.{total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/checkout")}
                                    className="w-full mt-8 h-14 bg-secondary text-white rounded-2xl font-black text-sm hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 group"
                                >
                                    Proceed to Checkout
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>

                                <p className="text-center mt-5 text-[10px] font-bold text-secondary/30 px-2 line-clamp-2">
                                    * Taxes and discounts will be calculated during the next step.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
