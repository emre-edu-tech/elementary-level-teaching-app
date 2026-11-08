// WebAudio success/error chimes. Spec in docs/05-frontend.md.
// Loudness follows the header volume setting: peak = 0.4 × setting
// (low 0.2 / middle 0.32 / high 0.4), so chimes and speech move together.

import { getVolume } from "./common.js";

let ctx = null;

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Create/resume the AudioContext on first user click (autoplay policy).
document.addEventListener("click", () => audioCtx(), { once: true });

function tone(freq, start, dur) {
  const c = audioCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  const peak = 0.4 * getVolume();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(peak, c.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

export function sfxSuccess() {
  tone(660, 0, 0.15);
  tone(880, 0.15, 0.15);
}

export function sfxError() {
  tone(220, 0, 0.2);
}
