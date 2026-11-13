// play.html page module — shared round engine + the 4 number tap games.
// Specs: docs/05-frontend.md (design rules, copy table — reuse, don't invent),
// docs/06-games-numbers.md (game logic). Round = 5 questions; every answer is
// POSTed to /api/attempts, round end POSTs /api/rounds and shows stars.
// Tap games check answers client-side; voice games come in M6.

import { postJSON, randChoice, shuffle } from "/static/js/common.js";
import { speak } from "/static/js/tts.js";
import { sfxSuccess, sfxError } from "/static/js/sounds.js";
import { confetti } from "/static/js/confetti.js";

// Copy table (docs/05). Praise/retry rotate randomly.
const PRAISE = ["Harika!", "Bravo!", "Çok güzel!", "Doğru!", "Süper!"];
const RETRY_PLANS = ["Tekrar dene!", "Olmadı, bir daha dene!"];
const ROUND_WORDS = "Tebrikler!"; // round end (spoken) + "Ana Sayfa"/"Tekrar oyna" buttons

const ACTIVITY = window.GAME_CONFIG.activity;
// Turkish number words 1–100, injected from app/lexicon.py (docs/08).
const NUM = window.GAME_CONFIG.lexicon.numberWords;
// 29 letters {char, lower, name} in alphabet order, injected from lexicon.py.
const LETTERS = window.GAME_CONFIG.lexicon.letters;

function letterName(char) {
  const l = LETTERS.find((x) => x.char === char);
  return l ? l.name : char;
}

const els = {
  instruction: document.getElementById("instruction"),
  replay: document.getElementById("replay"),
  area: document.getElementById("game-area"),
};

const CARD =
  "flex min-w-16 min-h-16 items-center justify-center rounded-3xl border-4 border-white bg-white shadow-lg";

// ---- shared helpers ----------------------------------------------------

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cap(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

let replayWords = "";
function say(words) {
  replayWords = words;
  speak(words);
}

// 🔊 replay button re-speaks the current instruction (docs/06 question flow).
els.replay.addEventListener("click", () => speak(replayWords));

function logAttempt(item, correct) {
  postJSON("/api/attempts", {
    activity: ACTIVITY,
    item: String(item),
    correct,
    via_voice: false,
  }).catch(() => {}); // fire-and-forget; errors silently ignored (docs/05)
}

function wobble(btn) {
  btn.classList.remove("shake");
  btn.classList.add("shake");
  btn.addEventListener(
    "animationend",
    () => btn.classList.remove("shake"),
    { once: true }
  );
}

// Option button (numeral answers). Entries ≥ 64px with chunky borders.
function optionButton(value, extra = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.value = String(value);
  b.textContent = String(value);
  b.className = `${CARD} ${extra} p-6 text-7xl font-extrabold hover:bg-amber-400`;
  return b;
}

// ---- question/round engine --------------------------------------------

// One option-question: render prompt + options, speak the instruction, then
// wait for the answer on the same screen. Only the FIRST tap on a question is
// logged (docs/06: unlimited retries, first attempt only). Wrong → shake +
// retry copy; correct → flash + confetti + chime + praise, then 1.2s pause.
// Resolves true if the child answered correctly on their first tap.
function askQuestion({ instruction, item, answer, options, promptNode }) {
  els.area.innerHTML = "";
  els.instruction.textContent = instruction;
  if (promptNode) els.area.append(promptNode);

  const optionRow = document.createElement("div");
  optionRow.className = "flex flex-wrap justify-center gap-4";
  const buttons = shuffle(options).map((o) => optionButton(o));
  optionRow.append(...buttons);
  els.area.append(optionRow);
  say(instruction);

  return new Promise((resolve) => {
    let solved = false;
    let firstLogDone = false;
    let firstCorrect = false;

    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (solved) return;
        const correct = btn.dataset.value === String(answer);

        if (!firstLogDone) {
          firstLogDone = true;
          firstCorrect = correct;
          logAttempt(item, correct);
        }
        if (correct) {
          solved = true;
          sfxSuccess();
          confetti();
          btn.classList.add("flash-success");
          say(randChoice(PRAISE));
          await delay(1200); // feedback beat before the next question
          resolve(firstCorrect);
        } else {
          sfxError();
          wobble(btn);
          speak(randChoice(RETRY_PLANS));
        }
      });
    });
  });
}

