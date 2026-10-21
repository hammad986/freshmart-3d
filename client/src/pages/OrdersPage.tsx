import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { Order } from "../types";

function statusClass(status: string) {
  return `badge status-${status.toLowerCase().replace(/ /g, "-")}`;
}
export { statusClass };

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api<{ orders: Order[] }>("/orders", {}, token).then((d) => setOrders(d.orders));
  }, [token]);

  if (orders.length === 0) {
    return (
      <div className="empty">
        <p className="empty-emoji">📦</p>
        <p>No orders yet.</p>
        <Link className="btn" to="/">Start shopping</Link>
      </div>
    );
  }

  return (
    <>
      <h1>My orders</h1>
      <div className="order-list">
        {orders.map((o) => (
          <Link className="order-row" to={`/orders/${o.id}`} key={o.id}>
            <div>
              <strong>Order #{o.id}</strong>
              <p className="meta">
                {new Date(o.created_at + "Z").toLocaleString()} · {o.item_count} item(s)
              </p>
            </div>
            <div className="order-row-right">
              <span className={statusClass(o.status)}>{o.status}</span>
              <span className="price">₹{o.total.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
