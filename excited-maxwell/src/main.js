const DEFAULT_TASKS = [
  'Water the lavender patch',
  'Sort the pollen jars',
  'Check the honeycomb shelves',
  'Send the hive update',
  "Plan tomorrow's flower route",
];

const DEFAULT_IDEAS = [
  'Make a tiny victory dance for finished tasks',
  'Decorate the hive dashboard with seasonal flowers',
];

const SHOP_ITEMS = [
  { name: 'Golden flower sticker', cost: 4, description: 'A cheerful badge for today\'s list.' },
  { name: 'Extra buzz break', cost: 6, description: 'Take a guilt-free stretch after the next task.' },
  { name: 'Royal honey boost', cost: 10, description: 'Make the next focus session feel extra sweet.' },
];

const SPARK_IDEAS = [
  'Try a two-minute tidy before the next task',
  'Pair the hardest task with a favorite song',
  'Write a thank-you note to future you',
  'Turn one big job into three tiny bee steps',
];

const tasks = [...DEFAULT_TASKS];
const ideas = [...DEFAULT_IDEAS];
let selectedTask = '';
let highlightedIndex = -1;
let isSpinning = false;
let timers = [];
let honeyDrops = 12;
let timerSeconds = 25 * 60;
let timerLengthSeconds = 25 * 60;
let timerInterval = null;

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
const timerDisplay = document.querySelector('#timer-display');
const timerNote = document.querySelector('#timer-note');
const timerStart = document.querySelector('#timer-start');
const timerPause = document.querySelector('#timer-pause');
const timerReset = document.querySelector('#timer-reset');
const timerPresetButtons = document.querySelectorAll('[data-minutes]');
const honeyWallet = document.querySelector('#honey-wallet');
const shopItems = document.querySelector('#shop-items');
const ideaForm = document.querySelector('#idea-form');
const newIdeaInput = document.querySelector('#new-idea');
const ideaList = document.querySelector('#idea-list');
const ideaSpark = document.querySelector('#idea-spark');

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

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerSeconds);
  timerStart.disabled = Boolean(timerInterval);
  timerPause.disabled = !timerInterval;
}

function completeTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  honeyDrops += 3;
  timerSeconds = timerLengthSeconds;
  timerNote.textContent = 'Great focus! You earned 3 honey drops.';
  renderTimer();
  renderShop();
}

function startTimer() {
  if (timerInterval) return;

  timerNote.textContent = 'Timer buzzing... stay with your task.';
  timerInterval = setInterval(() => {
    timerSeconds -= 1;
    if (timerSeconds <= 0) {
      completeTimer();
      return;
    }
    renderTimer();
  }, 1000);
  renderTimer();
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerNote.textContent = 'Timer paused. Your bee is waiting.';
  renderTimer();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = timerLengthSeconds;
  timerNote.textContent = 'Finish a timer to earn 3 honey drops.';
  renderTimer();
}

function setTimerPreset(minutes) {
  clearInterval(timerInterval);
  timerInterval = null;
  timerLengthSeconds = minutes * 60;
  timerSeconds = timerLengthSeconds;
  timerNote.textContent = `${minutes}-minute timer ready.`;
  renderTimer();
}

function renderShop() {
  honeyWallet.textContent = `🍯 ${honeyDrops}`;
  shopItems.innerHTML = '';

  SHOP_ITEMS.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'shop-item';

    const title = document.createElement('h3');
    title.textContent = item.name;

    const description = document.createElement('p');
    description.textContent = item.description;

    const buyButton = document.createElement('button');
    buyButton.type = 'button';
    buyButton.textContent = `Buy for ${item.cost} 🍯`;
    buyButton.disabled = honeyDrops < item.cost;
    buyButton.addEventListener('click', () => buyShopItem(item));

    card.append(title, description, buyButton);
    shopItems.append(card);
  });
}

function buyShopItem(item) {
  if (honeyDrops < item.cost) return;

  honeyDrops -= item.cost;
  timerNote.textContent = `Bought ${item.name}. Enjoy your reward!`;
  renderShop();
}

function renderIdeas() {
  ideaList.innerHTML = '';

  ideas.forEach((idea) => {
    const item = document.createElement('li');
    item.textContent = idea;
    ideaList.append(item);
  });
}

function addIdea(event) {
  event.preventDefault();
  const cleanIdea = newIdeaInput.value.trim();
  if (!cleanIdea) return;

  ideas.unshift(cleanIdea);
  newIdeaInput.value = '';
  renderIdeas();
}

function sparkIdea() {
  const idea = SPARK_IDEAS[Math.floor(Math.random() * SPARK_IDEAS.length)];
  ideas.unshift(idea);
  renderIdeas();
}

taskForm.addEventListener('submit', addTask);
spinButton.addEventListener('click', spinRoulette);
timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);
timerReset.addEventListener('click', resetTimer);
timerPresetButtons.forEach((button) => {
  button.addEventListener('click', () => setTimerPreset(Number(button.dataset.minutes)));
});
ideaForm.addEventListener('submit', addIdea);
ideaSpark.addEventListener('click', sparkIdea);

renderTasks();
renderTimer();
renderShop();
renderIdeas();
