from functools import wraps

import jwt
from flask import Blueprint, current_app, g, jsonify, request

from . import db
from .models import User

auth_bp = Blueprint("auth", __name__)


def sign_token(user):
    return jwt.encode(
        {"sub": user.id, "name": user.name, "email": user.email, "is_admin": user.is_admin},
        current_app.config["JWT_SECRET"],
        algorithm="HS256",
    )


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:] if header.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Login required."}), 401
        try:
            payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
        except jwt.PyJWTError:
            return jsonify({"error": "Session expired, please log in again."}), 401
        user = db.session.get(User, payload["sub"])
        if not user:
            return jsonify({"error": "Account not found."}), 401
        g.user = user
        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    @auth_required
    def wrapper(*args, **kwargs):
        if not g.user.is_admin:
            return jsonify({"error": "Admin access required."}), 403
        return fn(*args, **kwargs)

    return wrapper


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required."}), 400
    if "@" not in email:
        return jsonify({"error": "Enter a valid email address."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"token": sign_token(user), "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401
    return jsonify({"token": sign_token(user), "user": user.to_dict()})


@auth_bp.get("/me")
@auth_required
def me():
    return jsonify({"user": g.user.to_dict()})
