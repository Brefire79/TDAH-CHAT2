// emotions.js - check-in emocional simples com uma dica curta por vez
const moodTips = {
  ok: "Continue! Pequena pausa de agua.",
  neutral: "Respire fundo 3 vezes.",
  sad: "Que tal respirar 30s?",
  angry: "Pause 2 minutos e respire lento."
};

export function createEmotions(elements, toast) {
  const { moodButtons, moodTip } = elements;

  const handleMood = (mood) => {
    moodTip.textContent = moodTips[mood] || "Diga como se sente.";
    toast("Estou com voce");
  };

  const bind = () => {
    moodButtons.forEach(btn => {
      btn.addEventListener("click", () => handleMood(btn.dataset.mood));
    });
  };

  return { bind };
}
