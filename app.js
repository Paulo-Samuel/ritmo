'use strict';
/*
 * Ritmo — player de música local com layout inspirado em apps de streaming.
 * Toca arquivos do seu computador. Biblioteca, capas e playlists ficam salvas
 * no próprio navegador (IndexedDB); nada é enviado para a internet.
 */

// ---------- ícones ----------
const svg = (body, filled = false) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" ${filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
const HEART = 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z';
const ICON = {
  play: svg('<path d="M7 4.6v14.8a.8.8 0 0 0 1.2.7l12-7.4a.8.8 0 0 0 0-1.4l-12-7.4A.8.8 0 0 0 7 4.6z"/>', true),
  pause: svg('<rect x="5.5" y="4" width="4.5" height="16" rx="1.2"/><rect x="14" y="4" width="4.5" height="16" rx="1.2"/>', true),
  next: svg('<path d="M4.5 5.2v13.6a.8.8 0 0 0 1.2.7l9.8-6.5a1.2 1.2 0 0 0 0-2L5.7 4.5a.8.8 0 0 0-1.2.7z"/><rect x="16.5" y="4" width="3" height="16" rx="1"/>', true),
  prev: svg('<path d="M19.5 5.2v13.6a.8.8 0 0 1-1.2.7L8.5 13a1.2 1.2 0 0 1 0-2l9.8-6.5a.8.8 0 0 1 1.2.7z"/><rect x="4.5" y="4" width="3" height="16" rx="1"/>', true),
  shuffle: svg('<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>'),
  repeat: svg('<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
  heart: svg(`<path d="${HEART}"/>`),
  heartFill: svg(`<path d="${HEART}"/>`, true),
  home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>'),
  library: svg('<path d="M4 3v18M9 3v18"/><path d="m14 3.5 6 17"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  more: svg('<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>', true),
  volume: svg('<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'),
  volumeLow: svg('<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>'),
  mute: svg('<path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z"/><path d="m16 9.5 5 5m0-5-5 5"/>'),
  panel: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>'),
  back: svg('<path d="m15 18-6-6 6-6"/>'),
  fwd: svg('<path d="m9 18 6-6-6-6"/>'),
  note: svg('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  upload: svg('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'),
  folder: svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  queue: svg('<path d="M4 6h16M4 12h16M4 18h9"/><path d="m16 15 5 3-5 3z"/>'),
  playlist: svg('<path d="M4 6h12M4 12h12M4 18h7"/><path d="M19 13v8M15 17h8"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6"/><path d="m6 7 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M9 7V4h6v3"/>'),
  edit: svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  disc: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
  sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  wave: svg('<path d="M5 10v4M9 7v10M13 4v16M17 8v8M21 11v2"/>'),
  download: svg('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
  retry: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  check: svg('<path d="m5 12 5 5L20 7"/>'),
  alert: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>'),
  video: svg('<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>'),
};

// ---------- utilidades ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = v => encodeURIComponent(JSON.stringify(v));
const dec = s => JSON.parse(decodeURIComponent(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const NO_ALBUM = 'Sem álbum';

function fmt(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  sec = Math.floor(sec);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
function fmtTotal(sec) {
  sec = Math.round(sec || 0);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h} h ${m} min`;
  if (m) return `${m} min ${s} s`;
  return `${s} s`;
}
const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
function ago(ts) {
  const diff = (ts - Date.now()) / 1000;
  for (const [unit, s] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) {
    if (Math.abs(diff) >= s) return rtf.format(Math.round(diff / s), unit);
  }
  return 'agora mesmo';
}
function hash(str) {
  let h = 2166136261;
  for (const c of String(str)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const hue = s => hash(s) % 360;
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function mulberry32(seed) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function groupBy(list, key) {
  const m = new Map();
  for (const t of list) { const k = key(t); if (!m.has(k)) m.set(k, []); m.get(k).push(t); }
  return m;
}

// ---------- estado ----------
const state = {
  tracks: [],     // { id, title, artist, album, duration, liked, likedAt, addedAt, sig }
  playlists: [],  // { id, name, trackIds, createdAt }
  settings: { volume: 0.8, muted: false, shuffle: false, repeat: 'off', showRight: true },
};
const byId = new Map();      // id -> música
const coverUrls = new Map(); // id -> URL da capa
const memFiles = new Map();  // id -> arquivo de áudio desta sessão
let view = { name: 'home' };
const nav = { back: [], fwd: [] };

// ---------- armazenamento (IndexedDB) ----------
let db = null;
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('ritmo', 1);
    req.onupgradeneeded = () => {
      for (const s of ['files', 'covers', 'meta']) if (!req.result.objectStoreNames.contains(s)) req.result.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function tx(store, mode, fn) {
  return new Promise((resolve, reject) => {
    if (!db) return resolve(undefined);
    const t = db.transaction(store, mode);
    const r = fn(t.objectStore(store));
    t.oncomplete = () => resolve(Array.isArray(r) ? r.map(x => x.result) : r?.result);
    t.onerror = t.onabort = () => reject(t.error);
  });
}
let saveTimer = 0;
function persistNow() {
  clearTimeout(saveTimer);
  saveTimer = 0;
  return tx('meta', 'readwrite', s => s.put({ tracks: state.tracks, playlists: state.playlists, settings: state.settings }, 'state'))
    .catch(e => console.warn('Falha ao salvar a biblioteca', e));
}
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistNow, 150);
}
// Ao fechar a janela, grava na hora o que ainda estiver pendente.
window.addEventListener('pagehide', () => { if (saveTimer) persistNow(); });
async function getAudio(id) {
  return memFiles.get(id) || (await tx('files', 'readonly', s => s.get(id))) || null;
}

// ---------- leitura de metadados (tags ID3 de MP3) ----------
const synchsafe = (b, o) => (b[o] << 21) | (b[o + 1] << 14) | (b[o + 2] << 7) | b[o + 3];
const be32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
function decodeText(encoding, bytes) {
  let label = 'iso-8859-1';
  if (encoding === 3) label = 'utf-8';
  else if (encoding === 2) label = 'utf-16be';
  else if (encoding === 1) {
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) { label = 'utf-16be'; bytes = bytes.subarray(2); }
    else { label = 'utf-16le'; if (bytes[0] === 0xFF && bytes[1] === 0xFE) bytes = bytes.subarray(2); }
  }
  return new TextDecoder(label).decode(bytes);
}
function textFrame(data) {
  return decodeText(data[0], data.subarray(1)).replace(/\0+$/, '').replace(/\0/g, ', ').trim();
}
function pictureFrame(data) {
  const encoding = data[0];
  let i = 1;
  while (i < data.length && data[i] !== 0) i++;
  const mime = new TextDecoder('iso-8859-1').decode(data.subarray(1, i)) || 'image/jpeg';
  i += 2; // fim do mime + tipo da imagem
  if (encoding === 1 || encoding === 2) { while (i + 1 < data.length && !(data[i] === 0 && data[i + 1] === 0)) i += 2; i += 2; }
  else { while (i < data.length && data[i] !== 0) i++; i += 1; }
  if (mime === '-->' || i >= data.length) return null;
  return new Blob([data.subarray(i)], { type: mime.includes('/') ? mime : `image/${mime.toLowerCase()}` });
}
async function readTags(file) {
  const out = {};
  try {
    const head = new Uint8Array(await file.slice(0, 10).arrayBuffer());
    if (head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return out; // "ID3"
    const version = head[3];
    if (version < 3 || version > 4) return out;
    const size = synchsafe(head, 6);
    const buf = new Uint8Array(await file.slice(10, 10 + size).arrayBuffer());
    let p = 0;
    if (head[5] & 0x40) p += version === 4 ? synchsafe(buf, 0) : be32(buf, 0) + 4; // cabeçalho estendido
    while (p + 10 <= buf.length) {
      const id = String.fromCharCode(buf[p], buf[p + 1], buf[p + 2], buf[p + 3]);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const len = version === 4 ? synchsafe(buf, p + 4) : be32(buf, p + 4);
      const start = p + 10, end = start + len;
      if (len <= 0 || end > buf.length) break;
      const data = buf.subarray(start, end);
      if (id === 'TIT2') out.title = textFrame(data);
      else if (id === 'TPE1') out.artist = textFrame(data);
      else if (id === 'TALB') out.album = textFrame(data);
      else if (id === 'TRCK') out.trackNo = parseInt(textFrame(data), 10) || undefined; // "3" ou "3/12"
      else if (id === 'APIC' && !out.cover) out.cover = pictureFrame(data);
      p = end;
    }
  } catch (e) { console.warn('Não foi possível ler as tags de', file.name, e); }
  return out;
}
function guessFromName(name) {
  const raw = name.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
  const num = raw.match(/^\s*(\d{1,3})\s*[-.)]\s*/);
  const base = raw.slice(num ? num[0].length : 0).trim();
  const trackNo = num ? +num[1] : undefined;
  const parts = base.split(/\s+[-–]\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim(), trackNo };
  return { title: base || name, trackNo };
}
function probeDuration(file) {
  return new Promise(resolve => {
    const a = new Audio();
    const url = URL.createObjectURL(file);
    let done = false;
    const finish = d => { if (done) return; done = true; URL.revokeObjectURL(url); resolve(d); };
    a.preload = 'metadata';
    a.onloadedmetadata = () => finish(Number.isFinite(a.duration) ? a.duration : 0);
    a.onerror = () => finish(null);
    setTimeout(() => finish(0), 10000);
    a.src = url;
  });
}

// ---------- importação ----------
const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|webm|weba)$/i;
async function pool(items, size, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => { while (i < items.length) await fn(items[i++]); }));
}
async function addTrack(file, override = {}) {
  const duration = await probeDuration(file);
  if (duration === null) return null;
  const tags = await readTags(file);
  const guess = guessFromName(file.name);
  const id = uid();
  const cover = override.cover || tags.cover || null;
  const t = {
    id,
    title: override.title || tags.title || guess.title,
    artist: override.artist || tags.artist || guess.artist || 'Artista desconhecido',
    album: override.album || tags.album || NO_ALBUM,
    duration,
    trackNo: override.trackNo || tags.trackNo || guess.trackNo || 0,
    liked: false,
    likedAt: 0,
    addedAt: Date.now(),
    sig: `${file.name}:${file.size}`,
  };
  memFiles.set(id, file);
  if (cover) coverUrls.set(id, URL.createObjectURL(cover));
  try {
    await tx('files', 'readwrite', s => s.put(file, id));
    if (cover) await tx('covers', 'readwrite', s => s.put(cover, id));
  } catch (e) { console.warn('Não foi possível guardar o arquivo no navegador', e); }
  state.tracks.push(t);
  byId.set(id, t);
  return t;
}
const byPath = (a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
/*
 * Importa arquivos na ordem das pastas/nomes (01, 02, … 10). Músicas que já estavam na
 * biblioteca são reaproveitadas. Com `playlistId`, tudo vai direto para essa playlist;
 * com `folderName`, oferece criar uma playlist com o nome da pasta.
 */
async function importFiles(fileList, { playlistId = null, folderName = '', sorted = false } = {}) {
  const files = [...fileList].filter(f => f.type.startsWith('audio/') || AUDIO_EXT.test(f.name));
  if (!sorted) files.sort((a, b) => byPath(a.webkitRelativePath || a.name, b.webkitRelativePath || b.name));
  if (!files.length) { toast('Nenhum arquivo de áudio encontrado'); return []; }
  const known = new Map(state.tracks.map(t => [t.sig, t.id]));
  const ids = files.map(f => known.get(`${f.name}:${f.size}`) || null);
  const fresh = files.map((f, i) => [f, i]).filter(([, i]) => !ids[i]);
  let failed = 0;
  if (fresh.length) {
    toast(`Importando ${plural(fresh.length, 'música', 'músicas')}…`, 60000);
    await pool(fresh, 4, async ([f, i]) => { const t = await addTrack(f); if (t) ids[i] = t.id; else failed++; });
    // As importações rodam em paralelo; recoloca as novas na ordem dos arquivos.
    const added = new Set(fresh.map(([, i]) => ids[i]).filter(Boolean));
    state.tracks = [...state.tracks.filter(t => !added.has(t.id)), ...ids.filter(id => added.has(id)).map(id => byId.get(id))];
  }
  const got = ids.filter(Boolean);
  const addedCount = fresh.length - failed;
  let msg = addedCount ? plural(addedCount, 'música adicionada', 'músicas adicionadas') : 'Essas músicas já estavam na biblioteca';
  if (failed) msg += ` • ${failed} não puderam ser lidas`;
  const p = playlistId && state.playlists.find(x => x.id === playlistId);
  if (p) msg += ` • ${plural(addIdsToPlaylist(p, got), 'nova', 'novas')} em “${p.name}”`;
  save();
  refreshKeepingInput();
  toast(msg);
  if (!p && folderName && got.length > 1) {
    const ok = await ask({ title: 'Criar playlist?', message: `Criar a playlist “${folderName}” com ${plural(got.length, 'música', 'músicas')} desta pasta, na mesma ordem?`, ok: 'Criar playlist' });
    if (ok) newPlaylist(folderName, got);
  }
  return got;
}
async function filesFromDrop(dt) {
  const entries = [...(dt.items || [])].map(i => i.webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return { files: [...dt.files], folderName: '' };
  const found = []; // [caminho, arquivo]
  async function walk(entry) {
    if (entry.isFile) found.push([entry.fullPath, await new Promise((res, rej) => entry.file(res, rej))]);
    else if (entry.isDirectory) {
      const reader = entry.createReader();
      let batch;
      do {
        batch = await new Promise((res, rej) => reader.readEntries(res, rej));
        for (const e of batch) await walk(e);
      } while (batch.length);
    }
  }
  for (const e of entries) await walk(e).catch(() => {});
  found.sort((a, b) => byPath(a[0], b[0]));
  const folderName = entries.length === 1 && entries[0].isDirectory ? entries[0].name : '';
  return { files: found.map(([, f]) => f), folderName };
}

// ---------- músicas de demonstração (geradas no navegador) ----------
const DEMO = [
  { title: 'Maré Alta', artist: 'Ritmo Demo', album: 'Sessões de Teste', h: 195, seed: 1 },
  { title: 'Luz da Manhã', artist: 'Ritmo Demo', album: 'Sessões de Teste', h: 195, seed: 2 },
  { title: 'Céu de Neon', artist: 'Banda Exemplo', album: 'Noturno', h: 285, seed: 3 },
  { title: 'Estrada Vazia', artist: 'Banda Exemplo', album: 'Noturno', h: 285, seed: 4 },
  { title: 'Café Quente', artist: 'Trio Placeholder', album: 'Manhãs', h: 28, seed: 5 },
];
function synthWav(seed, seconds = 30) {
  const sr = 22050, n = sr * seconds, pcm = new Int16Array(n);
  const rnd = mulberry32(seed * 9973);
  const root = 48 + ((seed * 5) % 12);
  const beat = 60 / (86 + seed * 9), step = beat / 2;
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const prog = [0, -3, 5, -5];
  const melody = Array.from({ length: 32 }, () => (rnd() < 0.2 ? null : root + 12 + scale[Math.floor(rnd() * scale.length)]));
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const si = Math.floor(t / step), st = t - si * step;
    let v = 0;
    const note = melody[si % 32];
    if (note !== null) {
      const f = freq(note), env = Math.min(1, st / 0.01) * Math.exp(-st * 5);
      v += 0.2 * env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t));
    }
    const bi = Math.floor(t / beat), bt = t - bi * beat;
    const bf = freq(root - 12 + prog[Math.floor(bi / 4) % 4]);
    v += 0.26 * Math.min(1, bt / 0.01) * Math.exp(-bt * 3) * Math.sin(2 * Math.PI * bf * t);
    if (bi % 2 === 0 && bt < 0.2) v += 0.5 * Math.exp(-bt * 20) * Math.sin(2 * Math.PI * (50 * bt + 4 * (1 - Math.exp(-30 * bt))));
    if (si % 2 === 1 && st < 0.03) v += (rnd() * 2 - 1) * 0.05 * (1 - st / 0.03);
    const fade = Math.min(1, t / 1.5, (seconds - t) / 2);
    pcm[i] = Math.max(-1, Math.min(1, v * fade)) * 32767;
  }
  const buf = new ArrayBuffer(44 + pcm.length * 2), dv = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, k) => dv.setUint8(o + k, c.charCodeAt(0)));
  w(0, 'RIFF'); dv.setUint32(4, 36 + pcm.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data');
  dv.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  return new Blob([buf], { type: 'audio/wav' });
}
function makeCover({ album, h }) {
  const c = document.createElement('canvas');
  c.width = c.height = 400;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, `hsl(${h}, 70%, 55%)`);
  grad.addColorStop(1, `hsl(${(h + 50) % 360}, 65%, 18%)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 400, 400);
  const rnd = mulberry32(hash(album));
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.arc(rnd() * 400, rnd() * 400, 30 + rnd() * 120, 0, Math.PI * 2);
    g.fillStyle = `hsla(${(h + rnd() * 80) % 360}, 80%, 70%, ${0.08 + rnd() * 0.18})`;
    g.fill();
  }
  let size = 46;
  g.font = `800 ${size}px "Segoe UI", system-ui, sans-serif`;
  while (g.measureText(album.toUpperCase()).width > 344 && size > 18) g.font = `800 ${--size}px "Segoe UI", system-ui, sans-serif`;
  g.fillStyle = 'rgba(255,255,255,.94)';
  g.fillText(album.toUpperCase(), 28, 366);
  return new Promise(resolve => c.toBlob(resolve, 'image/png'));
}
let demoBusy = false;
async function loadDemo() {
  if (demoBusy) return;
  demoBusy = true;
  toast('Gerando músicas de demonstração…', 60000);
  try {
    const covers = new Map();
    let added = 0;
    for (const d of DEMO) {
      const file = new File([synthWav(d.seed)], `${d.artist} - ${d.title}.wav`, { type: 'audio/wav' });
      if (state.tracks.some(t => t.sig === `${file.name}:${file.size}`)) continue;
      if (!covers.has(d.album)) covers.set(d.album, await makeCover(d));
      if (await addTrack(file, { ...d, cover: covers.get(d.album) })) added++;
    }
    save();
    renderAll();
    toast(added ? `${plural(added, 'música de demonstração adicionada', 'músicas de demonstração adicionadas')}. Dê o play!` : 'As músicas de demonstração já estão na biblioteca');
  } finally { demoBusy = false; }
}

// ---------- coleções ----------
function keyOf(v) {
  if (v.name === 'playlist') return `playlist:${v.id}`;
  if (v.name === 'artist' || v.name === 'album') return `${v.name}:${v.value}`;
  if (v.name === 'search') return `search:${v.q || ''}`;
  return v.name;
}
function listFor(v) {
  const all = state.tracks;
  let ids = [], title = '', label = '', h = 220;
  switch (v.name) {
    case 'liked':
      ids = all.filter(t => t.liked).sort((a, b) => (b.likedAt || 0) - (a.likedAt || 0)).map(t => t.id);
      title = 'Músicas curtidas'; label = 'Playlist'; h = 262; break;
    case 'all':
      ids = all.map(t => t.id); title = 'Todas as músicas'; label = 'Coleção'; h = 205; break;
    case 'recent':
      ids = all.map((t, i) => [t, i]).sort((a, b) => b[0].addedAt - a[0].addedAt || b[1] - a[1]).slice(0, 20).map(([t]) => t.id);
      title = 'Adicionadas recentemente'; label = 'Coleção'; h = 160; break;
    case 'playlist': {
      const p = state.playlists.find(x => x.id === v.id);
      ids = p ? p.trackIds.filter(id => byId.has(id)) : [];
      title = p ? p.name : 'Playlist'; label = 'Playlist'; h = hue(v.id); break;
    }
    case 'artist':
      ids = all.filter(t => t.artist === v.value).map(t => t.id); title = v.value; label = 'Artista'; h = hue(v.value); break;
    case 'album':
      // Álbum na ordem das faixas (as sem número ficam no fim, na ordem em que foram adicionadas).
      ids = all.filter(t => t.album === v.value).map((t, i) => [t, i])
        .sort((a, b) => (a[0].trackNo || 1e4) - (b[0].trackNo || 1e4) || a[1] - b[1]).map(([t]) => t.id);
      title = v.value; label = 'Álbum'; h = hue(v.value); break;
    case 'search': {
      const words = norm(v.q).split(/\s+/).filter(Boolean);
      ids = all.filter(t => { const hay = norm(`${t.title} ${t.artist} ${t.album}`); return words.every(w => hay.includes(w)); }).map(t => t.id);
      title = `Resultados para “${v.q}”`; label = 'Busca'; break;
    }
  }
  return { v, key: keyOf(v), ids, title, label, h };
}

// ---------- pedaços de HTML ----------
function coverHTML(t, cls = '') {
  if (t && coverUrls.has(t.id)) return `<img class="cover ${cls}" src="${coverUrls.get(t.id)}" alt="" loading="lazy" draggable="false">`;
  const seed = t ? (t.album !== NO_ALBUM ? t.album : t.title) : 'x';
  return `<div class="cover gen ${cls}" style="--h:${hue(seed)}">${ICON.note}</div>`;
}
function collCover(v, ids, cls = '') {
  if (v.name === 'liked') return `<div class="cover gen liked ${cls}">${ICON.heartFill}</div>`;
  if (v.name === 'all' || v.name === 'recent') return `<div class="cover gen ${cls}" style="--h:${v.name === 'all' ? 205 : 160}">${ICON.note}</div>`;
  const withCover = ids.map(id => byId.get(id)).find(t => t && coverUrls.has(t.id));
  if (withCover) return coverHTML(withCover, cls);
  return `<div class="cover gen ${cls}" style="--h:${hue(v.name === 'playlist' ? v.id : v.value)}">${v.name === 'artist' ? ICON.user : ICON.note}</div>`;
}
function playBtn(cls, act, v, { id = '', attrs = '' } = {}) {
  const live = id ? player.current === id : player.context?.key === keyOf(v);
  return `<button class="${cls}${live ? ' is-ctx' : ''}" data-act="${act}" data-v="${enc(v)}"${id ? ` data-id="${id}"` : ''} title="Tocar" aria-label="Tocar"${attrs}><span class="i-play">${ICON.play}</span><span class="i-pause">${ICON.pause}</span></button>`;
}
function likeBtn(t) {
  return `<button class="icon-btn like${t.liked ? ' on' : ''}" data-act="like" data-id="${t.id}" title="${t.liked ? 'Remover das Músicas curtidas' : 'Salvar em Músicas curtidas'}" aria-label="Curtir" aria-pressed="${t.liked}">${t.liked ? ICON.heartFill : ICON.heart}</button>`;
}
function card({ v, title, sub, cover, round = false, play }) {
  return `<div class="card" data-act="nav" data-v="${enc(v)}" role="button" tabindex="0"><div class="card-cover${round ? ' round' : ''}">${cover}${play}</div><div class="card-title" title="${esc(title)}">${esc(title)}</div><div class="card-sub">${esc(sub)}</div></div>`;
}
function section(title, cards, moreV, oneRow = true) {
  if (!cards) return '';
  return `<section class="section"><div class="sec-head"><h2>${esc(title)}</h2>${moreV ? `<button class="sec-more" data-act="nav" data-v="${enc(moreV)}">Mostrar tudo</button>` : ''}</div><div class="cards${oneRow ? ' one-row' : ''}">${cards}</div></section>`;
}
function artistCards(limit = Infinity) {
  return [...groupBy(state.tracks, t => t.artist)].slice(0, limit).map(([name, list]) => {
    const v = { name: 'artist', value: name };
    return card({ v, title: name, sub: `Artista • ${plural(list.length, 'música', 'músicas')}`, cover: collCover(v, list.map(t => t.id)), round: true, play: playBtn('fab', 'play-coll', v) });
  }).join('');
}
function albumCards(limit = Infinity) {
  return [...groupBy(state.tracks.filter(t => t.album !== NO_ALBUM), t => t.album)].slice(0, limit).map(([name, list]) => {
    const v = { name: 'album', value: name };
    return card({ v, title: name, sub: list[0].artist, cover: collCover(v, list.map(t => t.id)), play: playBtn('fab', 'play-coll', v) });
  }).join('');
}

// ---------- telas ----------
function emptyView() {
  return `<div class="empty"><div class="empty-inner">
    <div class="empty-icon">${ICON.note}</div>
    <h1>Sua biblioteca está vazia</h1>
    <p>Adicione músicas do seu computador (MP3, M4A, WAV, OGG, FLAC…) ou arraste arquivos e pastas para esta janela.</p>
    <div class="btn-row">
      <button class="btn primary" data-act="pick-files">${ICON.upload}Adicionar músicas</button>
      <button class="btn ghost" data-act="pick-folder">${ICON.folder}Adicionar pasta</button>
      ${dlApi ? `<button class="btn ghost" data-act="nav-download">${ICON.download}Baixar do YouTube</button>` : ''}
    </div>
    <button class="btn text" data-act="demo">${ICON.sparkle}Carregar músicas de demonstração</button>
    <p class="hint">Os arquivos ficam só no seu computador: nada é enviado para a internet.</p>
  </div></div>`;
}
function homeView() {
  const hr = new Date().getHours();
  const greet = hr < 5 ? 'Boa noite' : hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
  const tileViews = [];
  if (state.tracks.some(t => t.liked)) tileViews.push({ name: 'liked' });
  tileViews.push({ name: 'all' });
  for (const p of state.playlists) tileViews.push({ name: 'playlist', id: p.id });
  const tiles = tileViews.slice(0, 8).map(v => {
    const L = listFor(v);
    return `<div class="tile" data-act="nav" data-v="${enc(v)}" role="button" tabindex="0">${collCover(v, L.ids)}<span class="tile-title">${esc(L.title)}</span>${playBtn('fab sm', 'play-coll', v, { attrs: L.ids.length ? '' : ' disabled' })}</div>`;
  }).join('');
  const recent = listFor({ name: 'recent' });
  const recentCards = recent.ids.slice(0, 12).map(id => {
    const t = byId.get(id);
    const v = t.album !== NO_ALBUM ? { name: 'album', value: t.album } : { name: 'artist', value: t.artist };
    return card({ v, title: t.title, sub: t.artist, cover: coverHTML(t), play: playBtn('fab', 'play-track', { name: 'recent' }, { id }) });
  }).join('');
  return `<div class="home" style="--h:18">
    <h1 class="greet">${greet}</h1>
    <div class="tiles">${tiles}</div>
    ${section('Adicionadas recentemente', recentCards, { name: 'recent' })}
    ${section('Seus artistas', artistCards(12), { name: 'search', q: '' })}
    ${section('Seus álbuns', albumCards(12), { name: 'search', q: '' })}
  </div>`;
}
function browseView() {
  return `<div class="home" style="--h:230">
    <h1 class="greet">Navegar por tudo</h1>
    ${section('Artistas', artistCards(), null, false)}
    ${section('Álbuns', albumCards(), null, false)}
  </div>`;
}
function rowHTML(t, i) {
  const cur = player.current === t.id;
  return `<div class="row${cur ? ' current' : ''}${selection.has(t.id) ? ' sel' : ''}" data-id="${t.id}" data-i="${i}" role="row" aria-selected="${selection.has(t.id)}">
<div class="c-idx"><span class="num">${i + 1}</span><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><button class="row-play${cur ? ' is-ctx' : ''}" data-act="play-row" aria-label="Tocar ${esc(t.title)}"><span class="i-play">${ICON.play}</span><span class="i-pause">${ICON.pause}</span></button></div>
<div class="c-title">${coverHTML(t, 'sm')}<div class="tt"><div class="t-name" title="${esc(t.title)}">${esc(t.title)}</div><button class="link t-artist" data-act="nav" data-v="${enc({ name: 'artist', value: t.artist })}">${esc(t.artist)}</button></div></div>
<div class="c-album">${t.album === NO_ALBUM ? '<span class="dim">—</span>' : `<button class="link" data-act="nav" data-v="${enc({ name: 'album', value: t.album })}">${esc(t.album)}</button>`}</div>
<div class="c-added">${ago(t.addedAt)}</div>
<div class="c-like">${likeBtn(t)}</div>
<div class="c-dur"><span>${fmt(t.duration)}</span><button class="icon-btn more" data-act="more" data-id="${t.id}" title="Mais opções" aria-label="Mais opções">${ICON.more}</button></div>
</div>`;
}
function listView(v) {
  const L = listFor(v);
  const tracks = L.ids.map(id => byId.get(id));
  const total = tracks.reduce((s, t) => s + (t.duration || 0), 0);
  const count = plural(L.ids.length, 'música', 'músicas');
  const withDur = L.ids.length ? `${count}, ${fmtTotal(total)}` : count;
  let top;
  if (v.name === 'search') {
    top = `<div class="search-head"><h1>${esc(L.title)}</h1><p>${count}</p></div>`;
  } else {
    let meta = withDur;
    if (v.name === 'playlist') meta = `<b>Você</b> • ${withDur}`;
    else if (v.name === 'album' && tracks[0]) meta = `<button class="link inline" data-act="nav" data-v="${enc({ name: 'artist', value: tracks[0].artist })}"><b>${esc(tracks[0].artist)}</b></button> • ${withDur}`;
    const titleAttrs = v.name === 'playlist' ? ` class="hero-title editable" data-act="rename" data-id="${v.id}" title="Clique para renomear"` : ' class="hero-title"';
    top = `<header class="hero">${collCover(v, L.ids, 'hero-cover' + (v.name === 'artist' ? ' round' : ''))}<div class="hero-info"><span class="hero-label">${L.label}</span><h1${titleAttrs}>${esc(L.title)}</h1><div class="hero-meta">${meta}</div></div></header>`;
  }
  const actions = `<div class="actions">${playBtn('big-play', 'play-coll', v, { attrs: L.ids.length ? '' : ' disabled' })}
    <button class="icon-btn lg${state.settings.shuffle ? ' on' : ''}" data-act="shuffle" title="Ordem aleatória" aria-label="Ordem aleatória">${ICON.shuffle}</button>
    <button class="icon-btn lg" data-act="coll-menu" data-v="${enc(v)}" title="Mais opções" aria-label="Mais opções">${ICON.more}</button></div>`;
  let body;
  if (!L.ids.length) {
    if (v.name === 'playlist') body = `<div class="inline-empty"><h3>Esta playlist está vazia</h3>
      <p>Adicione arquivos do computador direto aqui, ou abra um álbum, artista ou “Todas as músicas”, selecione várias músicas (Ctrl+clique, Shift+clique ou Ctrl+A) e escolha “Adicionar à playlist”.</p>
      <div class="btn-row"><button class="btn primary" data-act="pick-into-playlist" data-id="${v.id}">${ICON.upload}Adicionar do computador</button><button class="btn ghost" data-act="nav" data-v="${enc({ name: 'all' })}">Ver todas as músicas</button></div></div>`;
    else if (v.name === 'search') body = `<div class="inline-empty"><h3>Nenhum resultado para “${esc(v.q)}”</h3><p>Confira a ortografia ou tente outras palavras.</p></div>`;
    else body = `<div class="inline-empty"><h3>Nada por aqui ainda</h3>${v.name === 'liked' ? '<p>Toque no coração ao lado de uma música para curti-la.</p>' : ''}</div>`;
  } else {
    body = `<div class="tracks" role="table"><div class="row head" role="row"><div class="c-idx">#</div><div class="c-title">Título</div><div class="c-album">Álbum</div><div class="c-added">Adicionada</div><div class="c-like"></div><div class="c-dur" title="Duração">${ICON.clock}</div></div>${tracks.map(rowHTML).join('')}</div>`;
  }
  return `<div class="view${v.name === 'search' ? ' plain' : ''}" style="--h:${L.h}">${top}<div class="view-body">${actions}${body}${selbarHTML()}</div></div>`;
}

// ---------- seleção de várias músicas ----------
let selection = new Set();
let selAnchor = null; // posição do último clique, para o Shift+clique
function selbarInner() {
  return `<span class="sel-count">${plural(selection.size, 'selecionada', 'selecionadas')}</span>
    <button class="btn light sm" data-act="sel-playlist">${ICON.playlist}Adicionar à playlist</button>
    <button class="btn ghost sm" data-act="sel-queue">${ICON.queue}Fila</button>
    <button class="icon-btn" data-act="sel-more" title="Mais opções" aria-label="Mais opções">${ICON.more}</button>
    <button class="icon-btn" data-act="sel-clear" title="Limpar seleção (Esc)" aria-label="Limpar seleção">${ICON.close}</button>`;
}
function selbarHTML() {
  const show = selection.size > 1;
  return `<div class="selbar" id="selbar" role="toolbar" aria-label="Músicas selecionadas"${show ? '' : ' hidden'}>${show ? selbarInner() : ''}</div>`;
}
function paintSelection() {
  $$('.row[data-id]').forEach(r => { const on = selection.has(r.dataset.id); r.classList.toggle('sel', on); r.setAttribute('aria-selected', on); });
  const bar = $('#selbar');
  if (!bar) return;
  const show = selection.size > 1;
  bar.innerHTML = show ? selbarInner() : ''; // só atualiza o conteúdo: a animação roda apenas ao aparecer
  bar.hidden = !show;
}
function clearSelection() {
  if (!selection.size) return;
  selection = new Set();
  selAnchor = null;
  paintSelection();
}
function clickRow(row, e) {
  const id = row.dataset.id, i = +row.dataset.i;
  if (e.shiftKey && selAnchor !== null) {
    const ids = listFor(view).ids;
    if (!(e.ctrlKey || e.metaKey)) selection = new Set();
    for (let k = Math.min(selAnchor, i); k <= Math.max(selAnchor, i); k++) selection.add(ids[k]);
  } else if (e.ctrlKey || e.metaKey) {
    if (selection.has(id)) selection.delete(id); else selection.add(id);
    selAnchor = i;
  } else {
    selection = new Set([id]);
    selAnchor = i;
  }
  paintSelection();
}
function selectAll() {
  const ids = listFor(view).ids;
  if (!ids.length) return;
  selection = new Set(ids);
  selAnchor = 0;
  paintSelection();
  toast(`${plural(ids.length, 'música selecionada', 'músicas selecionadas')}`);
}
// Ids na ordem em que aparecem na tela.
const selectedIds = () => listFor(view).ids.filter(id => selection.has(id));
// O que um menu de música deve afetar: a seleção inteira, se a música clicada fizer parte dela.
function targetIds(id) {
  if (selection.size > 1 && selection.has(id)) return selectedIds();
  selection = new Set([id]);
  selAnchor = listFor(view).ids.indexOf(id);
  paintSelection();
  return [id];
}

// ---------- baixar de links (só no app de desktop) ----------
const dlApi = window.ritmo || null;
const downloads = []; // { id, url, format, status, percent, speed, eta, title, error, trackIds }
const DL_FORMATS = {
  mp3: { label: 'MP3', hint: 'Áudio em MP3 com capa e nome do artista. Toca em qualquer aparelho.' },
  m4a: { label: 'M4A', hint: 'Áudio no formato original do YouTube, sem conversão: melhor qualidade e mais rápido.' },
  mp4: { label: 'MP4 (vídeo)', hint: 'Vídeo com áudio, até 1080p. Arquivo bem maior; no Ritmo toca só o som.' },
};
const DL_TYPES = { mp3: 'audio/mpeg', m4a: 'audio/mp4', mp4: 'video/mp4', webm: 'audio/webm', opus: 'audio/ogg', ogg: 'audio/ogg' };
const dlFormat = () => (DL_FORMATS[state.settings.dlFormat] ? state.settings.dlFormat : 'mp3');

function downloadView() {
  if (!dlApi) {
    return `<div class="view plain"><div class="dl-page"><h1 class="greet">Baixar músicas</h1>
      <div class="dl-note">Este recurso funciona só no app de desktop (<b>Ritmo.exe</b>). No navegador, o Ritmo não tem permissão para baixar arquivos.</div></div></div>`;
  }
  const fmt = dlFormat();
  return `<div class="view plain"><div class="dl-page">
    <h1 class="greet">Baixar do YouTube</h1>
    <p class="dl-sub">Cole o link de um vídeo ou música. O arquivo vai para a pasta <b>Música\\Ritmo</b> e entra direto na sua biblioteca.</p>
    <form class="dl-form" id="dlForm" autocomplete="off">
      <input id="dlUrl" type="url" placeholder="https://www.youtube.com/watch?v=…" required spellcheck="false" aria-label="Link do vídeo">
      <div class="seg" role="radiogroup" aria-label="Formato">${Object.entries(DL_FORMATS).map(([f, d]) =>
        `<button type="button" class="seg-btn${f === fmt ? ' on' : ''}" data-act="dl-format" data-f="${f}" role="radio" aria-checked="${f === fmt}">${d.label}</button>`).join('')}</div>
      <button class="btn primary" type="submit">${ICON.download}Baixar</button>
    </form>
    <p class="hint" id="dlHint">${DL_FORMATS[fmt].hint}</p>
    <div class="dl-head"><h2>Downloads</h2><button class="btn text sm" data-act="dl-open-folder">${ICON.folder}Abrir pasta</button></div>
    <div id="dlList">${dlListHTML()}</div>
    <p class="hint legal">Baixe só o que você tem direito de baixar: seus próprios vídeos, conteúdo liberado pelo autor ou de domínio público. Os termos do YouTube não permitem baixar outros vídeos sem autorização.</p>
  </div></div>`;
}
function dlListHTML() {
  if (!downloads.length) return '<p class="dl-empty">Nenhum download ainda. Cole um link acima para começar.</p>';
  return downloads.map(j => {
    let meta = '', bar = '', icon = j.format === 'mp4' ? ICON.video : ICON.note, action = '';
    const cancelBtn = `<button class="icon-btn" data-act="dl-cancel" data-id="${j.id}" title="Cancelar" aria-label="Cancelar">${ICON.close}</button>`;
    switch (j.status) {
      case 'queued': meta = 'Na fila'; action = cancelBtn; break;
      case 'tools': meta = `Preparando o download (só na primeira vez)… ${j.percent}%`; bar = `<div class="dl-bar"><i style="width:${j.percent}%"></i></div>`; break;
      case 'starting': meta = 'Conectando…'; bar = '<div class="dl-bar indet"><i></i></div>'; action = cancelBtn; break;
      case 'downloading':
        meta = [`${Math.round(j.percent)}%`, j.speed, j.eta && `faltam ${j.eta}`].filter(Boolean).join(' • ');
        bar = `<div class="dl-bar"><i style="width:${j.percent}%"></i></div>`; action = cancelBtn; break;
      case 'processing': meta = 'Convertendo…'; bar = '<div class="dl-bar indet"><i></i></div>'; action = cancelBtn; break;
      case 'importing': meta = 'Adicionando à biblioteca…'; bar = '<div class="dl-bar indet"><i></i></div>'; break;
      case 'done':
        meta = 'Pronto • na sua biblioteca'; icon = ICON.check;
        if (j.trackIds?.length) action = playBtn('icon-btn', 'play-track', { name: 'all' }, { id: j.trackIds[0] });
        break;
      case 'error': meta = j.error; icon = ICON.alert; action = `<button class="icon-btn" data-act="dl-retry" data-id="${j.id}" title="Tentar de novo" aria-label="Tentar de novo">${ICON.retry}</button>`; break;
      case 'canceled': meta = 'Cancelado'; action = `<button class="icon-btn" data-act="dl-retry" data-id="${j.id}" title="Tentar de novo" aria-label="Tentar de novo">${ICON.retry}</button>`; break;
    }
    return `<div class="dl-item ${j.status}"><div class="dl-icon">${icon}</div><div class="dl-info"><div class="dl-title" title="${esc(j.title || j.url)}">${esc(j.title || j.url)}</div><div class="dl-meta">${esc(DL_FORMATS[j.format].label)} • ${esc(meta)}</div>${bar}</div><div class="dl-actions">${action}</div></div>`;
  }).join('');
}
function renderDlList() {
  const el = $('#dlList');
  if (el) el.innerHTML = dlListHTML();
}
// Atualiza a tela depois de mudar a biblioteca sem apagar o que a pessoa está digitando no link.
function refreshKeepingInput() {
  renderSidebar();
  if (view.name === 'download') renderDlList(); else renderMain();
  renderRight();
  updatePlayerBar();
}
function enqueueDownload(url) {
  url = url.trim();
  if (!/^https?:\/\/\S+$/i.test(url)) { toast('Cole um link completo, começando com https://'); return; }
  downloads.unshift({ id: uid(), url, format: dlFormat(), status: 'queued', percent: 0, title: '', error: '' });
  renderDlList();
  runDownloads();
}
let dlRunning = false;
async function runDownloads() {
  if (dlRunning) return;
  dlRunning = true;
  try {
    let job;
    while ((job = [...downloads].reverse().find(j => j.status === 'queued'))) await runDownload(job);
  } finally { dlRunning = false; }
}
const ipcError = e => String(e?.message || e).replace(/^Error invoking remote method '[^']+':\s*(Error:\s*)?/, '');
const NOISE = /\s*[([][^)\]]*(official|oficial|video|vídeo|clipe|clip|lyrics?|letra|audio|áudio|visuali[sz]er|hd|4k|remaster(ed)?)[^)\]]*[)\]]/gi;
function metaFromDownload(f) {
  let title = (f.title || '').replace(NOISE, '').trim();
  let artist = (f.artist || '').split(',')[0].trim();
  if (!artist) {
    const parts = title.split(/\s+[-–—]\s+/);
    if (parts.length >= 2) { artist = parts[0].trim(); title = parts.slice(1).join(' - ').trim(); }
    else artist = (f.uploader || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  }
  return { title: title || f.title, artist: artist || 'Artista desconhecido', album: f.album || NO_ALBUM };
}
async function runDownload(job) {
  try {
    const tools = await dlApi.toolsStatus();
    if (!tools.ready) { job.status = 'tools'; job.percent = 0; renderDlList(); await dlApi.installTools(); }
    if (job.status === 'canceled') return;
    job.status = 'starting';
    renderDlList();
    const files = await dlApi.download({ id: job.id, url: job.url, format: job.format });
    if (job.status === 'canceled') return;
    job.status = 'importing';
    renderDlList();
    job.trackIds = [];
    for (const f of files) {
      const name = f.path.split(/[\\/]/).pop();
      const bytes = await dlApi.readFile(f.path);
      const file = new File([bytes], name, { type: DL_TYPES[name.split('.').pop().toLowerCase()] || '' });
      const existing = state.tracks.find(t => t.sig === `${file.name}:${file.size}`);
      const meta = metaFromDownload(f);
      const t = existing || await addTrack(file, meta);
      if (t) job.trackIds.push(t.id);
      job.title = meta.title;
    }
    save();
    job.status = 'done';
    refreshKeepingInput();
    toast(`“${job.title}” está na sua biblioteca`);
  } catch (e) {
    if (job.status !== 'canceled') { job.status = 'error'; job.error = ipcError(e); }
  }
  renderDlList();
}
if (dlApi) {
  dlApi.onProgress(d => {
    const job = downloads.find(j => j.id === d.id);
    if (!job || job.status === 'canceled') return;
    if (d.title) job.title = d.title;
    if (d.percent !== undefined) {
      job.percent = d.percent;
      job.speed = d.speed;
      job.eta = d.eta;
      job.status = d.percent >= 100 ? 'processing' : 'downloading';
    }
    renderDlList();
  });
  dlApi.onToolsProgress(p => {
    const job = downloads.find(j => j.status === 'tools');
    if (job) { job.percent = p.percent; renderDlList(); }
  });
}

// ---------- atualizações automáticas (só no app instalado) ----------
let appVersion = '';
let manualUpdateCheck = false;
function showUpdateCard(version) {
  const card = $('#updateCard');
  card.innerHTML = `<div class="uc-icon">${ICON.sparkle}</div>
    <div class="uc-text"><b>Nova versão pronta</b><span>Ritmo ${esc(version)}. Reinicie para usar, ou ela entra quando você fechar o app.</span></div>
    <div class="uc-actions"><button class="btn primary sm" data-act="update-install">Reiniciar agora</button><button class="btn text sm" data-act="update-later">Depois</button></div>`;
  card.hidden = false;
}
function onUpdateStatus(s) {
  if (s.state === 'ready') { showUpdateCard(s.version); manualUpdateCheck = false; return; }
  if (!manualUpdateCheck) return; // verificações automáticas são silenciosas
  if (s.state === 'downloading' && s.version) toast(`Baixando a versão ${s.version}…`);
  else if (s.state === 'latest') { toast(`Você já tem a versão mais nova (${appVersion})`); manualUpdateCheck = false; }
  else if (s.state === 'unavailable') { toast('A atualização automática só funciona na versão instalada pelo Ritmo-Instalador.', 5000); manualUpdateCheck = false; }
  else if (s.state === 'error') {
    toast(s.noReleases ? 'Ainda não há versões publicadas para baixar.' : 'Não foi possível procurar atualizações agora. Confira sua internet.');
    manualUpdateCheck = false;
  }
}
function brandMenuItems() {
  const items = [{ label: appVersion ? `Ritmo ${appVersion}` : 'Ritmo', icon: 'wave', disabled: true }];
  if (dlApi?.checkUpdate) {
    items.push('-', { label: 'Procurar atualizações', icon: 'retry', run: () => { manualUpdateCheck = true; toast('Procurando atualizações…'); dlApi.checkUpdate(); } });
  }
  return items;
}
if (dlApi?.onUpdate) {
  dlApi.onUpdate(onUpdateStatus);
  dlApi.version().then(v => { appVersion = v; $('.brand').title = `Ritmo ${v}`; }).catch(() => {});
}

// ---------- renderização ----------
function renderSidebar() {
  const items = [{ name: 'liked' }, { name: 'all' }, ...state.playlists.map(p => ({ name: 'playlist', id: p.id }))];
  const cur = keyOf(view);
  const list = items.map(v => {
    const L = listFor(v);
    const playing = player.context?.key === L.key;
    const sub = `${v.name === 'all' ? 'Coleção' : 'Playlist'} • ${plural(L.ids.length, 'música', 'músicas')}`;
    return `<div class="lib-item${L.key === cur ? ' active' : ''}" data-act="nav" data-v="${enc(v)}"${v.name === 'playlist' ? ` data-pid="${v.id}"` : ''} role="button" tabindex="0" title="${esc(L.title)}">${collCover(v, L.ids)}<div class="lib-text"><div class="lib-title${playing ? ' accent' : ''}">${esc(L.title)}</div><div class="lib-sub">${sub}</div></div>${playing ? `<span class="lib-playing">${ICON.volume}</span>` : ''}</div>`;
  }).join('');
  $('#sidebar').innerHTML = `<div class="side-head"><button class="side-title" data-act="nav" data-v="${enc({ name: 'all' })}" title="Todas as músicas">${ICON.library}<span>Sua biblioteca</span></button><button class="round sm" data-act="library-add" title="Criar playlist ou adicionar músicas" aria-label="Criar playlist ou adicionar músicas">${ICON.plus}</button></div><div class="lib-list">${list}</div>`;
}
function renderMain(reset = false) {
  const main = $('#main');
  if (reset) { selection = new Set(); selAnchor = null; } // trocou de tela: começa sem seleção
  let html;
  if (view.name === 'download') html = downloadView();
  else if (!state.tracks.length && view.name !== 'playlist') html = emptyView();
  else if (view.name === 'home') html = homeView();
  else if (view.name === 'search' && !view.q) html = browseView();
  else html = listView(view);
  main.innerHTML = html;
  if (reset) main.scrollTop = 0;
  $('#homeBtn').classList.toggle('active', view.name === 'home');
  $('#dlBtn').classList.toggle('active', view.name === 'download');
  $('#back').disabled = !nav.back.length;
  $('#fwd').disabled = !nav.fwd.length;
}
function renderRight() {
  const el = $('#right');
  const t = byId.get(player.current);
  const head = label => `<div class="right-head"><span>${esc(label)}</span><button class="icon-btn" data-act="toggle-right" title="Fechar painel" aria-label="Fechar painel">${ICON.close}</button></div>`;
  if (!t) {
    el.innerHTML = head('Tocando agora') + `<div class="right-empty">${ICON.note}<p>Escolha uma música para começar a ouvir.</p></div>`;
    return;
  }
  const c = player.context;
  const item = (id, q, now = false) => {
    const x = byId.get(id);
    if (!x) return '';
    return `<div class="q-item${now ? ' now' : ''}"${q ? ` data-act="jump" data-q="${q}" role="button" tabindex="0"` : ''}>${coverHTML(x, 'xs')}<div class="q-text"><div class="q-title">${esc(x.title)}</div><div class="q-sub">${esc(x.artist)}</div></div></div>`;
  };
  const user = player.upNext.map((id, i) => item(id, `u:${i}`)).join('');
  const ctx = c ? c.ids.slice(player.pos + 1, player.pos + 41).map((id, i) => item(id, `c:${player.pos + 1 + i}`)).join('') : '';
  el.innerHTML = head(c ? c.label : 'Tocando agora') + `
    <div class="np-cover">${coverHTML(t, 'np')}</div>
    <div class="np-row"><div class="np-text"><div class="np-title" title="${esc(t.title)}">${esc(t.title)}</div><button class="link np-artist" data-act="nav" data-v="${enc({ name: 'artist', value: t.artist })}">${esc(t.artist)}</button></div>${likeBtn(t)}</div>
    <div class="q-card"><h3>Fila</h3>
      <div class="q-label">Tocando agora</div>${item(t.id, '', true)}
      ${user ? `<div class="q-label">Próximas na fila</div>${user}` : ''}
      ${ctx ? `<div class="q-label">A seguir: ${esc(c.label)}</div>${ctx}` : ''}
      ${!user && !ctx ? '<p class="q-none">Nada na fila depois desta música.</p>' : ''}
    </div>`;
}
function updatePlayerBar() {
  const t = byId.get(player.current);
  $('#pInfo').innerHTML = t
    ? `${coverHTML(t)}<div class="p-text"><button class="link p-title" data-act="goto-context" title="Ir para o que está tocando">${esc(t.title)}</button><button class="link p-artist" data-act="nav" data-v="${enc({ name: 'artist', value: t.artist })}">${esc(t.artist)}</button></div>${likeBtn(t)}`
    : '';
  if (!t) { setRange($('#seek'), 0); $('#tCur').textContent = '0:00'; $('#tDur').textContent = '0:00'; }
  updateControls();
}
function updateControls() {
  const s = state.settings;
  $$('[data-act="shuffle"]').forEach(b => { b.classList.toggle('on', s.shuffle); b.title = s.shuffle ? 'Desativar ordem aleatória' : 'Ativar ordem aleatória'; });
  const r = $('#btnRepeat');
  r.classList.toggle('on', s.repeat !== 'off');
  r.classList.toggle('one', s.repeat === 'one');
  r.title = { off: 'Ativar repetição', all: 'Repetir só esta música', one: 'Desativar repetição' }[s.repeat];
  const has = !!player.current;
  $('.player [data-act="prev"]').disabled = !has;
  $('.player [data-act="next"]').disabled = !has;
  $('.p-play').disabled = !state.tracks.length;
  $('#seek').disabled = !has;
}
function renderAll(reset = false) {
  renderSidebar();
  renderMain(reset);
  renderRight();
  updatePlayerBar();
}
function applyLayout() {
  $('#app').classList.toggle('no-right', !state.settings.showRight);
  $('#btnQueue').classList.toggle('on', state.settings.showRight);
}
function setRange(el, value) {
  el.value = value;
  el.style.setProperty('--p', `${((value - +el.min) / (+el.max - +el.min)) * 100}%`);
}

// ---------- navegação ----------
function navigate(v) {
  closeMenu();
  if (keyOf(v) === keyOf(view)) { if (v.name !== 'search') $('#main').scrollTop = 0; return; }
  nav.back.push(view);
  if (nav.back.length > 50) nav.back.shift();
  nav.fwd = [];
  setView(v);
}
function setView(v) {
  view = v;
  const s = $('#search');
  if (v.name === 'search') { if (s.value.trim() !== (v.q || '')) s.value = v.q || ''; }
  else s.value = '';
  renderSidebar();
  renderMain(true);
}
function goBack() { if (!nav.back.length) return; nav.fwd.push(view); setView(nav.back.pop()); }
function goFwd() { if (!nav.fwd.length) return; nav.back.push(view); setView(nav.fwd.pop()); }

// ---------- player ----------
const audio = new Audio();
audio.preload = 'auto';
const player = { context: null, pos: -1, upNext: [], current: null, url: null, token: 0 };
const duration = () => (Number.isFinite(audio.duration) ? audio.duration : byId.get(player.current)?.duration || 0);

function playList(L, index = null) {
  if (!L.ids.length) return;
  const original = [...L.ids];
  let start = index ?? (state.settings.shuffle ? Math.floor(Math.random() * original.length) : 0);
  let ids = original;
  if (state.settings.shuffle) {
    ids = [original[start], ...shuffled(original.filter((_, i) => i !== start))];
    start = 0;
  }
  player.context = { key: L.key, label: L.title, v: L.v, original, ids: [...ids] };
  player.pos = start;
  playId(ids[start]);
}
function playOrToggle(L) {
  if (player.context?.key === L.key && player.current) togglePlay();
  else playList(L);
}
async function playId(id) {
  if (!byId.has(id)) return;
  const token = ++player.token;
  const blob = await getAudio(id).catch(() => null);
  if (token !== player.token) return;
  if (!blob) { toast('Arquivo não encontrado. Remova a música e adicione de novo.'); return; }
  if (player.url) URL.revokeObjectURL(player.url);
  player.url = URL.createObjectURL(blob);
  player.current = id;
  audio.src = player.url;
  onTrackChange();
  try { await audio.play(); }
  catch (e) { if (e.name !== 'AbortError') toast('Não foi possível tocar este arquivo'); }
}
function togglePlay() {
  if (!player.current) {
    const playable = ['all', 'liked', 'playlist', 'artist', 'album', 'search', 'recent'].includes(view.name);
    const L = playable ? listFor(view) : listFor({ name: 'all' });
    playList(L.ids.length ? L : listFor({ name: 'all' }));
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}
function next(ended = false) {
  if (ended && state.settings.repeat === 'one') { audio.currentTime = 0; audio.play().catch(() => {}); return; }
  if (player.upNext.length) { playId(player.upNext.shift()); return; }
  const c = player.context;
  if (!c) return;
  let n = player.pos + 1;
  if (n >= c.ids.length) {
    if (state.settings.repeat === 'all' && c.ids.length) n = 0;
    else { if (ended) { audio.pause(); audio.currentTime = 0; } return; }
  }
  player.pos = n;
  playId(c.ids[n]);
}
function prev() {
  const c = player.context;
  if (audio.currentTime > 3 || !c || player.pos <= 0) { audio.currentTime = 0; return; }
  player.pos--;
  playId(c.ids[player.pos]);
}
function seekBy(sec) {
  if (!player.current) return;
  audio.currentTime = Math.max(0, Math.min(duration(), audio.currentTime + sec));
}
function toggleShuffle() {
  const s = state.settings;
  s.shuffle = !s.shuffle;
  const c = player.context;
  if (c) {
    const cur = c.ids[player.pos];
    if (s.shuffle) {
      const rest = shuffled(c.original.filter(id => id !== cur));
      c.ids = cur ? [cur, ...rest] : rest;
      player.pos = cur ? 0 : -1;
    } else {
      c.ids = [...c.original];
      player.pos = Math.max(-1, c.original.indexOf(cur));
    }
  }
  save();
  updateControls();
  renderRight();
}
function cycleRepeat() {
  const s = state.settings;
  s.repeat = { off: 'all', all: 'one', one: 'off' }[s.repeat];
  save();
  updateControls();
}
function addToQueue(ids) {
  if (!player.current) { playList({ key: 'queue', title: 'Fila', v: { name: 'all' }, ids: [...ids] }, 0); return; }
  player.upNext.push(...ids);
  renderRight();
  toast(ids.length === 1 ? 'Adicionada à fila' : `${ids.length} músicas adicionadas à fila`);
}
function jumpQueue(q) {
  const [kind, n] = q.split(':');
  const i = +n;
  if (kind === 'u') { const id = player.upNext[i]; player.upNext.splice(0, i + 1); playId(id); }
  else if (player.context) { player.pos = i; playId(player.context.ids[i]); }
}
function stopPlayback() {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  if (player.url) URL.revokeObjectURL(player.url);
  player.url = null;
  player.current = null;
  document.body.classList.remove('is-playing');
  onTrackChange();
}
function dropFromPlayer(set) {
  player.upNext = player.upNext.filter(id => !set.has(id));
  const c = player.context;
  if (c) {
    const kept = c.ids.slice(0, player.pos + 1).filter(id => !set.has(id)).length;
    c.ids = c.ids.filter(id => !set.has(id));
    c.original = c.original.filter(id => !set.has(id));
    player.pos = kept - 1;
  }
  if (set.has(player.current)) stopPlayback();
}
function onTrackChange() {
  const t = byId.get(player.current);
  document.title = t ? `${t.title} • ${t.artist}` : 'Ritmo';
  updatePlayerBar();
  renderSidebar();
  renderMain();
  renderRight();
  updateMediaSession();
}
function updateTime() {
  const d = duration();
  $('#tDur').textContent = fmt(d);
  if (seeking) return;
  setRange($('#seek'), d ? (audio.currentTime / d) * 1000 : 0);
  $('#tCur').textContent = fmt(audio.currentTime);
}
function applyVolume() {
  const s = state.settings;
  audio.volume = s.volume;
  audio.muted = s.muted;
  setRange($('#vol'), s.muted ? 0 : s.volume * 100);
  const b = $('#btnMute');
  b.innerHTML = s.muted || s.volume === 0 ? ICON.mute : s.volume < 0.5 ? ICON.volumeLow : ICON.volume;
  b.title = s.muted ? 'Ativar som' : 'Silenciar';
}
function toggleMute() {
  const s = state.settings;
  if (s.muted || s.volume === 0) { s.muted = false; if (s.volume === 0) s.volume = 0.5; }
  else s.muted = true;
  applyVolume();
  save();
}
function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const t = byId.get(player.current);
  navigator.mediaSession.metadata = t
    ? new MediaMetadata({ title: t.title, artist: t.artist, album: t.album === NO_ALBUM ? '' : t.album, artwork: coverUrls.has(t.id) ? [{ src: coverUrls.get(t.id), sizes: '400x400' }] : [] })
    : null;
}

let seeking = false;
audio.addEventListener('play', () => { document.body.classList.add('is-playing'); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'; });
audio.addEventListener('pause', () => { document.body.classList.remove('is-playing'); if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'; });
audio.addEventListener('ended', () => next(true));
audio.addEventListener('timeupdate', updateTime);
audio.addEventListener('loadedmetadata', () => {
  const t = byId.get(player.current);
  if (t && Number.isFinite(audio.duration) && Math.abs((t.duration || 0) - audio.duration) > 1) { t.duration = audio.duration; save(); }
  updateTime();
});
audio.addEventListener('error', () => {
  if (!audio.getAttribute('src')) return;
  toast('Erro ao tocar este arquivo. Pulando para a próxima.');
  setTimeout(() => next(), 800);
});
for (const [action, fn] of [['play', () => audio.play()], ['pause', () => audio.pause()], ['previoustrack', prev], ['nexttrack', () => next()], ['seekto', d => { audio.currentTime = d.seekTime; }]]) {
  try { navigator.mediaSession?.setActionHandler(action, fn); } catch { /* ação não suportada */ }
}

// ---------- biblioteca e playlists ----------
function toggleLike(id) {
  const t = byId.get(id);
  if (!t) return;
  t.liked = !t.liked;
  t.likedAt = t.liked ? Date.now() : 0;
  save();
  renderAll();
  toast(t.liked ? 'Salva em Músicas curtidas' : 'Removida das Músicas curtidas');
}
function setLiked(ids, liked) {
  const now = Date.now();
  // Mantém a ordem da tela em "Músicas curtidas" (a mais recente aparece primeiro).
  ids.forEach((id, k) => { const t = byId.get(id); if (t && t.liked !== liked) { t.liked = liked; t.likedAt = liked ? now - k : 0; } });
  save();
  renderAll();
  toast(liked ? `${plural(ids.length, 'música salva', 'músicas salvas')} em Músicas curtidas` : `${plural(ids.length, 'música removida', 'músicas removidas')} das Músicas curtidas`);
}
// Adiciona sem repetir; devolve quantas eram novas.
function addIdsToPlaylist(p, ids) {
  const have = new Set(p.trackIds);
  const fresh = [...new Set(ids)].filter(id => !have.has(id) && byId.has(id));
  p.trackIds.push(...fresh);
  return fresh.length;
}
function newPlaylist(name, ids = []) {
  const p = { id: uid(), name, trackIds: [], createdAt: Date.now() };
  addIdsToPlaylist(p, ids);
  state.playlists.push(p);
  save();
  navigate({ name: 'playlist', id: p.id });
  renderAll();
  if (ids.length) toast(`Playlist “${name}” criada com ${plural(p.trackIds.length, 'música', 'músicas')}`);
  return p;
}
async function createPlaylist(ids = []) {
  const name = await ask({
    title: 'Criar playlist',
    message: ids.length ? `${plural(ids.length, 'música vai', 'músicas vão')} para a nova playlist.` : '',
    value: `Minha playlist nº ${state.playlists.length + 1}`,
    ok: 'Criar',
  });
  if (name) newPlaylist(name, ids);
}
function addToPlaylist(pid, ids) {
  const p = state.playlists.find(x => x.id === pid);
  if (!p) return;
  const added = addIdsToPlaylist(p, ids);
  save();
  renderAll();
  const skipped = ids.length - added;
  if (!added) toast(ids.length === 1 ? 'Essa música já está na playlist' : 'Todas já estavam na playlist');
  else toast(`${plural(added, 'música adicionada', 'músicas adicionadas')} a “${p.name}”${skipped ? ` • ${skipped} já estavam lá` : ''}`);
}
function removeFromPlaylist(pid, ids) {
  const p = state.playlists.find(x => x.id === pid);
  if (!p) return;
  const drop = new Set(ids);
  p.trackIds = p.trackIds.filter(x => !drop.has(x));
  selection = new Set();
  save();
  renderAll();
  toast(`${plural(ids.length, 'música removida', 'músicas removidas')} de “${p.name}”`);
}
async function renamePlaylist(pid) {
  const p = state.playlists.find(x => x.id === pid);
  if (!p) return;
  const name = await ask({ title: 'Renomear playlist', value: p.name });
  if (!name) return;
  p.name = name;
  if (player.context?.key === `playlist:${pid}`) player.context.label = name;
  save();
  renderAll();
}
async function deletePlaylist(pid) {
  const p = state.playlists.find(x => x.id === pid);
  if (!p) return;
  const ok = await ask({ title: 'Excluir playlist?', message: `“${p.name}” será excluída. As músicas continuam na sua biblioteca.`, ok: 'Excluir', danger: true });
  if (!ok) return;
  state.playlists = state.playlists.filter(x => x.id !== pid);
  const gone = v => v.name === 'playlist' && v.id === pid;
  nav.back = nav.back.filter(v => !gone(v));
  nav.fwd = nav.fwd.filter(v => !gone(v));
  if (gone(view)) view = { name: 'home' };
  save();
  renderAll(true);
  toast('Playlist excluída');
}
async function confirmRemove(ids) {
  const first = byId.get(ids[0]);
  if (!first) return;
  const what = ids.length === 1 ? `“${first.title}” sai` : `${ids.length} músicas saem`;
  const ok = await ask({ title: 'Remover da biblioteca?', message: `${what} da biblioteca e de todas as playlists. Os arquivos originais no seu computador não são apagados.`, ok: 'Remover', danger: true });
  if (!ok) return;
  await removeTracks(ids);
  toast(ids.length === 1 ? 'Música removida da biblioteca' : `${ids.length} músicas removidas da biblioteca`);
}
async function removeTracks(ids) {
  const set = new Set(ids);
  for (const id of ids) selection.delete(id);
  dropFromPlayer(set);
  state.tracks = state.tracks.filter(t => !set.has(t.id));
  for (const p of state.playlists) p.trackIds = p.trackIds.filter(id => !set.has(id));
  for (const id of ids) {
    byId.delete(id);
    memFiles.delete(id);
    if (coverUrls.has(id)) URL.revokeObjectURL(coverUrls.get(id));
    coverUrls.delete(id);
  }
  renderAll();
  await persistNow();
  try {
    await tx('files', 'readwrite', s => ids.map(id => s.delete(id)));
    await tx('covers', 'readwrite', s => ids.map(id => s.delete(id)));
  } catch (e) { console.warn('Falha ao apagar do navegador', e); }
}

// ---------- menus, avisos e diálogos ----------
let menuItems = [];
function openMenu(x, y, items) {
  const m = $('#menu');
  menuItems = items;
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' :
    `<button role="menuitem" data-mi="${i}" class="${it.danger ? 'danger' : ''}"${it.disabled ? ' disabled' : ''}>${it.icon ? ICON[it.icon] : ''}<span>${esc(it.label)}</span>${it.sub ? '<b class="chev">›</b>' : ''}</button>`).join('');
  m.hidden = false;
  m.style.left = '0px';
  m.style.top = '0px';
  const r = m.getBoundingClientRect();
  m.style.left = `${Math.max(8, Math.min(x, innerWidth - r.width - 8))}px`;
  m.style.top = `${Math.max(8, Math.min(y, innerHeight - r.height - 8))}px`;
  m.dataset.x = x;
  m.dataset.y = y;
}
function closeMenu() { $('#menu').hidden = true; menuItems = []; }
// Submenu "Adicionar à playlist" para uma ou várias músicas.
function playlistSubmenu(ids, exceptPid = null) {
  const lists = state.playlists.filter(p => p.id !== exceptPid);
  return [
    { label: 'Nova playlist', icon: 'plus', run: () => createPlaylist(ids) },
    ...(lists.length ? ['-'] : []),
    ...lists.map(p => ({ label: p.name, disabled: ids.every(id => p.trackIds.includes(id)), run: () => addToPlaylist(p.id, ids) })),
  ];
}
// Menu de música(s): `ids` pode ter uma música ou a seleção inteira.
function trackMenuItems(ids) {
  const t = byId.get(ids[0]);
  if (!t) return [];
  const many = ids.length > 1;
  const allLiked = ids.every(id => byId.get(id)?.liked);
  const items = [];
  if (many) items.push({ label: `${ids.length} músicas selecionadas`, disabled: true }, '-');
  items.push(
    { label: 'Adicionar à fila', icon: 'queue', run: () => addToQueue(ids) },
    { label: 'Adicionar à playlist', icon: 'playlist', sub: () => playlistSubmenu(ids) },
    { label: allLiked ? 'Remover das Músicas curtidas' : 'Salvar em Músicas curtidas', icon: allLiked ? 'heartFill' : 'heart', run: () => setLiked(ids, !allLiked) },
  );
  if (!many) {
    items.push('-', { label: 'Ir para o artista', icon: 'user', run: () => navigate({ name: 'artist', value: t.artist }) });
    if (t.album !== NO_ALBUM) items.push({ label: 'Ir para o álbum', icon: 'disc', run: () => navigate({ name: 'album', value: t.album }) });
  }
  if (view.name === 'playlist') items.push('-', { label: 'Remover desta playlist', icon: 'minus', run: () => removeFromPlaylist(view.id, ids) });
  items.push('-', { label: 'Remover da biblioteca', icon: 'trash', danger: true, run: () => confirmRemove(ids) });
  return items;
}
// Menu "⋯" de uma lista inteira (álbum, artista, busca, playlist, todas as músicas…).
function collectionMenuItems(v) {
  const L = listFor(v);
  const items = [];
  if (L.ids.length) {
    items.push(
      { label: 'Adicionar tudo à playlist', icon: 'playlist', sub: () => playlistSubmenu(L.ids, v.name === 'playlist' ? v.id : null) },
      { label: 'Adicionar tudo à fila', icon: 'queue', run: () => addToQueue(L.ids) },
      { label: 'Selecionar todas (Ctrl+A)', icon: 'check', run: selectAll },
    );
  }
  if (v.name === 'playlist') {
    if (items.length) items.push('-');
    items.push(
      { label: 'Adicionar músicas do computador', icon: 'upload', run: () => pickInto(v.id, '#filePick') },
      { label: 'Adicionar uma pasta', icon: 'folder', run: () => pickInto(v.id, '#folderPick') },
      { label: 'Renomear', icon: 'edit', run: () => renamePlaylist(v.id) },
      '-',
      { label: 'Excluir playlist', icon: 'trash', danger: true, run: () => deletePlaylist(v.id) },
    );
  }
  return items;
}
function playlistMenuItems(pid) {
  return [
    { label: 'Tocar', icon: 'play', run: () => playList(listFor({ name: 'playlist', id: pid })) },
    { label: 'Adicionar músicas do computador', icon: 'upload', run: () => pickInto(pid, '#filePick') },
    { label: 'Renomear', icon: 'edit', run: () => renamePlaylist(pid) },
    '-',
    { label: 'Excluir playlist', icon: 'trash', danger: true, run: () => deletePlaylist(pid) },
  ];
}
// Abre o seletor de arquivos e manda o que for escolhido direto para a playlist.
let importTarget = null;
function pickInto(pid, inputSel) {
  importTarget = pid;
  $(inputSel).click();
}
function addMenuItems() {
  return [
    { label: 'Criar playlist', icon: 'playlist', run: () => createPlaylist() },
    '-',
    { label: 'Adicionar músicas', icon: 'upload', run: () => $('#filePick').click() },
    { label: 'Adicionar pasta', icon: 'folder', run: () => $('#folderPick').click() },
    { label: 'Baixar de um link (YouTube)', icon: 'download', run: () => navigate({ name: 'download' }) },
    '-',
    { label: 'Carregar músicas de demonstração', icon: 'sparkle', run: loadDemo },
  ];
}
let toastTimer = 0;
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
function ask({ title, message = '', value = null, ok = 'Salvar', danger = false }) {
  return new Promise(resolve => {
    const d = $('#dlg'), input = $('#dlgInput'), okBtn = $('#dlgOk');
    $('#dlgTitle').textContent = title;
    $('#dlgMsg').textContent = message;
    $('#dlgMsg').hidden = !message;
    input.hidden = value === null;
    input.value = value ?? '';
    okBtn.textContent = ok;
    okBtn.className = `btn ${danger ? 'danger' : 'primary'}`;
    const form = $('form', d);
    let done = false;
    // Responde direto ao clique/Enter/Esc, sem depender só do evento "close" do diálogo.
    const finish = confirmed => {
      if (done) return;
      done = true;
      form.removeEventListener('submit', onSubmit);
      d.removeEventListener('keydown', onKey);
      d.removeEventListener('close', onClose);
      if (d.open) d.close();
      resolve(!confirmed ? null : value === null ? true : input.value.trim() || null);
    };
    const onSubmit = e => { e.preventDefault(); finish((e.submitter?.value ?? 'ok') === 'ok'); };
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); finish(false); } };
    const onClose = () => finish(d.returnValue === 'ok');
    form.addEventListener('submit', onSubmit);
    d.addEventListener('keydown', onKey);
    d.addEventListener('close', onClose);
    d.returnValue = '';
    d.showModal();
    if (value !== null) input.select();
    else if (danger) $('#dlgCancel').focus();
  });
}

// ---------- eventos ----------
const LIST_VIEWS = ['all', 'liked', 'playlist', 'artist', 'album', 'search', 'recent'];
function playRow(row) {
  const L = listFor(view);
  const i = +row.dataset.i;
  if (player.current === L.ids[i]) togglePlay();
  else playList(L, i);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn && e.detail) btn.blur(); // libera o espaço para tocar/pausar depois de um clique
  const el = e.target.closest('[data-act]');
  if (!el) {
    const row = e.target.closest('.row[data-id]');
    if (row) clickRow(row, e);
    else if (e.target.closest('#main') && !e.target.closest('.selbar')) clearSelection();
    return;
  }
  const { act, id } = el.dataset;
  const v = el.dataset.v ? dec(el.dataset.v) : null;
  const rect = () => el.getBoundingClientRect();
  switch (act) {
    case 'nav': navigate(v); break;
    case 'home': navigate({ name: 'home' }); break;
    case 'back': goBack(); break;
    case 'fwd': goFwd(); break;
    case 'play-coll': playOrToggle(listFor(v)); break;
    case 'play-row': playRow(el.closest('.row')); break;
    case 'play-track': {
      if (player.current === id) togglePlay();
      else { const L = listFor(v); playList(L, Math.max(0, L.ids.indexOf(id))); }
      break;
    }
    case 'play': togglePlay(); break;
    case 'next': next(); break;
    case 'prev': prev(); break;
    case 'shuffle': toggleShuffle(); break;
    case 'repeat': cycleRepeat(); break;
    case 'mute': toggleMute(); break;
    case 'like': toggleLike(id); break;
    case 'more': { const r = rect(); openMenu(r.right - 230, r.bottom + 4, trackMenuItems(targetIds(id))); break; }
    case 'playlist-menu': { const r = rect(); openMenu(r.left, r.bottom + 4, playlistMenuItems(el.dataset.pid)); break; }
    case 'coll-menu': { const r = rect(); openMenu(r.left, r.bottom + 4, collectionMenuItems(v)); break; }
    case 'sel-playlist': { const r = rect(); openMenu(r.left, r.top - 8 - Math.min(320, 44 * (state.playlists.length + 2)), playlistSubmenu(selectedIds())); break; }
    case 'sel-queue': addToQueue(selectedIds()); break;
    case 'sel-more': { const r = rect(); openMenu(r.left, r.top - 300, trackMenuItems(selectedIds())); break; }
    case 'sel-clear': clearSelection(); break;
    case 'pick-into-playlist': pickInto(id, '#filePick'); break;
    case 'library-add': { const r = rect(); openMenu(r.left, r.bottom + 4, addMenuItems()); break; }
    case 'rename': renamePlaylist(id); break;
    case 'jump': jumpQueue(el.dataset.q); break;
    case 'goto-context': if (player.context) navigate(player.context.v); break;
    case 'toggle-right': state.settings.showRight = !state.settings.showRight; applyLayout(); save(); break;
    case 'pick-files': $('#filePick').click(); break;
    case 'pick-folder': $('#folderPick').click(); break;
    case 'demo': loadDemo(); break;
    case 'nav-download': navigate({ name: 'download' }); setTimeout(() => $('#dlUrl')?.focus(), 0); break;
    case 'dl-format': {
      state.settings.dlFormat = el.dataset.f;
      save();
      $$('[data-act="dl-format"]').forEach(b => { const on = b.dataset.f === el.dataset.f; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
      $('#dlHint').textContent = DL_FORMATS[el.dataset.f].hint;
      break;
    }
    case 'dl-cancel': {
      const job = downloads.find(j => j.id === id);
      if (job) { job.status = 'canceled'; dlApi?.cancel(id); renderDlList(); }
      break;
    }
    case 'dl-retry': {
      const job = downloads.find(j => j.id === id);
      if (job) { Object.assign(job, { status: 'queued', percent: 0, error: '' }); renderDlList(); runDownloads(); }
      break;
    }
    case 'dl-open-folder': dlApi?.openFolder(); break;
    case 'brand-menu': { const r = rect(); openMenu(r.right - 240, r.bottom + 4, brandMenuItems()); break; }
    case 'update-install': persistNow().finally(() => dlApi?.installUpdate()); break;
    case 'update-later': $('#updateCard').hidden = true; break;
  }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'dlForm') return;
  e.preventDefault();
  enqueueDownload($('#dlUrl').value);
  $('#dlUrl').value = '';
});
document.addEventListener('dblclick', e => {
  if (e.target.closest('button')) return;
  const row = e.target.closest('.row[data-id]');
  if (row) { playRow(row); return; }
  const item = e.target.closest('.lib-item');
  if (item) playOrToggle(listFor(dec(item.dataset.v)));
});
document.addEventListener('contextmenu', e => {
  const row = e.target.closest('.row[data-id]');
  if (row) { e.preventDefault(); openMenu(e.clientX, e.clientY, trackMenuItems(targetIds(row.dataset.id))); return; }
  const pl = e.target.closest('[data-pid]');
  if (pl) { e.preventDefault(); openMenu(e.clientX, e.clientY, playlistMenuItems(pl.dataset.pid)); }
});
$('#menu').addEventListener('click', e => {
  const b = e.target.closest('[data-mi]');
  if (!b) return;
  e.stopPropagation();
  const it = menuItems[+b.dataset.mi];
  if (it.sub) { const m = $('#menu'); openMenu(+m.dataset.x, +m.dataset.y, it.sub()); return; }
  closeMenu();
  it.run?.();
});
document.addEventListener('mousedown', e => { if (!$('#menu').hidden && !e.target.closest('#menu')) closeMenu(); }, true);
$('#main').addEventListener('scroll', closeMenu, { passive: true });
window.addEventListener('resize', closeMenu);