// distractor set: `count` unique values near answer (±maxOffset), never
// equal to the answer, in range [min, max].
function distractors(answer, count, min, max, maxOffset) {
  const set = new Set();
  while (set.size < count) {
    const d = randInt(min, max);
    if (d !== answer && Math.abs(d - answer) <= maxOffset) set.add(d);
  }
  return [...set];
}

async function endRound(correctCount) {
  // /api/rounds computes stars server-side (rule in docs/04).
  const data = await postJSON("/api/rounds", {
    activity: ACTIVITY,
    correct_count: correctCount,
  }).catch(() => null);
  showStars(data ? data.stars : 0);
}

// Round end screen: big 0–3 stars, praise TTS, "Tekrar oyna" / "Ana Sayfa".
function showStars(stars) {
  els.area.innerHTML = "";
  els.instruction.textContent = "";

  const box = document.createElement("div");
  box.className =
    "flex flex-col items-center gap-8 rounded-3xl border-4 border-white bg-white px-16 py-10 shadow-lg";

  const starRow = document.createElement("div");
  starRow.className = "flex items-center justify-center gap-4";
  for (let i = 0; i < 3; i++) {
    const s = document.createElement("span");
    s.textContent = "⭐";
    s.className = i < stars ? "text-8xl" : "text-8xl opacity-30";
    starRow.append(s);
  }

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex flex-wrap items-center justify-center gap-4";
  const again = document.createElement("button");
  again.type = "button";
  again.textContent = "Tekrar oyna";
  again.className = `${CARD} bg-amber-400 px-8 py-4 text-3xl font-extrabold hover:bg-amber-300`;
  again.addEventListener("click", start);
  const home = document.createElement("a");
  home.href = "/home";
  home.textContent = "Ana Sayfa";
  home.className = `${CARD} bg-amber-400 px-8 py-4 text-3xl font-extrabold hover:bg-amber-300`;
  buttonRow.append(again, home);

  box.append(starRow, buttonRow);
  els.area.append(box);
  speak(ROUND_WORDS + " " + randChoice(PRAISE));
}

async function runRound(fiveQuestions) {
  let correctCount = 0;
  for (const question of fiveQuestions) {
    const ok = await question();
    if (ok) correctCount++;
    await delay(400);
  }
  await endRound(correctCount);
}

// ---- numbers_count — "Nesneleri Say" -----------------------------------

async function questionCount() {
  // N = 1–20, easy skew: 60% of questions N ≤ 10 (docs/06).
  const n = Math.random() < 0.6 ? randInt(1, 10) : randInt(11, 20);
  const options = [n, ...distractors(n, 3, 1, 20, 5)];

  const apples = document.createElement("div");
  apples.className =
    "flex max-w-3xl flex-wrap justify-center gap-3 rounded-3xl border-4 border-white bg-white p-8 shadow-lg";
  for (let i = 0; i < n; i++) {
    const apple = document.createElement("span");
    apple.textContent = "🍎";
    apple.className = "text-6xl";
    apple.style.transform = `rotate(${randInt(-12, 12)}deg)`;
    apples.append(apple);
  }

  return askQuestion({
    instruction: "Elmaları say ve sayısını bul!",
    item: String(n),
    answer: n,
    options,
    promptNode: apples,
  });
}

// ---- numbers_next — "Sırada Hangi Sayı Var?" ---------------------------

