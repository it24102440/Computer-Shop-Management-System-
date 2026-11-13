import { useState } from "react";
import { toast } from "react-hot-toast";

export default function OrderPage() {
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleAction = (action, order) => {
    if (action === "confirm") toast.success(`✓ Order ${order.id} confirmed & notification sent!`);
    if (action === "assign") toast.success(`🚗 Driver assigned to ${order.id}!`, {
      icon: '💜',
      style: { background: '#8b5cf6', color: '#fff' }
    });
    if (action === "cancel") toast.error(`✕ Order ${order.id} cancelled. Refund initiated.`);
    setShowModal(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
        padding: "0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .order-row:hover { background: rgba(255,255,255,0.06) !important; cursor: pointer; }
        .filter-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
        .filter-btn:hover { opacity: 0.9; }
        .action-btn { transition: all 0.18s ease; cursor: pointer; border: none; }
        .action-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        @keyframes slideIn { from { transform: translateY(-16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .notif { animation: slideIn 0.3s ease; }
        .modal-overlay { animation: fadeIn 0.2s ease; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "18px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
            Order Management
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Real-time delivery operations dashboard
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px #10b981",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Live</span>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              marginLeft: 12,
              cursor: "pointer",
            }}
            onClick={() => toast.success("📊 Report exported successfully!")}
          >
            Export Report
          </div>
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <StatCard label="Total Orders Today" value="47" sub="+12% vs yesterday" accent="#3b82f6" />
          <StatCard label="Active Deliveries" value="8" sub="3 drivers on road" accent="#8b5cf6" />
          <StatCard label="Avg Delivery Time" value="18m" sub="2m faster than avg" accent="#10b981" />
          <StatCard label="Revenue Today" value="$1,284" sub="↑ $210 from yesterday" accent="#f59e0b" />
          <StatCard label="Cancellations" value="2" sub="4.2% rate" accent="#ef4444" />
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Main Table */}
          <div style={{ flex: 1 }}>
            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap b" }}>
              {["all", "pending", "preparing", "delivering", "delivered", "cancelled"].map((f) => (
                <button
                  key={f}
                  className="filter-btn"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    background: filter === f ? "#3b82f6" : "rgba(255,255,255,0.07)",
                    color: filter === f ? "#fff" : "rgba(255,255,255,0.55)",
                    border: filter === f ? "none" : "1px solid rgba(255,255,255,0.1)",
                    textTransform: "capitalize",
                    letterSpacing: 0.3,
                  }}
                >
                  {f === "all" ? `All Orders (${orders.length})` : f}
                </button>
              ))}
            </div>

            {/* Table */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.4fr 0.8fr 0.9fr 0.7fr 0.7fr",
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                <span>Order ID</span>
                <span>Customer</span>
                <span>Total</span>
                <span>Status</span>
                <span>ETA</span>
                <span>Actions</span>
              </div>

              {/* Rows */}
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="order-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.4fr 0.8fr 0.9fr 0.7fr 0.7fr",
                    padding: "16px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    alignItems: "center",
                    transition: "background 0.15s ease",
                  }}
                  onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{order.id}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{order.time}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{order.customer}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.address}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{order.total}</div>
                  <div><StatusBadge status={order.status} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: order.status === "delivering" ? "#8b5cf6" : "rgba(255,255,255,0.5)" }}>
                    {order.eta}
                  </div>
                  <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 6 }}>
                    {order.status === "pending" && (
                      <button
                        className="action-btn"
                        onClick={() => handleAction("confirm", order)}
                        style={{ background: "#3b82f6", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700 }}
                      >
                        Confirm
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        className="action-btn"
                        onClick={() => handleAction("assign", order)}
                        style={{ background: "#8b5cf6", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700 }}
                      >
                        Assign
                      </button>
                    )}
                    {(order.status === "pending" || order.status === "preparing") && (
                      <button
                        className="action-btn"
                        onClick={() => handleAction("cancel", order)}
                        style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700 }}
                      >
                        Cancel
                      </button>
                    )}
                    {(order.status === "delivered" || order.status === "cancelled") && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Delivery Staff */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.5)", marginBottom: 14, textTransform: "uppercase" }}>
                Delivery Staff
              </h3>
              {drivers.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                        }}
                    >
                        {d.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: d.status === "available" ? "#10b981" : "#f59e0b" }}>
                        {d.status === "available" ? "Available" : `${d.orders} order${d.orders > 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </div>
                  {d.status === "available" && (
                    <button
                        className="action-btn"
                        style={{ background: "#3b82f6", color: "#fff", borderRadius: 8, border: "none", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}
                    >+</button>
                  )}
                </div>
              ))}
            </div>

            {/* Activity Feed */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 20,
                flex: 1,
              }}
            >
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.5)", marginBottom: 14, textTransform: "uppercase" }}>
                Activity Feed
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { user: "System", action: "Assigned J. Wick to #ORD-4293", time: "2m ago" },
                  { user: "John Carter", action: "Updated #ORD-4102 status", time: "12m ago" },
                  { user: "Admin", action: "Confirmed #ORD-4582", time: "24m ago" },
                ].map((a, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{a.user}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{a.action}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 24,
              padding: 32,
              width: 480,
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800 }}>
                  Order Details
                </h2>
                <div style={{ fontSize: 13, color: "#a78bfa", marginTop: 4, fontWeight: 700 }}>{selectedOrder.id}</div>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Customer", value: selectedOrder.customer },
                { label: "Total", value: selectedOrder.total },
                { label: "Address", value: selectedOrder.address },
                { label: "Driver", value: selectedOrder.driver || "Not assigned" },
                { label: "ETA", value: selectedOrder.eta },
                { label: "Placed", value: selectedOrder.time },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Items Ordered</div>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", padding: "4px 0", borderBottom: i < selectedOrder.items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  • {item}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {selectedOrder.status === "pending" && (
                <button
                  className="action-btn"
                  onClick={() => handleAction("confirm", selectedOrder)}
                  style={{ flex: 1, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14 }}
                >
                  ✓ Confirm Order
                </button>
              )}
              {selectedOrder.status === "preparing" && (
                <button
                  className="action-btn"
                  onClick={() => handleAction("assign", selectedOrder)}
                  style={{ flex: 1, background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14 }}
                >
                  🚗 Assign Driver
                </button>
              )}
              {(selectedOrder.status === "pending" || selectedOrder.status === "preparing") && (
                <button
                  className="action-btn"
                  onClick={() => handleAction("cancel", selectedOrder)}
                  style={{ flex: 1, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14 }}
                >
                  ✕ Cancel & Refund
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Components ──
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px 24px", minWidth: 200, flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent, margin: "6px 0" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", dot: "#f59e0b" },
    preparing: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6", dot: "#3b82f6" },
    delivering: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", dot: "#8b5cf6" },
    delivered: { bg: "rgba(16,185,129,0.12)", color: "#10b981", dot: "#10b981" },
    cancelled: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", dot: "#ef4444" },
  };
  const s = styles[status] || styles.pending;
  return (
    <div style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </div>
  );
}

// ── Mock Data ──
const orders = [
  { id: "#ORD-4923", customer: "Amara Silva", address: "Galle Road, Colombo", total: "Rs. 142,500", status: "preparing", time: "12m ago", eta: "8m", items: ["MacBook Air M2", "Magic Mouse"] },
  { id: "#ORD-4812", customer: "Kasun Perera", address: "Kandy Road, Kiribathgoda", total: "Rs. 45,900", status: "delivering", time: "24m ago", eta: "14m", driver: "John Wick", items: ["RTX 3060 TI", "8GB RAM"] },
  { id: "#ORD-4702", customer: "Janith Abey", address: "Pelawatta, Battaramulla", total: "Rs. 8,200", status: "pending", time: "45m ago", eta: "—", items: ["Logitech G502"] },
  { id: "#ORD-4581", customer: "Nimmi Fernando", address: "Dehiwala", total: "Rs. 192,000", status: "delivered", time: "1h ago", eta: "—", items: ["Alienware 27 Monitor"] },
  { id: "#ORD-4491", customer: "Dilshan K.", address: "Negombo", total: "Rs. 12,500", status: "cancelled", time: "2h ago", eta: "—", items: ["Redragon Keyboard"] },
];

const drivers = [
  { name: "John Wick", status: "busy", orders: 1 },
  { name: "Sarah Connor", status: "available", orders: 0 },
  { name: "Ethan Hunt", status: "busy", orders: 2 },
];
