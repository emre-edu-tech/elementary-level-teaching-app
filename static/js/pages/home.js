// Home page: the welcome card greets the child with a chime + Turkish TTS
// when tapped. A deliberate tap is required because browsers block speech
// before any user gesture; no Turkish voice installation is needed.
// The card bounces and the hand waves until the first tap (attention cue),
// then the animation is removed so it rests.

import { speak } from "../tts.js";
import { sfxSuccess } from "../sounds.js";

const name = document.body.dataset.profileName || "";
const greeting = name ? `Hoş geldin ${name}!` : "Hoş geldin!";

const button = document.getElementById("welcome-button");
button.addEventListener("click", () => {
  button.classList.remove("welcome-attention");
  sfxSuccess();
  speak(greeting);
});
