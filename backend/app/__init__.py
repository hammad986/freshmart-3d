import os

from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, static_folder=None)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    app.config["JWT_SECRET"] = os.environ.get("JWT_SECRET", "dev-jwt-secret-change-me")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///" + os.path.join(app.instance_path, "freshmart.db")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    os.makedirs(app.instance_path, exist_ok=True)
    db.init_app(app)

    from .auth import auth_bp
    from .routes.products import products_bp
    from .routes.cart import cart_bp
    from .routes.orders import orders_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(cart_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Not found."}), 404

    @app.errorhandler(500)
    def server_error(_):
        return jsonify({"error": "Something went wrong on our side."}), 500

    # Serve the built frontend (run `npm run build` inside client/ first).
    client_dist = os.path.join(os.path.dirname(app.root_path), "..", "client", "dist")
    if os.path.isdir(client_dist):

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def spa(path):
            full = os.path.join(client_dist, path)
            if path and os.path.isfile(full):
                return send_from_directory(client_dist, path)
            return send_from_directory(client_dist, "index.html")

    with app.app_context():
        db.create_all()
        from .seed_data import seed_if_empty

        seed_if_empty()

    return app
