const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("tactidesk", {
  isElectron: true,
  toggleAlwaysOnTop: () => ipcRenderer.invoke("tactidesk:alwaysOnTop"),
  setIgnoreMouse: (ignore) => ipcRenderer.invoke("tactidesk:ignoreMouse", ignore),
  onToggleOverlay: (handler) => {
    const listener = () => handler();
    ipcRenderer.on("tactidesk:toggle", listener);
    return () => ipcRenderer.removeListener("tactidesk:toggle", listener);
  },
});
