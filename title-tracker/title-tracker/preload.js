const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onTitle: (cb) => ipcRenderer.on('title', (_e, t) => cb(t)),
  onState: (cb) => ipcRenderer.on('state', (_e, s) => cb(s)),
  setUrl: (u) => ipcRenderer.send('set-url', u),
  toggleLock: () => ipcRenderer.send('toggle-lock'),
  quit: () => ipcRenderer.send('quit')
});
