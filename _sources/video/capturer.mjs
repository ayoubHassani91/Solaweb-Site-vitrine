// Capture la vidéo de fond image par image avec Chrome sans fenêtre (aucune dépendance : Node 22+).
// Usage :
//   node capturer.mjs images <dossier-sortie> [ips=25]      -> toutes les images de la boucle (JPEG)
//   node capturer.mjs cles <dossier-sortie> 2 6 11.5 ...    -> quelques instants choisis (PNG), pour vérifier
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const [mode, sortie, ...reste] = process.argv.slice(2);
if (!mode || !sortie) { console.error('usage : node capturer.mjs images|cles <dossier> ...'); process.exit(1); }
fs.mkdirSync(sortie, { recursive: true });

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT_WEB = 8770, PORT_DEBUG = 9333, DUREE = 20;
const TYPES = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2' };

// petit serveur local pour la page d'animation et ses polices
const serveur = http.createServer((req, res) => {
  const f = path.join(ICI, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ICI) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT_WEB, '127.0.0.1');

const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'solaweb-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT_DEBUG}`, `--user-data-dir=${profil}`, '--no-first-run', '--hide-scrollbars', '--window-size=1920,1080', 'about:blank'], { stdio: 'ignore' });

const attendre = ms => new Promise(r => setTimeout(r, ms));
async function cible() {
  for (let i = 0; i < 50; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${PORT_DEBUG}/json/list`)).json(); const p = l.find(x => x.type === 'page'); if (p) return p.webSocketDebuggerUrl; } catch {}
    await attendre(200);
  }
  throw new Error('Chrome ne répond pas');
}

let id = 0; const enAttente = new Map();
const ws = new WebSocket(await cible());
await new Promise(r => ws.addEventListener('open', r, { once: true }));
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && enAttente.has(m.id)) { enAttente.get(m.id)(m); enAttente.delete(m.id); } });
const envoyer = (method, params = {}) => new Promise(r => { const n = ++id; enAttente.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const evaluer = async expr => { const r = await envoyer('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails)); return r.result.result.value; };

try {
  await envoyer('Page.navigate', { url: `http://127.0.0.1:${PORT_WEB}/animation.html?capture` });
  for (let i = 0; i < 100 && !(await evaluer('window.PRET === true').catch(() => false)); i++) await attendre(100);
  const image = async (t, type, fichier) => {
    const url = await evaluer(`dessiner(${t}); document.getElementById('c').toDataURL('${type}', 0.95)`);
    fs.writeFileSync(path.join(sortie, fichier), Buffer.from(url.split(',')[1], 'base64'));
  };
  if (mode === 'cles') {
    for (const t of reste) await image(Number(t), 'image/png', `cle-${String(t).replace('.', '_')}.png`);
  } else {
    const ips = Number(reste[0] || 25), n = DUREE * ips;
    for (let i = 0; i < n; i++) {
      await image(i / ips, 'image/jpeg', `img-${String(i).padStart(4, '0')}.jpg`);
      if (i % 50 === 0) console.log(`image ${i} / ${n}`);
    }
  }
  console.log('terminé');
} finally {
  ws.close(); chrome.kill(); serveur.close();
}
