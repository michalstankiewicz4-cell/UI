// ═══════════════════════════════════════════════════════════════
//   SLIDER ITEM
// ═══════════════════════════════════════════════════════════════

import { UIItem } from './UIItem.js';

/**
 * SliderItem - Draggable slider with min/max/step
 */
class SliderItem extends UIItem {
    constructor(label, getValue, setValue, min, max, step = 0.01) {
        super('slider');
        this.label = label;
        this.getValue = getValue;
        this.setValue = setValue;
        this.min = min;
        this.max = max;
        this.step = step;
        this.dragging = false;
    }

    getHeight(window) {
        return 40;
    }

    draw(ctx, window, x, y) {
        const value = this.getValue();
        const width = window.width - window.padding * 2;
        const trackHeight = 6;
        const thumbSize = 16;
        const STYLES = this.STYLES || window.STYLES;
        
        // Label
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.main;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.label, x, y);
        
        // Value display
        const valueText = value.toFixed(2);
        ctx.textAlign = 'right';
        ctx.fillText(valueText, x + width, y);
        
        // Track
        const trackY = y + 20;
        ctx.fillStyle = STYLES.colors.sliderTrack;
        ctx.fillRect(x, trackY, width, trackHeight);
        
        // Fill
        const range = this.max - this.min;
        const normalizedValue = (value - this.min) / range;
        const fillWidth = normalizedValue * width;
        ctx.fillStyle = STYLES.colors.panel;
        ctx.fillRect(x, trackY, fillWidth, trackHeight);
        
        // Thumb
        const thumbX = x + normalizedValue * width;
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(thumbX, trackY + trackHeight / 2, thumbSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        super.update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y);
        
        const width = window.width - window.padding * 2;
        const trackY = y + 20;
        
        // Start dragging
        if (this.hovered && mouseClicked) {
            this.dragging = true;
        }
        
        // Stop dragging
        if (!mouseDown) {
            this.dragging = false;
        }
        
        // Update value while dragging
        if (this.dragging && mouseDown) {
            const normalized = Math.max(0, Math.min(1, (mouseX - x) / width));
            const newValue = this.min + normalized * (this.max - this.min);
            const steppedValue = Math.round(newValue / this.step) * this.step;
            const clampedValue = Math.max(this.min, Math.min(this.max, steppedValue));
            this.setValue(clampedValue);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SliderItem };
}
