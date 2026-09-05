const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tactidesk", {
  isElectron: true,
  toggleAlwaysOnTop: () => ipcRenderer.invoke("tactidesk:alwaysOnTop"),
  setIgnoreMouse: (ignore) => ipcRenderer.invoke("tactidesk:ignoreMouse", ignore),
  installUpdate: () => ipcRenderer.invoke("tactidesk:installUpdate"),
  saveUpdaterToken: (token) => ipcRenderer.invoke("tactidesk:saveUpdaterToken", token),
  onToggleOverlay: (handler) => {
    const listener = () => handler();
    ipcRenderer.on("tactidesk:toggle", listener);
    return () => ipcRenderer.removeListener("tactidesk:toggle", listener);
  },
  onUpdateStatus: (handler) => {
    const listener = (_event, status) => handler(status);
    ipcRenderer.on("tactidesk:update", listener);
    return () => ipcRenderer.removeListener("tactidesk:update", listener);
  },
});