document.addEventListener('keydown', e => {
  if ($('#dlg').open) return;
  const target = e.target instanceof Element ? e.target : document.body;
  if ((e.key === 'Enter' || e.key === ' ') && target.matches('[role="button"][data-act]')) { e.preventDefault(); target.click(); return; }
  if (e.key === 'Escape') {
    if (!$('#menu').hidden) closeMenu(); else clearSelection();
    if (target === $('#search')) target.blur();
    return;
  }
  if (target.closest('input, textarea, [contenteditable="true"]')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && LIST_VIEWS.includes(view.name)) { e.preventDefault(); selectAll(); return; }
  if (e.code === 'Space' && !target.closest('button')) { e.preventDefault(); togglePlay(); }
  else if (e.key === 'ArrowRight' && e.altKey) { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft' && e.altKey) { e.preventDefault(); prev(); }
  else if (e.key === 'ArrowRight') seekBy(5);
  else if (e.key === 'ArrowLeft') seekBy(-5);
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#search').focus(); openSearch(); }
});

const searchEl = $('#search');
searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim();
  if (view.name === 'search') { view = { name: 'search', q }; renderMain(true); }
  else navigate({ name: 'search', q });
});
const openSearch = () => { if (view.name !== 'search') navigate({ name: 'search', q: searchEl.value.trim() }); };
searchEl.addEventListener('click', openSearch);

