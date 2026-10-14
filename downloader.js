// Baixa músicas e vídeos a partir de links (YouTube e outros sites suportados pelo yt-dlp).
// As ferramentas (yt-dlp e ffmpeg) são baixadas dos sites oficiais na primeira vez que forem usadas.
const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { spawn, execFile } = require('child_process');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');

const binDir = () => path.join(app.getPath('userData'), 'bin');
const ytdlpPath = () => path.join(binDir(), 'yt-dlp.exe');
const ffmpegPath = () => path.join(binDir(), 'ffmpeg.exe');
const outDir = () => path.join(app.getPath('music'), 'Ritmo');

const TOOLS = [
  { name: 'yt-dlp', file: ytdlpPath, url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', gzip: false, weight: 18 },
  { name: 'ffmpeg', file: ffmpegPath, url: 'https://github.com/eugeneware/ffmpeg-static/releases/latest/download/ffmpeg-win32-x64.gz', gzip: true, weight: 30 },
];

const FORMATS = {
  mp3: ['-x', '--audio-format', 'mp3', '--audio-quality', '0', '--embed-thumbnail', '--convert-thumbnails', 'jpg'],
  m4a: ['-f', 'bestaudio[ext=m4a]/bestaudio', '-x', '--audio-format', 'm4a'],
  mp4: ['-f', 'bv*[ext=mp4][height<=1080]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b', '--merge-output-format', 'mp4'],
};

const jobs = new Map(); // id -> { child, canceled }
const canceledEarly = new Set(); // cancelados antes de o yt-dlp começar
let updateChecked = false;

function toolsStatus() {
  const missing = TOOLS.filter(t => !fs.existsSync(t.file())).map(t => t.name);
  return { ready: missing.length === 0, missing, folder: outDir() };
}

async function fetchTo(url, dest, gzip, onBytes) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Ritmo' } });
  if (!res.ok || !res.body) throw new Error(`Falha ao baixar ${path.basename(dest)} (HTTP ${res.status})`);
  const total = Number(res.headers.get('content-length')) || 0;
  let received = 0;
  const counter = new Transform({
    transform(chunk, _enc, cb) { received += chunk.length; onBytes(total ? received / total : 0); cb(null, chunk); },
  });
  const tmp = `${dest}.part`;
  const stages = [Readable.fromWeb(res.body), counter];
  if (gzip) stages.push(zlib.createGunzip());
  stages.push(fs.createWriteStream(tmp));
  try {
    await pipeline(...stages);
    await fs.promises.rename(tmp, dest);
  } catch (e) {
    await fs.promises.rm(tmp, { force: true });
    throw e;
  }
}

async function installTools(onProgress) {
  await fs.promises.mkdir(binDir(), { recursive: true });
  const missing = TOOLS.filter(t => !fs.existsSync(t.file()));
  const totalWeight = missing.reduce((s, t) => s + t.weight, 0) || 1;
  let doneWeight = 0;
  for (const tool of missing) {
    await fetchTo(tool.url, tool.file(), tool.gzip, frac => {
      onProgress({ name: tool.name, percent: Math.round(((doneWeight + frac * tool.weight) / totalWeight) * 100) });
    });
    doneWeight += tool.weight;
  }
  updateChecked = true; // acabou de baixar a versão mais nova
  onProgress({ name: 'pronto', percent: 100 });
  return toolsStatus();
}

// Mantém o yt-dlp atualizado (o YouTube muda com frequência). Roda uma vez por sessão.
function updateYtdlp() {
  if (updateChecked) return Promise.resolve();
  updateChecked = true;
  return new Promise(resolve => {
    execFile(ytdlpPath(), ['-U'], { timeout: 60000, windowsHide: true }, () => resolve());
  });
}