async function questionNext() {
  // 3 consecutive numbers starting 1–15, then the "?" card (docs/06).
  const a = randInt(1, 15);
  const seq = [a, a + 1, a + 2];
  const answer = a + 3;
  const options = [answer, ...distractors(answer, 3, 1, 20, 3)];

  const seqRow = document.createElement("div");
  seqRow.className = "flex items-center justify-center gap-4";
  for (const value of seq) {
    const card = document.createElement("div");
    card.className = `${CARD} px-6 py-4 text-8xl font-extrabold`;
    card.textContent = String(value);
    seqRow.append(card);
  }
  const questionCard = document.createElement("div");
  questionCard.className = `${CARD} bg-rose-400 px-6 py-4 text-8xl font-extrabold`;
  questionCard.textContent = "?";
  seqRow.append(questionCard);

  return askQuestion({
    instruction: `Sayıları dinle: ${NUM[a]}, ${NUM[a + 1]}, ${NUM[a + 2]}. Sırada hangi sayı var?`,
    item: String(answer),
    answer,
    options,
    promptNode: seqRow,
  });
}

// ---- numbers_find — "Sayıyı Bul" ---------------------------------------

async function questionFind(questionIndex) {
  // 4 big numeral cards early, 6 later (docs/06: 4 → 6 in later questions).
  const target = randInt(1, 20);
  const optionCount = questionIndex >= 3 ? 6 : 4;
  const options = [target, ...distractors(target, optionCount - 1, 1, 20, 19)];

  return askQuestion({
    instruction: `${cap(NUM[target])} sayısını bul!`,
    item: String(target),
    answer: target,
    options,
  });
}

// ---- numbers_tens — "Onar Onar Sayalım" --------------------------------

async function numbersTens() {
  // The whole grid IS the choice set: 10 is highlighted + spoken; the child
  // taps the next card in sequence (docs/06). Correct tap → highlight + speak
  // its word; wrong tap → shake, retry. Every tap is logged.
  els.area.innerHTML = "";
  els.instruction.textContent = "";

  const tensRow = document.createElement("div");
  tensRow.className = "flex flex-wrap justify-center gap-4";
  const cardByValue = new Map();
  for (let value = 10; value <= 100; value += 10) {
    const card = document.createElement("button");
    card.type = "button";
    card.textContent = String(value);
    card.className = `${CARD} px-6 py-4 text-8xl font-extrabold hover:bg-amber-400`;
    cardByValue.set(value, card);
    tensRow.append(card);
  }
  els.area.append(tensRow);

  const state = { expect: 10, firstTries: 0, solving: true };

  function highlight(card) {
    card.classList.add("bg-emerald-400");
    card.classList.remove("hover:bg-amber-400");
  }

  // Card 10 is the spoken demo before any child tap (docs/06).
  function showDemo() {
    highlight(cardByValue.get(10));
    say(NUM[10]);
    state.expect = 20;
  }

  return new Promise((resolve) => {
    cardByValue.forEach((card, value) => {
      card.addEventListener("click", () => {
        if (!state.solving) return;
        if (card.classList.contains("bg-emerald-400")) return;

        if (value === state.expect) {
          if (!card.dataset.logged) state.firstTries++; // first try on this card
          card.dataset.logged = "1";
          logAttempt(String(value), true); // docs/06: log attempts per tap
          state.solving = false; // freeze taps while feedback plays
          highlight(card);
          sfxSuccess();
          say(NUM[value]);
          setTimeout(async () => {
            if (value === 100) {
              confetti();
              speak("Yüze kadar saydın! Harika!");
              await delay(1800);
              endRound(scoreTens(state.firstTries));
              resolve();
              return;
            }
            state.expect = value + 10;
            state.solving = true;
          }, 900);
        } else {
          logAttempt(String(value), false); // docs/06: log attempts per tap
          if (!card.dataset.logged) card.dataset.logged = "1";
          sfxError();
          wobble(card);
          speak(randChoice(RETRY_PLANS));
        }
      });
    });

    showDemo();
  });
}

// docs/06: "round result = taps correct on first try" over 9 taps, matched
// onto /api/rounds' 5-question scale (approved proportional map):
// ≥9 first-try taps → 5 (⭐⭐⭐), ≥6 → 4 (⭐⭐), ≥3 → 3 (⭐), else the raw count.
function scoreTens(firstTries) {
  if (firstTries >= 9) return 5;
  if (firstTries >= 6) return 4;
  if (firstTries >= 3) return 3;
  return firstTries;
}

// ---- letters_meet — "Harfleri Tanıyalım" -------------------------------

