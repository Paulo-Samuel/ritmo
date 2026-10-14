// Servidor local do Ritmo (sem dependências). Uso: node server.js [--open]
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = Number(process.env.PORT) || 5173;
const ROOT = __dirname;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

function handle(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname === '/') pathname = '/index.html';
  const file = path.join(ROOT, path.normalize(pathname));
  if (!file.startsWith(ROOT + path.sep) || path.basename(file) === 'server.js') { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}

// Escuta só nesta máquina (IPv4 e IPv6), nunca na rede.
const main = http.createServer(handle);
main.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Feche o outro servidor ou rode com outra porta: set PORT=5174 && node server.js`);
    process.exit(1);
  }
  throw err;
});
main.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Ritmo rodando em ${url}  (Ctrl+C para parar)`);
  if (process.argv.includes('--open')) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd);
  }
});
http.createServer(handle).on('error', () => {}).listen(PORT, '::1');
