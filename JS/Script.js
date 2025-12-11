// script.js

// Seletores principais
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".btn-filter");
const clearCompletedBtn = document.getElementById("clear-completed");

// Estado das tarefas em memória
let tasks = [];
let currentFilter = "all"; // all | pending | done

// Carrega tarefas do localStorage ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("devtasks");
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (err) {
      console.error("Erro ao ler devtasks do localStorage", err);
      tasks = [];
    }
  }
  renderTasks();
});

// Salva estado no localStorage
function saveTasks() {
  localStorage.setItem("devtasks", JSON.stringify(tasks));
}

// Cria uma nova tarefa
function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now(),
    title: trimmed,
    done: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask); // adiciona no topo
  saveTasks();
  renderTasks();
}

// Alterna o status de concluída
function toggleTaskDone(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, done: !task.done } : task
  );
  saveTasks();
  renderTasks();
}

// Remove uma tarefa
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

// Limpa todas as tarefas concluídas
function clearCompleted() {
  const hasCompleted = tasks.some((t) => t.done);
  if (!hasCompleted) return;

  const confirmed = confirm(
    "Tem certeza que deseja remover todas as tarefas concluídas?"
  );
  if (!confirmed) return;

  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
}

// Aplica o filtro atual sobre a lista
function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((t) => !t.done);
  }
  if (currentFilter === "done") {
    return tasks.filter((t) => t.done);
  }
  return tasks;
}

// Atualiza texto do contador
function updateTaskCount() {
  const total = tasks.length;
  const pending = tasks.filter((t) => !t.done).length;

  if (total === 0) {
    taskCount.textContent = "Nenhuma tarefa";
  } else if (pending === 0) {
    taskCount.textContent = `${total} tarefa(s), todas concluídas 🎉`;
  } else {
    taskCount.textContent = `${pending} pendente(s) de ${total} tarefa(s)`;
  }
}

// Formata a data de criação
function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Renderiza a lista na tela
function renderTasks() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML =
      '<span class="task-item__meta">Nenhuma tarefa para exibir.</span>';
    taskList.appendChild(li);
    updateTaskCount();
    return;
  }

  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("button");
    checkbox.className = "task-item__checkbox";
    if (task.done) {
      checkbox.classList.add("task-item__checkbox--done");
    }
    checkbox.setAttribute("aria-label", "Marcar como concluída");
    checkbox.addEventListener("click", () => toggleTaskDone(task.id));

    const content = document.createElement("div");
    content.className = "task-item__content";

    const title = document.createElement("span");
    title.className = "task-item__title";
    if (task.done) {
      title.classList.add("task-item__title--done");
    }
    title.textContent = task.title;

    const meta = document.createElement("span");
    meta.className = "task-item__meta";
    meta.textContent = `Criada em ${formatDate(task.createdAt)}`;

    content.appendChild(title);
    content.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "task-item__actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "task-item__delete";
    deleteBtn.innerHTML = "✕";
    deleteBtn.setAttribute("aria-label", "Excluir tarefa");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    taskList.appendChild(li);
  });

  updateTaskCount();
}

// EVENTOS

// Submit do formulário
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskTitleInput.value);
  taskTitleInput.value = "";
  taskTitleInput.focus();
});

// Click nos filtros
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    currentFilter = filter;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    renderTasks();
  });
});

// Botão "Limpar concluídas"
clearCompletedBtn.addEventListener("click", clearCompleted);
