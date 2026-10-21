import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { Product } from "../../types";

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  const load = () =>
    api<{ products: Product[] }>("/admin/products", {}, token).then((d) => setProducts(d.products));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await api(`/admin/products/${p.id}`, { method: "DELETE" }, token);
    load();
  };

  return (
    <>
      <div className="admin-head">
        <h1>Products ({products.length})</h1>
        <Link className="btn" to="/admin/products/new">+ New product</Link>
      </div>
      <table className="table">
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><span className="tile-dot" style={{ background: p.color }}>{p.emoji}</span></td>
              <td>{p.name}</td>
              <td>{p.category_name}</td>
              <td>₹{p.price.toFixed(0)}</td>
              <td>{p.stock}</td>
              <td>{p.is_active ? "Active" : "Hidden"}</td>
              <td className="row-actions">
                <Link className="btn btn-small" to={`/admin/products/${p.id}/edit`}>Edit</Link>
                <button className="btn btn-small btn-danger" onClick={() => remove(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
