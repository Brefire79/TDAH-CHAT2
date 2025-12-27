// app.js - orquestra rotinas, foco, recompensas, emocao e persistencia
import { loadState, saveState, setFlag, getFlag, clearTimers } from "./storage.js";
import { createRoutine } from "./routine.js";
import { createFocus } from "./focus.js";
import { createRewards } from "./rewards.js";
import { createEmotions } from "./emotions.js";

const defaultState = {
  profile: { name: "", age: "", avatar: "🙂", sound: false, contrast: false, fontLarge: false },
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

const state = loadState(defaultState);

const el = {
  nameInput: document.getElementById("name-input"),
  ageInput: document.getElementById("age-input"),
  avatarButtons: document.querySelectorAll(".avatar-option"),
  soundToggle: document.getElementById("sound-toggle"),
  contrastToggle: document.getElementById("contrast-toggle"),
  fontToggle: document.getElementById("font-toggle"),
  avatarDisplay: document.getElementById("avatar-display"),
  childName: document.getElementById("child-name"),
  childAge: document.getElementById("child-age"),
  profileForm: document.getElementById("profile-form"),
  tabs: document.querySelectorAll(".tab"),
  taskList: document.getElementById("task-list"),
  addTaskBtn: document.getElementById("btn-add-task"),
  chips: document.querySelectorAll(".chip[data-minutes]"),
  startFocusBtn: document.getElementById("btn-start-focus"),
  focusTimer: document.getElementById("focus-timer"),
  focusStatus: document.getElementById("focus-status"),
  calmAnimation: document.getElementById("calm-animation"),
  points: document.getElementById("points"),
  streak: document.getElementById("streak"),
  badges: document.getElementById("badges"),
  moodTip: document.getElementById("mood-tip"),
  moodButtons: document.querySelectorAll(".chip[data-mood]"),
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
  fontButton: document.getElementById("btn-font"),
  onboarding: {
    wrapper: document.getElementById("onboarding"),
    text: document.getElementById("onboarding-text"),
    dots: document.querySelectorAll(".onboarding__steps .dot"),
    next: document.getElementById("onboarding-next"),
    skip: document.getElementById("onboarding-skip")
  }
};

let toastTimeout;
const toast = (message) => {
  clearTimeout(toastTimeout);
  el.toast.textContent = message;
  el.toast.classList.add("show");
  toastTimeout = setTimeout(() => el.toast.classList.remove("show"), 2200);
};

const persist = () => saveState(state);

const rewards = createRewards(state, { points: el.points, streak: el.streak, badges: el.badges }, { toast, persist });
const focus = createFocus(state, { chips: el.chips, startFocusBtn: el.startFocusBtn, focusTimer: el.focusTimer, focusStatus: el.focusStatus, calmAnimation: el.calmAnimation }, { onReward: rewards.awardForFocus, toast });
const routine = createRoutine(state, { tabs: el.tabs, taskList: el.taskList, addTaskBtn: el.addTaskBtn }, { onStartFocus: (minutes) => focus.start(minutes), onReward: rewards.awardForTask, onChange: persist, toast });
const emotions = createEmotions({ moodButtons: el.moodButtons, moodTip: el.moodTip }, toast);

const renderProfile = () => {
  el.avatarDisplay.textContent = state.profile.avatar;
  el.childName.textContent = state.profile.name ? `Ola, ${state.profile.name}` : "Ola!";
  el.childAge.textContent = state.profile.age ? `${state.profile.age} anos` : "Defina seu perfil";
  el.nameInput.value = state.profile.name;
  el.ageInput.value = state.profile.age;
  el.soundToggle.checked = state.profile.sound;
  el.contrastToggle.checked = state.profile.contrast;
  el.fontToggle.checked = state.profile.fontLarge;
  document.body.dataset.contrast = state.profile.contrast ? "high" : "";
  document.body.dataset.fontSize = state.profile.fontLarge ? "large" : "normal";
  el.accessibility.setAttribute("aria-pressed", state.profile.contrast);
  el.fontButton.setAttribute("aria-pressed", state.profile.fontLarge);
  el.avatarButtons.forEach(btn => {
    const active = btn.dataset.avatar === state.profile.avatar;
    btn.setAttribute("aria-pressed", active);
  });
};

const renderParent = () => {
  el.parentRewards.checked = state.parent.rewardsOn;
  el.parentFocus.checked = state.parent.focusOn;
  el.parentNote.value = state.parent.note;
  el.parentData.textContent = state.parent.note ? `Mensagem do dia: ${state.parent.note}` : "";
};

const toggleParentPanel = () => {
  const isHidden = el.parentPanel.hasAttribute("hidden");
  el.parentPanel.toggleAttribute("hidden");
  el.parentToggle.setAttribute("aria-pressed", String(isHidden));
};

const bindProfile = () => {
  el.avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      state.profile.avatar = btn.dataset.avatar;
      renderProfile();
      persist();
    });
  });

  el.profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.profile.name = el.nameInput.value.trim();
    state.profile.age = el.ageInput.value.trim();
    state.profile.sound = el.soundToggle.checked;
    state.profile.contrast = el.contrastToggle.checked;
    state.profile.fontLarge = el.fontToggle.checked;
    renderProfile();
    persist();
    toast("Perfil salvo");
  });

  el.accessibility.addEventListener("click", () => {
    state.profile.contrast = !state.profile.contrast;
    renderProfile();
    persist();
  });

  el.fontButton.addEventListener("click", () => {
    state.profile.fontLarge = !state.profile.fontLarge;
    renderProfile();
    persist();
  });
};

