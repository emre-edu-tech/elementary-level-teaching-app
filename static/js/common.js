// Shared api/dom helpers. Spec in docs/05-frontend.md.

export async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.status === 204 ? null : res.json();
}

export async function postForm(url, formData) {
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Volume setting (header 🔈🔉🔊): "low" | "middle" | "high", kept in
// localStorage so it survives page changes. tts.js and sounds.js both read
// it, so speech and chimes always change together. "high" is the browser's
// maximum (speech volume is capped at 1.0).
const VOLUME_KEY = "sayiharf-volume";
const VOLUME_VALUES = { low: 0.5, middle: 0.8, high: 1.0 };

export function getVolume() {
  const v = VOLUME_VALUES[localStorage.getItem(VOLUME_KEY)] || VOLUME_VALUES.middle;
  return v;
}

// Wire the header volume buttons if the page has them. The active level gets
// the amber highlight; a click stores the choice immediately (no save step).
export function initVolumeControl() {
  const buttons = document.querySelectorAll("[data-volume]");
  if (!buttons.length) return;
  const paint = () => {
    const current = localStorage.getItem(VOLUME_KEY) || "middle";
    buttons.forEach((b) => {
      const active = b.dataset.volume === current;
      b.classList.toggle("bg-amber-400", active);
      b.classList.toggle("bg-white", !active);
    });
  };
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      localStorage.setItem(VOLUME_KEY, b.dataset.volume);
      paint();
    })
  );
  paint();
}
