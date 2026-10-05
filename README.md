# Exercise1-Web-Project
# Profiles & Skills

Small full-stack project:

1. **Static front-end**: responsive HTML/CSS page with a profile form (name, surname, email, phone, skills) validated with JavaScript.
2. **Skill finder**: search for programming skills from a curated list and show matching results.
3. **REST backend**: Flask + SQLite, full CRUD on `/api/profiles`, called from the front-end.
4. **Git**: step-by-step commit history.
5. **Cloud**: deployed on Render (free tier).

## Run locally

Requirements: Python 3.10+.

### Windows (PowerShell)

If Python is not installed, install it once with `winget install --id Python.Python.3.12 -e`, then close and reopen the terminal. From the repository root:

```bash
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

### macOS / Linux

From the repository root:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Open http://localhost:5000. Flask serves the front-end and the API from the same server; do not open `index.html` directly.

## API

| Method | Route | Description | Success | Errors |
|--------|-------|-------------|---------|--------|
| GET | `/api/profiles` | List profiles | 200 | |
| GET | `/api/profiles/<id>` | Get one profile | 200 | 404 |
| POST | `/api/profiles` | Create profile | 201 | 400 (validation), 409 (duplicate email) |
| PUT | `/api/profiles/<id>` | Update profile | 200 | 400, 404, 409 |
| DELETE | `/api/profiles/<id>` | Delete profile | 204 | 404 |

Example body:

```json
{"name": "Ana", "surname": "Pop", "email": "ana@example.com", "phone": "+40 712 345 678", "skills": ["HTML", "JS"]}
```

Quick test:

```bash
curl -i -X POST http://localhost:5000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","surname":"Pop","email":"ana@example.com","phone":"0712345678","skills":["JS"]}'
```

## Deploy (Render)

1. Push the repo to GitHub.
2. On https://render.com, choose **New > Blueprint** and select the repository. The root-level `render.yaml` installs the backend dependencies and starts Gunicorn from `backend/`, while keeping the frontend files available to Flask.
3. Wait for the build, then open the generated `onrender.com` URL.

Note: on the free tier the SQLite file is wiped on each redeploy/restart. Fine for a demo; for persistence use a Render disk (set `DB_PATH` to the mount path) or switch to Postgres.

## Project structure

```
backend/                         Flask app, SQLite, requirements
src/main/static/frontend/        index.html, style.css, profile.js, skills.js
src/main/static/backend/          Postman collection
render.yaml                      Render Blueprint
```
