/// <reference types="vite/client" />

interface Window {
  tactidesk?: {
    isElectron: boolean;
    toggleAlwaysOnTop: () => Promise<boolean>;
    setIgnoreMouse: (ignore: boolean) => Promise<void>;
    installUpdate: () => Promise<void>;
    saveUpdaterToken: (token: string) => Promise<boolean>;
    onToggleOverlay: (handler: () => void) => () => void;
    onUpdateStatus: (handler: (status: import("./lib/updates").UpdateStatus) => void) => () => void;
  };
}
