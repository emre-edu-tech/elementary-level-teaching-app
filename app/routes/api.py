from flask import Blueprint

api_bp = Blueprint("api", __name__)

# /api/* routes (attempts, rounds, progress, check-speech) are defined in
# docs/04-api.md — built in M2/M5.
