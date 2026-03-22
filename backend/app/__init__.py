import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, migrate
from app.routes.auth import bp as auth_bp
from app.routes.clubs import bp as clubs_bp
from app.routes.events import bp as events_bp
from app.routes.gallery import bp as gallery_bp
from app.routes.gallery import register_upload_route
from app.routes.notifications import bp as notifications_bp
from app.routes.reports import bp as reports_bp
from app.routes.users import bp as users_bp


def create_app(config_class=Config):
    load_dotenv()
    backend_dir = Path(__file__).resolve().parent.parent
    load_dotenv(backend_dir / ".env")

    app = Flask(__name__, instance_path=str(backend_dir / "instance"))
    app.config.from_object(config_class)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(clubs_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(gallery_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(reports_bp)
    register_upload_route(app)

    @app.route("/api/health")
    def health():
        return {"status": "ok"}, 200

    with app.app_context():
        db.create_all()
        from app.seed import seed_if_empty

        seed_if_empty()

    return app
