from flask import Blueprint, g, jsonify, request

from .. import db
from ..auth import auth_required
from ..models import CartItem, Product

cart_bp = Blueprint("cart", __name__)


def cart_payload(user_id):
    items = CartItem.query.filter_by(user_id=user_id).order_by(CartItem.id).all()
    total = round(sum(i.product.price * i.quantity for i in items), 2)
    return {"items": [i.to_dict() for i in items], "total": total}


@cart_bp.get("/cart")
@auth_required
def get_cart():
    return jsonify(cart_payload(g.user.id))


@cart_bp.post("/cart")
@auth_required
def add_to_cart():
    data = request.get_json(silent=True) or {}
    product = Product.query.filter_by(id=data.get("product_id"), is_active=True).first()
    if not product:
        return jsonify({"error": "Product not found."}), 404
    if product.stock < 1:
        return jsonify({"error": f"{product.name} is out of stock."}), 400

    item = CartItem.query.filter_by(user_id=g.user.id, product_id=product.id).first()
    if item:
        if item.quantity >= product.stock:
            return jsonify({"error": f"Only {product.stock} in stock."}), 400
        item.quantity += 1
    else:
        db.session.add(CartItem(user_id=g.user.id, product_id=product.id, quantity=1))
    db.session.commit()
    return jsonify(cart_payload(g.user.id))


@cart_bp.patch("/cart/<int:item_id>")
@auth_required
def update_cart_item(item_id):
    item = CartItem.query.filter_by(id=item_id, user_id=g.user.id).first()
    if not item:
        return jsonify({"error": "Cart item not found."}), 404

    data = request.get_json(silent=True) or {}
    try:
        quantity = int(data.get("quantity"))
    except (TypeError, ValueError):
        return jsonify({"error": "Quantity must be a number."}), 400

    if quantity < 1:
        db.session.delete(item)
    else:
        if quantity > item.product.stock:
            return jsonify({"error": f"Only {item.product.stock} in stock."}), 400
        item.quantity = quantity
    db.session.commit()
    return jsonify(cart_payload(g.user.id))


@cart_bp.delete("/cart/<int:item_id>")
@auth_required
def remove_cart_item(item_id):
    CartItem.query.filter_by(id=item_id, user_id=g.user.id).delete()
    db.session.commit()
    return jsonify(cart_payload(g.user.id))
