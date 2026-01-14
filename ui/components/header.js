// ═══════════════════════════════════════════════════════════════
//   WINDOW HEADER
// ═══════════════════════════════════════════════════════════════

import { rectHit } from '../core/geometry.js';
import { SIZE_BUTTON, SPACING_BUTTON, HEIGHT_HEADER, RADIUS_EYE } from '../core/constants.js';

/**
 * Get header button bounds (eye, maximize, minimize, close)
 */
export function getHeaderButtonBounds(window, index) {
    // 4 buttons now: eye(0), maximize(1), minimize(2), close(3)
    const x = window.x + window.width - SIZE_BUTTON * (4 - index) 
        - SPACING_BUTTON * (4 - index) - window.padding;
    const y = window.y + (HEIGHT_HEADER - SIZE_BUTTON) / 2;
    
    return { x, y, width: SIZE_BUTTON, height: SIZE_BUTTON };
}

/**
 * Draw window header with title and buttons
 */
export function drawHeader(ctx, window, STYLES) {
    // Header background
    ctx.fillStyle = STYLES.panel.headerBgColor;
    ctx.fillRect(window.x, window.y, window.width, HEIGHT_HEADER);
    
    // Title (always same color, no drag highlight)
    ctx.fillStyle = STYLES.colors.panel;
    ctx.font = STYLES.fonts.mainBold;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.title, window.x + window.padding, window.y + HEIGHT_HEADER / 2);
    
    // Buttons
    drawHeaderButtons(ctx, window, STYLES);
}

/**
 * Draw header buttons (eye, maximize, minimize, close)
 */
export function drawHeaderButtons(ctx, window, STYLES) {
    // Eye button (transparent toggle) - index 0
    const eyeBtn = getHeaderButtonBounds(window, 0);
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
    
    const eyeX = eyeBtn.x + eyeBtn.width / 2;
    const eyeY = eyeBtn.y + eyeBtn.height / 2;
    
    if (window.transparent) {
        // Closed eye (line)
        ctx.beginPath();
        ctx.moveTo(eyeX - RADIUS_EYE, eyeY);
        ctx.lineTo(eyeX + RADIUS_EYE, eyeY);
        ctx.stroke();
    } else {
        // Open eye (ellipse + dot)
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, RADIUS_EYE, RADIUS_EYE * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Maximize button - index 1 (square icon)
    const maxBtn = getHeaderButtonBounds(window, 1);
    ctx.strokeRect(maxBtn.x, maxBtn.y, maxBtn.width, maxBtn.height);
    
    if (window.fullscreen) {
        // Fullscreen: two overlapping squares (restore icon)
        ctx.strokeRect(maxBtn.x + 5, maxBtn.y + 5, 8, 8);
        ctx.strokeRect(maxBtn.x + 7, maxBtn.y + 3, 8, 8);
    } else {
        // Normal: single square (maximize icon)
        ctx.strokeRect(maxBtn.x + 4, maxBtn.y + 4, maxBtn.width - 8, maxBtn.height - 8);
    }
    
    // Minimize button - index 2
    const minBtn = getHeaderButtonBounds(window, 2);
    ctx.strokeRect(minBtn.x, minBtn.y, minBtn.width, minBtn.height);
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(minBtn.x + 4, minBtn.y + minBtn.height / 2 - 1, minBtn.width - 8, 2);
    
    // Close button - index 3
    const closeBtn = getHeaderButtonBounds(window, 3);
    ctx.strokeRect(closeBtn.x, closeBtn.y, closeBtn.width, closeBtn.height);
    const cx = closeBtn.x + closeBtn.width / 2;
    const cy = closeBtn.y + closeBtn.height / 2;
    const size = 6;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.stroke();
}

/**
 * Draw minimized header (just title bar)
 */
export function drawMinimizedHeader(ctx, window, STYLES) {
    drawHeader(ctx, window, STYLES);
}
