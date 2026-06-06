'use strict';

// ─── STATE ───────────────────────────────────────────
let tasks          = loadTasks();
let currentFilter  = 'all';
let currentPriority = 'low';

// ─── DOM ─────────────────────────────────────────────
const taskInput      = document.getElementById('taskInput');
const addBtn         = document.getElementById('addBtn');
const taskList       = document.getElementById('taskList');
const emptyState     = document.getElementById('emptyState');
const counterNum     = document.getElementById('counterNum');
const headerSub      = document.getElementById('headerSub');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns     = document.querySelectorAll('.filter-btn');
const priorityPills  = document.querySelectorAll('.pill');

// ─── LOCALSTORAGE ────────────────────────────────────
function loadTasks() {
  try { return JSON.parse(localStorage.getItem('dooit-tasks')) || []; }
  catch { return []; }
}

function saveTasks() {
  localStorage.setItem('dooit-tasks', JSON.stringify(tasks));
}

// ─── RENDER ──────────────────────────────────────────
function render() {
  const filtered = getFiltered();

  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
    filtered.forEach(task => taskList.appendChild(createTaskEl(task)));
  }

  updateCounter();
  updateHeader();
}

function getFiltered() {
  switch (currentFilter) {
    case 'active':    return tasks.filter(t => !t.completed);
    case 'completed': return tasks.filter(t =>  t.completed);
    default:          return [...tasks];
  }
}

// ─── CREATE ELEMENT ──────────────────────────────────
function createTaskEl(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id       = task.id;
  li.dataset.priority = task.priority;

  li.innerHTML = `
    <div class="task-check${task.completed ? ' checked' : ''}" role="checkbox" aria-checked="${task.completed}" tabindex="0"></div>
    <div class="task-body">
      <div class="task-text">${escapeHtml(task.text)}</div>
      <div class="task-meta">
        <span class="priority-tag tag-${task.priority}">${task.priority}</span>
      </div>
    </div>
    <button class="task-delete" aria-label="Delete task">🗑️</button>
  `;

  // checkbox click
  li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
  li.querySelector('.task-check').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTask(task.id); }
  });

  // delete click
  li.querySelector('.task-delete').addEventListener('click', () => removeTask(task.id, li));

  return li;
}

// ─── TASK OPERATIONS ─────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) { shake(taskInput); return; }

  const task = {
    id:        Date.now(),
    text,
    priority:  currentPriority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  taskInput.value = '';
  taskInput.focus();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

function removeTask(id, el) {
  el.classList.add('removing');
  el.addEventListener('animationend', () => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }, { once: true });
}

function clearDone() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// ─── COUNTER & HEADER ────────────────────────────────
function updateCounter() {
  const active = tasks.filter(t => !t.completed).length;
  counterNum.textContent = active;
}

function updateHeader() {
  const active = tasks.filter(t => !t.completed).length;
  const total  = tasks.length;
  if (total === 0) {
    headerSub.textContent = 'Nothing on your list — enjoy the freedom! 🎉';
  } else if (active === 0) {
    headerSub.textContent = 'All done! You crushed it today 🚀';
  } else if (active === 1) {
    headerSub.textContent = 'Just one more thing to do — you got this! 💪';
  } else {
    headerSub.textContent = `${active} task${active > 1 ? 's' : ''} to conquer today ✨`;
  }
}

// ─── PRIORITY SELECTION ──────────────────────────────
priorityPills.forEach(pill => {
  pill.addEventListener('click', () => {
    currentPriority = pill.dataset.priority;
    priorityPills.forEach(p => p.classList.remove('active-pill'));
    pill.classList.add('active-pill');
  });
});

// ─── FILTERS ─────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active-filter'));
    btn.classList.add('active-filter');
    render();
  });
});

// ─── EVENTS ──────────────────────────────────────────
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
clearCompleted.addEventListener('click', clearDone);

// ─── UTILS ───────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.35s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

// add shake keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{ transform: translateX(0); }
    20%    { transform: translateX(-8px); }
    40%    { transform: translateX(8px); }
    60%    { transform: translateX(-5px); }
    80%    { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// ─── INIT ────────────────────────────────────────────
render();
