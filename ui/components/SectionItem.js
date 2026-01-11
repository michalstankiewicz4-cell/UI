// ═══════════════════════════════════════════════════════════════
//   SECTION ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * SectionItem - Visual divider with title
 */
class SectionItem extends UIItem {
    constructor(title) {
        super('section');
        this.title = title;
    }

    getHeight(window) {
        return 20;
    }

    draw(ctx, window, x, y) {
        const width = window.width - window.padding * 2;
        const STYLES = this.STYLES || window.STYLES;
        
        ctx.font = STYLES.fonts.main;
        const textWidth = ctx.measureText(this.title).width;
        const lineY = y + 10;
        const lineWidth = (width - textWidth - 16) / 2;
        
        // Left line
        ctx.strokeStyle = STYLES.colors.sectionDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + lineWidth, lineY);
        ctx.stroke();
        
        // Title text
        ctx.fillStyle = STYLES.colors.sectionDim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.title, x + width / 2, lineY);
        
        // Right line
        ctx.beginPath();
        ctx.moveTo(x + width - lineWidth, lineY);
        ctx.lineTo(x + width, lineY);
        ctx.stroke();
        
        // Reset alignment
        ctx.textAlign = 'left';
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Sections don't interact
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SectionItem };
}
