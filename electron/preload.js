// ============================================
// ELITE STREAK — Electron Preload Script
// Secure bridge between renderer and main
// ============================================

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});
