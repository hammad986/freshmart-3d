import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useCart } from "../cart";
import HeroScene from "../three/HeroScene";
import { Category, Product } from "../types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notice, setNotice] = useState("");
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  const q = params.get("q") || "";
  const category = params.get("category") || "";

  useEffect(() => {
    api<{ categories: Category[] }>("/categories").then((d) => setCategories(d.categories));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    api<{ products: Product[] }>(`/products?${query}`).then((d) => setProducts(d.products));
  }, [q, category]);

  const addToCart = async (p: Product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await add(p.id);
      setNotice(`Added ${p.name} to your cart.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not add to cart.");
    }
    window.setTimeout(() => setNotice(""), 2500);
  };

  return (
    <>
      <section className="hero3d">
        <HeroScene />
        <div className="hero3d-text">
          <h1>Everything your kitchen needs</h1>
          <p>Fresh produce, dairy, snacks and household essentials - in interactive 3D.</p>
        </div>
      </section>

      {notice && <div className="flash flash-success">{notice}</div>}

      <nav className="chips">
        <Link className={`chip ${!category ? "active" : ""}`} to="/">All</Link>
        {categories.map((c) => (
          <Link key={c.id} className={`chip ${category === c.slug ? "active" : ""}`} to={`/?category=${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </nav>

      {q && <p className="result-note">{products.length} result(s) for “{q}”</p>}

      {products.length > 0 ? (
        <div className="grid">
          {products.map((p) => (
            <article className="card" key={p.id}>
              <Link className="tile" to={`/product/${p.id}`} style={{ background: p.color }}>
                <span className="emoji">{p.emoji}</span>
              </Link>
              <div className="card-body">
                <h3><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
                <p className="meta">{p.unit} · {p.category_name}</p>
                <div className="card-foot">
                  <span className="price">₹{p.price.toFixed(0)}</span>
                  {p.stock > 0 ? (
                    <button className="btn" onClick={() => addToCart(p)}>Add to cart</button>
                  ) : (
                    <span className="badge out">Out of stock</span>
                  )}
                </div>
                {p.stock > 0 && p.stock < 10 && <p className="low">Only {p.stock} left</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty">No products found. Try another search or category.</p>
      )}
    </>
  );
}
