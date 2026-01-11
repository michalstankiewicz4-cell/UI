// ═══════════════════════════════════════════════════════════════
//   SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════

import { measureTextCached } from '../core/text-cache.js';

/**
 * Draw section divider with title
 */
export function drawSection(ctx, window, item, y, STYLES) {
    const sectionY = y + 10;
    const totalWidth = window.width - window.padding * 2;
    const x = window.x + window.padding;
    
    ctx.strokeStyle = STYLES.colors.sectionDim;
    ctx.fillStyle = STYLES.colors.sectionDim;
    ctx.font = STYLES.fonts.small;
    
    const titleWidth = measureTextCached(ctx, item.title, STYLES.fonts.small);
    const lineLength = (totalWidth - titleWidth - 8) / 2;
    
    // Left line
    ctx.beginPath();
    ctx.moveTo(x, sectionY);
    ctx.lineTo(x + lineLength, sectionY);
    ctx.stroke();
    
    // Title (centered)
    const titleX = x + lineLength + 4;
    ctx.fillText(item.title, titleX, sectionY + 4);
    
    // Right line
    ctx.beginPath();
    ctx.moveTo(titleX + titleWidth + 4, sectionY);
    ctx.lineTo(x + totalWidth, sectionY);
    ctx.stroke();
}
