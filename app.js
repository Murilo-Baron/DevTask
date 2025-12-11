// script.js

// Seletores principais
const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskPrioritySelect = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".btn-filter");
const clearCompletedBtn = document.getElementById("clear-completed");
const searchInput = document.getElementById("task-search");
const themeToggleBtn = document.getElementById("theme-toggle");

// Estado das tarefas em memória
let tasks = [];
let currentFilter = "all"; // all | pending | done
let searchTerm = "";
let currentTheme = "dark"; // dark | light

// ---------- THEME ----------

function loadTheme() {
  const savedTheme = localStorage.getItem("devtasks-theme");
  currentTheme = savedTheme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeToggleLabel();
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("devtasks-theme", currentTheme);
  updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
  if (!themeToggleBtn) return;
  if (currentTheme === "dark") {
    themeToggleBtn.textContent = "🌙";
    themeToggleBtn.title = "Alternar para tema claro";
  } else {
    themeToggleBtn.textContent = "☀️";
    themeToggleBtn.title = "Alternar para tema escuro";
  }
}

// ---------- STORAGE ----------

// Carrega tarefas do localStorage ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();

  const saved = localStorage.getItem("devtasks");
  if (saved) {
    try {
      tasks = JSON.parse(saved);
      // garante que tarefas antigas tenham prioridade
      tasks = tasks.map((task) => ({
        ...task,
        priority: task.priority || "medium",
      }));
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

// ---------- TASKS ----------

function addTask(title, priority) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now(),
    title: trimmed,
    done: false,
    createdAt: new Date().toISOString(),
    priority: priority || "medium",
  };

  tasks.unshift(newTask); // adiciona no topo
  saveTasks();
  renderTasks();
}

function toggleTaskDone(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, done: !task.done } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

// Edição simples via prompt ao dar duplo clique no título
function editTaskTitle(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const newTitle = prompt("Editar tarefa:", task.title);
  if (newTitle === null) return; // cancelado
  const trimmed = newTitle.trim();
  if (!trimmed) return;

  tasks = tasks.map((t) =>
    t.id === taskId ? { ...t, title: trimmed } : t
  );
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

// ---------- FILTERS / SEARCH ----------

function getFilteredTasks() {
  let filtered = [...tasks];

  if (currentFilter === "pending") {
    filtered = filtered.filter((t) => !t.done);
  } else if (currentFilter === "done") {
    filtered = filtered.filter((t) => t.done);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(term));
  }

  return filtered;
}

// ---------- UI HELPERS ----------

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

function getPriorityLabel(priority) {
  switch (priority) {
    case "high":
      return "Prioridade alta";
    case "low":
      return "Prioridade baixa";
    default:
      return "Prioridade média";
  }
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

    // Checkbox
    const checkbox = document.createElement("button");
    checkbox.className = "task-item__checkbox";
    if (task.done) {
      checkbox.classList.add("task-item__checkbox--done");
    }
    checkbox.setAttribute("aria-label", "Marcar como concluída");
    checkbox.addEventListener("click", () => toggleTaskDone(task.id));

    // Conteúdo (título + meta)
    const content = document.createElement("div");
    content.className = "task-item__content";

    const title = document.createElement("span");
    title.className = "task-item__title";
    if (task.done) {
      title.classList.add("task-item__title--done");
    }
    title.textContent = task.title;

    // Duplo clique para editar
    title.addEventListener("dblclick", () => editTaskTitle(task.id));

    const meta = document.createElement("span");
    meta.className = "task-item__meta";

    const datePart = document.createElement("span");
    datePart.textContent = `Criada em ${formatDate(task.createdAt)}`;

    const priorityChip = document.createElement("span");
    priorityChip.className = `task-item__priority task-item__priority--${task.priority}`;
    priorityChip.textContent = getPriorityLabel(task.priority);

    meta.appendChild(datePart);
    meta.appendChild(priorityChip);

    content.appendChild(title);
    content.appendChild(meta);

    // Ações
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

// ---------- EVENTOS ----------

// Submit do formulário
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskTitleInput.value, taskPrioritySelect.value);
  taskTitleInput.value = "";
  taskPrioritySelect.value = "medium";
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

// Busca em tempo real
searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value || "";
  renderTasks();
});

// Alternar tema
themeToggleBtn.addEventListener("click", toggleTheme);
