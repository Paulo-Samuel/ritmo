// Ponte segura entre a janela do Ritmo e os recursos do computador (download de músicas).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ritmo', {
  toolsStatus: () => ipcRenderer.invoke('ritmo:tools-status'),
  installTools: () => ipcRenderer.invoke('ritmo:install-tools'),
  download: job => ipcRenderer.invoke('ritmo:download', job),
  cancel: id => ipcRenderer.invoke('ritmo:cancel', id),
  readFile: filePath => ipcRenderer.invoke('ritmo:read-file', filePath),
  openFolder: () => ipcRenderer.invoke('ritmo:open-folder'),
  onProgress: fn => ipcRenderer.on('ritmo:progress', (_e, data) => fn(data)),
  onToolsProgress: fn => ipcRenderer.on('ritmo:tools-progress', (_e, data) => fn(data)),
  version: () => ipcRenderer.invoke('ritmo:version'),
  checkUpdate: () => ipcRenderer.invoke('ritmo:check-update'),
  installUpdate: () => ipcRenderer.invoke('ritmo:install-update'),
  onUpdate: fn => ipcRenderer.on('ritmo:update', (_e, status) => fn(status)),
});
