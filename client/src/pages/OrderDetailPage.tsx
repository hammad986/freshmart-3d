import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { Order, OrderItem } from "../types";
import { statusClass } from "./OrdersPage";

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    api<{ order: Order; items: OrderItem[] }>(`/orders/${id}`, {}, token)
      .then((d) => {
        setOrder(d.order);
        setItems(d.items);
      })
      .catch(() => setOrder(null));
  }, [id, token]);

  if (!order) return <p className="loading">Loading…</p>;

  return (
    <>
      <div className="order-head">
        <h1>Order #{order.id}</h1>
        <span className={statusClass(order.status)}>{order.status}</span>
      </div>
      <p className="meta">Placed on {new Date(order.created_at + "Z").toLocaleString()}</p>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((i) => (
            <div className="cart-item" key={i.id}>
              <div className="cart-item-info">
                <h3>{i.name}</h3>
                <p className="meta">₹{i.price.toFixed(0)} × {i.quantity}</p>
              </div>
              <div className="line-total">₹{(i.price * i.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h2>Delivery</h2>
          <p>
            {order.full_name}<br />
            {order.address_line}<br />
            {order.city}, {order.state} - {order.pincode}<br />
            📞 {order.phone}
          </p>
          <p className="meta">
            Payment: {order.payment_method === "cod" ? "Cash on delivery" : "UPI on delivery"}
          </p>
          <div className="summary-row total"><span>Total</span><span>₹{order.total.toFixed(2)}</span></div>
        </aside>
      </div>
    </>
  );
}
