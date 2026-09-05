const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { setupAutoUpdater } = require("./updater.cjs");

const isDev = !app.isPackaged;
let win;

function resolveIcon() {
  const candidates = [
    path.join(__dirname, "..", "build", "icon.ico"),
    path.join(__dirname, "..", "build", "icon.png"),
  ];
  return candidates.find((file) => fs.existsSync(file));
}

function createWindow() {
  win = new BrowserWindow({
    width: 440,
    height: 760,
    minWidth: 360,
    minHeight: 240,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    autoHideMenuBar: true,
    backgroundColor: "#00000000",
    icon: resolveIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) {
    win.loadURL("http://127.0.0.1:5173");
    return;
  }

  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

function showWindow() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", showWindow);

  app.whenReady().then(() => {
    createWindow();
    setupAutoUpdater({ app, ipcMain, getWindow: () => win });
    globalShortcut.register("CommandOrControl+Shift+T", () => {
      win?.webContents.send("tactidesk:toggle");
    });
  });
}

app.on("window-all-closed", () => app.quit());
app.on("will-quit", () => globalShortcut.unregisterAll());

ipcMain.handle("tactidesk:alwaysOnTop", () => {
  if (!win) return false;
  const next = !win.isAlwaysOnTop();
  win.setAlwaysOnTop(next, "screen-saver");
  return next;
});

ipcMain.handle("tactidesk:ignoreMouse", (_event, ignore) => {
  win?.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
});
