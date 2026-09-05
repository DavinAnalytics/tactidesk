const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tactidesk", {
  isElectron: true,
  toggleAlwaysOnTop: () => ipcRenderer.invoke("tactidesk:alwaysOnTop"),
  setIgnoreMouse: (ignore) => ipcRenderer.invoke("tactidesk:ignoreMouse", ignore),
  installUpdate: () => ipcRenderer.invoke("tactidesk:installUpdate"),
  minimize: () => ipcRenderer.invoke("tactidesk:minimize"),
  quit: () => ipcRenderer.invoke("tactidesk:quit"),
  onUpdateStatus: (handler) => {
    const listener = (_event, status) => handler(status);
    ipcRenderer.on("tactidesk:update", listener);
    return () => ipcRenderer.removeListener("tactidesk:update", listener);
  },
});
