const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.getElementById('todo-list');
const dateInput = document.querySelector('.todo-date');
const timeInput = document.querySelector('.todo-time');
const quoteBox = document.getElementById('quote-box');
const filterSelect = document.getElementById('filter-select');
const alertAudio = document.getElementById('alert-audio');

const standardTheme = document.querySelector('.standard-theme');
const lightTheme = document.querySelector('.light-theme');
const darkerTheme = document.querySelector('.darker-theme');
const resetBtn = document.querySelector('.reset-btn');

const quotes = [
  "Start where you are. Use what you have. Do what you can.",
  "Believe you can and you're halfway there.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "The future depends on what you do today."
];

// Request permission for notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

let savedTheme = localStorage.getItem('savedTheme');
if (savedTheme) changeTheme(savedTheme);

toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', handleTaskActions);
document.addEventListener("DOMContentLoaded", getTodos);
filterSelect.addEventListener('change', getTodos);
standardTheme.addEventListener('click', () => changeTheme('standard'));
lightTheme.addEventListener('click', () => changeTheme('light'));
darkerTheme.addEventListener('click', () => changeTheme('darker'));
resetBtn.addEventListener('click', () => {
  localStorage.clear();
  toDoList.innerHTML = '';
});

function addToDo(e) {
  e.preventDefault();
  const task = {
    id: Date.now().toString(),
    text: toDoInput.value,
    date: dateInput.value,
    time: timeInput.value,
    favorite: false,
    completed: false,
    alerted: false
  };
  if (!task.text) return;
  saveLocal(task);
  renderTask(task);
  toDoInput.value = '';
  dateInput.value = '';
  timeInput.value = '';
  showQuote();
}

function renderTask(task) {
  const todoDiv = document.createElement('div');
  todoDiv.classList.add('todo');
  todoDiv.setAttribute('data-id', task.id);
  if (task.completed) todoDiv.classList.add('completed');

  const newTodo = document.createElement('li');
  newTodo.innerText = `${task.text} (${task.date || 'No date'} ${task.time || ''})`;
  newTodo.classList.add('todo-item');
  todoDiv.appendChild(newTodo);

  const completedButton = document.createElement('button');
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add('check-btn', 'green-btn');
  todoDiv.appendChild(completedButton);

  const trashButton = document.createElement('button');
  trashButton.innerHTML = '<i class="fas fa-trash"></i>';
  trashButton.classList.add('delete-btn', 'red-btn');
  todoDiv.appendChild(trashButton);

  const favoriteButton = document.createElement('button');
  favoriteButton.innerHTML = task.favorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
  favoriteButton.classList.add('favorite-btn');
  todoDiv.appendChild(favoriteButton);

  toDoList.appendChild(todoDiv);
}

function handleTaskActions(e) {
  const taskDiv = e.target.closest('.todo');
  if (!taskDiv) return;
  const id = taskDiv.getAttribute('data-id');
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  if (e.target.closest('.check-btn')) {
    taskDiv.classList.toggle('completed');
    tasks = tasks.map(t => {
      if (t.id === id) t.completed = taskDiv.classList.contains('completed');
      return t;
    });
  } else if (e.target.closest('.delete-btn')) {
    taskDiv.classList.add('fall');
    taskDiv.addEventListener('transitionend', () => taskDiv.remove());
    tasks = tasks.filter(t => t.id !== id);
  } else if (e.target.closest('.favorite-btn')) {
    tasks = tasks.map(t => {
      if (t.id === id) t.favorite = !t.favorite;
      return t;
    });
    const btn = e.target.closest('.favorite-btn');
    const isFav = tasks.find(t => t.id === id).favorite;
    btn.innerHTML = isFav ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));
  getTodos();
}

function saveLocal(task) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTodos() {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.sort((a, b) => b.favorite - a.favorite);
  const filter = filterSelect.value;

  if (filter === 'favorites') {
    tasks = tasks.filter(task => task.favorite);
  } else if (filter === 'completed') {
    tasks = tasks.filter(task => task.completed);
  } else if (filter === 'pending') {
    tasks = tasks.filter(task => !task.completed);
  }

  toDoList.innerHTML = '';
  tasks.forEach(task => renderTask(task));
}

function changeTheme(theme) {
  document.body.classList.remove('standard', 'light', 'darker');
  document.body.classList.add(theme);
  localStorage.setItem('savedTheme', theme);
}

function showQuote() {
  if (!quoteBox) return;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteBox.textContent = quote;
  quoteBox.style.display = 'block';
  setTimeout(() => {
    quoteBox.style.display = 'none';
  }, 4000);
}

// ⏰ Alert + 🔊 Sound + 🔔 Notification (1 hour before due)
setInterval(() => {
  const now = new Date();
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let updated = false;

  tasks.forEach(task => {
    if (task.completed || task.alerted || !task.date || !task.time) return;

    const due = new Date(`${task.date}T${task.time}`);
    const diff = due - now;

    if (diff <= 3600000 && diff > 0) {
      if (Notification.permission === "granted") {
        new Notification("⏰ Reminder", {
          body: `"${task.text}" is due at ${task.time}`,
          icon: "sound/alert.png" // Optional: Add alert icon
        });
      }
      if (alertAudio) alertAudio.play();
      task.alerted = true;
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}, 30000);