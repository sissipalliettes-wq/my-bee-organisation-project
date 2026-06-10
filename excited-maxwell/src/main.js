const DEFAULT_TASKS = [
  'Water the lavender patch',
  'Sort the pollen jars',
  'Check the honeycomb shelves',
  'Send the hive update',
  "Plan tomorrow's flower route",
];

const tasks = [...DEFAULT_TASKS];
let selectedTask = '';
let highlightedIndex = -1;
let isSpinning = false;
let timers = [];

const taskList = document.querySelector('#task-list');
const taskForm = document.querySelector('#task-form');
const newTaskInput = document.querySelector('#new-task');
const spinButton = document.querySelector('#spin-task-button');
const roulettePanel = document.querySelector('#roulette-panel');
const rouletteWheel = document.querySelector('#roulette-wheel');
const speechBubble = document.querySelector('#speech-bubble');
const taskPlank = document.querySelector('#task-plank');
const leftArm = document.querySelector('#left-arm');
const rightArm = document.querySelector('#right-arm');

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task) => {
    const item = document.createElement('li');
    if (selectedTask === task) item.classList.add('selected-task');

    const label = document.createElement('span');
    label.textContent = task;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', `Remove ${task}`);
    removeButton.addEventListener('click', () => removeTask(task));

    item.append(label, removeButton);
    taskList.append(item);
  });

  spinButton.disabled = isSpinning || tasks.length === 0;
  renderWheel();
}

function renderWheel() {
  rouletteWheel.innerHTML = '';

  const slice = 360 / Math.max(tasks.length, 1);
  const colors = ['#ffd166', '#f6bd60', '#ffe8a3', '#ffb703', '#f9c74f', '#fcd34d'];
  const gradient = tasks
    .map((_, index) => `${colors[index % colors.length]} ${index * slice}deg ${(index + 1) * slice}deg`)
    .join(', ');
  rouletteWheel.style.background = `conic-gradient(${gradient})`;

  tasks.forEach((task, index) => {
    const label = document.createElement('span');
    const angle = (360 / tasks.length) * index;
    label.textContent = task;
    label.style.transform = `rotate(${angle}deg) translate(0, -6.3rem) rotate(${-angle}deg)`;
    if (highlightedIndex === index) label.classList.add('highlighted');
    rouletteWheel.append(label);
  });
}

function addTask(event) {
  event.preventDefault();
  const cleanTask = newTaskInput.value.trim();
  if (!cleanTask) return;

  tasks.push(cleanTask);
  newTaskInput.value = '';
  renderTasks();
}

function removeTask(taskToRemove) {
  const index = tasks.indexOf(taskToRemove);
  if (index === -1) return;

  tasks.splice(index, 1);
  if (selectedTask === taskToRemove) selectedTask = '';
  renderTasks();
}

function setBeePlankVisible(visible, task = '') {
  speechBubble.hidden = !visible;
  taskPlank.hidden = !visible;
  leftArm.classList.toggle('arm-raised', visible);
  rightArm.classList.toggle('arm-raised', visible);

  if (visible) {
    taskPlank.textContent = task;
    taskPlank.setAttribute('aria-label', `Selected task: ${task}`);
  } else {
    taskPlank.textContent = '';
    taskPlank.removeAttribute('aria-label');
  }
}

function spinRoulette() {
  if (!tasks.length || isSpinning) return;

  clearTimers();
  isSpinning = true;
  highlightedIndex = -1;
  selectedTask = '';
  roulettePanel.hidden = false;
  roulettePanel.classList.add('is-spinning');
  setBeePlankVisible(false);
  renderTasks();

  const cycles = 18;
  for (let tick = 0; tick < cycles; tick += 1) {
    timers.push(
      setTimeout(() => {
        highlightedIndex = Math.floor(Math.random() * tasks.length);
        renderWheel();
      }, tick * 115),
    );
  }

  timers.push(
    setTimeout(() => {
      const winnerIndex = Math.floor(Math.random() * tasks.length);
      const winner = tasks[winnerIndex];
      highlightedIndex = winnerIndex;
      selectedTask = winner;
      isSpinning = false;
      roulettePanel.classList.remove('is-spinning');
      setBeePlankVisible(true, winner);
      renderTasks();

      timers.push(
        setTimeout(() => {
          setBeePlankVisible(false);
        }, 7000),
      );
    }, cycles * 115 + 200),
  );
}

taskForm.addEventListener('submit', addTask);
spinButton.addEventListener('click', spinRoulette);
renderTasks();
