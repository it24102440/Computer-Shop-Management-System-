import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleRedirects = {
    admin: "/admin",
    supplier: "/supplier",
    inventoryManager: "/inventory",
    productManager: "/admin",
    customer: "/",
};

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-primary flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // Not logged in → go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role not allowed → redirect to their own dashboard
    if (!allowedRoles.includes(user.role)) {
        const redirectPath = roleRedirects[user.role] || "/";
        return <Navigate to={redirectPath} replace />;
    }

    // Authorized ✅
    return children;
}
