// ═══════════════════════════════════════════════════════════════
//   GEOMETRY UTILITIES
// ═══════════════════════════════════════════════════════════════
// Pure math helpers - no UI logic

/**
 * Check if point is inside rectangle
 */
export function rectHit(x, y, rx, ry, rw, rh) {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

/**

 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

