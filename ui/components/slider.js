// ═══════════════════════════════════════════════════════════════
//   SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════════

import { circleHit, clamp, unlerp } from '../core/geometry.js';
import { HEIGHT_SLIDER, HEIGHT_SLIDER_TRACK, RADIUS_SLIDER_THUMB } from '../core/constants.js';

/**
 * Normalize slider value from mouse position
 */
export function normalizeSliderValue(item, window, mouseX) {
    const x = window.x + window.padding;
    const width = window.width - window.padding * 2;
    const relativeX = mouseX - x;
    const t = clamp(relativeX / width, 0, 1);
    const value = item.min + t * (item.max - item.min);
    const stepped = Math.round(value / item.step) * item.step;
    return clamp(stepped, item.min, item.max);
}

/**
 * Get slider thumb position
 */
export function getSliderThumbX(item, window) {
    const x = window.x + window.padding;
    const width = window.width - window.padding * 2;
    const t = unlerp(item.min, item.max, item.getValue());
    return x + width * t;
}

/**
 * Check if mouse hits slider thumb
 */
export function hitSliderThumb(item, window, y, mouseX, mouseY) {
    const trackY = y + 20;
    const thumbX = getSliderThumbX(item, window);
    return circleHit(mouseX, mouseY, thumbX, trackY + HEIGHT_SLIDER_TRACK / 2, RADIUS_SLIDER_THUMB);
}

/**
 * Draw slider
 */
export function drawSlider(ctx, window, item, y, STYLES) {
    const width = window.width - window.padding * 2;
    const x = window.x + window.padding;
    const t = unlerp(item.min, item.max, item.getValue());
    
    // Label and value
    ctx.fillStyle = STYLES.colors.panel;
    ctx.font = STYLES.fonts.main;
    ctx.fillText(item.label, x, y);
    ctx.textAlign = 'right';
    ctx.fillText(item.getValue().toFixed(2), x + width, y);
    ctx.textAlign = 'left';
    
    // Track
    const trackY = y + 20;
    ctx.fillStyle = STYLES.colors.sliderTrack;
    ctx.fillRect(x, trackY, width, HEIGHT_SLIDER_TRACK);
    
    // Fill
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(x, trackY, width * t, HEIGHT_SLIDER_TRACK);
    
    // Thumb
    const thumbX = getSliderThumbX(item, window);
    ctx.beginPath();
    ctx.arc(thumbX, trackY + HEIGHT_SLIDER_TRACK / 2, RADIUS_SLIDER_THUMB, 0, Math.PI * 2);
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fill();
}