// Free play, no rounds/stars (docs/07): 29-letter grid, tap → pop + TTS name,
// card stays highlighted until the next tap. Every tap logs correct:true.
function lettersMeet() {
  els.area.innerHTML = "";
  els.instruction.textContent = "";

  let highlighted = null;
  let playing = false; // "Sırayla söyle" sequence; any tap cancels it

  const grid = document.createElement("div");
  grid.className = "flex max-w-3xl flex-wrap justify-center gap-3";
  const cards = LETTERS.map(({ char, lower, name }) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `${CARD} gap-2 p-3 hover:bg-amber-400`;

    const up = document.createElement("span");
    up.textContent = char;
    up.className = "text-6xl font-extrabold";
    const low = document.createElement("span");
    low.textContent = lower;
    low.className = "text-4xl font-bold opacity-70";
    card.append(up, low);

    card.addEventListener("click", () => {
      playing = false; // cancel the A→Z sequence on any tap (docs/07)
      window.speechSynthesis?.cancel();
      if (highlighted && highlighted !== card) {
        highlighted.classList.remove("bg-amber-400");
      }
      card.classList.add("bg-amber-400");
      highlighted = card;
      card.classList.add("pop");
      card.addEventListener(
        "animationend",
        () => card.classList.remove("pop"),
        { once: true }
      );
      logAttempt(char, true); // interest only, no round_results (docs/07)
      say(name);
    });
    return card;
  });
  grid.append(...cards);
  els.area.append(grid);

  async function playSequence() {
    for (const { name } of LETTERS) {
      if (!playing) return;
      say(name);
      await delay(900); // docs/07: one letter every 0.9s
    }
    playing = false;
  }

  const seqBtn = document.createElement("button");
  seqBtn.type = "button";
  seqBtn.textContent = "Sırayla söyle";
  seqBtn.className = `${CARD} bg-amber-400 px-8 py-4 text-3xl font-extrabold hover:bg-amber-300`;
  seqBtn.addEventListener("click", () => {
    if (playing) {
      playing = false; // second tap stops the sequence
      window.speechSynthesis?.cancel();
      return;
    }
    playing = true;
    playSequence();
  });
  els.area.append(seqBtn);
}

// ---- letters_find — "Harfi Bul" -----------------------------------------

// Visually confusable pairs (docs/07): with 50% probability one distractor
// is the target's pair (B/C, İ/I, Ö/O, Ü/U, Ş/S, Ğ/G).
const CONFUSABLE = {
  B: "C", C: "B", İ: "I", I: "İ", Ö: "O", O: "Ö",
  Ü: "U", U: "Ü", Ş: "S", S: "Ş", Ğ: "G", G: "Ğ",
};

async function questionLettersFind(questionIndex) {
  const target = randChoice(LETTERS).char;
  // 4 letter cards (questions 1–3), 6 cards (questions 4–5) — docs/07.
  const optionCount = questionIndex >= 3 ? 6 : 4;

  const pool = LETTERS.map((l) => l.char).filter((c) => c !== target);
  const distractorSet = new Set();
  const confusable = CONFUSABLE[target];
  if (confusable && Math.random() < 0.5) distractorSet.add(confusable);
  while (distractorSet.size < optionCount - 1) {
    distractorSet.add(randChoice(pool));
  }

  return askQuestion({
    instruction: `${letterName(target)} harfini bul!`,
    item: target,
    answer: target,
    options: [target, ...distractorSet],
  });
}

// ---- dispatch ----------------------------------------------------------

const games = {
  numbers_count: () =>
    runRound(Array.from({ length: 5 }, () => questionCount)),
  numbers_next: () =>
    runRound(Array.from({ length: 5 }, () => questionNext)),
  numbers_find: () =>
    runRound([0, 1, 2, 3, 4].map((i) => () => questionFind(i))),
  numbers_tens: numbersTens,
  letters_meet: lettersMeet,
  letters_find: () =>
    runRound([0, 1, 2, 3, 4].map((i) => () => questionLettersFind(i))),
};

function start() {
  const game = games[ACTIVITY];
  if (game) game();
}

start();
