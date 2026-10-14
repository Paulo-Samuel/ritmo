// Atualização automática: confere o GitHub, baixa a versão nova em segundo plano
// e avisa a janela. Só funciona na versão instalada (não no .exe portátil).
const { app } = require('electron');
const { autoUpdater } = require('electron-updater');

const CHECK_EVERY_MS = 4 * 60 * 60 * 1000; // 4 horas

function canUpdate() {
  // Em desenvolvimento e no .exe portátil não há o que atualizar.
  return app.isPackaged && !process.env.PORTABLE_EXECUTABLE_FILE;
}

function setupUpdates(getWindow) {
  const send = status => getWindow()?.webContents.send('ritmo:update', status);
  if (!canUpdate()) return { check: async () => send({ state: 'unavailable' }), install: () => {} };

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true; // se não reiniciar agora, atualiza ao fechar
  autoUpdater.on('update-available', info => send({ state: 'downloading', version: info.version }));
  autoUpdater.on('download-progress', p => send({ state: 'downloading', percent: Math.round(p.percent) }));
  autoUpdater.on('update-downloaded', info => send({ state: 'ready', version: info.version }));
  autoUpdater.on('update-not-available', () => send({ state: 'latest' }));
  // Sem internet ou GitHub fora do ar: tenta de novo na próxima verificação.
  autoUpdater.on('error', err => {
    const msg = String(err?.message || err);
    console.warn('Atualização falhou:', msg);
    // 404 = o repositório ainda não tem nenhuma versão publicada.
    send({ state: 'error', noReleases: /\b404\b|Unable to find latest version|No published versions/i.test(msg) });
  });

  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 5000);
  setInterval(check, CHECK_EVERY_MS);
  // Instala em silêncio (sem o assistente de "Próximo") e reabre o app já atualizado.
  return { check, install: () => autoUpdater.quitAndInstall(true, true) };
}

module.exports = { setupUpdates };
