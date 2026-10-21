import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { AdminStats, Order, Product } from "../../types";
import { statusClass } from "../OrdersPage";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    api<{ stats: AdminStats; recent_orders: Order[]; low_stock: Product[] }>("/admin/stats", {}, token)
      .then((d) => {
        setStats(d.stats);
        setRecent(d.recent_orders);
        setLowStock(d.low_stock);
      });
  }, [token]);

  if (!stats) return <p className="loading">Loading…</p>;

  return (
    <>
      <div className="admin-head">
        <h1>Dashboard</h1>
        <div>
          <Link className="btn btn-small" to="/admin/products">Products</Link>{" "}
          <Link className="btn btn-small" to="/admin/orders">Orders</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat"><p className="stat-label">Revenue</p><p className="stat-value">₹{stats.revenue.toLocaleString("en-IN")}</p></div>
        <div className="stat"><p className="stat-label">Orders</p><p className="stat-value">{stats.orders}</p></div>
        <div className="stat"><p className="stat-label">Customers</p><p className="stat-value">{stats.customers}</p></div>
        <div className="stat"><p className="stat-label">Products</p><p className="stat-value">{stats.products}</p></div>
      </div>

      <div className="admin-cols">
        <section>
          <h2>Recent orders</h2>
          <table className="table">
            <thead><tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {recent.length === 0 && <tr><td colSpan={4} className="meta">No orders yet.</td></tr>}
              {recent.map((o) => (
                <tr key={o.id}>
                  <td><Link to={`/orders/${o.id}`}>#{o.id}</Link></td>
                  <td>{o.full_name}</td>
                  <td>₹{o.total.toFixed(2)}</td>
                  <td><span className={statusClass(o.status)}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2>Low stock</h2>
          <table className="table">
            <thead><tr><th>Product</th><th>Stock</th></tr></thead>
            <tbody>
              {lowStock.length === 0 && <tr><td colSpan={2} className="meta">Everything is well stocked.</td></tr>}
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/admin/products/${p.id}/edit`}>{p.emoji} {p.name}</Link></td>
                  <td>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
