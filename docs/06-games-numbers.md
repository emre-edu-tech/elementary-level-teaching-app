# 06 — Number Games

Shared round structure for ALL games (tap and voice):

- A round = **5 questions**. Each answer → log `/api/attempts`.
- Round end → POST `/api/rounds` → show stars screen: big stars
  (0–3, rule in 04), praise TTS, buttons "Tekrar oyna" and "Ana Sayfa".
- Question flow: generate → render → `speak(instruction)` → wait for answer →
  feedback (1.2s) → next question. Instructions auto-spoken; a 🔊 replay
  button (min 64px) re-speaks the instruction.
- Number generation uses helpers from `08-content-tr.md` (`numberWord(n)`).
- Voice game mic flow is identical for both voice games: see §voice_numbers.
  After a `correct:false` verdict, the child gets 2 more tries on the same
  question (3 total), then the app says the right answer via TTS and moves on
  (counts as incorrect).

## numbers_count — "Nesneleri Say"

- Screen: N emoji apples 🍎 in a scattered-looking grid (N = 1–20, random;
  skew easy: 60% of questions N ≤ 10). Below: 4 numeral buttons (target +
  3 distractors within ±5, unique, shuffled).
- Instruction: "Elmaları say ve sayısını bul!"
- Answer: tap numeral. Correct → praise; wrong → shake + retry (same
  question, unlimited retries, only first attempt logged).

## numbers_next — "Sırada Hangi Sayı Var?"

- Screen: 3 consecutive numbers in cards (start 1–15), then a "?" card.
  4 options: correct next + 3 distractors (±1..±3, unique, shuffled).
- Instruction: "Sayıları dinle: {a}, {b}, {c}. Sırada hangi sayı var?"
  (numbers spoken as Turkish words via `numberWord`).
- Interaction identical to numbers_count.

## numbers_find — "Sayıyı Bul"

- Screen: grid of 4 big numeral cards (question progresses 4 → 6 options in
  later questions; range 1–20 for options).
- Instruction: "{word} sayısını bul!" e.g. "Yedi sayısını bul!"
- Answer: tap the named numeral. Interaction as above.

## numbers_tens — "Onar Onar Sayalım"

- Screen: row/grid of cards 10, 20, … 100 in order (all 10 visible).
- Flow: card 10 highlighted + spoken "on"; child taps the next card in
  sequence; correct tap → highlight + speak its word ("yirmi"…). Wrong tap →
  gentle shake, retry. No options — the whole grid IS the choice set.
- Reaching 100 → big confetti + "Yüze kadar saydın! Harika!" Round = one full
  run; log attempts per tap, round result = taps correct on first try.

## voice_numbers — "Sayıyı Söyle" (STT)

- Question target: 1–20 (first 3 questions), 21–100 by tens + a few mixed
  (last 2). Show the numeral HUGE (`text-9xl`).
- Instruction: "Mikrofona bas ve bu sayıyı söyle!" (then just the number
  word once mic UI is familiar: speak `{numberWord(target)}` as the prompt
  example is NOT allowed — never speak the answer).
- Mic flow (shared, in `recorder.js`): tap 🎤 → permission if needed →
  "Dinliyorum…" state → auto-stop after 3.5s or on child tapping stop →
  spinner "Dinliyorum…" → POST `/api/check-speech`
  (`activity=voice_numbers`, `target`, audio blob) → verdict:
  correct → praise + confetti; incorrect → "Seni duyamadım / Tekrar dene"
  (retry up to 2 more times, then TTS the answer and move on).
- Empty/no-speech result → "Seni duyamadım, tekrar dene" (does not count as
  an attempt unless 3 tries exhausted).
