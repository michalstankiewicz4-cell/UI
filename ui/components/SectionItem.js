// ═══════════════════════════════════════════════════════════════
//   SECTION ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * SectionItem - Visual divider with title
 * 
 * Types:
 * - 'standard' (default) - Green dimmed color for normal sections
 * - 'statistics' - Cyan dimmed color for statistics sections
 */
class SectionItem extends UIItem {
    constructor(title, type = 'standard') {
        super('section');
        this.title = title;
        this.sectionType = type; // 'standard' or 'statistics'
    }

    getHeight(window) {
        return 20;
    }

    draw(ctx, window, x, y) {
        const width = window.width - window.padding * 2;
        const STYLES = this.STYLES || window.STYLES;
        
        // Choose color based on section type
        const color = this.sectionType === 'statistics' 
            ? 'rgba(0, 245, 255, 0.5)'  // Cyan dimmed (statistics)
            : STYLES.colors.sectionDim;  // Green dimmed (standard)
        
        ctx.font = STYLES.fonts.main;
        const textWidth = ctx.measureText(this.title).width;
        const lineY = y + 10;
        const lineWidth = (width - textWidth - 16) / 2;
        
        // Left line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x + lineWidth, lineY);
        ctx.stroke();
        
        // Title text
        ctx.fillStyle = color;
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
