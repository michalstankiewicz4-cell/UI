// ═══════════════════════════════════════════════════════════════
//   BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════

import { rectHit } from '../core/geometry.js';
import { HEIGHT_BUTTON } from '../core/constants.js';

/**
 * Draw button
 */
export function drawButton(ctx, window, item, y, STYLES) {
    const width = window.width - window.padding * 2;
    
    ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.fillRect(window.x + window.padding, y, width, HEIGHT_BUTTON);
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(window.x + window.padding, y, width, HEIGHT_BUTTON);
    
    ctx.fillStyle = STYLES.colors.panel;
    ctx.font = STYLES.fonts.mainBold;
    ctx.textAlign = 'center';
    ctx.fillText(item.label, window.x + window.width / 2, y + HEIGHT_BUTTON / 2 + 4);
    ctx.textAlign = 'left';
}
