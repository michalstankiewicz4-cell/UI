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
    
    getWidth(window) {
        return 200; // Fixed track width (+ value text)
    }

    draw(ctx, window, x, y) {
        const value = this.getValue();
        const trackWidth = this.getWidth(window);
        const trackHeight = 6;
        const thumbSize = 16;
        const STYLES = this.STYLES || window.STYLES;
        
        // Label
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.main;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.label, x, y);
        
        // Value display (to the right of track)
        const valueText = value.toFixed(2);
        ctx.textAlign = 'left';
        ctx.fillText(valueText, x + trackWidth + 10, y);
        
        // Track background (full range visible)
        const trackY = y + 20;
        ctx.fillStyle = STYLES.colors.sliderTrack;
        ctx.fillRect(x, trackY, trackWidth, trackHeight);
        
        // Track border (shows full range)
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, trackY, trackWidth, trackHeight);
        
        // Fill (shows current value)
        const range = this.max - this.min;
        const normalizedValue = (value - this.min) / range;
        const fillWidth = normalizedValue * trackWidth;
        ctx.fillStyle = STYLES.colors.panel;
        ctx.fillRect(x, trackY, fillWidth, trackHeight);
        
        // Thumb
        const thumbX = x + normalizedValue * trackWidth;
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(thumbX, trackY + trackHeight / 2, thumbSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        super.update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y);
        
        const trackWidth = this.getWidth(window);
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
            const normalized = Math.max(0, Math.min(1, (mouseX - x) / trackWidth));
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
