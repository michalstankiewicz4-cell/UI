// ═══════════════════════════════════════════════════════════════
//   SIMULATION VIEW ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * SimulationViewItem - Displays simulation canvas content in a window
 * In fullscreen mode, fills entire window while maintaining aspect ratio
 */
class SimulationViewItem extends UIItem {
    constructor(simCanvas, height = 200) {
        super('simulationView');
        this.simCanvas = simCanvas;
        this.defaultHeight = height;
    }

    getHeight(window) {
        // In fullscreen mode, use entire window height
        if (window.fullscreen) {
            return window.height;
        }
        return this.defaultHeight;
    }

    /**
     * Calculate width maintaining aspect ratio of source canvas
     */
    getWidth(window) {
        const height = this.getHeight(window);
        
        // Get aspect ratio from source canvas
        const aspectRatio = this.simCanvas.width / this.simCanvas.height;
        
        // Calculate width from height, maintaining aspect ratio
        const calculatedWidth = height * aspectRatio;
        
        // In fullscreen mode, clamp to window dimensions
        if (window.fullscreen) {
            return Math.min(calculatedWidth, window.width);
        }
        
        // In normal mode, clamp to available window width
        const maxWidth = window.width - window.padding * 2;
        return Math.min(calculatedWidth, maxWidth);
    }

    draw(ctx, window, x, y) {
        if (window.fullscreen) {
            // FULLSCREEN MODE - ignore x,y params, use window coordinates directly
            const aspectRatio = this.simCanvas.width / this.simCanvas.height;
            const windowAspectRatio = window.width / window.height;
            
            let finalWidth, finalHeight;
            
            // Fit to window while maintaining aspect ratio
            if (aspectRatio > windowAspectRatio) {
                // Canvas is wider - fit to width
                finalWidth = window.width;
                finalHeight = window.width / aspectRatio;
            } else {
                // Canvas is taller - fit to height
                finalHeight = window.height;
                finalWidth = window.height * aspectRatio;
            }
            
            // Center in fullscreen window
            const drawX = window.x + (window.width - finalWidth) / 2;
            const drawY = window.y + (window.height - finalHeight) / 2;
            
            // Draw simulation canvas content (fullscreen, centered)
            ctx.drawImage(this.simCanvas, drawX, drawY, finalWidth, finalHeight);
        } else {
            // NORMAL MODE - use x,y params from layout
            const height = this.defaultHeight;
            const width = this.getWidth(window);
            
            // Draw border
            ctx.strokeStyle = this.STYLES?.colors?.accent || '#00ff88';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, width, height);
            
            // Draw simulation canvas content (maintaining aspect ratio)
            ctx.drawImage(this.simCanvas, x, y, width, height);
        }
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Simulation view doesn't interact (yet)
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimulationViewItem };
}