const bindParent = () => {
  el.parentToggle.addEventListener("click", toggleParentPanel);
  el.parentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (el.parentPin.value.length < 4) {
      toast("Use 4 digitos");
      return;
    }
    state.parent.pin = el.parentPin.value;
    state.parent.rewardsOn = el.parentRewards.checked;
    state.parent.focusOn = el.parentFocus.checked;
    state.parent.note = el.parentNote.value.trim();
    renderParent();
    persist();
    toast("Ajustes salvos");
  });
};

const onboardingSteps = [
  "Use o app para guiar seu dia, sem pressa.",
  "Veja manha / tarde / noite e conclua tarefas simples.",
  "Escolha 10, 15 ou 20 minutos e aperte Comecar para focar."
];
let onboardingIndex = 0;

const updateOnboardingDots = () => {
  el.onboarding.dots.forEach((dot, i) => {
    dot.classList.toggle("dot--active", i === onboardingIndex);
  });
};

const updateOnboardingContent = () => {
  el.onboarding.text.textContent = onboardingSteps[onboardingIndex];
  updateOnboardingDots();
};

const showOnboarding = () => {
  onboardingIndex = 0;
  el.onboarding.wrapper.hidden = false;
  updateOnboardingContent();
};

const hideOnboarding = () => {
  el.onboarding.wrapper.hidden = true;
  setFlag("onboardingDone", true);
};

const bindOnboarding = () => {
  el.onboarding.next.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onboardingIndex >= onboardingSteps.length - 1) {
      hideOnboarding();
      return;
    }
    onboardingIndex += 1;
    updateOnboardingContent();
  });
  el.onboarding.skip.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideOnboarding();
  });
};

const registerSW = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(err => console.warn("SW", err));
  }
};

const bindShortcuts = () => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !el.onboarding.wrapper.hidden) {
      hideOnboarding();
    }
  });
};

function init() {
  renderProfile();
  renderParent();
  rewards.render();
  routine.render();
  focus.selectFocus(state.ui.focusMinutes || 10);
  bindProfile();
  bindParent();
  routine.bind();
  focus.bind();
  emotions.bind();
  bindOnboarding();
  bindShortcuts();
  registerSW();

  if (!getFlag("onboardingDone")) showOnboarding();
}

window.addEventListener("beforeunload", () => {
  clearTimers(state);
});

init();
