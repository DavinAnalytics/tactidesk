/// <reference types="vite/client" />

interface Window {
  tactidesk?: {
    isElectron: boolean;
    toggleAlwaysOnTop: () => Promise<boolean>;
    setIgnoreMouse: (ignore: boolean) => Promise<void>;
    installUpdate: () => Promise<void>;
    minimize: () => Promise<void>;
    quit: () => Promise<void>;
    onUpdateStatus: (handler: (status: import("./lib/updates").UpdateStatus) => void) => () => void;
  };
}
