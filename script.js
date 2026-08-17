const MODE_COLORS = { focus: '#e5533c', short: '#3ca66e', long: '#3c7ae5' };
const MODE_LABELS = { focus: 'Foco', short: 'Pausa curta', long: 'Pausa longa' };

const timeEl = document.getElementById('time');
const cycleLabelEl = document.getElementById('cycle-label');
const ringProgress = document.querySelector('.ring-progress');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const modeBtns = document.querySelectorAll('.mode-btn');
const focusInput = document.getElementById('focus-input');
const shortInput = document.getElementById('short-input');
const longInput = document.getElementById('long-input');
const cyclesInput = document.getElementById('cycles-input');
const sessionsCountEl = document.getElementById('sessions-count');
const focusTotalEl = document.getElementById('focus-total');
const historyListEl = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

const CIRCUMFERENCE = 565.48;

let mode = 'focus';
let cycleNum = 1;
let secondsLeft = getDurationSeconds('focus');
let totalSeconds = secondsLeft;
let running = false;
let intervalId = null;

function getDurationMinutes(m) {
  if (m === 'focus') return parseInt(focusInput.value, 10) || 25;
  if (m === 'short') return parseInt(shortInput.value, 10) || 5;
  return parseInt(longInput.value, 10) || 15;
}

function getDurationSeconds(m) {
  return getDurationMinutes(m) * 60;
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function updateDisplay() {
  timeEl.textContent = formatTime(secondsLeft);
  const cyclesTotal = parseInt(cyclesInput.value, 10) || 4;
  cycleLabelEl.textContent = mode === 'focus'
    ? `Ciclo ${cycleNum} de ${cyclesTotal}`
    : MODE_LABELS[mode];
  const progress = 1 - secondsLeft / totalSeconds;
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * progress;
  document.documentElement.style.setProperty('--accent', MODE_COLORS[mode]);
  document.title = `${formatTime(secondsLeft)} · ${MODE_LABELS[mode]}`;
}

function setMode(newMode, resetCycle = false) {
  mode = newMode;
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === newMode));
  totalSeconds = getDurationSeconds(newMode);
  secondsLeft = totalSeconds;
  if (resetCycle) cycleNum = 1;
  pause();
  updateDisplay();
}

function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [0, 0.15, 0.3].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 2 ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.3);
    });
  } catch (e) { /* audio unavailable */ }
}

function tick() {
  secondsLeft--;
  if (secondsLeft < 0) {
    completeSession();
    return;
  }
  updateDisplay();
}

function completeSession() {
  pause();
  playDing();

  if (mode === 'focus') {
    logHistory('focus', getDurationMinutes('focus'));
    const cyclesTotal = parseInt(cyclesInput.value, 10) || 4;
    if (cycleNum >= cyclesTotal) {
      setMode('long', true);
    } else {
      cycleNum++;
      setMode('short');
    }
  } else {
    setMode('focus');
  }
  updateDisplay();
}

function start() {
  running = true;
  startPauseBtn.textContent = 'Pausar';
  intervalId = setInterval(tick, 1000);
}

function pause() {
  running = false;
  startPauseBtn.textContent = secondsLeft === totalSeconds ? 'Iniciar' : 'Continuar';
  clearInterval(intervalId);
}

function reset() {
  pause();
  totalSeconds = getDurationSeconds(mode);
  secondsLeft = totalSeconds;
  startPauseBtn.textContent = 'Iniciar';
  updateDisplay();
}

startPauseBtn.addEventListener('click', () => {
  if (running) {
    pause();
  } else {
    start();
  }
});

resetBtn.addEventListener('click', reset);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

[focusInput, shortInput, longInput, cyclesInput].forEach(input => {
  input.addEventListener('change', () => {
    if (!running) {
      totalSeconds = getDurationSeconds(mode);
      secondsLeft = totalSeconds;
      updateDisplay();
    }
  });
});

// --- History (localStorage, per day) ---
function todayKey() {
  const d = new Date();
  return `pomodoro-history-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(todayKey())) || [];
  } catch (e) {
    return [];
  }
}

function saveHistory(entries) {
  localStorage.setItem(todayKey(), JSON.stringify(entries));
}

function logHistory(type, minutes) {
  const entries = loadHistory();
  entries.push({
    type,
    minutes,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
  saveHistory(entries);
  renderHistory();
}

function renderHistory() {
  const entries = loadHistory();
  historyListEl.innerHTML = '';
  let totalFocusMin = 0;
  entries.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<span>🍅 Foco (${entry.minutes} min)</span><span>${entry.time}</span>`;
    historyListEl.appendChild(li);
    totalFocusMin += entry.minutes;
  });
  sessionsCountEl.textContent = entries.length;
  focusTotalEl.textContent = `${totalFocusMin}min`;
}

clearHistoryBtn.addEventListener('click', () => {
  saveHistory([]);
  renderHistory();
});

updateDisplay();
renderHistory();

// --- PWA: install prompt + service worker ---
const installBtn = document.getElementById('install-btn');
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installBtn.classList.add('hidden');
});

window.addEventListener('appinstalled', () => {
  installBtn.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
