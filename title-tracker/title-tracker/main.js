const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const W = 320, H = 28, MX = 10, MY = 10;
let overlay = null;
let watcher = null;
let cfg = { url: '', locked: true };
let lastTitle = '';

const cfgPath = () => path.join(app.getPath('userData'), 'config.json');

function loadCfg() {
  try {
    cfg = { url: '', locked: true, ...JSON.parse(fs.readFileSync(cfgPath(), 'utf8')) };
  } catch (_) { /* primo avvio */ }
}
function saveCfg() {
  try { fs.writeFileSync(cfgPath(), JSON.stringify(cfg)); } catch (_) {}
}

function normalize(u) {
  u = (u || '').trim();
  if (u && !/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = 'https://' + u;
  return u;
}

function snap() {
  if (!overlay || overlay.isDestroyed()) return;
  const wa = screen.getPrimaryDisplay().workArea;
  overlay.setBounds({ x: wa.x + MX, y: wa.y + wa.height - H - MY, width: W, height: H });
}

function pushState() {
  if (!overlay || overlay.isDestroyed()) return;
  overlay.setMovable(!cfg.locked);
  overlay.webContents.send('state', { locked: cfg.locked, url: cfg.url });
}

function sendTitle(t, force) {
  if (!t || (t === lastTitle && !force)) return;
  lastTitle = t;
  if (overlay && !overlay.isDestroyed()) overlay.webContents.send('title', t);
}

function startWatching(url) {
  if (!watcher) {
    watcher = new BrowserWindow({
      show: false, width: 1280, height: 800,
      webPreferences: {
        backgroundThrottling: false,      // i timer JS della pagina non rallentano
        partition: 'persist:watcher',     // mantiene eventuali login tra un avvio e l'altro
        contextIsolation: true, nodeIntegration: false, sandbox: true
      }
    });
    const wc = watcher.webContents;
    wc.setAudioMuted(true);
    // user agent "da Chrome normale" (senza i token di Electron/app)
    wc.setUserAgent(
      wc.getUserAgent()
        .replace(/\s*Electron\/\S+/i, '')
        .replace(/\s+[\w.-]+\/[\d.]+(?=\s+Chrome\/)/, '')
    );
    wc.on('page-title-updated', (_e, title) => sendTitle(title));
    wc.on('did-finish-load', () => sendTitle(wc.getTitle()));
    wc.on('did-fail-load', (_e, code, _d, _u, isMainFrame) => {
      if (isMainFrame && code !== -3) sendTitle('Pagina non raggiungibile', true);
    });
    // rete di sicurezza: rilegge il titolo ogni secondo
    setInterval(() => {
      if (watcher && !watcher.isDestroyed()) sendTitle(watcher.webContents.getTitle());
    }, 1000);
  }
  sendTitle('Caricamento…', true);
  watcher.loadURL(url).catch(() => {});
}

function createOverlay() {
  overlay = new BrowserWindow({
    width: W, height: H, useContentSize: true,
    frame: false, resizable: false, minimizable: false, maximizable: false,
    fullscreenable: false, skipTaskbar: true, hasShadow: false, show: false,
    alwaysOnTop: true, backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false
    }
  });
  overlay.setAlwaysOnTop(true, 'screen-saver');
  try { overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); } catch (_) {}
  snap();
  overlay.loadFile('index.html');
  overlay.once('ready-to-show', () => overlay.show());
  overlay.webContents.on('did-finish-load', () => {
    pushState();
    if (cfg.url) startWatching(cfg.url);
  });
  overlay.on('closed', () => app.quit());
}

ipcMain.on('set-url', (_e, u) => {
  cfg.url = normalize(u);
  saveCfg();
  if (cfg.url) startWatching(cfg.url);
  pushState();
});
ipcMain.on('toggle-lock', () => {
  cfg.locked = !cfg.locked;
  saveCfg();
  if (cfg.locked) snap();
  pushState();
});
ipcMain.on('quit', () => app.quit());

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    loadCfg();
    if (process.platform === 'darwin' && app.dock) app.dock.hide();
    createOverlay();
    screen.on('display-metrics-changed', () => { if (cfg.locked) snap(); });
  });
  app.on('window-all-closed', () => app.quit());
}
