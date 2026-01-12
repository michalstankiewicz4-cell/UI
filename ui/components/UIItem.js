// ═══════════════════════════════════════════════════════════════
//   UI ITEM BASE CLASS
// ═══════════════════════════════════════════════════════════════

/**
 * UIItem - Base class for all UI items
 * Provides common functionality for interactive UI elements
 */
class UIItem {
    constructor(type) {
        this.type = type;
        this.hovered = false;
    }

    /**
     * Get width of this item
     * Override in subclasses for custom widths
     */
    getWidth(window) {
        return window.width - window.padding * 2; // Default: full width
    }

    /**
     * Get height of this item
     * Override in subclasses for different heights
     */
    getHeight(window) {
        return 30; // Default height
    }

    /**
     * Draw this item
     * Override in subclasses
     */
    draw(ctx, window, x, y) {
        // Override in subclasses
    }

    /**
     * Update this item (handle mouse interaction)
     * Override in subclasses
     */
    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Update hover state using getWidth() (respects custom widths!)
        const width = this.getWidth(window);
        const height = this.getHeight(window);
        
        this.hovered = (
            mouseX >= x && 
            mouseX <= x + width && 
            mouseY >= y && 
            mouseY <= y + height
        );
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIItem };
}
