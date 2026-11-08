// speak() via browser speechSynthesis, tr-TR. Spec in docs/05-frontend.md.
// If no Turkish voice is installed, the default voice speaks with
// lang="tr-TR" — no voice installation is required, so we never prompt.
// Volume follows the header setting (common.js getVolume()).

import { getVolume } from "./common.js";

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
  u.volume = getVolume();                      // header 🔈🔉🔊 setting
  speechSynthesis.speak(u);
}
