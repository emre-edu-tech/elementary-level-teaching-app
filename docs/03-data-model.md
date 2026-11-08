# 03 — Data Model (SQLite)

File: `data/app.db`. Created by `app/db.py::init_db()` (idempotent:
`CREATE TABLE IF NOT EXISTS`) — called automatically by `create_app()` at
startup, so a fresh clone or server deploy boots with no manual init step
(it creates the `data/` directory too). Enable `PRAGMA foreign_keys = ON`
per connection. Use `sqlite3.Row` row factory.

## Schema

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,                 -- child's first name
  avatar     TEXT    NOT NULL DEFAULT '🐱',    -- emoji from fixed set (05)
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attempts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity   TEXT    NOT NULL,   -- 'numbers_count' etc. (list in 01)
  item       TEXT    NOT NULL,   -- e.g. '7', '21', 'B'
  correct    INTEGER NOT NULL,   -- 1 / 0
  via_voice  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS round_results (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id    INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity      TEXT    NOT NULL,
  correct_count INTEGER NOT NULL,   -- out of 5 questions per round
  stars         INTEGER NOT NULL,   -- 0–3 (rule in 06/07)
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rounds_profile
  ON round_results(profile_id, activity);
```

## Activity ids (valid values for `activity`)

`numbers_count`, `numbers_next`, `numbers_find`, `numbers_tens`,
`voice_numbers`, `letters_meet`, `letters_find`, `voice_letters`.
Validate against this list in the API layer; reject anything else with 400.

## db.py conventions

```python
import sqlite3
from flask import g, current_app

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DB_PATH"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()
```

- `init_db(db_path=None)` opens its own standalone connection (works outside
  app context), executes the schema above, commits, closes. `create_app()`
  calls it with `app.config["DB_PATH"]` at startup; calling it manually is
  still fine. Register `close_db` in `create_app()` via
  `app.teardown_appcontext`.
- All writes commit immediately (kid taps are low-frequency; simplicity wins).
- No migrations needed for MVP. If the schema changes during development,
  deleting `data/app.db` and re-initializing is acceptable.

## Profile session

Current profile id is stored in the Flask session cookie
(`session["profile_id"]`). No profile table auth. `POST /profile` sets it;
`GET /` redirects to `/profile` when unset.
