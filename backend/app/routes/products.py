from flask import Blueprint, jsonify, request

from ..models import Category, Product

products_bp = Blueprint("products", __name__)


@products_bp.get("/categories")
def categories():
    return jsonify({"categories": [c.to_dict() for c in Category.query.order_by(Category.name).all()]})


@products_bp.get("/products")
def products():
    q = request.args.get("q", "").strip()
    category_slug = request.args.get("category", "").strip()

    query = Product.query.filter_by(is_active=True)
    if q:
        query = query.filter(Product.name.ilike(f"%{q}%"))
    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)

    return jsonify({"products": [p.to_dict() for p in query.order_by(Product.name).all()]})


@products_bp.get("/products/<int:product_id>")
def product_detail(product_id):
    product = Product.query.filter_by(id=product_id, is_active=True).first_or_404()
    related = (
        Product.query.filter(
            Product.category_id == product.category_id,
            Product.id != product.id,
            Product.is_active.is_(True),
        )
        .limit(4)
        .all()
    )
    return jsonify({"product": product.to_dict(), "related": [p.to_dict() for p in related]})
