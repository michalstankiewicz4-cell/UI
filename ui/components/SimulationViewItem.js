// ═══════════════════════════════════════════════════════════════
//   SIMULATION VIEW ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * SimulationViewItem - Displays simulation canvas content in a window
 */
class SimulationViewItem extends UIItem {
    constructor(simCanvas, height = 200) {
        super('simulationView');
        this.simCanvas = simCanvas;
        this.height = height;
    }

    getHeight(window) {
        return this.height;
    }

    /**
     * Calculate width maintaining aspect ratio of source canvas
     */
    getWidth(window) {
        // Get aspect ratio from source canvas
        const aspectRatio = this.simCanvas.width / this.simCanvas.height;
        
        // Calculate width from height, maintaining aspect ratio
        const calculatedWidth = this.height * aspectRatio;
        
        // Clamp to available window width
        const maxWidth = window.width - window.padding * 2;
        return Math.min(calculatedWidth, maxWidth);
    }

    draw(ctx, window, x, y) {
        const width = this.getWidth(window);
        
        // Draw border
        ctx.strokeStyle = this.STYLES?.colors?.accent || '#00ff88';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, this.height);
        
        // Draw simulation canvas content (maintaining aspect ratio)
        ctx.drawImage(this.simCanvas, x, y, width, this.height);
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Simulation view doesn't interact (yet)
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimulationViewItem };
}
