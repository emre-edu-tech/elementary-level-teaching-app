# 02 — Architecture

## Stack (fixed — do not substitute)

| Concern      | Choice                                                      |
|--------------|-------------------------------------------------------------|
| Backend      | Flask (Jinja templates, blueprints)                         |
| Database     | SQLite via Python stdlib `sqlite3` (no ORM)                 |
| STT          | faster-whisper, multilingual model `small`, CPU, int8       |
| TTS          | Browser `speechSynthesis`, `tr-TR` voice                    |
| CSS          | Tailwind CSS **v3** via npm + PostCSS (NO CDN, no v4)       |
| JS           | Vanilla ES modules, no framework, no bundler                |
| Python deps  | `flask`, `faster-whisper` (requirements.txt)                |

## Project tree

```
run.py                  # app entry: from app import create_app; app.run(...)
requirements.txt
package.json            # tailwindcss@^3.4, postcss, autoprefixer
tailwind.config.js      # content: ./templates/**/*.html, ./static/js/**/*.js
postcss.config.js
app/
  __init__.py           # create_app(): config, blueprints, db teardown
  config.py             # SECRET_KEY, DB_PATH, WHISPER_MODEL, WHISPER_COMPUTE_TYPE
  db.py                 # get_db(), close_db(), init_db() (schema in 03)
  lexicon.py            # Turkish lexicon generated from rules in 08
  stt.py                # whisper load + transcribe + match (spec in 10)
  routes/
    pages.py            # page routes (blueprint "pages")
    api.py              # /api/* routes (blueprint "api")
templates/
  base.html             # kid layout shell (see 05)
  profile.html  home.html  play.html  progress.html  mic_test.html
static/
  css/input.css         # @tailwind base/components/utilities + custom bits
  css/output.css        # BUILD OUTPUT (committed — built locally, reused on the remote server)
  js/common.js          # api helpers, dom helpers
  js/tts.js             # speak() (spec in 05)
  js/sounds.js          # WebAudio success/error chimes (spec in 05)
  js/confetti.js        # canvas confetti, no library
  js/recorder.js        # mic capture module (spec in 09)
  js/pages/*.js         # one module per page
data/app.db             # SQLite file (gitignored, created by init)
docs/                   # these specs
```

## Configuration (`app/config.py`)

```python
class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me")
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "app.db")
    WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")
    WHISPER_COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
```

Whisper model must load lazily (first STT request) but be cached module-level,
so app startup stays fast and the model loads once.

## Build & run commands

Python dependencies are always installed into a virtual environment
(`.venv/` at the project root, already git-ignored), never globally.

```bash
python -m venv .venv
# Windows (Git Bash): source .venv/Scripts/activate   |   POSIX: source .venv/bin/activate
pip install -r requirements.txt
npm install
npm run watch            # dev: Tailwind rebuild on change
npm run build            # prod: minified one-off build
python -c "from app.db import init_db; init_db()"   # create schema
python run.py            # http://127.0.0.1:5000 (run with the venv interpreter)
```

## Conventions

- Tailwind: all styling via utility classes in templates; the only custom CSS
  allowed in `input.css` is animations/keyframes and a couple of component
  classes if repeated. Never use CDN Tailwind.
- JS: one ES module per page, loaded with `<script type="module">`. Shared
  behavior goes in the shared modules listed above. No global namespace
  pollution; communicate with server via `fetch` + JSON.
- Routing: pages render Jinja templates; all interactivity hits `/api/*`.
- Game pages share ONE template `play.html`; the activity id + its config are
  injected as `window.GAME_CONFIG` JSON (activity id, title, type). The page
  JS module dispatches on the activity id.
- App language: Turkish. All Turkish copy comes from the string tables in
  `05-frontend.md` / `08-content-tr.md`.
