// focus.js - modo foco curto com timer simples e feedback calmo
export function createFocus(state, elements, { onReward, toast }) {
  const { chips, startFocusBtn, focusTimer, focusStatus, calmAnimation } = elements;

  const selectFocus = (minutes) => {
    state.ui.focusMinutes = minutes;
    chips.forEach(ch => ch.classList.toggle("active", Number(ch.dataset.minutes) === minutes));
  };

  const formatTime = (total) => {
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const finishFocus = () => {
    clearInterval(state.ui.timerId);
    state.ui.timerId = null;
    focusTimer.textContent = "00:00";
    focusStatus.textContent = "Mandou bem! Pausa curta.";
    calmAnimation.style.opacity = "0.4";
    onReward();
    if (state.profile.sound && "speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance("Tempo concluido. Muito bem!");
      window.speechSynthesis.speak(msg);
    }
  };

  const tick = () => {
    if (state.ui.remaining <= 0) {
      finishFocus();
      return;
    }
    focusTimer.textContent = formatTime(state.ui.remaining);
    state.ui.remaining -= 1;
  };

  const start = (customMinutes) => {
    if (!state.parent.focusOn) {
      toast("Modo foco desativado pelos pais");
      return;
    }
    clearInterval(state.ui.timerId);
    const minutes = customMinutes || state.ui.focusMinutes || 10;
    state.ui.remaining = minutes * 60;
    focusStatus.textContent = "Focando... Respire tranquilo.";
    calmAnimation.style.opacity = "1";
    tick();
    state.ui.timerId = setInterval(tick, 1000);
  };

  const bind = () => {
    chips.forEach(ch => ch.addEventListener("click", () => selectFocus(Number(ch.dataset.minutes))));
    startFocusBtn.addEventListener("click", () => start());
  };

  return { bind, selectFocus, start };
}
