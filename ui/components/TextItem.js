// ═══════════════════════════════════════════════════════════════
//   TEXT ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * TextItem - Static or dynamic text display (supports multiline)
 */
class TextItem extends UIItem {
    constructor(text, color = '#00ff88') {
        super('text');
        this.text = text;
        this.color = color;
        this.lines = null; // Will be calculated dynamically
    }

    getHeight(window) {
        // Get text content (resolve function if needed)
        const textContent = typeof this.text === 'function' ? this.text() : this.text;
        const lines = textContent.split('\n').length;
        // 14px per line + 4px bottom padding for spacing
        return (lines * 14) + 4;
    }

    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || window.STYLES;
        ctx.fillStyle = this.color;
        ctx.font = STYLES.fonts.main;
        
        // Get text content (resolve function if needed)
        const textContent = typeof this.text === 'function' ? this.text() : this.text;
        const lines = textContent.split('\n');
        
        // Draw each line with proper baseline offset
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + 12 + (i * 14));
        }
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Text doesn't interact
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextItem };
}
