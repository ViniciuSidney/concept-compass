export function createOverlayManager() {
  const overlays = new Set();
  function register(controller) {
    overlays.add(controller);
    return () => overlays.delete(controller);
  }
  function closeAll(reason = 'manager') {
    for (const overlay of overlays) overlay.close?.(reason);
  }
  function reset(reason = 'reset') {
    for (const overlay of [...overlays]) {
      if (overlay.destroy) overlay.destroy(reason);
      else overlay.close?.(reason);
    }
    overlays.clear();
  }
  return Object.freeze({ register, closeAll, reset, size: () => overlays.size });
}
