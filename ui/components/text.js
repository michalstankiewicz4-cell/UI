// ═══════════════════════════════════════════════════════════════
//   TEXT COMPONENT
// ═══════════════════════════════════════════════════════════════

import { measureTextCached } from '../core/text-cache.js';
import { HEIGHT_TEXT_LINE } from '../core/constants.js';

/**
 * Wrap text to fit width (with cache!)
 */
export function wrapText(ctx, text, maxWidth) {
    const paragraphs = String(text).split('\n');
    const lines = [];
    
    for (const para of paragraphs) {
        if (!para.trim()) {
            lines.push('');
            continue;
        }
        
        const words = para.split(' ');
        let line = '';
        
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            const width = measureTextCached(ctx, test, ctx.font);
            
            if (width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        
        if (line) lines.push(line);
    }
    
    return lines;
}

/**
 * Draw text (multi-line with wrapping)
 */
export function drawText(ctx, window, item, y, STYLES) {
    const text = typeof item.text === 'function' ? item.text() : item.text;
    const lines = wrapText(ctx, text, window.width - window.padding * 2);
    
    ctx.fillStyle = item.color || STYLES.colors.text;
    ctx.font = STYLES.fonts.main;
    
    const maxLines = item.lines || lines.length;
    for (let i = 0; i < maxLines && i < lines.length; i++) {
        ctx.fillText(lines[i], window.x + window.padding, y + (i + 1) * HEIGHT_TEXT_LINE);
    }
}
