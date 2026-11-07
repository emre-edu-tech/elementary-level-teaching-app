# 10 — STT Server Side: Whisper + Matching (`app/stt.py`)

## Model loading (lazy, cached)

```python
_model = None
def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel(
            current_app.config["WHISPER_MODEL"],       # "small"
            device="cpu",
            compute_type=current_app.config["WHISPER_COMPUTE_TYPE"],  # "int8"
        )
    return _model
```

First request pays the load cost (~seconds) — acceptable for MVP; the mic-test
page is where the developer warms it up. Do NOT load at import time.

## Transcription

```python
segments, info = get_model().transcribe(path, language="tr", vad_filter=True)
text = " ".join(s.text for s in segments).strip()
```

- `language="tr"` is mandatory (never auto-detect — single words misdetect).
- `vad_filter=True` skips leading/trailing silence, reducing hallucinations.
- Server still enforces: reject/ignore files > 15s or < 0.4s (defensive,
  client guards may be bypassed).

## Normalization (shared for target and transcript)

```python
def normalize(t: str) -> str:
    t = (t or "").casefold()
    t = t.replace("ı", "i").replace("i̇", "i").replace("i", "i")  # TR dot issues
    t = "".join(ch for ch in t if ch.isalnum())   # drops spaces AND punctuation
    return t
```

Space-stripping is deliberate: "yirmi bir" / "yirmibir" / "yirmi,bir" must
all normalize identically. Unicode `casefold` + the explicit ı→i mapping
avoid the Turkish İ/I lower-casing traps. (Note: this maps ı and i together
— safe because voice games never target vowels, see 07.)

## Matching rules

1. Build accepted set from lexicon (08): numbers → `{digits, spaceless word}`;
   letters → the per-letter variant list.
2. `n = normalize(transcript)`. If `n == ""` → no speech: return
   `{"correct": False, "heard": transcript, "expected": target}` (the client
   treats empty `heard` as "didn't hear you", not as a wrong answer).
3. If `len(transcript) > 40` chars → likely hallucination/noise: same
   no-speech response.
4. Exact: `n in accepted_set` → correct.
5. Fuzzy (numbers and letter names ≥ 2 chars): Levenshtein distance ≤ 1 →
   correct. (Kids mispronounce; one edit is a fair tolerance. Letters' 1-char
   variants require exact match.)
6. Otherwise: correct=false with `heard` returned.

Levenshtein: implement a tiny pure-Python DP function in `stt.py` (12 lines,
no dependency).

## Endpoint wiring (in `api.py`)

- Save upload to `tempfile.NamedTemporaryFile(suffix=".webm", delete=False)`,
  transcribe, then `os.unlink` in a `finally`. faster-whisper decodes
  webm/opus directly (via PyAV) — no ffmpeg conversion step needed.
- Validate `activity` ∈ {voice_numbers, voice_letters, mic_test}; `target`
  format checked against lexicon (number 1–100 or letter in the 29 set);
  otherwise 400.
- Log the attempt server-side too (print or logging): target, heard, correct,
  latency_ms — this is your tuning dataset for later.
- Return time: measure and include `latency_ms` in the JSON response
  (mic-test displays it; games ignore it).

## Expected performance & failure handling

- faster-whisper small/int8 on CPU: ~0.3–1s for a 2–4s clip. Total endpoint
  budget < 2.5s; if a request exceeds ~10s, log a warning.
- If faster-whisper raises on a corrupt blob → catch, log, return
  `{"correct": False, "heard": "", "expected": target}` with 200 (treat as
  no-speech; the child just retries). Never 5xx the kid UI for one bad blob.

## Tuning notes for later (do not implement in MVP)

- Model size is a config value: `base` (faster, weaker Turkish) ↔ `small` ↔
  `medium` (needs more CPU). Small is the chosen default for Turkish.
- If false-accepts appear on letters, tighten per-letter variants from the
  mic-test log data.
