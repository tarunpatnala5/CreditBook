// Credit Book — Navigation Callbacks
// Allows pages to register "close modal" functions that fire
// SYNCHRONOUSLY before navigation, preventing any modal flash.

const _callbacks = new Set();

/**
 * Register a function to be called before any tab navigation.
 * Returns an unregister function (use in useEffect cleanup).
 */
export function registerModalCloser(fn) {
  _callbacks.add(fn);
  return () => _callbacks.delete(fn);
}

/**
 * Called by PillTabBar & DesktopTabNav BEFORE navigate().
 * Closes all open modals synchronously.
 */
export function closeAllModals() {
  _callbacks.forEach((fn) => fn());
}
