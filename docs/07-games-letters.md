# 07 — Letter Games

Same shared round structure as `06-games-numbers.md` (5 questions, stars,
retry-without-punishment, 🔊 replay button). Letter names and data come from
the table in `08-content-tr.md` (`LETTERS` in `app/lexicon.py`).

## letters_meet — "Harfleri Tanıyalım" (exploration, not scored)

- Screen: grid of all 29 letters (uppercase, `text-6xl`, 6–7 per row, fits
  one screen). This game has no rounds/stars — free play.
- Tap a letter → card pops (scale animation), letter is SPOKEN by name
  (TTS, `letterName(letter)` from lexicon), card stays highlighted until the
  next tap. Also uppercase/lowercase shown together: big "B b".
- A "Sırayla söyle" button plays A→Z slowly (each letter 0.9s apart, cancel
  on any tap) so the child can listen to the whole alphabet.
- Log each tap to `/api/attempts` (`correct: true`) for interest, but no
  round_results.

## letters_find — "Harfi Bul"

- Screen: 4 letter cards (question 1–3), 6 cards (question 4–5). Options
  unique, shuffled, drawn from all 29 letters. Visually confusable pairs
  (B/C, İ/I, Ö/O, Ü/U, Ş/S, Ğ/G) should appear together sometimes — when
  generating distractors, with 50% probability include one confusable of the
  target.
- Instruction: "{name} harfini bul!" e.g. "Be harfini bul!"
- Answer: tap the named letter. Interaction/retry identical to number games.

## voice_letters — "Harfi Söyle" (STT)

- Question target: random letter from all 29, but avoid vowels (A, E, I, İ,
  O, Ö, U, Ü) and `Ğ` in the MVP — single-vowel answers are unreliable for
  STT and `yumuşak ge` is a word, not a letter name. Consonants only (20
  letters).
- Show the letter HUGE with its lowercase beside it ("B b").
- Instruction: "Mikrofona bas ve bu harfi söyle!"
- Verdict: POST `/api/check-speech` (`activity=voice_letters`, `target=B`).
  Matching uses the per-letter accepted-variant list from `08-content-tr.md`
  (letter names are syllables like "be" and Whisper transcribes them with
  variance). Retry flow identical to voice_numbers (3 tries, then TTS says
  the letter name and app moves on).
