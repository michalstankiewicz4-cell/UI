// ═══════════════════════════════════════════════════════════════
//   TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════════

import { rectHit } from '../core/geometry.js';
import { SIZE_TOGGLE_CHECKBOX, HEIGHT_TOGGLE } from '../core/constants.js';

/**
 * Draw toggle checkbox
 */
export function drawToggle(ctx, window, item, y, STYLES) {
    const x = window.x + window.padding;
    const y2 = y + 2;
    
    // Checkbox border
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y2, SIZE_TOGGLE_CHECKBOX, SIZE_TOGGLE_CHECKBOX);
    
    // Checkbox fill (if checked)
    if (item.getValue()) {
        ctx.fillStyle = STYLES.colors.panel;
        ctx.fillRect(x + 3, y2 + 3, SIZE_TOGGLE_CHECKBOX - 6, SIZE_TOGGLE_CHECKBOX - 6);
    }
    
    // Label
    ctx.fillStyle = STYLES.colors.panel;
    ctx.font = STYLES.fonts.main;
    ctx.fillText(item.label, x + SIZE_TOGGLE_CHECKBOX + 8, y2 + 12);
}
