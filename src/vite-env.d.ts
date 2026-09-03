/// <reference types="vite/client" />

interface Window {
  tactidesk?: {
    isElectron: boolean;
    toggleAlwaysOnTop: () => Promise<boolean>;
    setIgnoreMouse: (ignore: boolean) => Promise<void>;
    onToggleOverlay: (handler: () => void) => () => void;
  };
}