function friendlyError(stderr) {
  const text = stderr.join('\n');
  const rules = [
    [/Requested format is not available/i, 'Esse formato não está disponível para este vídeo. Tente outro.'],
    [/Sign in to confirm your age|age-restricted|inappropriate for some users/i, 'Vídeo com restrição de idade: o YouTube só libera com login.'],
    [/Sign in to confirm you.?re not a bot/i, 'O YouTube pediu verificação anti-robô. Espere alguns minutos e tente de novo.'],
    [/Private video/i, 'Este vídeo é privado.'],
    [/members-only|Join this channel/i, 'Vídeo exclusivo para membros do canal.'],
    [/video (is )?unavailable|video is not available|has been removed|account .* terminated/i, 'Vídeo indisponível ou removido. Confira o link.'],
    [/live event will begin|is not live|Premieres in/i, 'A transmissão ainda não começou.'],
    [/Unsupported URL|is not a valid URL/i, 'Esse link não é suportado.'],
    [/getaddrinfo|Unable to download webpage|Failed to resolve|timed out/i, 'Não foi possível acessar o site. Confira sua internet.'],
  ];
  for (const [re, msg] of rules) if (re.test(text)) return msg;
  const last = stderr.filter(l => /^ERROR:/.test(l)).pop() || stderr.filter(Boolean).pop();
  return last ? last.replace(/^ERROR:\s*(\[[^\]]+\]\s*)?/, '') : 'O download falhou por um motivo desconhecido.';
}

async function download({ id, url, format }, send) {
  if (typeof url !== 'string' || !/^https?:\/\/\S+$/i.test(url.trim()) || url.length > 2000) throw new Error('Link inválido.');
  if (!FORMATS[format]) throw new Error('Formato inválido.');
  if (!toolsStatus().ready) throw new Error('As ferramentas de download não estão instaladas.');
  await fs.promises.mkdir(outDir(), { recursive: true });
  await updateYtdlp();
  if (canceledEarly.delete(id)) throw new Error('Cancelado.');

  const args = [
    '--no-playlist', '--newline', '--progress', '--quiet', '--no-warnings',
    '--encoding', 'utf-8', '--windows-filenames', '--embed-metadata',
    '--ffmpeg-location', ffmpegPath(),
    // O próprio app funciona como "node" para o yt-dlp resolver os desafios do YouTube.
    '--js-runtimes', `node:${process.execPath}`,
    '-o', path.join(outDir(), '%(title).150B.%(ext)s'),
    '--progress-template', 'download:RITMO_P %(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s',
    '--print', 'before_dl:RITMO_T %(title)s',
    '--print', 'after_move:RITMO_F %(filepath)s\t%(title)s\t%(artist|)s\t%(uploader|)s\t%(album|)s',
    ...FORMATS[format],
    '--', url.trim(),
  ];
  const env = { ...process.env, ELECTRON_RUN_AS_NODE: '1', PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

  return new Promise((resolve, reject) => {
    const child = spawn(ytdlpPath(), args, { env, windowsHide: true });
    const job = { child, canceled: false };
    jobs.set(id, job);
    const files = [];
    const stderr = [];
    readline.createInterface({ input: child.stdout }).on('line', line => {
      if (line.startsWith('RITMO_P ')) {
        const [pct, speed, eta] = line.slice(8).split('|').map(s => s.trim());
        send({ id, percent: parseFloat(pct) || 0, speed: speed === 'N/A' ? '' : speed, eta: eta === 'N/A' ? '' : eta });
      } else if (line.startsWith('RITMO_T ')) {
        send({ id, title: line.slice(8).trim() });
      } else if (line.startsWith('RITMO_F ')) {
        const [filepath, title, artist, uploader, album] = line.slice(8).split('\t');
        files.push({ path: filepath, title, artist, uploader, album });
      }
    });
    readline.createInterface({ input: child.stderr }).on('line', line => {
      stderr.push(line);
      if (stderr.length > 40) stderr.shift();
    });
    child.on('error', err => { jobs.delete(id); reject(new Error(`Não foi possível iniciar o yt-dlp: ${err.message}`)); });
    child.on('close', code => {
      jobs.delete(id);
      if (job.canceled) reject(new Error('Cancelado.'));
      else if (code === 0 && files.length) resolve(files);
      else reject(new Error(friendlyError(stderr)));
    });
  });
}

function cancel(id) {
  const job = jobs.get(id);
  if (!job) { canceledEarly.add(id); return false; }
  job.canceled = true;
  // Encerra o yt-dlp e o ffmpeg que ele tiver aberto.
  spawn('taskkill', ['/pid', String(job.child.pid), '/T', '/F'], { windowsHide: true });
  return true;
}

// Só entrega arquivos que estão dentro da pasta de downloads do Ritmo.
async function readDownloaded(filePath) {
  const resolved = path.resolve(String(filePath));
  if (!resolved.startsWith(outDir() + path.sep)) throw new Error('Arquivo fora da pasta de downloads.');
  return fs.promises.readFile(resolved);
}

module.exports = { toolsStatus, installTools, download, cancel, readDownloaded, outDir };
