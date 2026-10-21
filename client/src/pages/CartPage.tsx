import { Link } from "react-router-dom";
import { useCart } from "../cart";

export default function CartPage() {
  const { items, total, update, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="empty">
        <p className="empty-emoji">🛒</p>
        <p>Your cart is empty.</p>
        <Link className="btn" to="/">Start shopping</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="tile tile-small" style={{ background: item.color }}>
                <span className="emoji">{item.emoji}</span>
              </div>
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="meta">₹{item.price.toFixed(0)} / {item.unit}</p>
                <button className="link-danger" onClick={() => remove(item.id)}>Remove</button>
              </div>
              <div className="stepper">
                <button
                  className="step"
                  onClick={() => (item.quantity > 1 ? update(item.id, item.quantity - 1) : remove(item.id))}
                >
                  −
                </button>
                <span className="qty">{item.quantity}</span>
                <button className="step" onClick={() => update(item.id, item.quantity + 1).catch((e) => alert(e.message))}>
                  +
                </button>
              </div>
              <div className="line-total">₹{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h2>Order summary</h2>
          <div className="summary-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span className="free">FREE</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <Link className="btn btn-large btn-block" to="/checkout">Proceed to checkout</Link>
        </aside>
      </div>
    </>
  );
}
