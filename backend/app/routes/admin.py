from flask import Blueprint, jsonify, request

from .. import db
from ..auth import admin_required
from ..models import Category, Order, Product, User

admin_bp = Blueprint("admin", __name__)

ORDER_STATUSES = ["Placed", "Packed", "Out for delivery", "Delivered", "Cancelled"]
SHAPES = ["fruit", "vegetable", "bottle", "box", "bag", "loaf", "bar", "egg"]


@admin_bp.get("/stats")
@admin_required
def stats():
    revenue = db.session.query(db.func.coalesce(db.func.sum(Order.total), 0)).filter(
        Order.status != "Cancelled"
    ).scalar()
    recent_orders = Order.query.order_by(Order.created_at.desc(), Order.id.desc()).limit(8).all()
    low_stock = Product.query.filter(Product.stock < 10).order_by(Product.stock).limit(8).all()
    return jsonify({
        "stats": {
            "revenue": round(revenue, 2),
            "orders": Order.query.count(),
            "customers": User.query.filter_by(is_admin=False).count(),
            "products": Product.query.count(),
        },
        "recent_orders": [o.to_dict() for o in recent_orders],
        "low_stock": [p.to_dict() for p in low_stock],
    })


@admin_bp.get("/products")
@admin_required
def list_products():
    return jsonify({"products": [p.to_dict() for p in Product.query.order_by(Product.name).all()]})


def _read_product_body(data):
    name = str(data.get("name", "")).strip()
    if not name:
        return None, "Name is required."
    try:
        price = float(data.get("price", 0))
        stock = int(data.get("stock", 0))
        category_id = int(data.get("category_id"))
    except (TypeError, ValueError):
        return None, "Price, stock and category must be numbers."
    if price <= 0:
        return None, "Price must be positive."
    if stock < 0:
        return None, "Stock cannot be negative."
    if not db.session.get(Category, category_id):
        return None, "Unknown category."
    shape = str(data.get("shape", "box")).strip()
    if shape not in SHAPES:
        shape = "box"
    return {
        "name": name,
        "description": str(data.get("description", "")).strip(),
        "price": price,
        "stock": stock,
        "emoji": str(data.get("emoji", "🛍️")).strip() or "🛍️",
        "color": str(data.get("color", "#e8f5e9")).strip() or "#e8f5e9",
        "unit": str(data.get("unit", "1 pc")).strip() or "1 pc",
        "shape": shape,
        "is_active": bool(data.get("is_active", True)),
        "category_id": category_id,
    }, None


@admin_bp.post("/products")
@admin_required
def create_product():
    values, error = _read_product_body(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400
    product = Product(**values)
    db.session.add(product)
    db.session.commit()
    return jsonify({"product": product.to_dict()}), 201


@admin_bp.put("/products/<int:product_id>")
@admin_required
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    values, error = _read_product_body(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400
    for key, value in values.items():
        setattr(product, key, value)
    db.session.commit()
    return jsonify({"product": product.to_dict()})


@admin_bp.delete("/products/<int:product_id>")
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"ok": True})


@admin_bp.get("/orders")
@admin_required
def list_orders():
    orders = Order.query.order_by(Order.created_at.desc(), Order.id.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders], "statuses": ORDER_STATUSES})


@admin_bp.patch("/orders/<int:order_id>")
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    status = str((request.get_json(silent=True) or {}).get("status", ""))
    if status not in ORDER_STATUSES:
        return jsonify({"error": "Unknown status."}), 400
    order.status = status
    db.session.commit()
    return jsonify({"order": order.to_dict()})
