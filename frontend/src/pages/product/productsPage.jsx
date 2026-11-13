import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";

const CATEGORIES = ["All", "Laptop", "Desktop", "Monitor", "Accessory", "Other"];
const BRANDS = ["All", "Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "Generic"];

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [brand, setBrand] = useState("All");
    const [sort, setSort] = useState("default");
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        axiosClient.get("/products")
            .then(res => setProducts(res.data || []))
            .catch(() => toast.error("Failed to load products"))
            .finally(() => setLoading(false));
    }, []);

    function handleLogout() {
        localStorage.clear();
        toast.success("Logged out!");
        navigate("/login");
    }

    function addToCart(e, product) {
        e.stopPropagation();
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(i => i._id === product._id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        toast.success(`${product.name} added to cart! 🛒`);
        navigate("/cart"); // Auto redirect to cart
    }

    // Filter + sort
    const filtered = products
        .filter(p => p.isvisible !== false)
        .filter(p => category === "All" || p.category === category)
        .filter(p => brand === "All" || p.brand === brand)
        .filter(p =>
            !search ||
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase()) ||
            p.brand?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sort === "price-asc") return a.price - b.price;
            if (sort === "price-desc") return b.price - a.price;
            if (sort === "name") return a.name?.localeCompare(b.name);
            return 0;
        });

    const cartCount = JSON.parse(localStorage.getItem("cart") || "[]").reduce((s, i) => s + i.qty, 0);

    return (
        <div className="min-h-screen bg-primary text-secondary">

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md shadow-lg px-8 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl">🖥️</span>
                    <span className="text-xl font-extrabold text-accent tracking-wide">TechShop</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-primary/90 font-medium">
                    <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                    <Link to="/products" className="text-accent font-bold">Products</Link>
                    <Link to="/my-orders" className="hover:text-accent transition-colors">My Orders</Link>
                </div>

                <div className="flex items-center gap-3">
                    {/* Cart */}
                    <Link to="/cart" className="relative p-2 text-primary/80 hover:text-accent transition-colors">
                        <span className="text-xl">🛒</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user.firstName ? (
                        <>
                            <Link to="/profile" className="text-primary/70 text-sm hidden md:flex items-center gap-1.5 hover:text-accent transition-colors">
                                <span className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-xs">
                                    {user.firstName[0].toUpperCase()}
                                </span>
                                <span>{user.firstName}</span>
                            </Link>
                            <button onClick={handleLogout} className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 text-sm font-semibold">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold">
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* ── Header ── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-secondary">All Products</h1>
                    <p className="text-secondary/50 mt-1">{filtered.length} products found</p>
                </div>

                {/* ── Search + Filters ── */}
                <div className="flex flex-col md:flex-row gap-3 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40">🔍</span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full h-11 pl-10 pr-4 border-2 border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                        />
                    </div>

                    {/* Category */}
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        className="h-11 px-4 border-2 border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                    >
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>

                    {/* Brand */}
                    <select value={brand} onChange={e => setBrand(e.target.value)}
                        className="h-11 px-4 border-2 border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                    >
                        {BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>

                    {/* Sort */}
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        className="h-11 px-4 border-2 border-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-white text-secondary text-sm"
                    >
                        <option value="default">Sort: Default</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="name">Name: A → Z</option>
                    </select>
                </div>

                {/* ── Category Chips ── */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${category === c
                                ? "bg-accent text-white shadow"
                                : "bg-white text-secondary/60 border border-secondary/10 hover:bg-accent/10"
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* ── Products Grid ── */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-secondary/40">
                        <p className="text-6xl mb-4">📦</p>
                        <p className="text-xl font-semibold">No products found</p>
                        <p className="text-sm mt-2">Try changing your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <div
                                key={product._id}
                                onClick={() => navigate(`/products/${product._id}`)}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer overflow-hidden border border-secondary/10 group"
                            >
                                {/* Image */}
                                <div className="h-48 bg-primary flex items-center justify-center overflow-hidden relative">
                                    {product.image?.[0] ? (
                                        <img
                                            src={product.image[0]}
                                            alt={product.name}
                                            className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform"
                                            onError={e => { e.target.src = ""; e.target.onerror = null; }}
                                        />
                                    ) : (
                                        <span className="text-7xl">💻</span>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <p className="text-xs text-accent font-semibold mb-1">{product.brand}</p>
                                    <h3 className="font-bold text-secondary text-sm line-clamp-2 mb-1">{product.name}</h3>
                                    <p className="text-secondary/40 text-xs mb-3 line-clamp-1">{product.category}</p>

                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-accent font-extrabold text-lg">Rs. {product.price?.toLocaleString()}</p>
                                            {product.labelledprice > product.price && (
                                                <p className="text-secondary/30 text-xs line-through">Rs. {product.labelledprice?.toLocaleString()}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={e => addToCart(e, product)}
                                            disabled={product.stock === 0}
                                            className="bg-accent text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            🛒 Add
                                        </button>
                                    </div>

                                    <p className={`text-xs font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                                        {product.stock > 0 ? `✅ In Stock (${product.stock})` : "❌ Out of Stock"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-secondary text-primary/60 py-8 text-center text-sm mt-16">
                <p>© 2025 <span className="text-accent font-semibold">TechShop</span>. All rights reserved.</p>
            </footer>
        </div>
    );
}
