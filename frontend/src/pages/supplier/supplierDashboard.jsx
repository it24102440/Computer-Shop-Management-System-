import { Link } from "react-router-dom";

export default function SupplierDashboardHome() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="p-8">
            <h1 className="text-3xl font-extrabold text-secondary mb-1">Welcome, {user.firstName}! 👋</h1>
            <p className="text-secondary/50 mb-8">Supplier Dashboard</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Link
                    to="/supplier/add"
                    className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10 hover:shadow-md hover:scale-[1.02] transition-all"
                >
                    <p className="text-4xl mb-3">📦</p>
                    <h3 className="font-bold text-secondary text-xl mb-1">Add Supply</h3>
                    <p className="text-secondary/50 text-sm">Submit a new supply request for products</p>
                </Link>

                <Link
                    to="/supplier/supplies"
                    className="bg-white rounded-2xl p-6 shadow-sm border border-secondary/10 hover:shadow-md hover:scale-[1.02] transition-all"
                >
                    <p className="text-4xl mb-3">📋</p>
                    <h3 className="font-bold text-secondary text-xl mb-1">My Supplies</h3>
                    <p className="text-secondary/50 text-sm">View all your supply requests and their status</p>
                </Link>
            </div>
        </div>
    );
}
