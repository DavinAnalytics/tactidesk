import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  concealBrowserWindow,
  shouldRestoreOverlay,
  showBrowserWindow,
  toggleOverlayVisibility,
} from "./overlay-window.cjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function fakeWindow(state: { minimized?: boolean; visible?: boolean; destroyed?: boolean }) {
  const win = {
    minimized: Boolean(state.minimized),
    visible: state.visible ?? true,
    destroyed: Boolean(state.destroyed),
    isDestroyed: () => win.destroyed,
    isMinimized: () => win.minimized,
    isVisible: () => win.visible,
    restore: vi.fn(() => {
      win.minimized = false;
      win.visible = true;
    }),
    show: vi.fn(() => {
      win.visible = true;
    }),
    focus: vi.fn(),
    minimize: vi.fn(() => {
      win.minimized = true;
      win.visible = false;
    }),
    hide: vi.fn(() => {
      win.visible = false;
    }),
  };
  return win;
}

describe("overlay window visibility", () => {
  it("restores a minimized or hidden window", () => {
    expect(shouldRestoreOverlay(fakeWindow({ minimized: true, visible: false }))).toBe(true);
    expect(shouldRestoreOverlay(fakeWindow({ minimized: false, visible: false }))).toBe(true);
    expect(shouldRestoreOverlay(fakeWindow({ minimized: false, visible: true }))).toBe(false);
    expect(shouldRestoreOverlay(fakeWindow({ destroyed: true }))).toBe(false);
  });

  it("minimizes a visible overlay and restores it on toggle", () => {
    const win = fakeWindow({ visible: true });
    toggleOverlayVisibility(win);
    expect(win.minimize).toHaveBeenCalledOnce();
    expect(win.hide).not.toHaveBeenCalled();
    toggleOverlayVisibility(win);
    expect(win.restore).toHaveBeenCalledOnce();
    expect(win.show).toHaveBeenCalledOnce();
    expect(win.focus).toHaveBeenCalledOnce();
  });

  it("hides when minimize does not take the window off screen", () => {
    const win = fakeWindow({ visible: true });
    win.minimize = vi.fn();
    concealBrowserWindow(win);
    expect(win.hide).toHaveBeenCalledOnce();
  });

  it("show restores then focuses", () => {
    const win = fakeWindow({ minimized: true, visible: false });
    showBrowserWindow(win);
    expect(win.restore).toHaveBeenCalledOnce();
    expect(win.show).toHaveBeenCalledOnce();
    expect(win.focus).toHaveBeenCalledOnce();
  });
});

describe("overlay window wiring", () => {
  it("registers minimize, quit, and the global shortcut in the Electron shell", () => {
    const main = readFileSync(join(ROOT, "electron/main.cjs"), "utf8");
    const preload = readFileSync(join(ROOT, "electron/preload.cjs"), "utf8");
    const app = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
    expect(main).toContain("tactidesk:minimize");
    expect(main).toContain("tactidesk:quit");
    expect(main).toContain("CommandOrControl+Shift+T");
    expect(main).not.toContain("tactidesk:toggle");
    expect(preload).toContain("tactidesk:minimize");
    expect(preload).toContain("tactidesk:quit");
    expect(app).toContain("Close");
    expect(app).toContain("concealOverlay");
    expect(app).not.toContain("peek");
    expect(app).not.toContain("onToggleOverlay");
  });
});
