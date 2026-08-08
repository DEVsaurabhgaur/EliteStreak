// ============================================
// ELITE STREAK — Electron Main Process
// Windows Desktop Application
// ============================================

import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0f',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0f',
      symbolColor: '#00ff88',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
  });

  // Load the built web app
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(indexPath);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close — minimize to tray instead
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Create a simple tray icon
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAhRJREFUWEftlr1KA0EUhe/sJoqFYGFhYSEWVlYWFoJgYWEhWFgIFhaChYWgha2thYWNhX+NjY2NjQYSEpOd3Z254+yyu5NsEnfBwMLCMnfm++acOzMLkPxK0vsDAC0A2wCuAHxbDvAEIATwRER9r9GnBfgJIA+gU04rJeALgC4RzSY1UgFECzAlgEMAIQA3bvmFEKID4IBZH8B+LYJUIgCJlxqG6JyIPqoVgF8ACogO01UBeAOgBSBHRAVXxlgBGBXA+bHjOJ+dTOo3XRyAa+a47pdrz80B2AZwn4gGLozEBpiH2Y5bh0T04cKI7wJGhYVEVHFhJEkHvMVqWihHdUxExP/9a+FKlH0gzAL4sQXAGpIZoDWp5uePtXz5cq3sdHCp90qBcQZ8b4y03Y9R+FYAt0TUrymILOsNL9KUdwOZcGnbJKKSjRLfBfwNoIVZv1bBTHKhpF2NVJUHbHYYgF0AnxIBiC+7fVcA2p8A1k2yUjRAJAH/J+UqM5VXsN2CqUkAEwDqBCRV6sAW/5MAOgA+G/bSGUH2KTlEdGVZD2iZZ0QA3xp4TOABoCGkBIJgGqm44u0qpJifQCuASwRUcmFkciAB8CVyXYargeE9OkC8TfknJNJfFp2+8UrOiZhRvYG1AMi8msSqEqAaJe7rjVKR2WAJxMiW8f3qMy9WoZh1pW8VNK7xhkHsAngJckaA2JyEnF3wdiBQAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Elite Streak',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Elite Streak — Personal Performance OS');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});
