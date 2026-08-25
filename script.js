const display = document.querySelector("#timerDisplay");
const prompt = document.querySelector("#timerPrompt");
const startButton = document.querySelector("#startButton");
const startLabel = startButton.querySelector("span");
const resetButton = document.querySelector("#resetButton");
const tabs = [...document.querySelectorAll(".mode-tab")];
const sessionCount = document.querySelector("#sessionCount");
const progressBar = document.querySelector("#progressBar");
const soundButton = document.querySelector("#soundButton");
const themeButton = document.querySelector("#themeButton");

let secondsLeft = 25 * 60;
let selectedMinutes = 25;
let intervalId = null;
let sessions = 0;
let soundEnabled = true;

const modeNames = { focus: "focus", short: "break", long: "break" };

function renderTime() {
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  display.textContent = `${minutes}:${seconds}`;
  display.setAttribute("aria-label", `${Math.floor(secondsLeft / 60)} minutes and ${secondsLeft % 60} seconds remaining`);
  document.title = `${minutes}:${seconds} — Pomelo`;
}

function setRunning(running) {
  startButton.classList.toggle("running", running);
  startLabel.textContent = running ? "Pause" : `Start ${modeNames[tabs.find(tab => tab.classList.contains("active")).dataset.mode]}`;
  prompt.textContent = running ? "Stay with it. You’re doing great." : "Ready when you are.";
}

function playChime() {
  if (!soundEnabled) return;
  const context = new (window.AudioContext || window.webkitAudioContext)();
  [0, .18].forEach((delay, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = index ? 660 : 520;
    gain.gain.setValueAtTime(.12, context.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + delay + .5);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + delay);
    oscillator.stop(context.currentTime + delay + .5);
  });
}

function completeTimer() {
  clearInterval(intervalId);
  intervalId = null;
  if (tabs[0].classList.contains("active")) {
    sessions = Math.min(sessions + 1, 4);
    sessionCount.innerHTML = `${sessions} <span>/ 4</span>`;
    progressBar.style.width = `${sessions * 25}%`;
  }
  playChime();
  setRunning(false);
  prompt.textContent = "Session complete. Take a breath.";
}

startButton.addEventListener("click", () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    setRunning(false);
    prompt.textContent = "Paused. Start again when you’re ready.";
    return;
  }
  setRunning(true);
  intervalId = setInterval(() => {
    secondsLeft -= 1;
    renderTime();
    if (secondsLeft <= 0) completeTimer();
  }, 1000);
});

resetButton.addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
  secondsLeft = selectedMinutes * 60;
  renderTime();
  setRunning(false);
});

tabs.forEach(tab => tab.addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", active.toString());
  });
  selectedMinutes = Number(tab.dataset.minutes);
  secondsLeft = selectedMinutes * 60;
  renderTime();
  setRunning(false);
}));

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute("aria-pressed", (!soundEnabled).toString());
  soundButton.setAttribute("aria-label", soundEnabled ? "Mute completion sound" : "Enable completion sound");
  soundButton.style.opacity = soundEnabled ? "1" : ".45";
});

themeButton.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  themeButton.setAttribute("aria-pressed", dark.toString());
  themeButton.setAttribute("aria-label", dark ? "Use light theme" : "Use dark theme");
});

renderTime();
