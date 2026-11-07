# 01 — Product Overview

## Product

**SayıHarf** (working title): a browser-based Turkish learning app for
pre-school and 1st-year elementary children (ages ~4–7). Children learn
numbers 1–100 and the 29-letter Turkish alphabet through tap-based games and
voice-answer activities (child speaks into the microphone, server-side STT
checks the answer).

## Primary user

- Turkish-speaking child, age 4–7. CANNOT read fluently → every instruction
  must be spoken aloud (TTS), text is decorative support.
- Uses a laptop/desktop with mouse (child-level mouse skill: single clicks on
  large targets only). No drag, no double-click, no hover-dependent actions.
- Uses the app together with or near a parent; parent sets up the profile.

## Scope — IN (MVP)

1. Simple profile picker: first name + emoji avatar, no passwords.
2. Home screen with large activity buttons, spoken greeting.
3. Number games (see `06-games-numbers.md`):
   - numbers_count — count objects, tap the numeral (1–20)
   - numbers_next — what comes next in the sequence
   - numbers_find — "tap the number 7" among options
   - numbers_tens — count by tens 10→100, tap-along
   - voice_numbers — STT: "say the number 21"
4. Letter games (see `07-games-letters.md`):
   - letters_meet — tap letters, hear their names (29 letters)
   - letters_find — "tap the letter B" among options
   - voice_letters — STT: "say the letter B"
5. Progress: per-activity best star rating (0–3) shown on a sticker board.
6. Mic-test diagnostic page (hidden, for the developer/parent).

## Scope — OUT (explicitly, do not build)

- Accounts, passwords, teacher/parent dashboards, multi-language UI
  (Turkish only; strings kept centralized so adding a language later is cheap).
- Letter tracing/writing, phonics, addition/subtraction, reading words.
- Tablet/mobile optimization (desktop-first; responsive enough not to break).
- Audio asset files (all speech via browser TTS; sounds via WebAudio).
- Any real-time streaming STT (record-then-upload only).

## Success criteria for MVP

- A 5-year-old can complete a 5-question round of any game with only spoken
  instructions and single clicks.
- Voice games correctly accept correctly-spoken Turkish numbers/letters ≥ 90%
  of the time on a quiet room, laptop mic.
- Whole pipeline runs on one machine: Flask + faster-whisper on CPU.
