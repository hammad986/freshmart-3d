import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useCart } from "../cart";

export default function CheckoutPage() {
  const { user, token } = useAuth();
  const { items, total, refresh } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.name ?? "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    payment_method: "cod",
  });

  const set = (key: string) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  if (items.length === 0) {
    return (
      <div className="empty">
        <p className="empty-emoji">🛒</p>
        <p>Your cart is empty.</p>
        <Link className="btn" to="/">Start shopping</Link>
      </div>
    );
  }

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const data = await api<{ order_id: number }>("/orders", {
        method: "POST",
        body: JSON.stringify(form),
      }, token);
      await refresh();
      navigate(`/orders/${data.order_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place the order.");
      setPlacing(false);
    }
  };

  return (
    <>
      <h1>Checkout</h1>
      {error && <div className="flash flash-error">{error}</div>}
      <div className="cart-layout">
        <form className="form-card" onSubmit={placeOrder}>
          <h2>Delivery address</h2>
          <label>Full name<input required value={form.full_name} onChange={set("full_name")} /></label>
          <label>Phone<input required pattern="[0-9+ \-]{10,15}" placeholder="98765 43210" value={form.phone} onChange={set("phone")} /></label>
          <label>Address<textarea required rows={2} placeholder="Flat / street / landmark" value={form.address_line} onChange={set("address_line")} /></label>
          <div className="form-row">
            <label>City<input required value={form.city} onChange={set("city")} /></label>
            <label>State<input required value={form.state} onChange={set("state")} /></label>
            <label>PIN code<input required pattern="[0-9]{6}" placeholder="635804" value={form.pincode} onChange={set("pincode")} /></label>
          </div>
          <h2>Payment</h2>
          <label className="radio">
            <input type="radio" name="payment" value="cod" checked={form.payment_method === "cod"} onChange={set("payment_method")} />
            Cash on delivery
          </label>
          <label className="radio">
            <input type="radio" name="payment" value="upi" checked={form.payment_method === "upi"} onChange={set("payment_method")} />
            UPI (pay on delivery)
          </label>
          <button className="btn btn-large btn-block" type="submit" disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </button>
        </form>
        <aside className="summary">
          <h2>Your order</h2>
          {items.map((i) => (
            <div className="summary-row" key={i.id}>
              <span>{i.emoji} {i.name} × {i.quantity}</span>
              <span>₹{(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Delivery</span><span className="free">FREE</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </aside>
      </div>
    </>
  );
}
