// rewards.js - controla estrelas, streak e medalhas leves para progresso pessoal
export function createRewards(state, elements, { toast, persist }) {
  const { points: pointsEl, streak: streakEl, badges: badgesEl } = elements;

  const render = () => {
    pointsEl.textContent = state.rewards.points;
    streakEl.textContent = state.rewards.streak;
    badgesEl.innerHTML = "";
    const badges = [];
    if (state.rewards.streak >= 3) badges.push("3 dias seguidos");
    if (state.rewards.points >= 5) badges.push("5 estrelas");
    if (state.rewards.points >= 10) badges.push("10 estrelas");
    badges.forEach(text => {
      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = text;
      badgesEl.appendChild(badge);
    });
  };

  const updateStreak = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.rewards.lastDay === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.rewards.streak = state.rewards.lastDay === yesterday ? state.rewards.streak + 1 : 1;
    state.rewards.lastDay = today;
  };

  const awardPoint = (message) => {
    state.rewards.points += 1;
    updateStreak();
    render();
    persist();
    if (message) toast(message);
  };

  return {
    render,
    awardForTask() {
      if (!state.parent.rewardsOn) return;
      awardPoint("Mais uma concluida 💪");
    },
    awardForFocus() {
      if (!state.parent.rewardsOn) return;
      awardPoint("Mandou bem! 👏");
    }
  };
}
