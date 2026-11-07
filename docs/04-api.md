# 04 — API

Two blueprints: `pages` (HTML) and `api` (JSON under `/api/*`).

## Page routes (`app/routes/pages.py`)

| Route                  | Behavior |
|------------------------|----------|
| `GET /`                | Redirect: no profile in session → `/profile`, else `/home` |
| `GET /profile`         | Profile picker page: existing profiles as big avatar cards + "Yeni profil" form (name input + avatar emoji picker) |
| `POST /profile`        | Form submit: validate name (1–20 chars, strip), pick avatar; INSERT profile; `session["profile_id"] = id`; redirect `/home`. Also used to switch: if `profile_id` in form, just set session |
| `GET /home`            | Home screen; requires profile (else redirect `/profile`) |
| `GET /play/<activity>` | Shared game shell `play.html`; 404 if activity id invalid. Injects `window.GAME_CONFIG = {"activity": ..., "title": ...}` |
| `GET /progress`        | Sticker board page; requires profile |
| `GET /mic-test`        | Diagnostic page (spec in 09). Not linked from home; direct URL only |

## JSON API (`app/routes/api.py`)

All responses JSON. Errors: `{"error": "<turkish message>"}` with 4xx/5xx.
All routes require a profile in session (401 `{"error": "Önce profilini seç"}`)
except where noted.

### POST /api/attempts

Log one answered question. Fire-and-forget from JS; response ignored by UI.

```json
// request
{"activity": "numbers_find", "item": "7", "correct": true, "via_voice": false}
// response 204, empty body
```

Validate: activity in list (03), `item` str ≤ 20 chars, `correct` bool.

### POST /api/rounds

Called when a 5-question round finishes; server computes stars.

```json
// request
{"activity": "numbers_find", "correct_count": 4}
// response
{"stars": 2, "best_stars": 2}
```

Stars rule: `correct_count >= 5 → 3`, `4 → 2`, `3 → 1`, else `0`.
`best_stars` = MAX(stars) for this profile+activity (including the new row).

### GET /api/progress

```json
// response — one entry per activity the profile has played at least once
{"activities": [
  {"activity": "numbers_count", "best_stars": 3, "rounds_played": 2,
   "last_played": "2026-11-06T14:30:00"}
]}
```

### POST /api/check-speech  (multipart/form-data, NOT JSON)

The core STT endpoint. Fields:

- `audio`: webm/opus blob from MediaRecorder (browser default)
- `activity`: `voice_numbers` or `voice_letters` (or `mic_test`)
- `target`: the expected item, e.g. `"21"` or `"B"`

Behavior (full spec in `10-stt-server.md`): save to temp file, transcribe
with faster-whisper `language="tr"`, normalize, match against accepted
variants from `app/lexicon.py`, delete temp file.

```json
// response
{"correct": true, "heard": "yirmi bir", "expected": "21"}
// "heard" is the raw transcript (may be empty string if nothing usable)
```

Never raise 5xx for "child said something wrong" — that's a normal
`correct: false` response. 5xx only for real server failures.

### Profile guard

`mic_test` works without a profile (developer page); every other `/api/*`
route requires one.

## Notes

- Tap games (numbers_count/next/find, numbers_tens, letters_meet/find) check
  answers **client-side** — the correct answer is necessarily visible on
  screen in those games, so a server round-trip adds nothing. They only POST
  attempts/rounds.
- Only voice games depend on `/api/check-speech`.
- No CORS, no auth headers: same-origin fetch only.
