# 11 — Milestones (build order)

Each milestone = one agent work session. Read only the files listed (map also
in 00-index). Do not start the next milestone before the current one's
acceptance check passes. After each milestone, the human runs the app and
verifies — write a 3–5 line "how to verify" into the final response.

## M1 — Project skeleton
Read: 01, 02, 03.
Build: full tree from 02 (empty/stub pages OK), config.py, db.py + init,
requirements.txt, package.json + Tailwind v3 setup (input.css, watch+build
scripts), base.html shell, run.py. Python deps are installed in a virtual
environment (`.venv/`), never globally. Verify `npm run build` produces
static/css/output.css and app boots to a bare home route.
Accept: `python run.py` serves (venv interpreter); profile picker route
exists (stub OK).

## M2 — Profiles, home, progress page shell
Read: 02, 03, 04, 05.
Build: profile picker (create + switch), home screen with 8 activity buttons,
progress page shell, TTS module, sounds, common.js, `/api/attempts` and
`/api/rounds` and `/api/progress`.
Accept: can create a profile, hear Turkish TTS on home via the welcome card
tap (works without an installed Turkish voice — no install prompt shown);
the welcome card visibly bounces/waves until the first tap, then rests;
the header 🔈🔉🔊 volume setting changes TTS and chime loudness and
persists across pages/reloads, home buttons link to stub play pages.

## M3 — Number tap games
Read: 04, 05, 06 (+ lexicon generation from 08 — numbers part).
Build: lexicon.py number rules, play.html shared shell, all 4 tap games,
confetti, stars end screen, `/api/rounds` wired.
Accept: full 5-question rounds playable in all 4 games; stars persist per
profile.

## M4 — Letter games
Read: 05, 07 (+ letters part of 08).
Build: letters_meet + letters_find, letter data in lexicon.py.
Accept: 29-letter grid with correct Turkish letter names spoken; find game
playable with confusable distractors.

## M5 — STT pipeline (mic-test) ← prove the hard part before game UI
Read: 02, 04, 08, 09, 10.
Build: stt.py (model load, transcribe, normalize, match), `/api/check-speech`,
recorder.js, mic-test page.
Accept: mic-test round-trip works on localhost — say "yirmi bir" for 21 →
correct=true; nonsense word → false; < 2.5s latency.
NOTE: `pip install faster-whisper` downloads the model (~460MB) on first use.

## M6 — Voice games
Read: 05, 06 (voice_numbers), 07 (voice_letters), 08, 09, 10.
Build: both voice games reusing recorder.js; retry flow (3 tries → TTS the
answer); no-answer vs wrong-answer distinction.
Accept: both games fully playable end-to-end with mic only.

## M7 — Sticker board + polish
Read: 03, 04, 05.
Build: progress page real data (best stars per activity from
`/api/progress`), star stickers with animation, replay/home flows consistent,
retry/encouragement copy rotation everywhere.
Accept: sticker board reflects played activities; every screen speaks its
instructions.

## M8 — Final polish + README
Read: 01, 11.
Build: README.md (setup: pip, npm install, npm run build, init_db, run;
HTTPS note for mic; how to change WHISPER_MODEL), .gitignore
(data/, node_modules, __pycache__; static/css/output.css is committed, not
ignored — built locally and reused on the remote server), 10-minute manual
test pass over all 8 activities.
Accept: fresh-machine setup works from README alone.
