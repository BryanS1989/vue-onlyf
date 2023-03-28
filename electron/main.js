// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const IS_DEV = process.env.IS_DEV === 'true' ? true : false;

const createWindow = () => {
    // Create the browser window.
    app.mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: 768,
        height: 1080,
        center: false,
        alwaysOnTop: false,
        roundedCorners: true,
        icon: path.join(__dirname, '../public/favicon.ico'),
        darkTheme: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
        },
    });

    // and load the index.html of the app.
    // mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    app.mainWindow.loadURL(
        IS_DEV
            ? 'http://localhost:5173/'
            : `file://${path.join(__dirname, '../dist/index.html')}`
    );

    // Open the DevTools.
    if (IS_DEV) {
        app.mainWindow.webContents.openDevTools();
    }

    app.currentChildWindowURL = 'https://www.google.es';
};

const createPageWindow = (mainWindow, url) => {
    app.childWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        center: true,
        fullscreen: false,
        // parent: mainWindow,
        // modal: true,
        icon: path.join(__dirname, '../public/favicon.ico'),
        darkTheme: true,
        closable: true,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, './childPreload.js'),
        },
    });

    app.childWindow.loadURL(url);

    // Open the DevTools.
    if (IS_DEV) {
        app.childWindow.webContents.openDevTools();
    }

    app.currentChildWindowURL = url;

    // Detect URL changes
    app.childWindow.webContents.on('did-navigate', (event, url) => {
        app.currentChildWindowURL = url;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    /**
     * Called from main BrowserWindow.
     * Set the selected URL to child browserWindow
     */
    ipcMain.on('actions:setUrl', (event, url) => {
        app.currentChildWindowURL = url;

        if (app.childWindow === undefined || app.childWindow.isDestroyed()) {
            createPageWindow(app.mainWindow, app.currentChildWindowURL);
        }

        app.childWindow.loadURL(url);
    });

    /**
     * Called from main BrowserWindow.
     * Show the child browserWindow
     */
    ipcMain.on('actions:toggle', (event, url) => {
        if (app.childWindow === undefined || app.childWindow.isDestroyed()) {
            createPageWindow(app.mainWindow, app.currentChildWindowURL);
        }

        app.childWindow.show(!app.childWindow.isVisible);
    });

    /**
     * Called from main BrowserWindow.
     * Scroll down the child browserWindow the amount of time selected by user
     */
    ipcMain.handle('actions:scrollDown', async (event, timeToScroll) => {
        let response = await app.childWindow.webContents.executeJavaScript(
            `
                var intervalScroll = setInterval(() => {
                    window.scrollTo(0, document.querySelector("body").scrollHeight);
                }, 1000);

                setTimeout(() => {
                    console.log("STOP SCROLL!!!", intervalScroll);
                    clearInterval(intervalScroll);
                }, ${timeToScroll})
            `
        );

        return response;
    });

    /**
     * Called from main BrowserWindow.
     * Count elements on child browserWindow by a selector
     */
    ipcMain.handle('actions:countElements', async (event, selector) => {
        console.log('[actions:countElements] selector: ' + selector);
        let response = await app.childWindow.webContents.executeJavaScript(
            `
                countElements("${selector}");
            `
        );

        return response;
    });

    /**
     * Called from main BrowserWindow.
     * Make click event on child BrowserWindow to not propagate,
     * and send the selected element non child BrowserWindow to MainWindow
     */
    ipcMain.on('actions:selectElement', (event, url) => {
        app.childWindow.webContents.executeJavaScript(
            `
                function preventAll() {
                    event.stopPropagation();
                    event.preventDefault();
                    window.actionsChild.sendClickedElement();
                }
            `
        );
    });

    /**
     * Called from Child BrowserWindow.
     * Save all clicked elements at child BrowserWindow
     */
    ipcMain.on('actionsChild:setClickedElement', (event, target) => {
        app.selectedElement = target;
    });

    /**
     * Called from Child BrowserWindow.
     * Send to Main BrowserWindow the selected element on ChildWindow
     * Let the click event continue at Child BrowserWindow
     */
    ipcMain.on('actionsChild:sendClickedElement', (event) => {
        app.mainWindow.webContents.send('clicked-element', app.selectedElement);

        app.childWindow.webContents.executeJavaScript(
            `
                function preventAll() {
                }
            `
        );
    });

    /**
     * Send to main Browsert the number of occurrences of the selected element
     */
    ipcMain.on('actionsChild:sendCountedElement', (event, target) => {
        app.mainWindow.webContents.send('counted-element', target);
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