const seekEl = $('#seek');
seekEl.addEventListener('input', () => {
  seeking = true;
  setRange(seekEl, +seekEl.value);
  $('#tCur').textContent = fmt((seekEl.value / 1000) * duration());
});
seekEl.addEventListener('change', () => {
  const d = duration();
  if (d && player.current) audio.currentTime = (seekEl.value / 1000) * d;
  seeking = false;
});
const volEl = $('#vol');
volEl.addEventListener('input', () => {
  state.settings.volume = volEl.value / 100;
  state.settings.muted = false;
  applyVolume();
  save();
});

for (const id of ['#filePick', '#folderPick']) {
  $(id).addEventListener('change', e => {
    const files = [...e.target.files];
    const folderName = files[0]?.webkitRelativePath.split('/')[0] || '';
    importFiles(files, { playlistId: importTarget, folderName });
    importTarget = null;
    e.target.value = '';
  });
  $(id).addEventListener('cancel', () => { importTarget = null; });
}
let dragDepth = 0;
const hasFiles = e => [...(e.dataTransfer?.types || [])].includes('Files');
window.addEventListener('dragenter', e => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth++; $('#drop').hidden = false; });
window.addEventListener('dragover', e => { if (hasFiles(e)) e.preventDefault(); });
window.addEventListener('dragleave', e => { if (!hasFiles(e)) return; if (--dragDepth <= 0) { dragDepth = 0; $('#drop').hidden = true; } });
window.addEventListener('drop', async e => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  $('#drop').hidden = true;
  // Soltar arquivos com uma playlist aberta coloca as músicas nela.
  const playlistId = view.name === 'playlist' ? view.id : null;
  const { files, folderName } = await filesFromDrop(e.dataTransfer);
  importFiles(files, { playlistId, folderName, sorted: true });
});

// ---------- inicialização ----------
async function boot() {
  if (/Electron/.test(navigator.userAgent)) document.body.classList.add('desktop');
  $$('[data-icon]').forEach(el => { el.innerHTML = ICON[el.dataset.icon]; });
  try { db = await openDB(); } catch { db = null; }
  if (db) {
    try {
      const saved = await tx('meta', 'readonly', s => s.get('state'));
      if (saved) {
        state.tracks = saved.tracks || [];
        state.playlists = saved.playlists || [];
        Object.assign(state.settings, saved.settings || {});
      }
      const [keys, blobs] = await tx('covers', 'readonly', s => [s.getAllKeys(), s.getAll()]);
      keys.forEach((k, i) => coverUrls.set(k, URL.createObjectURL(blobs[i])));
    } catch (e) { console.warn('Falha ao carregar a biblioteca', e); }
    navigator.storage?.persist?.().catch(() => {});
  }
  for (const t of state.tracks) byId.set(t.id, t);
  applyVolume();
  applyLayout();
  renderAll(true);
  if (!db) toast('O navegador bloqueou o armazenamento local: a biblioteca não será salva ao fechar.', 6000);
}
boot();
