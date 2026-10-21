import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useCart } from "../cart";
import ProductViewer from "../three/ProductViewer";
import { Product } from "../types";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [notice, setNotice] = useState("");
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api<{ product: Product; related: Product[] }>(`/products/${id}`)
      .then((d) => {
        setProduct(d.product);
        setRelated(d.related);
      })
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) return <p className="loading">Loading…</p>;

  const addToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await add(product.id);
      setNotice(`Added ${product.name} to your cart.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not add to cart.");
    }
  };

  return (
    <>
      {notice && <div className="flash flash-success">{notice}</div>}
      <div className="product-page">
        <div className="viewer-wrap">
          <ProductViewer shape={product.shape} color={product.color} />
          <p className="meta center">Drag to spin the 3D model</p>
        </div>
        <div className="product-info">
          <p className="meta">{product.category_name}</p>
          <h1>{product.emoji} {product.name}</h1>
          <p className="unit">{product.unit}</p>
          <p className="price price-large">₹{product.price.toFixed(0)}</p>
          <p className="desc">{product.description}</p>
          {product.stock > 0 ? (
            <>
              <p className="stock-ok">In stock ({product.stock} available)</p>
              <button className="btn btn-large" onClick={addToCart}>Add to cart</button>
            </>
          ) : (
            <p className="badge out">Out of stock</p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <>
          <h2 className="section-title">You may also like</h2>
          <div className="grid">
            {related.map((p) => (
              <article className="card" key={p.id}>
                <Link className="tile" to={`/product/${p.id}`} style={{ background: p.color }}>
                  <span className="emoji">{p.emoji}</span>
                </Link>
                <div className="card-body">
                  <h3><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
                  <div className="card-foot">
                    <span className="price">₹{p.price.toFixed(0)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
