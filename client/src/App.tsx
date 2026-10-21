import { FormEvent, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import { useCart } from "./cart";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";

function Protected({ children, admin }: { children: JSX.Element; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="loading">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !user.is_admin) return <Navigate to="/" replace />;
  return children;
}

function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/">🛒 FreshMart</Link>
        <form className="search" onSubmit={onSearch}>
          <input
            type="search"
            placeholder="Search for fruits, milk, snacks..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <nav className="header-nav">
          <Link to="/">Shop</Link>
          {user ? (
            <>
              <Link to="/orders">My Orders</Link>
              <Link className="cart-link" to="/cart">
                Cart{count > 0 && <span className="cart-badge">{count}</span>}
              </Link>
              {user.is_admin && <Link to="/admin">Admin</Link>}
              <span className="hello">Hi, {user.name.split(" ")[0]}</span>
              <button className="link-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="btn btn-small" to="/register">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<Protected><CartPage /></Protected>} />
          <Route path="/checkout" element={<Protected><CheckoutPage /></Protected>} />
          <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
          <Route path="/orders/:id" element={<Protected><OrderDetailPage /></Protected>} />
          <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
          <Route path="/admin/products" element={<Protected admin><AdminProducts /></Protected>} />
          <Route path="/admin/products/new" element={<Protected admin><AdminProductForm /></Protected>} />
          <Route path="/admin/products/:id/edit" element={<Protected admin><AdminProductForm /></Protected>} />
          <Route path="/admin/orders" element={<Protected admin><AdminOrders /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>🛒 FreshMart - fresh groceries in 3D. TypeScript + React + Three.js frontend, Python Flask API.</p>
        </div>
      </footer>
    </>
  );
}
