// ═══════════════════════════════════════════════════════════════
//   TEXT ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * TextItem - Static text display
 */
class TextItem extends UIItem {
    constructor(text, color = '#00ff88') {
        super('text');
        this.text = text;
        this.color = color;
    }

    getHeight(window) {
        return 18; // Line height
    }

    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || window.STYLES;
        ctx.fillStyle = this.color;
        ctx.font = STYLES.fonts.main;
        ctx.fillText(this.text, x, y + 14);
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Text doesn't interact
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextItem };
}
