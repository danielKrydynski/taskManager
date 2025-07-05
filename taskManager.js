// Task Manager Revamp - Modernized, with categories, due dates, search, and filtering
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const taskInput = document.getElementById('taskInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const categoryInput = document.getElementById('categoryInput');
    const dueDateInput = document.getElementById('dueDateInput');
    // const colorTagInput = document.getElementById('colorTagInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const logoutButton = document.getElementById('logoutButton');
    const authDiv = document.getElementById('auth');
    const taskManagerDiv = document.getElementById('taskManager');
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');

    let currentUser = null;
    let tasks = [];

    // --- Notification Permission Request ---
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // --- Authentication ---
    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (username && password) loginUser(username, password);
    });
    registerButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (username && password) registerUser(username, password);
    });
    logoutButton.addEventListener('click', logoutUser);

    // --- Task Form Submission ---
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const descriptionText = descriptionInput.value.trim();
        const category = categoryInput.value;
        const dueDate = dueDateInput.value;
        // const colorTag = colorTagInput.value;
        if (taskText) {
            addTask({ taskText, descriptionText, category, dueDate });
            taskForm.reset();
        }
    });

    // --- Task Actions (Edit/Delete) ---
    taskList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const action = e.target.dataset.action;
            const li = e.target.closest('.task-item');
            const idx = parseInt(li.dataset.index);
            if (action === 'delete') {
                tasks.splice(idx, 1);
                saveTasks();
                renderAndNotifyTasks();
                addXP(XP_ACTIONS.deleteTask);
            } else if (action === 'edit') {
                editTask(idx);
            }
        }
    });

    // --- Search & Filter ---
    searchInput.addEventListener('input', renderAndNotifyTasks);
    filterCategory.addEventListener('change', renderAndNotifyTasks);

    // --- User Registration ---
    function registerUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username]) {
            alert('User already exists');
        } else {
            users[username] = password;
            localStorage.setItem('users', JSON.stringify(users));
            alert('User registered successfully');
        }
    }

    function loginUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username] && users[username] === password) {
            currentUser = username;
            authDiv.style.display = 'none';
            taskManagerDiv.style.display = 'block';
            loadTasks();
            renderAndNotifyTasks();
            loadXP();
        } else {
            alert('Invalid username or password');
        }
    }

    function logoutUser() {
        currentUser = null;
        authDiv.style.display = 'flex';
        taskManagerDiv.style.display = 'none';
        taskList.innerHTML = '';
        tasks = [];
    }

    // --- Task CRUD ---
    function addTask(task) {
        tasks.push({
            taskText: task.taskText,
            descriptionText: task.descriptionText,
            category: task.category || '',
            dueDate: task.dueDate || '',
            subtasks: []
        });
        saveTasks();
        renderAndNotifyTasks();
        addXP(40);
    }

    function editTask(idx) {
        const t = tasks[idx];
        const newTaskText = prompt('Edit your task:', t.taskText);
        const newDescriptionText = prompt('Edit your description:', t.descriptionText);
        const newCategory = prompt('Edit category (Work, Personal, Urgent):', t.category);
        const newDueDate = prompt('Edit due date (YYYY-MM-DD):', t.dueDate);
        // const newColorTag = prompt('Edit color tag (hex, e.g. #7ad1ff):', t.colorTag || '');
        if (newTaskText && newDescriptionText) {
            tasks[idx] = {
                ...tasks[idx],
                taskText: newTaskText.trim(),
                descriptionText: newDescriptionText.trim(),
                category: newCategory || '',
                dueDate: newDueDate || ''
            };
        saveTasks();
        renderAndNotifyTasks();
        }
    }

    // --- Persistence ---
    function saveTasks() {
        if (currentUser) {
            localStorage.setItem(`tasks_${currentUser}`,
                JSON.stringify(tasks)
            );
        }
    }
    function loadTasks() {
        if (currentUser) {
            tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
        } else {
            tasks = [];
        }
    }

    // --- XP/Level System ---
    let userXP = 0;
    let userLevel = 1;
    const XP_PER_LEVEL = 1000;
    const XP_ACTIONS = {
        completeTask: 100,
        completeSubtask: 30,
        addTask: 40,
        addSubtask: 10,
        deleteTask: 0,
        deleteSubtask: 0
    };
    const xpBarFill = document.querySelector('.clean-xp-bar-fill');
    const xpLabel = document.querySelector('.clean-xp-label');

    function loadXP() {
        if (currentUser) {
            const data = JSON.parse(localStorage.getItem(`xp_${currentUser}`)) || { xp: 0, level: 1 };
            userXP = data.xp;
            userLevel = data.level;
        } else {
            userXP = 0;
            userLevel = 1;
        }
        updateXPBar();
    }
    function saveXP() {
        if (currentUser) {
            localStorage.setItem(`xp_${currentUser}`,
                JSON.stringify({ xp: userXP, level: userLevel })
            );
        }
    }
    function addXP(amount) {
        userXP += amount;
        let leveledUp = false;
        while (userXP >= XP_PER_LEVEL) {
            userXP -= XP_PER_LEVEL;
            userLevel++;
            leveledUp = true;
        }
        updateXPBar();
        saveXP();
        if (leveledUp) showLevelUp();
    }
    function updateXPBar() {
        if (xpBarFill && xpLabel) {
            const percent = Math.min(100, Math.round((userXP / XP_PER_LEVEL) * 100));
            xpBarFill.style.width = percent + '%';
            xpLabel.textContent = `XP: ${userXP} / ${XP_PER_LEVEL}  |  Level ${userLevel}`;
        }
    }
    function showLevelUp() {
        if (!xpLabel) return;
        xpLabel.textContent = `Level Up! Level ${userLevel}`;
        xpLabel.classList.add('level-up');
        setTimeout(() => {
            updateXPBar();
            xpLabel.classList.remove('level-up');
        }, 1800);
    }
    // Add a little animation for level up
    const style = document.createElement('style');
    style.textContent = `.level-up { color: #ffe156 !important; animation: pop 0.5s alternate 3; font-size: 1.2em; font-weight: 900; }
    @keyframes pop { 0% { transform: scale(1); } 100% { transform: scale(1.18) rotate(-2deg); } }`;
    document.head.appendChild(style);
    // Call loadXP on login
    const origLoginUser = loginUser;
    loginUser = function(username, password) {
        origLoginUser(username, password);
        loadXP();
    };
    // Call loadXP on page load if already logged in
    if (currentUser) loadXP();

    // --- Browser Notification Logic ---
    function notifyDueTask(task, idx) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = `Task Due: ${task.taskText}`;
            let body = '';
            if (task.dueDate) {
                body = `Due: ${new Date(task.dueDate + 'T23:59:59').toLocaleString()}`;
            }
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: `task-due-${idx}`
            });
        }
    }

    function notifyAllDueTasks(tasks) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        const now = new Date();
        if (!window._notifiedTasks) window._notifiedTasks = {};
        tasks.forEach((task, idx) => {
            if (task.dueDate && !task.completed) {
                const due = new Date(task.dueDate + 'T23:59:59');
                if (!isNaN(due)) {
                    // Notify if overdue or due within 1 hour
                    if ((due < now || (due - now < 1000 * 60 * 60 && due > now)) && !window._notifiedTasks[task.taskText + task.dueDate]) {
                        notifyDueTask(task, idx);
                        window._notifiedTasks[task.taskText + task.dueDate] = true;
                    }
                }
            }
        });
    }

    function renderAndNotifyTasks() {
        renderTasks();
        notifyAllDueTasks(tasks);
    }

    // --- Render Tasks ---
    function renderTasks() {
        taskList.innerHTML = '';
        let filtered = tasks;
        const search = searchInput.value.trim().toLowerCase();
        const cat = filterCategory.value;
        // Color tag filtering removed
        if (search) {
            filtered = filtered.filter(t =>
                t.taskText.toLowerCase().includes(search) ||
                t.descriptionText.toLowerCase().includes(search)
            );
        }
        if (cat) {
            filtered = filtered.filter(t => t.category === cat);
        }
        const now = new Date();
        if (filtered.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'task-item';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.opacity = '0.7';
            emptyMsg.innerHTML = tasks.length === 0
                ? 'No tasks yet. Add your first task!'
                : 'No tasks match your filter.';
            taskList.appendChild(emptyMsg);
            return;
        }
        filtered.forEach((task, idx) => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.completed ? ' completed' : '');
            li.dataset.index = idx;
            li.setAttribute('draggable', 'true');
            // Due date highlighting
            let dueStatus = '';
            if (task.dueDate) {
                const due = new Date(task.dueDate + 'T23:59:59');
                if (!isNaN(due)) {
                    if (due < now) dueStatus = 'overdue';
                    else if (due - now < 1000 * 60 * 60 * 24) dueStatus = 'due-soon';
                }
            }
            if (dueStatus) li.classList.add(dueStatus);
            // Subtask empty state
            let subtasksHtml = '';
            if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
                subtasksHtml = task.subtasks.map((sub, sidx) => `
                    <li class="subtask-item${sub.completed ? ' completed' : ''}" data-sidx="${sidx}">
                        <input type="checkbox" data-action="toggle-subtask" ${sub.completed ? 'checked' : ''} />
                        <span>${sub.text}</span>
                        <button data-action="delete-subtask">&times;</button>
                    </li>
                `).join('');
            } else {
                subtasksHtml = '<li class="subtask-item" style="opacity:0.6;">No subtasks</li>';
            }
            li.innerHTML = `
                <label style="display:inline-flex;align-items:center;gap:6px;margin-bottom:2px;">
                  <input type="checkbox" class="main-task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as complete" />
                  
                  <span class="task-title">${task.taskText}</span>
                </label>
                <span class="task-meta">
                    ${task.category ? `<span>Category: ${task.category}</span>` : ''}
                    ${task.dueDate ? `<span class="due-label ${dueStatus}">Due: ${task.dueDate}${dueStatus === 'overdue' ? ' (Overdue)' : dueStatus === 'due-soon' ? ' (Soon)' : ''}</span>` : ''}
                </span>
                <span>${task.descriptionText}</span>
                <ul class="subtask-list">
                    ${subtasksHtml}
                </ul>
                <form class="add-subtask-form" data-task-idx="${idx}">
                    <input type="text" class="add-subtask-input" placeholder="Add subtask..." aria-label="Add subtask" />
                    <button type="submit">+</button>
                </form>
                <div class="task-actions">
                    <button data-action="edit">Edit</button>
                    <button data-action="delete">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        // Drag and drop events
        (function() {
            const items = taskList.querySelectorAll('.task-item');
            let dragSrcIdx = null;
            items.forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    dragSrcIdx = parseInt(item.dataset.index);
                    item.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                });
                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    item.classList.add('drag-over');
                });
                item.addEventListener('dragleave', () => {
                    item.classList.remove('drag-over');
                });
                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    item.classList.remove('drag-over');
                    const dropIdx = parseInt(item.dataset.index);
                    if (dragSrcIdx !== null && dragSrcIdx !== dropIdx) {
                        // Move task in array
                        const moved = tasks.splice(dragSrcIdx, 1)[0];
                        tasks.splice(dropIdx, 0, moved);
            saveTasks();
            renderAndNotifyTasks();
                    }
                    dragSrcIdx = null;
                });
            });
        })();
        // Subtask events
        taskList.querySelectorAll('.add-subtask-form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const idx = parseInt(form.dataset.taskIdx);
                const input = form.querySelector('.add-subtask-input');
                const val = input.value.trim();
                if (val) {
                    tasks[idx].subtasks = tasks[idx].subtasks || [];
                    tasks[idx].subtasks.push({ text: val, completed: false });
                    saveTasks();
                    renderAndNotifyTasks();
                    addXP(XP_ACTIONS.addSubtask);
                }
            });
        });
        taskList.querySelectorAll('.subtask-item input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', function(e) {
                const li = cb.closest('.task-item');
                const idx = parseInt(li.dataset.index);
                const sidx = parseInt(cb.closest('.subtask-item').dataset.sidx);
                const wasCompleted = tasks[idx].subtasks[sidx].completed;
                tasks[idx].subtasks[sidx].completed = cb.checked;
                saveTasks();
                renderAndNotifyTasks();
                if (!wasCompleted && cb.checked) {
                    addXP(XP_ACTIONS.completeSubtask);
                }
            });
        });
        taskList.querySelectorAll('.subtask-item button[data-action="delete-subtask"]').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const li = btn.closest('.task-item');
                const idx = parseInt(li.dataset.index);
                const sidx = parseInt(btn.closest('.subtask-item').dataset.sidx);
                tasks[idx].subtasks.splice(sidx, 1);
                saveTasks();
                renderAndNotifyTasks();
                addXP(XP_ACTIONS.deleteSubtask);
            });
        });
        // Drag and drop events
        const items = taskList.querySelectorAll('.task-item');
        let dragSrcIdx = null;
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                dragSrcIdx = parseInt(item.dataset.index);
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const dropIdx = parseInt(item.dataset.index);
                if (dragSrcIdx !== null && dragSrcIdx !== dropIdx) {
                    // Move task in array
                    const moved = tasks.splice(dragSrcIdx, 1)[0];
                    tasks.splice(dropIdx, 0, moved);
                    saveTasks();
                    renderAndNotifyTasks();
                }
                dragSrcIdx = null;
            });
        });
        // Task completion events (checkboxes for main tasks)
        taskList.querySelectorAll('.task-item').forEach((item, idx) => {
            // If you want to add a completion checkbox for main tasks, you can do so here
            // For now, award XP if a task is marked completed (if you have such logic)
        });
    }

    // --- Initial State ---
    // Optionally, auto-login last user (for demo/portfolio)
    // const lastUser = localStorage.getItem('lastUser');
    // if (lastUser) { currentUser = lastUser; authDiv.style.display = 'none'; taskManagerDiv.style.display = 'block'; loadTasks(); renderTasks(); }
});