const { app, BrowserWindow, nativeImage } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const Store = require('electron-store');

Store.initRenderer();

let mainWindow;

function createWindow() {
  app.allowRendererProcessReuse = false;
  mainWindow = new BrowserWindow({
    minWidth: 960,
    minHeight: 660,
    width: 1024,
    height: 680,
    frame: false,
    titleBarStyle: 'hiddenInset',
    icon: nativeImage.createFromPath(path.join(__dirname, "/src/assets/images/logo.png")),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:4000"
      : `file://${path.join(__dirname, "/build/index.html")}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
