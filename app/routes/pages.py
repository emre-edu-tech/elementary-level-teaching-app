from flask import Blueprint, redirect, render_template, session

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def home():
    if "profile_id" not in session:
        return redirect("/profile")
    return render_template("home.html")


@pages_bp.route("/profile")
def profile():
    return render_template("profile.html")


@pages_bp.route("/play/<activity_id>")
def play(activity_id):
    return render_template("play.html")


@pages_bp.route("/progress")
def progress():
    return render_template("progress.html")


@pages_bp.route("/mic-test")
def mic_test():
    return render_template("mic_test.html")
