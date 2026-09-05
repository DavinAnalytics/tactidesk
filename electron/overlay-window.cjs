function isUsableWindow(win) {
  return Boolean(win) && typeof win.isDestroyed === "function" && !win.isDestroyed();
}

function shouldRestoreOverlay(win) {
  if (!isUsableWindow(win)) return false;
  return win.isMinimized() || !win.isVisible();
}

function showBrowserWindow(win) {
  if (!isUsableWindow(win)) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function concealBrowserWindow(win) {
  if (!isUsableWindow(win)) return;
  win.minimize();
  if (!win.isMinimized() && win.isVisible()) win.hide();
}

function toggleOverlayVisibility(win) {
  if (shouldRestoreOverlay(win)) {
    showBrowserWindow(win);
    return;
  }
  concealBrowserWindow(win);
}

module.exports = {
  shouldRestoreOverlay,
  showBrowserWindow,
  concealBrowserWindow,
  toggleOverlayVisibility,
};
