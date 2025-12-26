// Estado principal do app
const state = {
  profile: { name: "", age: "", avatar: "🙂", sound: false, contrast: false },
  tasks: {
    morning: [
      { id: "m1", name: "Escovar dentes", icon: "🪥", minutes: 5, done: false },
      { id: "m2", name: "Cafe da manha", icon: "🥣", minutes: 10, done: false }
    ],
    afternoon: [
      { id: "t1", name: "Ler 15 min", icon: "📖", minutes: 15, done: false },
      { id: "t2", name: "Dever de casa", icon: "✏️", minutes: 20, done: false }
    ],
    night: [
      { id: "n1", name: "Organizar mochila", icon: "🎒", minutes: 10, done: false },
      { id: "n2", name: "Relaxar", icon: "🧘", minutes: 10, done: false }
    ]
  },
  rewards: { points: 0, streak: 0, lastDay: "" },
  parent: { pin: "", rewardsOn: true, focusOn: true, note: "" },
  ui: { slot: "morning", focusMinutes: 10, timerId: null, remaining: 0 }
};

const el = {
  nameInput: document.getElementById("name-input"),
  ageInput: document.getElementById("age-input"),
  avatarButtons: document.querySelectorAll(".avatar-option"),
  soundToggle: document.getElementById("sound-toggle"),
  contrastToggle: document.getElementById("contrast-toggle"),
  avatarDisplay: document.getElementById("avatar-display"),
  childName: document.getElementById("child-name"),
  childAge: document.getElementById("child-age"),
  profileForm: document.getElementById("profile-form"),
  tabs: document.querySelectorAll(".tab"),
  taskList: document.getElementById("task-list"),
  addTask: document.getElementById("btn-add-task"),
  chips: document.querySelectorAll(".chip[data-minutes]"),
  startFocus: document.getElementById("btn-start-focus"),
  focusTimer: document.getElementById("focus-timer"),
  focusStatus: document.getElementById("focus-status"),
  calmAnimation: document.getElementById("calm-animation"),
  points: document.getElementById("points"),
  streak: document.getElementById("streak"),
  badges: document.getElementById("badges"),
  moodTip: document.getElementById("mood-tip"),
  parentToggle: document.getElementById("btn-parent-toggle"),
  parentPanel: document.getElementById("parent-panel"),
  parentForm: document.getElementById("parent-form"),
  parentPin: document.getElementById("parent-pin"),
  parentRewards: document.getElementById("parent-rewards"),
  parentFocus: document.getElementById("parent-focus"),
  parentNote: document.getElementById("parent-note"),
  parentData: document.getElementById("parent-data"),
  toast: document.getElementById("toast"),
  accessibility: document.getElementById("btn-accessibility"),
  moodButtons: document.querySelectorAll(".chip[data-mood]")
};

// Persistencia simples
function saveState() {
  localStorage.setItem("rotina-calma", JSON.stringify(state));
}

function loadState() {
  const data = localStorage.getItem("rotina-calma");
  if (!data) return;
  try {
    const parsed = JSON.parse(data);
    Object.assign(state, parsed);
  } catch (err) {
    console.warn("Falha ao carregar dados", err);
  }
}

// Perfil
function renderProfile() {
  el.avatarDisplay.textContent = state.profile.avatar;
  el.childName.textContent = state.profile.name ? `Ola, ${state.profile.name}` : "Ola!";
  el.childAge.textContent = state.profile.age ? `${state.profile.age} anos` : "Defina seu perfil";
  el.nameInput.value = state.profile.name;
  el.ageInput.value = state.profile.age;
  el.soundToggle.checked = state.profile.sound;
  el.contrastToggle.checked = state.profile.contrast;
  document.body.dataset.contrast = state.profile.contrast ? "high" : "";
  el.accessibility.setAttribute("aria-pressed", state.profile.contrast);
  el.avatarButtons.forEach(btn => {
    const active = btn.dataset.avatar === state.profile.avatar;
    btn.setAttribute("aria-pressed", active);
  });
}

