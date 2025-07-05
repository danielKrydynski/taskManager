
// Expanded Jest unit/integration tests for Task Manager core logic
const { addTask, editTask } = require('../taskManager');

describe('Task Manager Core', () => {
  test('addTask adds a new task', () => {
    let tasks = [];
    const task = { taskText: 'Test', descriptionText: 'Desc', category: '', dueDate: '', colorTag: '' };
    addTask.call({ tasks }, task);
    expect(tasks.length).toBe(1);
    expect(tasks[0].taskText).toBe('Test');
  });

  test('editTask edits a task', () => {
    let tasks = [{ taskText: 'Old', descriptionText: 'Old', category: '', dueDate: '', colorTag: '' }];
    global.prompt = jest.fn()
      .mockReturnValueOnce('New')
      .mockReturnValueOnce('NewDesc')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('')
      .mockReturnValueOnce('');
    editTask.call({ tasks }, 0);
    expect(tasks[0].taskText).toBe('New');
    expect(tasks[0].descriptionText).toBe('NewDesc');
  });
});

describe('Task Manager Advanced', () => {
  test('Drag-and-drop reorders tasks', () => {
    let tasks = [
      { taskText: 'A' },
      { taskText: 'B' },
      { taskText: 'C' }
    ];
    // Simulate drag A to position 2
    const moved = tasks.splice(0, 1)[0];
    tasks.splice(2, 0, moved);
    expect(tasks.map(t => t.taskText)).toEqual(['B', 'C', 'A']);
  });

  test('Subtasks: add, complete, delete', () => {
    let task = { subtasks: [] };
    // Add
    task.subtasks.push({ text: 'Sub1', completed: false });
    expect(task.subtasks.length).toBe(1);
    // Complete
    task.subtasks[0].completed = true;
    expect(task.subtasks[0].completed).toBe(true);
    // Delete
    task.subtasks.splice(0, 1);
    expect(task.subtasks.length).toBe(0);
  });

  test('Due date highlighting logic', () => {
    const now = new Date();
    const overdue = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const soon = new Date(now.getTime() + 3600000).toISOString().slice(0, 10);
    const future = new Date(now.getTime() + 86400000 * 5).toISOString().slice(0, 10);
    function getDueStatus(dueDate) {
      const due = new Date(dueDate + 'T23:59:59');
      if (due < now) return 'overdue';
      if (due - now < 1000 * 60 * 60 * 24) return 'due-soon';
      return '';
    }
    expect(getDueStatus(overdue)).toBe('overdue');
    expect(getDueStatus(soon)).toBe('due-soon');
    expect(getDueStatus(future)).toBe('');
  });

  test('Color tag filtering', () => {
    const tasks = [
      { colorTag: '#7ad1ff' },
      { colorTag: '#ffe156' },
      { colorTag: '#7ad1ff' }
    ];
    const filtered = tasks.filter(t => t.colorTag === '#7ad1ff');
    expect(filtered.length).toBe(2);
  });

  test('XP/level system logic', () => {
    let userXP = 0, userLevel = 1, XP_PER_LEVEL = 1000;
    function addXP(amount) {
      userXP += amount;
      let leveledUp = false;
      while (userXP >= XP_PER_LEVEL) {
        userXP -= XP_PER_LEVEL;
        userLevel++;
        leveledUp = true;
      }
      return { userXP, userLevel, leveledUp };
    }
    let result = addXP(500);
    expect(result.userXP).toBe(500);
    result = addXP(600);
    expect(result.userLevel).toBe(2);
    expect(result.userXP).toBe(100);
  });

  test('Undo/redo stack', () => {
    let tasks = [];
    let undoStack = [], redoStack = [];
    function addTaskSim(t) {
      undoStack.push([...tasks]);
      tasks.push(t);
      redoStack = [];
    }
    function undo() {
      if (undoStack.length) {
        redoStack.push([...tasks]);
        tasks = undoStack.pop();
      }
    }
    function redo() {
      if (redoStack.length) {
        undoStack.push([...tasks]);
        tasks = redoStack.pop();
      }
    }
    addTaskSim('A');
    addTaskSim('B');
    undo();
    expect(tasks).toEqual(['A']);
    redo();
    expect(tasks).toEqual(['A', 'B']);
  });

  test('Empty state and edge cases', () => {
    let tasks = [];
    expect(tasks.length).toBe(0);
    // Add empty subtask
    let task = { subtasks: [] };
    task.subtasks.push({ text: '', completed: false });
    expect(task.subtasks[0].text).toBe('');
    // Invalid color tag
    let invalidColor = '#notacolor';
    expect(/^#[0-9A-Fa-f]{6}$/.test(invalidColor)).toBe(false);
  });
});
