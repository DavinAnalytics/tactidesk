import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");

describe("Windows installer packaging", () => {
  it("has a one-click NSIS config and icons", () => {
    const config = readFileSync(resolve(root, "electron-builder.yml"), "utf8");
    expect(config).toContain("target: nsis");
    expect(config).toContain("oneClick: true");
    expect(config).toContain("createDesktopShortcut: always");
    expect(config).toContain("createStartMenuShortcut: true");
    expect(config).toContain("runAfterFinish: true");
    expect(config).toContain("provider: github");
    expect(config).not.toContain("private: true");
    expect(existsSync(resolve(root, "build/icon.png"))).toBe(true);
    expect(existsSync(resolve(root, "build/icon.ico"))).toBe(true);
    expect(existsSync(resolve(root, "electron/updater.cjs"))).toBe(true);
    expect(existsSync(resolve(root, "electron/overlay-window.cjs"))).toBe(true);
    expect(existsSync(resolve(root, "scripts/publish-win-release.sh"))).toBe(true);
  });

  it("exposes a Windows installer script and updater", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      author: string;
      main: string;
      dependencies: Record<string, string>;
    };
    expect(pkg.author).toBe("DavinAnalytics");
    expect(pkg.main).toBe("electron/main.cjs");
    expect(pkg.scripts["dist:win"]).toContain("electron-builder --win nsis");
    expect(pkg.dependencies["electron-updater"]).toBeTruthy();
  });
});
