// Rendu image par image de motion.html via Chrome sans interface (protocole DevTools, sans dépendance).
// Usage : node render.mjs <dossier_images> [fps=30] [liste de temps en secondes pour un test, ex. 2,7.5,14]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const out = process.argv[2];
const fps = Number(process.argv[3] || 30);
const only = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
mkdirSync(out, { recursive: true });

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const port = 9333 + Math.floor(Math.random() * 500);
const prof = path.join(out, '..', 'chrome-profile');
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--mute-audio', '--force-device-scale-factor=1', '--window-size=1920,1080', '--disable-gpu-vsync', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 60 && !target; i++) {
  try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); target = l.find((x) => x.type === 'page'); } catch { await sleep(250); }
}
if (!target) { console.error('Chrome injoignable'); proc.kill(); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const waiters = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  else if (m.method) waiters.filter((w) => w.method === m.method).forEach((w) => { waiters.splice(waiters.indexOf(w), 1); w.res(m.params); });
});
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const once = (method) => new Promise((res) => waiters.push({ method, res }));
const evalJs = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'erreur JS'); return r.result.value; };

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
const url = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'motion.html')).href + '?render';
const loaded = once('Page.loadEventFired');
await send('Page.navigate', { url });
await loaded;
await evalJs('document.fonts.ready.then(() => document.fonts.size)');
await sleep(400);
const dur = await evalJs('window.DURATION');
const times = only || Array.from({ length: Math.round(dur * fps) }, (_, f) => f / fps);
const t0 = Date.now();
for (let f = 0; f < times.length; f++) {
  await evalJs(`seek(${times[f]})`);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 93, captureBeyondViewport: false });
  writeFileSync(path.join(out, only ? `test_${String(times[f]).replace('.', '_')}.jpg` : `f_${String(f).padStart(5, '0')}.jpg`), Buffer.from(shot.data, 'base64'));
  if (f % 90 === 0) console.log(`image ${f}/${times.length} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
console.log(`terminé : ${times.length} images en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
ws.close(); proc.kill();
process.exit(0);
