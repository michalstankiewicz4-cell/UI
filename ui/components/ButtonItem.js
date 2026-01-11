// ═══════════════════════════════════════════════════════════════
//   BUTTON ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * ButtonItem - Clickable button with callback
 */
class ButtonItem extends UIItem {
    constructor(label, callback) {
        super('button');
        this.label = label;
        this.callback = callback;
    }

    getHeight(window) {
        return 26;
    }

    draw(ctx, window, x, y) {
        const width = window.width - window.padding * 2;
        const height = this.getHeight(window);
        const STYLES = this.STYLES || window.STYLES;
        
        // Button background
        ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text (centered)
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.textAlign = 'center';
        ctx.fillText(this.label, x + width / 2, y + height / 2 + 4);
        ctx.textAlign = 'left'; // Reset
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        super.update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y);
        
        // Execute callback on click
        if (this.hovered && mouseClicked) {
            this.callback();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ButtonItem };
}
