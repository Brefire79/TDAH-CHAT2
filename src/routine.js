// routine.js - rotina visual simples com ate 3 acoes por bloco (nova, comecar, concluir)
export function createRoutine(state, elements, { onStartFocus, onReward, onChange, toast }) {
  const { tabs, taskList, addTaskBtn } = elements;

  const render = () => {
    taskList.innerHTML = "";
    const current = state.tasks[state.ui.slot] || [];
    current.forEach(task => {
      const item = document.createElement("div");
      item.className = "task";
      if (task.done) item.classList.add("is-done");
      item.innerHTML = `
        <div class="task__meta">
          <span class="task__icon">${task.icon}</span>
          <div>
            <div class="task__name">${task.name}</div>
            <div class="task__time">${task.minutes} min</div>
          </div>
        </div>
        <div class="task__actions" aria-label="Acoes da tarefa">
          <button class="chip" data-action="start" data-id="${task.id}" aria-label="Comecar ${task.name}">Comecar</button>
          <button class="chip" data-action="done" data-id="${task.id}" aria-label="Concluir ${task.name}">${task.done ? "Feito" : "Concluir"}</button>
        </div>
      `;
      taskList.appendChild(item);
    });
    if (!current.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Nenhuma tarefa aqui.";
      taskList.appendChild(empty);
    }
  };

  const addTaskFlow = () => {
    const name = window.prompt("Nome curto da tarefa:");
    if (!name) return;
    const minutes = Number(window.prompt("Minutos estimados:") || 10);
    const icon = window.prompt("Escolha um emoji (ex: 🙂):", "⭐") || "⭐";
    const id = `${state.ui.slot}-${Date.now()}`;
    state.tasks[state.ui.slot].push({
      id,
      name: name.slice(0, 24),
      icon: icon.slice(0, 2),
      minutes: minutes || 5,
      done: false
    });
    render();
    onChange();
    toast("Tarefa criada 👍");
  };

  const toggleTask = (action, id) => {
    const list = state.tasks[state.ui.slot];
    const task = list.find(t => t.id === id);
    if (!task) return;
    if (action === "done") {
      task.done = !task.done;
      if (task.done) onReward();
      toast(task.done ? "Mais uma concluida 💪" : "Tarefa reaberta");
    }
    if (action === "start") {
      onStartFocus(task.minutes);
      toast(`Foco de ${task.minutes} min`);
    }
    render();
    onChange();
  };

  const bind = () => {
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        state.ui.slot = tab.dataset.slot;
        tabs.forEach(t => {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab);
        });
        render();
      });
    });

    addTaskBtn.addEventListener("click", addTaskFlow);

    taskList.addEventListener("click", e => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      toggleTask(btn.dataset.action, btn.dataset.id);
    });
  };

  return { bind, render, addTaskFlow };
}
