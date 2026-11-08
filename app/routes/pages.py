import json

from flask import Blueprint, abort, redirect, render_template, request, session

from app.db import get_db
from app.routes.api import ACTIVITIES

pages_bp = Blueprint("pages", __name__)

# Avatar emoji set for the profile picker (fixed set, docs/03 references 05).
AVATARS = ["🐱", "🐶", "🦊", "🐻", "🐼", "🐸", "🦉", "🐯"]


def load_profile():
    profile_id = session.get("profile_id")
    if profile_id is None:
        return None
    return get_db().execute(
        "SELECT id, name, avatar FROM profiles WHERE id = ?", (profile_id,)
    ).fetchone()


@pages_bp.get("/")
def index():
    if "profile_id" not in session:
        return redirect("/profile")
    return redirect("/home")


@pages_bp.get("/profile")
def profile_page():
    profiles = get_db().execute(
        "SELECT id, name, avatar FROM profiles ORDER BY name"
    ).fetchall()
    return render_template("profile.html", profiles=profiles, avatars=AVATARS)


@pages_bp.post("/profile")
def profile_submit():
    # Switch profile: existing profile card posts its id.
    profile_id = request.form.get("profile_id", type=int)
    if profile_id is not None:
        session["profile_id"] = profile_id
        return redirect("/home")

    # New profile: validate name (1-20 chars, strip), pick avatar, INSERT.
    name = request.form.get("name", "").strip()
    avatar = request.form.get("avatar", "🐱")
    if not 1 <= len(name) <= 20:
        return redirect("/profile")
    if avatar not in AVATARS:
        avatar = "🐱"

    db = get_db()
    cursor = db.execute(
        "INSERT INTO profiles (name, avatar) VALUES (?, ?)", (name, avatar)
    )
    db.commit()
    session["profile_id"] = cursor.lastrowid
    return redirect("/home")


@pages_bp.get("/home")
def home():
    profile = load_profile()
    if profile is None:
        return redirect("/profile")
    return render_template("home.html", profile=profile, activities=ACTIVITIES)


@pages_bp.get("/play/<activity_id>")
def play(activity_id):
    if activity_id not in ACTIVITIES:
        abort(404)
    profile = load_profile()
    config = {"activity": activity_id, "title": ACTIVITIES[activity_id]["title"]}
    return render_template(
        "play.html",
        profile=profile,
        title=ACTIVITIES[activity_id]["title"],
        game_config_json=json.dumps(config, ensure_ascii=False),
    )


@pages_bp.get("/progress")
def progress():
    profile = load_profile()
    if profile is None:
        return redirect("/profile")
    return render_template("progress.html", profile=profile)


@pages_bp.get("/mic-test")
def mic_test():
    return render_template("mic_test.html", profile=None)
