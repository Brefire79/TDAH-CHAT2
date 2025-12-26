// storage.js - persiste estado local e flags de onboarding sem dados sensíveis
const STATE_KEY = "rotina-calma-state-v2";
const FLAGS_KEY = "rotina-calma-flags-v2";

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn("Falha ao parsear storage", err);
    return fallback;
  }
};

export function loadState(defaultState) {
  const stored = safeParse(localStorage.getItem(STATE_KEY), null);
  if (!stored) return JSON.parse(JSON.stringify(defaultState));
  // merge previsível por seções conhecidas
  return {
    ...defaultState,
    ...stored,
    profile: { ...defaultState.profile, ...stored.profile },
    tasks: {
      morning: stored.tasks?.morning || defaultState.tasks.morning,
      afternoon: stored.tasks?.afternoon || defaultState.tasks.afternoon,
      night: stored.tasks?.night || defaultState.tasks.night
    },
    rewards: { ...defaultState.rewards, ...stored.rewards },
    parent: { ...defaultState.parent, ...stored.parent },
    ui: { ...defaultState.ui, ...stored.ui }
  };
}

export function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function getFlag(key) {
  const flags = safeParse(localStorage.getItem(FLAGS_KEY), {});
  return flags[key];
}

export function setFlag(key, value = true) {
  const flags = safeParse(localStorage.getItem(FLAGS_KEY), {});
  flags[key] = value;
  localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
}

export function clearTimers(state) {
  if (state.ui.timerId) {
    clearInterval(state.ui.timerId);
    state.ui.timerId = null;
  }
}
