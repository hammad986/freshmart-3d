import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { Order } from "../../types";

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    api<{ orders: Order[]; statuses: string[] }>("/admin/orders", {}, token).then((d) => {
      setOrders(d.orders);
      setStatuses(d.statuses);
    });
  }, [token]);

  const setStatus = async (orderId: number, status: string) => {
    await api(`/admin/orders/${orderId}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
    setOrders((list) => list.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  return (
    <>
      <h1>Orders ({orders.length})</h1>
      <table className="table">
        <thead><tr><th>#</th><th>Customer</th><th>Placed</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.length === 0 && <tr><td colSpan={5} className="meta">No orders yet.</td></tr>}
          {orders.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/orders/${o.id}`}>#{o.id}</Link></td>
              <td>{o.full_name}<br /><span className="meta">{o.city}</span></td>
              <td className="meta">{new Date(o.created_at + "Z").toLocaleDateString()}</td>
              <td>₹{o.total.toFixed(2)}</td>
              <td>
                <select className="status-select" value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
