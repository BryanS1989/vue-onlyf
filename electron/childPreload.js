const { contextBridge, ipcRenderer } = require('electron');

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    contextBridge.exposeInMainWorld('actionsChild', {
        setClickedElement: (target) =>
            ipcRenderer.send('actionsChild:setClickedElement', target),
        sendClickedElement: () =>
            ipcRenderer.send('actionsChild:sendClickedElement'),
    });

    var body = document.querySelector('body');
    var script = document.createElement('script');
    script.innerText =
        'function preventAll() {' +
        '}' +
        "document.addEventListener('click', (event) => {" +
        '    var eventData = {' +
        '      tagName: event.target.tagName,' +
        '      id: event.target.id,' +
        '      className: event.target.className,' +
        '      innerHTML: event.target.innerHTML,' +
        '      innerText: event.target.innerText,' +
        '      localName: event.target.localName,' +
        '      nodeName: event.target.nodeName,' +
        '      outerHTML: event.target.outerHTML,' +
        '      outerText: event.target.outerText,' +
        '      textContent: event.target.textContent,' +
        '    };' +
        '    console.log(event);window.actionsChild.setClickedElement({...eventData});' +
        '    preventAll();' +
        '}, true);';
    body.appendChild(script);
});
