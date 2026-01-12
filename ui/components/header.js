// ═══════════════════════════════════════════════════════════════
//   WINDOW HEADER
// ═══════════════════════════════════════════════════════════════

import { rectHit } from '../core/geometry.js';
import { SIZE_BUTTON, SPACING_BUTTON, HEIGHT_HEADER } from '../core/constants.js';

/**
 * Get header button bounds (close, minimize, eye)
 */
export function getHeaderButtonBounds(window, index) {
    const x = window.x + window.width - SIZE_BUTTON * (3 - index) 
        - SPACING_BUTTON * (3 - index) - window.padding;
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
 * Draw header buttons (eye, minimize, close)
 */
export function drawHeaderButtons(ctx, window, STYLES) {
    // Eye button (transparent toggle) - index 0
    const eyeBtn = getHeaderButtonBounds(window, 0);
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
    
    const eyeX = eyeBtn.x + eyeBtn.width / 2;
    const eyeY = eyeBtn.y + eyeBtn.height / 2;
    const eyeRadius = 4;
    
    if (window.transparent) {
        // Closed eye (line)
        ctx.beginPath();
        ctx.moveTo(eyeX - eyeRadius, eyeY);
        ctx.lineTo(eyeX + eyeRadius, eyeY);
        ctx.stroke();
    } else {
        // Open eye (ellipse + dot)
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeRadius, eyeRadius * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Minimize button - index 1
    const minBtn = getHeaderButtonBounds(window, 1);
    ctx.strokeRect(minBtn.x, minBtn.y, minBtn.width, minBtn.height);
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(minBtn.x + 4, minBtn.y + minBtn.height / 2 - 1, minBtn.width - 8, 2);
    
    // Close button - index 2
    const closeBtn = getHeaderButtonBounds(window, 2);
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
