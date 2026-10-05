import json
import os
import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory


PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "src" / "main" / "static" / "frontend"
DATABASE_PATH = Path(os.environ.get("DB_PATH", Path(__file__).resolve().parent / "profiles.db"))

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")


@contextmanager
def database_connection():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def initialize_database():
    with database_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                surname TEXT NOT NULL,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                phone TEXT NOT NULL,
                skills TEXT NOT NULL
            )
            """
        )


def profile_from_row(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "surname": row["surname"],
        "email": row["email"],
        "phone": row["phone"],
        "skills": json.loads(row["skills"]),
    }


def validate_profile(data):
    if not isinstance(data, dict):
        return None, {"body": "A JSON object is required"}

    profile = {
        "name": data.get("name", "").strip() if isinstance(data.get("name", ""), str) else "",
        "surname": data.get("surname", "").strip() if isinstance(data.get("surname", ""), str) else "",
        "email": data.get("email", "").strip().lower() if isinstance(data.get("email", ""), str) else "",
        "phone": data.get("phone", "").strip() if isinstance(data.get("phone", ""), str) else "",
        "skills": data.get("skills"),
    }
    errors = {}

    if len(profile["name"]) < 2:
        errors["name"] = "Name must have at least 2 characters"
    if len(profile["surname"]) < 2:
        errors["surname"] = "Surname must have at least 2 characters"
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", profile["email"]):
        errors["email"] = "Invalid email"
    if not re.fullmatch(r"\+?[0-9\s\-]{7,15}", profile["phone"]):
        errors["phone"] = "Invalid phone number"

    skills = profile["skills"]
    if not isinstance(skills, list) or not skills or any(
        not isinstance(skill, str) or not skill.strip() for skill in skills
    ):
        errors["skills"] = "Add at least one valid skill"
    else:
        profile["skills"] = [skill.strip() for skill in skills]

    return (None, errors) if errors else (profile, {})


def profile_not_found():
    return jsonify(error="Profile not found"), 404


@app.get("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/api/profiles")
def list_profiles():
    with database_connection() as connection:
        rows = connection.execute("SELECT * FROM profiles ORDER BY id").fetchall()
    return jsonify([profile_from_row(row) for row in rows])


@app.get("/api/profiles/<int:profile_id>")
def get_profile(profile_id):
    with database_connection() as connection:
        row = connection.execute(
            "SELECT * FROM profiles WHERE id = ?", (profile_id,)
        ).fetchone()
    if row is None:
        return profile_not_found()
    return jsonify(profile_from_row(row))


@app.post("/api/profiles")
def create_profile():
    profile, errors = validate_profile(request.get_json(silent=True))
    if errors:
        return jsonify(error="Validation failed", fields=errors), 400

    try:
        with database_connection() as connection:
            cursor = connection.execute(
                "INSERT INTO profiles (name, surname, email, phone, skills) VALUES (?, ?, ?, ?, ?)",
                (
                    profile["name"],
                    profile["surname"],
                    profile["email"],
                    profile["phone"],
                    json.dumps(profile["skills"]),
                ),
            )
            profile_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify(error="A profile with this email already exists"), 409

    return jsonify(id=profile_id, **profile), 201


@app.put("/api/profiles/<int:profile_id>")
def update_profile(profile_id):
    profile, errors = validate_profile(request.get_json(silent=True))
    if errors:
        return jsonify(error="Validation failed", fields=errors), 400

    try:
        with database_connection() as connection:
            cursor = connection.execute(
                """
                UPDATE profiles
                SET name = ?, surname = ?, email = ?, phone = ?, skills = ?
                WHERE id = ?
                """,
                (
                    profile["name"],
                    profile["surname"],
                    profile["email"],
                    profile["phone"],
                    json.dumps(profile["skills"]),
                    profile_id,
                ),
            )
            if cursor.rowcount == 0:
                return profile_not_found()
    except sqlite3.IntegrityError:
        return jsonify(error="A profile with this email already exists"), 409

    return jsonify(id=profile_id, **profile)


@app.delete("/api/profiles/<int:profile_id>")
def delete_profile(profile_id):
    with database_connection() as connection:
        cursor = connection.execute("DELETE FROM profiles WHERE id = ?", (profile_id,))
        if cursor.rowcount == 0:
            return profile_not_found()
    return "", 204


initialize_database()


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1")