const { autoUpdater } = require("electron-updater");

const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

function isMissingRelease(error) {
  const text = error instanceof Error ? error.message : String(error ?? "");
  const status = error && typeof error === "object" ? String(error.statusCode || "") : "";
  return /404|not found|cannot find channel/i.test(`${status} ${text}`);
}

function setupAutoUpdater({ app, ipcMain, getWindow }) {
  if (!app.isPackaged) return;

  let lastStatus = null;
  const send = (status) => {
    lastStatus = status;
    getWindow()?.webContents.send("tactidesk:update", status);
  };

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;

  autoUpdater.on("update-available", (info) => {
    send({ state: "available", version: info.version });
  });
  autoUpdater.on("download-progress", (progress) => {
    send({
      state: "downloading",
      version: lastStatus && "version" in lastStatus ? lastStatus.version : undefined,
      percent: progress.percent,
    });
  });
  autoUpdater.on("update-downloaded", (info) => {
    send({ state: "ready", version: info.version });
  });
  autoUpdater.on("error", (error) => {
    if (isMissingRelease(error)) return;
    send({ state: "error", message: "Update check failed" });
  });

  const check = () => {
    autoUpdater.checkForUpdates().catch((error) => {
      if (!isMissingRelease(error)) {
        send({ state: "error", message: "Update check failed" });
      }
    });
  };

  ipcMain.handle("tactidesk:installUpdate", () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle("tactidesk:updateStatus", () => lastStatus);

  check();
  setInterval(check, CHECK_EVERY_MS);
}

module.exports = { setupAutoUpdater };
