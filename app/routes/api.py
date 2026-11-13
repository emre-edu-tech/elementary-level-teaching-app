from flask import Blueprint, jsonify, request, session

from app.db import get_db

api_bp = Blueprint("api", __name__)

# Valid activity ids (docs/03) with their Turkish titles (docs/06) / icons.
ACTIVITIES = {
    "numbers_count": {"title": "Nesneleri Say", "emoji": "🔢"},
    "numbers_next": {"title": "Sırada Hangi Sayı Var?", "emoji": "➡️"},
    "numbers_find": {"title": "Sayıyı Bul", "emoji": "🔍"},
    "numbers_tens": {"title": "Onar Onar Sayalım", "emoji": "🧮"},
    "voice_numbers": {"title": "Sayıyı Söyle", "emoji": "🎤"},
    "letters_meet": {"title": "Harfleri Tanıyalım", "emoji": "🔤"},
    "letters_find": {"title": "Harfi Bul", "emoji": "🔎"},
    "voice_letters": {"title": "Sesli Harfler", "emoji": "🎙️"},
}

NO_PROFILE_ERROR = {"error": "Önce profilini seç"}


def require_profile():
    """Return (profile_id, None) or (None, (json, status)) when no profile."""
    profile_id = session.get("profile_id")
    if profile_id is None:
        return None, (jsonify(NO_PROFILE_ERROR), 401)
    return profile_id, None


def _bad_request():
    return jsonify({"error": "Geçersiz istek"}), 400


@api_bp.post("/attempts")
def post_attempt():
    profile_id, err = require_profile()
    if err:
        return err

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return _bad_request()

    activity = data.get("activity")
    item = data.get("item")
    correct = data.get("correct")
    via_voice = data.get("via_voice", False)

    if (
        activity not in ACTIVITIES
        or not isinstance(item, str)
        or not 1 <= len(item) <= 20
        or not isinstance(correct, bool)
        or not isinstance(via_voice, bool)
    ):
        return _bad_request()

    db = get_db()
    db.execute(
        "INSERT INTO attempts (profile_id, activity, item, correct, via_voice)"
        " VALUES (?, ?, ?, ?, ?)",
        (profile_id, activity, item, int(correct), int(via_voice)),
    )
    db.commit()
    return "", 204


@api_bp.post("/rounds")
def post_round():
    profile_id, err = require_profile()
    if err:
        return err

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return _bad_request()

    activity = data.get("activity")
    correct_count = data.get("correct_count")
    if (
        activity not in ACTIVITIES
        or not isinstance(correct_count, int)
        or isinstance(correct_count, bool)
        or not 0 <= correct_count <= 5
    ):
        return _bad_request()

    if correct_count >= 5:
        stars = 3
    elif correct_count == 4:
        stars = 2
    elif correct_count == 3:
        stars = 1
    else:
        stars = 0

    db = get_db()
    db.execute(
        "INSERT INTO round_results (profile_id, activity, correct_count, stars)"
        " VALUES (?, ?, ?, ?)",
        (profile_id, activity, correct_count, stars),
    )
    row = db.execute(
        "SELECT MAX(stars) FROM round_results WHERE profile_id = ? AND activity = ?",
        (profile_id, activity),
    ).fetchone()
    db.commit()
    return jsonify({"stars": stars, "best_stars": row[0]})


@api_bp.get("/progress")
def get_progress():
    profile_id, err = require_profile()
    if err:
        return err

    rows = get_db().execute(
        "SELECT activity, MAX(stars) AS best_stars, COUNT(*) AS rounds_played,"
        " MAX(created_at) AS last_played"
        " FROM round_results WHERE profile_id = ?"
        " GROUP BY activity",
        (profile_id,),
    ).fetchall()
    activities = [
        {
            "activity": row["activity"],
            "best_stars": row["best_stars"],
            "rounds_played": row["rounds_played"],
            "last_played": row["last_played"].replace(" ", "T"),
        }
        for row in rows
    ]
    return jsonify({"activities": activities})
