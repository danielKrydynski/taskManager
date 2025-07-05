
# Task Manager

## 🚀 Features

- **Modern, accessible UI** with light/dark mode, responsive design, and ARIA labels
- **Drag-and-drop task reordering** (with persistent order)
- **Subtasks** (nested, add/complete/delete, empty state handling)
- **Due date reminders**: visual highlighting and browser notifications for due/overdue tasks
- **Color tags**: assign, display, and filter tasks by color
- **XP/level-up system**: earn XP for actions, animated level-up, persistent progress
- **Undo/redo** for all major actions (with UI and keyboard shortcuts)
- **Full keyboard accessibility**: focusable controls, visible focus, ARIA, keyboard navigation
- **Robust edge-case handling**: empty states, invalid input, undo/redo, etc.
- **Persistent storage**: all data saved per user in browser localStorage

## 🖥️ Tech Stack

- HTML5, CSS3 (custom properties, modern layout, animations)
- Vanilla JavaScript (ES6+)
- [Jest](https://jestjs.io/) for unit/integration testing

## 📦 Getting Started

1. Clone/download this repo and open `taskManager.html` in your browser.
2. All features work offline (no build step required).
3. For best experience, use a modern browser (Chrome, Edge, Firefox, Safari).

## 🧪 Running Tests

This project uses [Jest](https://jestjs.io/) for unit/integration tests.

1. Install dependencies (if not already):
   ```sh
   npm install jest --save-dev
   ```
2. Run tests:
   ```sh
   npx jest
   ```

Test files are located in the `tests/` directory. Coverage includes core logic, drag-and-drop, subtasks, XP/level, undo/redo, color tags, and edge cases.

## ♿ Accessibility & UX

- All controls are keyboard-accessible and have visible focus
- ARIA labels and roles for screen readers
- Color contrast and theme support (light/dark)
- User-friendly empty states and error handling

## 📖 Portfolio & Attribution

- Designed and built for portfolio demonstration
- All code, UI, and features are original and fully documented
- For questions or attribution, see code comments or contact the author

---

For more details, see code comments and the UI for feature usage. Enjoy being productive!

