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
        width: 375,
        height: 375,
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

    ipcMain.on('actions:setUrl', (event, url) => {
        app.currentChildWindowURL = url;

        if (app.childWindow === undefined || app.childWindow.isDestroyed()) {
            createPageWindow(app.mainWindow, app.currentChildWindowURL);
        }

        app.childWindow.loadURL(url);
    });

    ipcMain.on('actions:toggle', (event, url) => {
        if (app.childWindow === undefined || app.childWindow.isDestroyed()) {
            createPageWindow(app.mainWindow, app.currentChildWindowURL);
        }

        app.childWindow.show(!app.childWindow.isVisible);
    });

    ipcMain.handle('actions:scrollDown', () => {
        app.childWindow.webContents.executeJavaScript(`
            let height = 0;
            let documentHeight = document.querySelector("body").scrollHeight;

            const intervalCheck = setInterval(() => {
                documentHeight = document.querySelector("body").scrollHeight;
                if (height === documentHeight) {
                    clearInterval(intervalScroll);
                    clearInterval(intervalCheck);
                } else {
                    height = document.querySelector("body").scrollHeight
                }
            }, 3000);

            const intervalScroll = setInterval(() => {
                window.scrollTo(0, documentHeight);
            }, 500);
        `);
    });

    ipcMain.on('actionsChild:setClickedElement', (event, target) => {
        console.log(target);
    });
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
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
