import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../auth";
import { Category, Product } from "../../types";

const SHAPES = ["fruit", "vegetable", "bottle", "box", "bag", "loaf", "bar", "egg"];

const EMPTY = {
  name: "",
  description: "",
  price: "",
  stock: "",
  emoji: "🛍️",
  color: "#e8f5e9",
  unit: "1 pc",
  shape: "box",
  category_id: "",
  is_active: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ categories: Category[] }>("/categories").then((d) => {
      setCategories(d.categories);
      if (!isEdit && d.categories.length > 0) {
        setForm((f) => (f.category_id ? f : { ...f, category_id: String(d.categories[0].id) }));
      }
    });
    if (isEdit) {
      api<{ product: Product }>(`/products/${id}`).then((d) => {
        const p = d.product;
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          stock: String(p.stock),
          emoji: p.emoji,
          color: p.color,
          unit: p.unit,
          shape: p.shape,
          category_id: String(p.category_id),
          is_active: p.is_active,
        });
      });
    }
  }, [id, isEdit]);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = JSON.stringify({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    });
    try {
      if (isEdit) {
        await api(`/admin/products/${id}`, { method: "PUT", body }, token);
      } else {
        await api("/admin/products", { method: "POST", body }, token);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="form-card" style={{ maxWidth: 560 }} onSubmit={submit}>
        <h1>{isEdit ? "Edit product" : "New product"}</h1>
        {error && <div className="flash flash-error">{error}</div>}
        <label>Name<input required value={form.name} onChange={set("name")} /></label>
        <label>Description<textarea rows={3} value={form.description} onChange={set("description")} /></label>
        <div className="form-row">
          <label>Price (₹)<input type="number" step="0.01" min="0" required value={form.price} onChange={set("price")} /></label>
          <label>Stock<input type="number" min="0" required value={form.stock} onChange={set("stock")} /></label>
          <label>Unit<input value={form.unit} onChange={set("unit")} /></label>
        </div>
        <div className="form-row">
          <label>Emoji<input maxLength={4} value={form.emoji} onChange={set("emoji")} /></label>
          <label>3D model
            <select value={form.shape} onChange={set("shape")}>
              {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Tile color<input maxLength={7} value={form.color} onChange={set("color")} placeholder="#e8f5e9" /></label>
        </div>
        <label>Category
          <select value={form.category_id} onChange={set("category_id")}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="radio">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
          Visible in shop
        </label>
        <button className="btn btn-large btn-block" type="submit" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <p className="auth-alt"><Link to="/admin/products">← Back to products</Link></p>
      </form>
    </div>
  );
}
