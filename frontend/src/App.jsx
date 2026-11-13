import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Auth & Shared
// Auth & Shared
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import ProfilePage from "./pages/customer/profile";

// Role pages
import HomePage from "./pages/customer/home";                              // customer (public)
import ProductsPage from "./pages/product/productsPage";                  // all products
import ProductDetailPage from "./pages/product/productDetailPage";         // product detail
import BarcodePrintPage from "./pages/product/BarcodePrintPage";           // barcode print
import CartPage from "./pages/order/cartPage";                          // cart
import CheckoutPage from "./pages/order/checkoutPage";                  // checkout
import MyOrdersPage from "./pages/customer/myOrdersPage";                  // my orders
import InvoicePage from "./pages/order/invoicePage";                    // invoice
import MyPaymentHistoryPage from "./pages/payment/myPaymentHistoryPage";   // payment history
import MyWarrantyClaims from "./pages/customer/myWarrantyClaims";          // warranty claims
import OrderPage from "./pages/order/order";                            // customer
import AdminPage from "./pages/admin/admin";                            // admin
import SupplierDashboard from "./pages/supplier/supplier";                 // supplier
import InventoryManagerDashboard from "./pages/inventoryManager/index"; // inventoryManager

// Route guard
import ProtectedRoute from "./components/ProtectedRoute";



export default function App() {
  return (
    <div className="bg-primary text-secondary">
      <Toaster position="top-right" />
      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Customer (logged in - any role can view home) ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/print-barcode/:id" element={<BarcodePrintPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/invoice/:orderId" element={<InvoicePage />} />
        <Route path="/payment-history" element={<MyPaymentHistoryPage />} />
        <Route path="/my-warranty" element={<MyWarrantyClaims />} />
        <Route path="/order" element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <OrderPage />
          </ProtectedRoute>
        } />

        {/* ── Profile (all logged-in roles) ── */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={["admin", "supplier", "inventoryManager", "customer"]}>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* ── Admin Only ── */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={["admin", "productManager"]}>
            <AdminPage />
          </ProtectedRoute>
        } />

        {/* ── Supplier Only ── */}
        <Route path="/supplier/*" element={
          <ProtectedRoute allowedRoles={["supplier"]}>
            <SupplierDashboard />
          </ProtectedRoute>
        } />

        {/* ── Inventory Manager Only ── */}
        <Route path="/inventory/*" element={
          <ProtectedRoute allowedRoles={["inventoryManager"]}>
            <InventoryManagerDashboard />
          </ProtectedRoute>
        } />

      </Routes>
    </div>
  );
}
