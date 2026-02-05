// ═══════════════════════════════════════════════════════════════
//   SCROLLBAR COMPONENT
// ═══════════════════════════════════════════════════════════════

import { rectHit } from '../core/geometry.js';
import { WIDTH_SCROLLBAR, MIN_THUMB_HEIGHT } from '../core/constants.js';

/**
 * Compute scrollbar geometry
 */
export function computeScrollbar(window) {
    if (window.contentHeight <= window.height) {
        return null; // No scrollbar needed
    }
    
    const contentAreaHeight = window.height - window.headerHeight;
    
    // Track bounds
    const trackX = window.x + window.width - WIDTH_SCROLLBAR - 2;
    const trackY = window.y + window.headerHeight + 2;
    const trackHeight = contentAreaHeight - 4;
    
    // Thumb bounds
    const thumbHeight = Math.max(MIN_THUMB_HEIGHT, 
        (window.height / window.contentHeight) * trackHeight);
    const maxScroll = window.contentHeight - window.height;
    const thumbY = trackY + (window.scrollOffset / maxScroll) * (trackHeight - thumbHeight);
    
    return {
        track: { x: trackX, y: trackY, width: WIDTH_SCROLLBAR, height: trackHeight },
        thumb: { x: trackX, y: thumbY, width: WIDTH_SCROLLBAR, height: thumbHeight }
    };
}

/**
 * Check if mouse hits scrollbar thumb
 */
export function hitScrollbarThumb(window, mouseX, mouseY) {
    const scroll = computeScrollbar(window);
    if (!scroll) return false;
    
    const { thumb } = scroll;
    return rectHit(mouseX, mouseY, thumb.x, thumb.y, thumb.width, thumb.height);
}

/**
 * Check if mouse hits scrollbar track
 */
export function hitScrollbarTrack(window, mouseX, mouseY) {
    const scroll = computeScrollbar(window);
    if (!scroll) return false;
    
    const { track } = scroll;
    return rectHit(mouseX, mouseY, track.x, track.y, track.width, track.height);
}

/**
 * Draw scrollbar
 */
export function drawScrollbar(ctx, window, STYLES) {
    const scroll = computeScrollbar(window);
    if (!scroll) return;
    
    const { track, thumb } = scroll;
    
    // Track
    ctx.fillStyle = STYLES.colors.scrollbarTrack;
    ctx.fillRect(track.x, track.y, track.width, track.height);
    
    // Thumb
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(thumb.x, thumb.y, thumb.width, thumb.height);
}

// ═══════════════════════════════════════════════════════════════
//   HORIZONTAL SCROLLBAR
// ═══════════════════════════════════════════════════════════════

/**
 * Compute horizontal scrollbar geometry
 */
export function computeScrollbarH(window) {
    if (window.contentWidth <= window.width) {
        return null; // No scrollbar needed
    }
    
    const contentAreaWidth = window.width;
    
    // Track bounds
    const trackX = window.x + 2;
    const trackY = window.y + window.height - WIDTH_SCROLLBAR - 2;
    const trackWidth = contentAreaWidth - 4;
    
    // Thumb bounds
    const thumbWidth = Math.max(MIN_THUMB_HEIGHT, 
        (window.width / window.contentWidth) * trackWidth);
    const maxScroll = window.contentWidth - window.width;
    const thumbX = trackX + (window.scrollOffsetX / maxScroll) * (trackWidth - thumbWidth);
    
    return {
        track: { x: trackX, y: trackY, width: trackWidth, height: WIDTH_SCROLLBAR },
        thumb: { x: thumbX, y: trackY, width: thumbWidth, height: WIDTH_SCROLLBAR }
    };
}

/**
 * Check if mouse hits horizontal scrollbar thumb
 */
export function hitScrollbarThumbH(window, mouseX, mouseY) {
    const scroll = computeScrollbarH(window);
    if (!scroll) return false;
    
    const { thumb } = scroll;
    return rectHit(mouseX, mouseY, thumb.x, thumb.y, thumb.width, thumb.height);
}

/**
 * Check if mouse hits horizontal scrollbar track
 */
export function hitScrollbarTrackH(window, mouseX, mouseY) {
    const scroll = computeScrollbarH(window);
    if (!scroll) return false;
    
    const { track } = scroll;
    return rectHit(mouseX, mouseY, track.x, track.y, track.width, track.height);
}

/**
 * Draw horizontal scrollbar
 */
export function drawScrollbarH(ctx, window, STYLES) {
    const scroll = computeScrollbarH(window);
    if (!scroll) return;
    
    const { track, thumb } = scroll;
    
    // Track
    ctx.fillStyle = STYLES.colors.scrollbarTrack;
    ctx.fillRect(track.x, track.y, track.width, track.height);
    
    // Thumb
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(thumb.x, thumb.y, thumb.width, thumb.height);
}
