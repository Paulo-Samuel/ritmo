// Janela do Ritmo como app de desktop (Electron).
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const downloader = require('./downloader');
const { setupUpdates } = require('./updater');

let win = null;
let updates = null;

if (!app.requestSingleInstanceLock()) app.quit();

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 420,
    minHeight: 500,
    title: 'Ritmo',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#000000',
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#000000', symbolColor: '#ffffff', height: 64 },
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.js') },
  });
  win.removeMenu();
  win.once('ready-to-show', () => win.show());
  // Links externos abrem no navegador; a janela nunca sai do app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.loadFile(path.join(__dirname, 'index.html'));
}

ipcMain.handle('ritmo:tools-status', () => downloader.toolsStatus());
ipcMain.handle('ritmo:install-tools', e => downloader.installTools(p => e.sender.send('ritmo:tools-progress', p)));
ipcMain.handle('ritmo:download', (e, job) => downloader.download(job, p => e.sender.send('ritmo:progress', p)));
ipcMain.handle('ritmo:cancel', (_e, id) => downloader.cancel(id));
ipcMain.handle('ritmo:read-file', (_e, filePath) => downloader.readDownloaded(filePath));
ipcMain.handle('ritmo:open-folder', async () => {
  await require('fs').promises.mkdir(downloader.outDir(), { recursive: true });
  return shell.openPath(downloader.outDir());
});
ipcMain.handle('ritmo:version', () => app.getVersion());
ipcMain.handle('ritmo:check-update', () => updates?.check());
ipcMain.handle('ritmo:install-update', () => updates?.install());

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});
app.whenReady().then(() => {
  createWindow();
  updates = setupUpdates(() => win);
});
app.on('window-all-closed', () => app.quit());
