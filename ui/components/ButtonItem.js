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
    
    getWidth(window) {
        return 100; // Fixed width
    }

    draw(ctx, window, x, y) {
        const width = this.getWidth(window);
        const height = this.getHeight(window);
        const STYLES = this.STYLES || window.STYLES;
        
        // Button background
        ctx.fillStyle = STYLES.colors.buttonBg;
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text (centered horizontally and vertically)
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, x + width / 2, y + height / 2);
        ctx.textAlign = 'left'; // Reset
        ctx.textBaseline = 'top'; // Reset
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
