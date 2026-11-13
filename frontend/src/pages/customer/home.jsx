import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../axiosClient";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
    FaShippingFast, FaHeadset, FaAward, FaFacebook, FaTwitter,
    FaInstagram, FaLinkedin, FaArrowRight, FaSearch, FaShoppingCart, FaUser, FaStar
} from "react-icons/fa";

const categories = [
    { name: "Laptops", icon: "💻", slug: "laptops", color: "from-blue-500/20" },
    { name: "Desktops", icon: "🖥️", slug: "desktops", color: "from-purple-500/20" },
    { name: "Components", icon: "⚙️", slug: "components", color: "from-orange-500/20" },
    { name: "Peripherals", icon: "🖱️", slug: "peripherals", color: "from-green-500/20" },
    { name: "Storage", icon: "💾", slug: "storage", color: "from-red-500/20" },
    { name: "Networking", icon: "🌐", slug: "networking", color: "from-cyan-500/20" },
];

const brands = ["HP", "Dell", "ASUS", "MSI", "Lenovo", "Acer", "Samsung"];

const features = [
    {
        icon: <FaShippingFast className="text-4xl text-accent" />,
        title: "Fast Shipping",
        desc: "Get your tech delivered to your doorstep within 24-48 hours islandwide."
    },
    {
        icon: <FaHeadset className="text-4xl text-accent" />,
        title: "Expert Support",
        desc: "Our tech experts are available 24/7 to help you choose the right gear."
    },
    {
        icon: <FaAward className="text-4xl text-accent" />,
        title: "Official Warranty",
        desc: "All products come with 1-Year official manufacturer warranty."
    }
];

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    async function fetchProducts() {
        try {
            const res = await axiosClient.get("/products");
            setProducts(res.data.products.slice(0, 8)); // show highlights
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#fcfcfd] font-outfit text-secondary overflow-x-hidden selection:bg-accent/30">

            {/* ───── STICKY NAVIGATION ───── */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12 py-5 flex items-center justify-between ${scrolled ? "bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] py-4" : "bg-transparent"
                }`}>
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-accent p-2 rounded-xl shadow-lg rotate-3 group-hover:rotate-0 transition-all duration-500 scale-110 group-hover:bg-secondary">
                        <span className="text-2xl text-white">🖥️</span>
                    </div>
                    <span className={`text-2xl font-black tracking-tighter ml-1 ${scrolled ? "text-secondary" : "text-white"}`}>
                        Tech<span className="text-accent">Shop</span>
                    </span>
                </Link>

                <div className={`hidden lg:flex items-center gap-10 font-bold text-xs uppercase tracking-[0.2em] ${scrolled ? "text-secondary/70" : "text-white/80"
                    }`}>
                    <Link to="/" className="hover:text-accent transition-all relative group py-2">
                        Home
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                    </Link>
                    <Link to="/products" className="hover:text-accent transition-all relative group py-2">
                        Products
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                    </Link>
                    <Link to="/my-orders" className="hover:text-accent transition-all relative group py-2">
                        My Orders
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                    </Link>
                </div>

                <div className="flex items-center gap-5">
                    <button className={`${scrolled ? "text-secondary" : "text-white"} hover:text-accent transition-all p-2 hover:bg-white/10 rounded-full`}>
                        <FaSearch className="text-xl" />
                    </button>
                    {user ? (
                        <div className="flex items-center gap-5">
                            <Link to="/cart" className={`relative p-2.5 rounded-full ${scrolled ? "text-secondary hover:bg-secondary/5" : "text-white hover:bg-white/10"} transition-all`}>
                                <FaShoppingCart className="text-xl" />
                                <span className="absolute top-1 right-1 bg-accent text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black border-2 border-primary">2</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-3 group px-1 py-1 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:border-accent transition-all">
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-accent transition-transform group-hover:scale-110">
                                    {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent flex items-center justify-center text-white"><FaUser size={12} /></div>}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-widest hidden md:block ${scrolled ? "text-secondary" : "text-white"}`}>
                                    {user.firstName || "Account"}
                                </span>
                            </Link>
                            <button onClick={logout} className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className={`px-4 py-2 font-black text-xs uppercase tracking-widest transition-all ${scrolled ? "text-secondary hover:text-accent" : "text-white hover:text-white/60"}`}>
                                Log In
                            </Link>
                            <Link to="/register" className="px-6 py-3 bg-white text-secondary rounded-xl hover:bg-accent hover:text-white transition-all text-xs font-black uppercase tracking-tighter shadow-2xl hover:-translate-y-1 active:scale-95">
                                Start Journey
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* ───── STUNNING HERO SECTION ───── */}
            <section className="relative h-screen min-h-[800px] flex items-center flex-col justify-center overflow-hidden bg-secondary">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 z-0">
                    <img src="/hero.png" className="w-full h-full object-cover opacity-30 mix-blend-overlay animate-slowZoom" />

                    {/* Animated Glows */}
                    <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full animate-float" />

                    <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/80 to-secondary" />
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/80 font-bold text-[10px] uppercase tracking-[0.4em] mb-10 animate-fadeInUp">
                        <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
                        Forged for Elite Performance
                    </div>

                    <h1 className="text-7xl md:text-[140px] font-black leading-[0.85] mb-8 animate-fadeInUp delay-100 tracking-tighter text-white">
                        UNLEASH THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-indigo-400">POSSIBILITY.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/50 mb-12 animate-fadeInUp delay-200 leading-relaxed font-medium">
                        Welcome to TechShop — the home of premium rigs, precision gear, and the next generation of computing excellence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fadeInUp delay-300">
                        <Link to="/products" className="group px-12 py-5 bg-accent text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all hover:scale-105 shadow-[0_20px_50px_-10px_rgba(2,169,247,0.5)] flex items-center gap-4">
                            BUILD YOUR SETUP <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link to="/products" className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black text-lg hover:bg-white/10 transition-all active:scale-95">
                            VIEW SPECIALS
                        </Link>
                    </div>
                </div>

                {/* Bottom Stats Floating Bar */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-12 px-12 py-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl animate-fadeInUp delay-500">
                    <div className="text-center border-r border-white/10 pr-12">
                        <p className="text-3xl font-black text-accent tracking-tighter">15k+</p>
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-1">Premium Gear</p>
                    </div>
                    <div className="text-center border-r border-white/10 pr-12">
                        <p className="text-3xl font-black text-white tracking-tighter">5.0</p>
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-1">Global Rating</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-white tracking-tighter">24/7</p>
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-1">Expert Support</p>
                    </div>
                </div>
            </section>

            {/* ───── FEATURES SECTION (CARD-STYLE) ───── */}
            <section className="py-24 relative z-20 -mt-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feat, idx) => (
                            <div key={idx} className="group p-10 rounded-[40px] bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-3">
                                <div className="mb-8 p-5 inline-block bg-accent/5 rounded-3xl group-hover:bg-accent transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110">
                                    <div className="group-hover:text-white transition-colors">
                                        {feat.icon}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black mb-5 text-secondary tracking-tight">{feat.title}</h3>
                                <p className="text-secondary/50 font-medium leading-relaxed text-sm">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── PREMIUM CATEGORIES ───── */}
            <section className="py-24 bg-primary overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20">
                        <div className="max-w-2xl">
                            <span className="text-accent font-black text-xs uppercase tracking-[0.4em] italic mb-4 block">Our Collections</span>
                            <h2 className="text-5xl md:text-7xl font-black text-secondary leading-none tracking-tighter">
                                CHOOSE <span className="italic font-light">YOUR</span> <br />
                                <span className="text-accent">LEGACY GEAR.</span>
                            </h2>
                        </div>
                        <div className="mt-8 lg:mt-0 flex gap-4">
                            <div className="w-16 h-1 w-16 bg-accent rounded-full" />
                            <p className="max-w-xs text-secondary/40 font-bold text-sm">Finest selection of hardware curated for stability and high frame rates.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat, idx) => (
                            <Link to={`/products?category=${cat.slug}`} key={idx} className={`group relative h-48 rounded-[36px] bg-white border border-slate-100 p-8 flex flex-col justify-end overflow-hidden hover:bg-secondary transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/30`}>
                                {/* Background Gradient Hover */}
                                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <span className="text-5xl translate-y-4 group-hover:-translate-y-12 transition-all duration-500 z-10">{cat.icon}</span>
                                <span className="text-xs font-black text-secondary group-hover:text-white transition-colors duration-500 uppercase tracking-widest z-10 group-hover:translate-x-2">{cat.name}</span>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <FaArrowRight className="text-accent" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ───── FEATURED GRID (GLASSMOPHISM) ───── */}
            <section className="py-32 bg-secondary relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary to-transparent opacity-10" />
                <div className="absolute -bottom-48 -right-48 w-[800px] h-[800px] bg-accent/10 blur-[200px] rounded-full" />

                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-20">
                        <div>
                            <span className="text-accent font-black text-xs uppercase tracking-[0.4em] italic mb-4 block">New Drops</span>
                            <h2 className="text-5xl font-black text-white tracking-tighter">FEATURED <span className="text-accent italic">HARDWARE.</span></h2>
                        </div>
                        <Link to="/products" className="mt-8 md:mt-0 px-8 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl text-xs font-black tracking-widest hover:bg-accent hover:border-accent transition-all uppercase">
                            View All Products
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-14 h-14 border-[5px] border-accent border-t-transparent rounded-full animate-spin" />
                            <p className="mt-8 font-black text-white/20 uppercase tracking-[0.5em] text-[10px] animate-pulse">Initializing Components</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((item) => (
                                <ProductCard key={item._id} product={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ───── MODERN NEWSLETTER BOX ───── */}
            <section className="py-32 bg-primary">
                <div className="container mx-auto px-6">
                    <div className="relative group p-12 md:p-24 rounded-[70px] bg-secondary overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.5)]">
                        {/* Ambient Lights */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-colors duration-700" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="text-center lg:text-left">
                                <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] mb-6">
                                    GET FIRST DIBS <br />
                                    ON <span className="text-accent">NEW RELEASES.</span>
                                </h2>
                                <p className="text-white/40 font-medium text-lg leading-relaxed max-w-sm mx-auto lg:mx-0">
                                    Join our monthly newsletter and be the first to know about GPU restocks.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-3xl p-3 rounded-[32px] w-full max-w-xl flex flex-col sm:flex-row items-center border border-white/10 focus-within:border-accent/50 transition-all p-4 shadow-2xl">
                                <input
                                    type="email"
                                    placeholder="your.email@techshop.lk"
                                    className="flex-1 bg-transparent px-6 py-5 outline-none text-white font-bold placeholder:text-white/20 text-lg"
                                />
                                <button className="w-full sm:w-auto px-12 py-5 bg-accent text-white rounded-2xl font-black text-lg hover:bg-white hover:text-secondary transition-all shadow-2xl hover:shadow-accent/40 active:scale-95">
                                    JOIN US
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── MINIMAL FOOTER ───── */}
            <footer className="bg-white pt-32 pb-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
                        <div>
                            <Link to="/" className="flex items-center gap-3 mb-10">
                                <div className="bg-secondary p-1.5 rounded-lg shadow-xl">
                                    <span className="text-2xl text-white">🖥️</span>
                                </div>
                                <span className="text-2xl font-black text-secondary tracking-tighter">Tech<span className="text-accent">Shop</span></span>
                            </Link>
                            <p className="text-secondary/50 font-medium leading-relaxed text-sm pr-6">
                                The ultimate destination for high-performance computer hardware in Sri Lanka.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-black text-secondary/30 mb-8 uppercase tracking-[0.3em] text-[11px] italic">Quick Menu</h4>
                            <ul className="space-y-4 text-secondary/60 font-bold text-sm">
                                {categories.slice(0, 4).map(c => <li key={c.name}><Link to={`/products?category=${c.slug}`} className="hover:text-accent transition-all">{c.name}</Link></li>)}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-secondary/30 mb-8 uppercase tracking-[0.3em] text-[11px] italic">Legal info</h4>
                            <ul className="space-y-4 text-secondary/60 font-bold text-sm">
                                <li><a href="#" className="hover:text-accent">Terms</a></li>
                                <li><a href="#" className="hover:text-accent">Privacy</a></li>
                                <li><a href="#" className="hover:text-accent">Warranty Policy</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-secondary/30 mb-8 uppercase tracking-[0.3em] text-[11px] italic">Socials</h4>
                            <div className="flex gap-4">
                                {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, idx) => (
                                    <a key={idx} href="#" className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary/60 hover:bg-accent hover:text-white transition-all text-xl">
                                        <Icon />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-slate-100 text-center">
                        <p className="text-secondary/20 font-black text-[10px] uppercase tracking-[0.5em]">© 2025 TechShop Inc. All Rights Reserved. Stay Ahead.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ───── PREMIUM GLASS PRODUCT CARD ─────
function ProductCard({ product }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/products/${product._id}`)}
            className="group relative h-[480px] bg-white/5 backdrop-blur-xl rounded-[45px] p-3 border border-white/10 hover:bg-white/10 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] transition-all duration-700 cursor-pointer overflow-hidden flex flex-col hover:border-white/20 active:scale-[0.98]"
        >
            {/* Ambient Shadow Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Image Box */}
            <div className="relative h-60 w-full rounded-[36px] overflow-hidden bg-white/5 flex items-center justify-center p-10 group-hover:p-8 transition-all duration-700">
                <div className="absolute inset-0 bg-white/5 opacity-40 backdrop-blur-md" />

                {product.image?.[0] ? (
                    <img
                        src={product.image[0]}
                        alt={product.name}
                        className="relative z-10 h-full w-full object-contain group-hover:scale-110 drop-shadow-2xl transition-transform duration-700"
                    />
                ) : (
                    <span className="relative z-10 text-8xl select-none group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">🖥️</span>
                )}

                {/* Stock Badges */}
                <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                    {product.stock <= 5 && product.stock > 0 && (
                        <div className="px-3 py-1 bg-red-500 text-white text-[9px] font-black italic rounded-full shadow-lg animate-pulse">LIMITED STOCK</div>
                    )}
                    {!product.stock && (
                        <div className="px-3 py-1 bg-secondary text-white text-[9px] font-black italic rounded-full shadow-lg">OUT OF STOCK</div>
                    )}
                </div>
            </div>

            {/* Info Body */}
            <div className="p-7 pt-9 flex flex-col flex-1 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] font-bold italic">{product.category || "General"}</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        <FaStar className="text-yellow-400 text-[10px]" />
                        <span className="text-white font-black text-[10px]">4.9</span>
                    </div>
                </div>

                <h3 className="text-lg font-black text-white leading-tight mb-6 group-hover:text-accent transition-colors line-clamp-2 min-h-12 tracking-tight">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Elite Price</p>
                        <p className="text-2xl font-black text-white tracking-tighter">
                            Rs. {product.price?.toLocaleString()}
                        </p>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Reserved: ${product.name}`);
                        }}
                        className="w-14 h-14 bg-accent text-white rounded-[22px] flex items-center justify-center shadow-2xl shadow-accent/40 hover:bg-white hover:text-secondary group/btn transition-all active:scale-90"
                    >
                        <FaShoppingCart className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
