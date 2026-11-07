# 05 — Frontend: Design Rules + Shared JS

## Design rules (kid ergonomics — apply everywhere)

- All interactive targets ≥ 64×64 px (`min-w-16 min-h-16`), spacing ≥ 12px
  between targets to prevent mis-taps.
- Base text for instructions: `text-3xl`+ ; letters/numerals on screen:
  `text-7xl`–`text-9xl`. Font: system sans-serif stack (Turkish glyphs safe).
- Palette (light, friendly, high contrast):
  bg `bg-sky-50`, cards `bg-white`, primary `bg-amber-400 hover:bg-amber-300`,
  accent `bg-rose-400`, success `bg-emerald-400`, text `text-slate-800`.
  Rounded everywhere: `rounded-3xl`, chunky borders `border-4 border-white`
  + soft shadow `shadow-lg`.
- Feedback is BIG and instant: correct → card flashes emerald + confetti +
  chime + TTS praise; wrong → card shakes + low chime + encouraging TTS.
  Never punish: no red X marks, no score loss, no timers.
- One action per screen state. Nothing depends on hover. No scrolling inside
  a game if avoidable (fit in 100vh on 1366×768).
- All text Turkish. Copy table (reuse, don't invent):
  - App title: "SayıHarf" · Home: "Ana Sayfa" · Progress: "Rozetlerim"
  - Profile: "Profilini Seç", "Yeni Profil", "Adın ne?" · "Başla!"
  - Praise: "Harika!", "Bravo!", "Çok güzel!", "Doğru!", "Süper!"
  - Retry: "Tekrar dene!", "Olmadı, bir daha dene!" (rotate randomly)
  - Mic: "Mikrofona bas ve söyle", "Dinliyorum…", "Seni duyamadım, tekrar dene"
  - Round end: "Tebrikler! ⭐⭐⭐", "Tekrar oyna", "Ana Sayfa"

## base.html

Kid shell: full-viewport centered column, small header row with avatar emoji +
name (links to `/profile` to switch) and a home button (🏠). `<body>` classes:
`bg-sky-50 text-slate-800 font-sans min-h-screen`. Includes
`static/css/output.css` and loads the page module via a `{% block scripts %}`.
Confetti `<canvas id="confetti">` fixed, pointer-events-none, in base.

## Shared JS modules (static/js/)

### tts.js — Turkish TTS (critical, follow exactly)

```js
let trVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  trVoice = vs.find(v => v.lang === "tr-TR")
         || vs.find(v => v.lang && v.lang.startsWith("tr")) || null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice; // Chrome loads voices async
}
export function speak(text, { rate = 0.85 } = {}) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();                    // never queue kid instructions
  const u = new SpeechSynthesisUtterance(text);
  if (trVoice) u.voice = trVoice;
  u.lang = "tr-TR"; u.rate = rate;             // slow: listeners are ~5yo
  speechSynthesis.speak(u);
}
```

If no tr-TR voice is found, show a small dismissible banner: "Türkçe ses
bulunamadı. Windows ayarlarından Türkçe metin okuma sesi ekleyebilirsin."
(banner defined once in base.html, shown when `trVoice === null` after
`voiceschanged` fires at least once).

### sounds.js — WebAudio chimes (no audio files)
`sfxSuccess()`: two rising sine notes (e.g. 660→880 Hz, 0.15s each).
`sfxError()`: single soft low note (220 Hz, 0.2s). Create/resume AudioContext
on first user click (autoplay policy).

### confetti.js — canvas confetti
`confetti()`: ~80 particles from top-center, 1.5s, then stop. Simple rects
+ circles, random palette from the design colors. No library.

### common.js
`postJSON(url, data)`, `postForm(url, formData)`, `randChoice(arr)`,
`shuffle(arr)`. Every page module calls `postJSON("/api/attempts", ...)`
after each answer (errors silently ignored).

### recorder.js
Mic capture module — specified in `09-stt-capture.md`. Includes the shared
mic button UI (big round button 🎤 → pulsing red while recording → spinner
while processing) used by both voice games and mic-test.
