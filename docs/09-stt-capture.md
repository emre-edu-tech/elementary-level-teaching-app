# 09 — STT Browser Side: Mic Capture + Mic-Test Page

## recorder.js — shared mic module (used by voice games + mic-test)

```js
export async function recordOnce({ maxMs = 3500 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = e => chunks.push(e.data);
  const stopped = new Promise(res => rec.onstop = res);
  rec.start();
  const timer = setTimeout(() => rec.state !== "inactive" && rec.stop(), maxMs);
  await stopped;                       // caller resolves via stopHandle below
  clearTimeout(timer);
  stream.getTracks().forEach(t => t.stop());
  return new Blob(chunks, { type: rec.mimeType });  // webm/opus in Chrome
}
```

(Caller needs a way to tap-stop early: expose the recorder handle or accept an
`onReady(rec)` callback — implement ergonomically, keep it in one module.)

## Behavior rules (must implement)

- **min duration guard**: if recording < 0.4s, do NOT upload — show
  "Seni duyamadım, tekrar dene" locally.
- **auto-stop** at 3.5s max (kids ramble; Whisper hallucinates on long
  silence). A visible countdown/progress ring while recording is nice-to-have.
- **one mic user at a time**: disable 🎤 while recording/processing.
- **permission denied** → Turkish message: "Mikrofon izni gerekli. Lütfen
  tarayıcıda mikrofon iznini aç." (mic button shows ⚠️ state).
- **insecure context**: `getUserMedia` needs HTTPS or localhost. On failure,
  show that same permission message. Note for deployment: production must be
  served over HTTPS.
- Upload: `FormData` with `audio`, `activity`, `target` →
  `POST /api/check-speech` (spec 04/10). While awaiting: spinner state
  "Dinliyorum…" → on response, verdict UI. On network error: "Bir sorun oldu,
  tekrar dene" (does not count as an attempt).

## Mic button UI (in recorder.js, reused everywhere)

Big round button 96px, states:
- idle: `bg-amber-400` 🎤, label "Mikrofona bas ve söyle" (spoken too)
- recording: `bg-rose-500` ⏹, pulsing (Tailwind `animate-pulse`), "Dinliyorum…"
- processing: `bg-slate-300` spinner + "Dinliyorum…"

## Mic-test page (`GET /mic-test`, developer diagnostic — build FIRST)

Purpose: prove the whole pipeline with zero game complexity. Not linked in
nav. Works without profile session.

Layout (simple, plain, still Tailwind):
1. Target picker: `<select>` with all numbers 1–100 and all 29 letters.
2. The shared mic button.
3. Result panel showing: raw transcript from `heard`, expected target,
   normalized form, `correct` boolean, and server round-trip time in ms
   (measure in JS).
4. A short log list (last 10 results) kept in memory — for quick trial runs.

Acceptance: say "yirmi bir" with target 21 → heard≈"yirmi bir", correct=true
in under ~2s round trip on localhost. Say an unrelated word → correct=false,
no crash. Empty/very short recording → friendly local message, no request.

## Voice games

`voice_numbers` / `voice_letters` use `recordOnce` + upload exactly as
specified in 06/07. No game logic lives in recorder.js — the page module
drives states and renders verdicts.
