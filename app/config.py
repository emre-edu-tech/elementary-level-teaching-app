import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me")
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app.db")
    WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")
    WHISPER_COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