// Rotina
function renderTasks() {
  el.taskList.innerHTML = "";
  const current = state.tasks[state.ui.slot] || [];
  current.forEach(task => {
    const item = document.createElement("div");
    item.className = "task";
    item.innerHTML = `
      <div class="task__meta">
        <span class="task__icon">${task.icon}</span>
        <div>
          <div class="task__name">${task.name}</div>
          <div class="task__time">${task.minutes} min</div>
        </div>
      </div>
      <div class="task__actions">
        <button class="chip" data-action="start" data-id="${task.id}">Comecar</button>
        <button class="chip" data-action="done" data-id="${task.id}">${task.done ? "Concluido" : "Concluir"}</button>
      </div>
    `;
    if (task.done) item.classList.add("is-done");
    el.taskList.appendChild(item);
  });
  if (!current.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nenhuma tarefa. Adicione uma tarefa.";
    el.taskList.appendChild(empty);
  }
}

function addTaskFlow() {
  const name = window.prompt("Nome da tarefa curta:");
  if (!name) return;
  const minutes = Number(window.prompt("Tempo estimado em minutos:") || 10);
  const icon = window.prompt("Emoji simples (ex: 🙂):", "⭐") || "⭐";
  const id = `${state.ui.slot}-${Date.now()}`;
  state.tasks[state.ui.slot].push({ id, name: name.slice(0, 24), icon: icon.slice(0, 2), minutes: minutes || 5, done: false });
  renderTasks();
  saveState();
  showToast("Tarefa adicionada");
}

function toggleTask(action, id) {
  const list = state.tasks[state.ui.slot];
  const task = list.find(t => t.id === id);
  if (!task) return;
  if (action === "done") {
    task.done = !task.done;
    if (task.done && state.rewards.points !== undefined && state.parent.rewardsOn) {
      state.rewards.points += 1;
      updateStreak();
      renderProgress();
    }
  }
  if (action === "start") {
    startFocusTimer(task.minutes);
    showToast(`Foco de ${task.minutes} min iniciado`);
  }
  renderTasks();
  saveState();
}

// Modo foco
function selectFocus(minutes) {
  state.ui.focusMinutes = minutes;
  el.chips.forEach(ch => ch.classList.toggle("active", Number(ch.dataset.minutes) === minutes));
}

function formatTime(total) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startFocusTimer(customMinutes) {
  if (!state.parent.focusOn) {
    showToast("Modo foco desativado pelos pais");
    return;
  }
  clearInterval(state.ui.timerId);
  const minutes = customMinutes || state.ui.focusMinutes || 10;
  state.ui.remaining = minutes * 60;
  el.focusStatus.textContent = "Focando... Respire fundo.";
  el.calmAnimation.style.opacity = "1";
  tick();
  state.ui.timerId = setInterval(tick, 1000);
}

function tick() {
  if (state.ui.remaining <= 0) {
    clearInterval(state.ui.timerId);
    el.focusTimer.textContent = "00:00";
    el.focusStatus.textContent = "Bom trabalho! Pausa curta.";
    el.calmAnimation.style.opacity = "0.4";
    if (state.profile.sound && "speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance("Tempo concluido. Muito bem!");
      window.speechSynthesis.speak(msg);
    }
    if (state.parent.rewardsOn) {
      state.rewards.points += 1;
      updateStreak();
      renderProgress();
      saveState();
    }
    return;
  }
  el.focusTimer.textContent = formatTime(state.ui.remaining);
  state.ui.remaining -= 1;
}

// Recompensas
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.rewards.lastDay === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.rewards.lastDay === yesterday) {
    state.rewards.streak += 1;
  } else {
    state.rewards.streak = 1;
  }
  state.rewards.lastDay = today;
}

