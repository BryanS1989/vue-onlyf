// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    contextBridge.exposeInMainWorld('actions', {
        setUrl: (url) => ipcRenderer.send('actions:setUrl', url),
        toggle: (url) => ipcRenderer.send('actions:toggle', url),
        scrollDown: (timeToScroll) =>
            ipcRenderer.invoke('actions:scrollDown', timeToScroll),
        selectElement: () => ipcRenderer.send('actions:selectElement'),
        onClickedElement: (callback) =>
            ipcRenderer.on('clicked-element', callback),
    });
});
