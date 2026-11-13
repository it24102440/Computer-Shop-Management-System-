import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    function handleLogout() {
        localStorage.clear();
        toast.success("Logged out!");
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-primary">
            {/* Navbar */}
            <nav className="bg-secondary px-8 py-4 flex items-center justify-between shadow-lg">
                <span className="text-accent font-extrabold text-xl">🛒 Customer Dashboard</span>
                <div className="flex items-center gap-4">
                    <span className="text-primary/80 text-sm">👋 {user.firstName}</span>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 text-sm font-semibold">Logout</button>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-8">
                <h1 className="text-3xl font-bold text-secondary mb-2">Welcome, {user.firstName}! 🎉</h1>
                <p className="text-secondary/60 mb-8">Browse products, track orders, and manage your account.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "Shop Products", icon: "🛍️", path: "/", desc: "Browse our latest products" },
                        { label: "My Orders", icon: "📦", path: "/order", desc: "Track your orders" },
                        { label: "My Profile", icon: "👤", path: "/profile", desc: "Update your information" },
                    ].map((card) => (
                        <button
                            key={card.label}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all text-left border border-secondary/10"
                        >
                            <span className="text-4xl mb-3 block">{card.icon}</span>
                            <h3 className="font-bold text-secondary text-lg">{card.label}</h3>
                            <p className="text-secondary/50 text-sm mt-1">{card.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
