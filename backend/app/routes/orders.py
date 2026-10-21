from flask import Blueprint, g, jsonify, request

from .. import db
from ..auth import auth_required
from ..models import CartItem, Order, OrderItem

orders_bp = Blueprint("orders", __name__)


@orders_bp.post("/orders")
@auth_required
def place_order():
    data = request.get_json(silent=True) or {}
    full_name = str(data.get("full_name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    address_line = str(data.get("address_line", "")).strip()
    city = str(data.get("city", "")).strip()
    state = str(data.get("state", "")).strip()
    pincode = str(data.get("pincode", "")).strip()
    payment_method = "upi" if data.get("payment_method") == "upi" else "cod"

    if not all([full_name, phone, address_line, city, state, pincode]):
        return jsonify({"error": "Every delivery field is required."}), 400

    items = CartItem.query.filter_by(user_id=g.user.id).all()
    if not items:
        return jsonify({"error": "Your cart is empty."}), 400
    for item in items:
        if item.quantity > item.product.stock:
            return jsonify({"error": f"Not enough stock for {item.product.name}."}), 400

    total = round(sum(i.product.price * i.quantity for i in items), 2)
    order = Order(
        user_id=g.user.id, full_name=full_name, phone=phone,
        address_line=address_line, city=city, state=state, pincode=pincode,
        payment_method=payment_method, total=total,
    )
    db.session.add(order)
    db.session.flush()

    for item in items:
        db.session.add(OrderItem(
            order_id=order.id, product_id=item.product_id,
            name=item.product.name, price=item.product.price, quantity=item.quantity,
        ))
        item.product.stock -= item.quantity
        db.session.delete(item)

    db.session.commit()
    return jsonify({"order_id": order.id}), 201


@orders_bp.get("/orders")
@auth_required
def list_orders():
    orders = Order.query.filter_by(user_id=g.user.id).order_by(Order.created_at.desc(), Order.id.desc()).all()
    return jsonify({"orders": [o.to_dict() for o in orders]})


@orders_bp.get("/orders/<int:order_id>")
@auth_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    if order.user_id != g.user.id and not g.user.is_admin:
        return jsonify({"error": "Not found."}), 404
    return jsonify({"order": order.to_dict(), "items": [i.to_dict() for i in order.items]})
