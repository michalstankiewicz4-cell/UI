// ═══════════════════════════════════════════════════════════════
//   TOGGLE ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * ToggleItem - Checkbox with getValue/setValue callbacks
 */
class ToggleItem extends UIItem {
    constructor(label, getValue, setValue) {
        super('toggle');
        this.label = label;
        this.getValue = getValue;
        this.setValue = setValue;
    }

    getHeight(window) {
        return 20;
    }
    
    getWidth(window) {
        // Checkbox width = checkbox + spacing + text
        const checkboxSize = 16;
        const spacing = 12;
        
        // Get canvas context for text measurement
        const canvas = document.querySelector('canvas');
        if (!canvas) return 200; // Fallback
        const ctx = canvas.getContext('2d');
        
        // Use default font if STYLES not available yet
        const font = (this.STYLES && this.STYLES.fonts) ? 
            this.STYLES.fonts.main : 
            '12px "Courier New", monospace';
        
        ctx.font = font;
        const textWidth = ctx.measureText(this.label).width;
        
        return checkboxSize + spacing + textWidth;
    }

    draw(ctx, window, x, y) {
        const value = this.getValue();
        const STYLES = this.STYLES || window.STYLES;
        
        // Checkbox
        const checkboxSize = 16;
        const checkboxX = x;
        const checkboxY = y + 2;
        
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
        
        if (value) {
            ctx.fillStyle = STYLES.colors.panel;
            ctx.fillRect(checkboxX + 3, checkboxY + 3, checkboxSize - 6, checkboxSize - 6);
        }
        
        // Label - vertically centered, left-aligned horizontally
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.main;
        ctx.textAlign = 'left'; // Explicit left alignment (default but be sure)
        ctx.textBaseline = 'middle'; // Vertical centering
        ctx.fillText(this.label, checkboxX + checkboxSize + 12, y + this.getHeight(window) / 2);
        ctx.textBaseline = 'top'; // Reset to default
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        super.update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y);
        
        // Toggle on click
        if (this.hovered && mouseClicked) {
            this.setValue(!this.getValue());
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToggleItem };
}