function renderProgress() {
  el.points.textContent = state.rewards.points;
  el.streak.textContent = state.rewards.streak;
  el.badges.innerHTML = "";
  const badges = [];
  if (state.rewards.streak >= 3) badges.push("3 dias seguidos");
  if (state.rewards.points >= 5) badges.push("5 estrelas" );
  if (state.rewards.points >= 10) badges.push("10 estrelas");
  badges.forEach(text => {
    const b = document.createElement("div");
    b.className = "badge";
    b.textContent = text;
    el.badges.appendChild(b);
  });
}

// Emocoes
const moodTips = {
  ok: "Continue assim! Pequena pausa de agua.",
  neutral: "Respire fundo por 3 vezes.",
  sad: "Tudo bem ficar triste. Fale com um adulto.",
  angry: "Pare 2 minutos e respire lento."
};

function handleMood(mood) {
  el.moodTip.textContent = moodTips[mood] || "Diga como se sente.";
  showToast("Vamos cuidar do que sente");
}

// Painel dos pais
function toggleParentPanel() {
  const isHidden = el.parentPanel.hasAttribute("hidden");
  el.parentPanel.toggleAttribute("hidden");
  el.parentToggle.setAttribute("aria-pressed", String(isHidden));
}

function renderParent() {
  el.parentRewards.checked = state.parent.rewardsOn;
  el.parentFocus.checked = state.parent.focusOn;
  el.parentNote.value = state.parent.note;
  el.parentData.textContent = state.parent.note ? `Mensagem do dia: ${state.parent.note}` : "";
}

// Toast
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  el.toast.textContent = message;
  el.toast.classList.add("show");
  toastTimeout = setTimeout(() => el.toast.classList.remove("show"), 2200);
}

// Service worker
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(err => console.warn("SW", err));
  }
}

// Eventos
function bindEvents() {
  el.avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      state.profile.avatar = btn.dataset.avatar;
      renderProfile();
      saveState();
    });
  });

  el.profileForm.addEventListener("submit", e => {
    e.preventDefault();
    state.profile.name = el.nameInput.value.trim();
    state.profile.age = el.ageInput.value.trim();
    state.profile.sound = el.soundToggle.checked;
    state.profile.contrast = el.contrastToggle.checked;
    renderProfile();
    saveState();
    showToast("Perfil salvo");
  });

  el.accessibility.addEventListener("click", () => {
    state.profile.contrast = !state.profile.contrast;
    renderProfile();
    saveState();
  });

  el.tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      state.ui.slot = tab.dataset.slot;
      el.tabs.forEach(t => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab);
      });
      renderTasks();
    });
  });

  el.addTask.addEventListener("click", addTaskFlow);

  el.taskList.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    toggleTask(btn.dataset.action, btn.dataset.id);
  });

  el.chips.forEach(ch => {
    ch.addEventListener("click", () => selectFocus(Number(ch.dataset.minutes)));
  });

  el.startFocus.addEventListener("click", () => startFocusTimer());

  el.moodButtons.forEach(btn => {
    btn.addEventListener("click", () => handleMood(btn.dataset.mood));
  });

  el.parentToggle.addEventListener("click", toggleParentPanel);

  el.parentForm.addEventListener("submit", e => {
    e.preventDefault();
    if (el.parentPin.value.length < 4) {
      showToast("Use 4 digitos");
      return;
    }
    state.parent.pin = el.parentPin.value;
    state.parent.rewardsOn = el.parentRewards.checked;
    state.parent.focusOn = el.parentFocus.checked;
    state.parent.note = el.parentNote.value.trim();
    renderParent();
    saveState();
    showToast("Ajustes salvos");
  });
}

function init() {
  loadState();
  renderProfile();
  renderTasks();
  renderProgress();
  renderParent();
  selectFocus(state.ui.focusMinutes);
  bindEvents();
  registerSW();
}

init();
