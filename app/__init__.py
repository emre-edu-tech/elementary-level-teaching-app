from flask import Flask

from app.db import close_db


def create_app():
    # templates/ and static/ live at the project root, not inside app/
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )
    app.config.from_object("app.config.Config")

    app.teardown_appcontext(close_db)

    from app.routes.pages import pages_bp
    from app.routes.api import api_bp

    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
