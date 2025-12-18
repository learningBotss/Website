## Project snapshot & intent

This repository is an early-stage skeleton for a web project. At the time of inspection:

- Directories `API/`, `Backend/`, and `Database/` exist but are empty.
- `Frontend/Login.py` exists but is empty.
- There is **no** `README.md`, no CI config, no dependency files (`requirements.txt`, `package.json`, `Dockerfile`), and no test suite discovered.

This file exists to help AI coding agents get productive quickly: what to read first, what assumptions are safe, and what to ask the maintainers.

---

## Quick start for an AI coding agent ✅

1. Confirm the target tech stack with the repo owner before implementing features.
   - The repo contains Python files, and you are on Windows (PowerShell). Do not assume Flask/Django/React — ask which framework and runtime are intended.
2. Check for missing artifacts and request them if not present:
   - A `README.md` describing architecture and setup
   - `requirements.txt` or `pyproject.toml` / `package.json` depending on stack
   - Example environment variables and any DB connection strings (redacted)
3. Create minimal reproducible scaffolding rather than large, opinionated changes:
   - Add a small `README.md` with the project's high-level goal and how to run locally (if the owner wants that).
   - Add a basic `Backend/app.py` (if Python backend is intended) using an app factory pattern and a minimal start script that runs on Windows PowerShell.

---

## What I looked for and why it matters 🔎

- `Frontend/Login.py` — entry point for authentication flows; currently empty. If you implement login, document expected endpoints and where credentials are stored.
- `API/`, `Backend/`, `Database/` — represent logical service boundaries. Keep responsibilities separate: API layer (routes), Backend (business logic), Database (models/migrations).
- No test files found — prioritize adding small, focused tests for any non-trivial logic you add and document how to run them.

---

## Project-specific guidance (actionable, not generic) 🔧

- Always confirm stack choices with maintainers before adding libraries (e.g., Flask vs FastAPI vs Django). Example message to ask: "Do you want a Flask-based `Backend/app.py` or a Node/Express API in `API/`?"
- When creating new modules, place them according to the existing directory intent:
  - route/controller code → `API/`
  - business logic/services → `Backend/`
  - schema/migrations → `Database/`
- Use Windows PowerShell compatible commands in README examples. Example: to create a venv and activate it in PowerShell use:

  ```powershell
  python -m venv .venv; .\.venv\Scripts\Activate.ps1
  ```

---

## Integration and debugging tips 🐞

- If the repo owner uses a remote DB or secrets, request a local development config or docker-compose that can bring up test data. Do not add credentials to the repo.
- When adding CI, prefer simple GitHub Actions that run off Windows and Linux matrices only after confirming tech choices.

---

## Minimal checklist for initial PRs (helpful for small, safe changes) ✅

- Add or update `README.md` describing stack and local steps.
- Add `requirements.txt` / `pyproject.toml` or `package.json` to pin dependencies.
- Add a tiny implementation that is easy to review (e.g., a hello-world route under `API/` or a `Backend/app.py` that prints a startup message).
- Add one small unit test and a short note describing how to run tests locally.

---

## Feedback & iteration 🔁

If anything in this file is unclear or if you have decisions about the stack (framework, DB, CI), tell me which you prefer and I'll update these instructions to be more specific and include sample commands and templates.
