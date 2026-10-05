# Exercise1-Web-Project
# Profiles & Books

Small full-stack project:

1. **Static front-end**: responsive HTML/CSS page with a profile form (name, surname, email, phone, skills) validated with JavaScript.
2. **API consumer**: book search by title using the [Open Library API](https://openlibrary.org/dev/docs/api/search) (`fetch`, async/await, loading indicator, error messages).
3. **REST backend**: Flask + SQLite, full CRUD on `/api/profiles`, called from the front-end.
4. **Git**: step-by-step commit history.
5. **Cloud**: deployed on Render (free tier).

## Run locally

Requirements: Python 3.10+

```bash
git clone <your-repo-url>
cd profile-book-app/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000 (Flask serves the front-end and the API from the same server).

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
2. On https://render.com: **New > Blueprint** (or **New > Web Service**), pick the repo. `render.yaml` already holds the settings
   (root dir `backend`, build `pip install -r requirements.txt`, start `gunicorn app:app`).
3. Wait for the build, then open the generated `onrender.com` URL.

Note: on the free tier the SQLite file is wiped on each redeploy/restart. Fine for a demo; for persistence use a Render disk (set `DB_PATH` to the mount path) or switch to Postgres.

## Project structure

```
backend/   Flask app, SQLite, requirements
frontend/  index.html, style.css, profile.js, books.js
render.yaml
```
