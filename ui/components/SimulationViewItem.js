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

    draw(ctx, window, x, y) {
        const width = this.getWidth(window);
        
        // Draw simulation canvas content
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
