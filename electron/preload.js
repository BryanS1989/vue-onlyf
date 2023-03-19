// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    contextBridge.exposeInMainWorld('actions', {
        setUrl: (url) => ipcRenderer.send('actions:setUrl', url),
        toggle: (url) => ipcRenderer.send('actions:toggle', url),
        scrollDown: () => ipcRenderer.invoke('actions:scrollDown'),
    });
});
