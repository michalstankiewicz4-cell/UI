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
 * Check if point is inside circle
 */
export function circleHit(x, y, cx, cy, radius) {
    const dx = x - cx;
    const dy = y - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Inverse linear interpolation (get t from value)
 */
export function unlerp(a, b, value) {
    return (value - a) / (b - a);
}
