const fs = require("fs");
const path = require("path");
const { autoUpdater } = require("electron-updater");

const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

function isAuthError(error) {
  const text = error instanceof Error ? error.message : String(error ?? "");
  const status = error && typeof error === "object" ? String(error.statusCode || "") : "";
  return /401|403|404|bad credentials|not found|cannot find channel|unauthorized/i.test(
    `${status} ${text}`,
  );
}

function tokenPaths(app) {
  return [
    path.join(__dirname, "updater.token"),
    path.join(app.getPath("userData"), "updater.token"),
  ];
}

function readToken(app) {
  const fromEnv = process.env.TD_UPDATER_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  for (const file of tokenPaths(app)) {
    try {
      const value = fs.readFileSync(file, "utf8").trim();
      if (value) return value;
    } catch {
      // try the next location
    }
  }
  return "";
}

function applyToken(token) {
  if (!token) return;
  process.env.GH_TOKEN = token;
  autoUpdater.requestHeaders = { Authorization: `token ${token}` };
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
  applyToken(readToken(app));

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
    if (isAuthError(error) && !readToken(app)) {
      send({ state: "needsToken" });
      return;
    }
    if (isAuthError(error)) return;
    send({ state: "error", message: "Update check failed" });
  });

  const check = () => {
    autoUpdater.checkForUpdates().catch((error) => {
      if (isAuthError(error) && !readToken(app)) {
        send({ state: "needsToken" });
      }
    });
  };

  ipcMain.handle("tactidesk:installUpdate", () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle("tactidesk:saveUpdaterToken", (_event, token) => {
    const value = String(token || "").trim();
    if (!value) return false;
    const file = path.join(app.getPath("userData"), "updater.token");
    fs.writeFileSync(file, value, "utf8");
    applyToken(value);
    check();
    return true;
  });

  ipcMain.handle("tactidesk:updateStatus", () => lastStatus);

  check();
  setInterval(check, CHECK_EVERY_MS);
}

module.exports = { setupAutoUpdater };
