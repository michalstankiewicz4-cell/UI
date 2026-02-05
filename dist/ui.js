// ═══════════════════════════════════════════════════════════════
//   UI LIBRARY - COMPLETE BUNDLE (MODULAR)
// ═══════════════════════════════════════════════════════════════
// Single-file bundle of entire UI system
// Extracted from Petrie Dish v5.1-C2
// 
// Version: 2.0.0 (Modular Architecture)
// Date: 2026-02-05
// Source: https://github.com/michalstankiewicz4-cell/UI
//
// Architecture:
// - ui/core/* (geometry, text-cache, constants, layout)
// - ui/components/* (header, button, toggle, slider, text, section, scrollbar)
// - ui/BaseWindow.js (refactored to use modules)
// - ui/WindowManager.js, Taskbar.js, EventRouter.js, Styles.js
//
// Total: ~1500+ lines of clean modular code
//
// Usage:
//   <script src="dist/ui.js"></script>
//   <script>
//     const manager = new UI.WindowManager();
//     const window = new UI.BaseWindow(100, 100, 'Hello!');
//     window.addButton('Click', () => console.log('Clicked!'));
//     manager.add(window);
//   </script>
// ═══════════════════════════════════════════════════════════════

(function(global) {
    'use strict';


// ═══ ui/core/geometry.js ═══

// ═══════════════════════════════════════════════════════════════
//   GEOMETRY UTILITIES
// ═══════════════════════════════════════════════════════════════
// Pure math helpers - no UI logic

/**
 * Check if point is inside rectangle
 */
function rectHit(x, y, rx, ry, rw, rh) {
    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

/**

 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}



// ═══ ui/core/text-cache.js ═══

// ═══════════════════════════════════════════════════════════════
//   TEXT MEASUREMENT CACHE
// ═══════════════════════════════════════════════════════════════
// LRU cache for measureText - 2-5× faster UI rendering

const textWidthCache = new Map();
const MAX_CACHE_SIZE = 5000; // OPT-6: Increased from 1000 for better cache hits

/**
 * Measure text width with caching
 */
function measureTextCached(ctx, text, font) {
    const key = `${font}:${text}`;
    
    if (textWidthCache.has(key)) {
        return textWidthCache.get(key);
    }
    
    ctx.font = font;
    const width = ctx.measureText(text).width;
    
    // LRU eviction
    if (textWidthCache.size >= MAX_CACHE_SIZE) {
        const firstKey = textWidthCache.keys().next().value;
        textWidthCache.delete(firstKey);
    }
    
    textWidthCache.set(key, width);
    return width;
}

/**
 * Clear text measurement cache
 */
function clearTextCache() {
    textWidthCache.clear();
}

/**
 * Get cache statistics
 */
function getTextCacheStats() {
    return {
        size: textWidthCache.size,
        maxSize: MAX_CACHE_SIZE
    };
}


// ═══ ui/core/constants.js ═══

// ═══════════════════════════════════════════════════════════════
//   UI CONSTANTS
// ═══════════════════════════════════════════════════════════════
// Centralized sizes, spacing, and dimensions

// Item heights (in pixels)
const HEIGHT_BUTTON = 20;
const HEIGHT_SLIDER = 40;
const HEIGHT_TOGGLE = 20;
const HEIGHT_SECTION = 20;
const HEIGHT_TEXT_LINE = 14;

// Spacing
const SPACING_ITEM = 8;      // Space between items
const SPACING_PADDING = 10;  // Window padding

// Header
const HEIGHT_HEADER = 26;
const SIZE_BUTTON = 20;      // Header button size
const SPACING_BUTTON = 4;    // Space between header buttons

// Scrollbar
const WIDTH_SCROLLBAR = 8;
const MIN_THUMB_HEIGHT = 20;

// Slider
const HEIGHT_SLIDER_TRACK = 6;
const RADIUS_SLIDER_THUMB = 8;

// Toggle
const SIZE_TOGGLE_CHECKBOX = 16;

// Header buttons
const RADIUS_EYE = 4;           // Eye icon radius

// Menu
const PADDING_MENU = 8;         // Menu padding (top/bottom/sides)
const SPACING_MENU_ITEM = 1;    // Space between menu items
const HEIGHT_MENU_SECTION = 24; // Section header height

// Taskbar
const PADDING_TASKBAR_VERTICAL = 4;      // Vertical padding for taskbar buttons
const PADDING_BUTTON_HORIZONTAL = 16;    // Horizontal padding for buttons (text spacing)

// Export all constants as object for bundle compatibility
const CONST = {
    HEIGHT_BUTTON,
    HEIGHT_SLIDER,
    HEIGHT_TOGGLE,
    HEIGHT_SECTION,
    HEIGHT_TEXT_LINE,
    SPACING_ITEM,
    SPACING_PADDING,
    HEIGHT_HEADER,
    SIZE_BUTTON,
    SPACING_BUTTON,
    WIDTH_SCROLLBAR,
    MIN_THUMB_HEIGHT,
    HEIGHT_SLIDER_TRACK,
    RADIUS_SLIDER_THUMB,
    SIZE_TOGGLE_CHECKBOX,
    RADIUS_EYE,
    PADDING_MENU,
    SPACING_MENU_ITEM,
    HEIGHT_MENU_SECTION,
    PADDING_TASKBAR_VERTICAL,
    PADDING_BUTTON_HORIZONTAL
};


// ═══ ui/core/layout.js ═══

// ═══════════════════════════════════════════════════════════════
//   LAYOUT ENGINE
// ═══════════════════════════════════════════════════════════════
// Compute positions and heights for all UI elements


/**
 * Get height for a single item
 */
function getItemHeight(item, window) {
    // Use item's own getHeight method if available (for dynamic sizing)
    if (item.getHeight && typeof item.getHeight === 'function') {
        return item.getHeight(window);
    }
    
    // Fallback to static heights
    switch (item.type) {
        case 'button': return HEIGHT_BUTTON;
        case 'slider': return HEIGHT_SLIDER;
        case 'toggle': return HEIGHT_TOGGLE;
        case 'section': return HEIGHT_SECTION;
        case 'text': {
            const lines = item.lines || 1;
            return lines * HEIGHT_TEXT_LINE;
        }
        default: return 20;
    }
}

/**
 * Compute layout for all items in window
 * Returns array of {type, y, height, item}
 */
function computeLayout(items, window) {
    const layout = [];
    let currentY = window.headerHeight + window.padding;
    
    for (const item of items) {
        const height = getItemHeight(item, window);
        
        layout.push({
            type: item.type,
            y: currentY,
            height: height,
            item: item
        });
        
        // Spacing rules:
        // - Sections: 0px (visual dividers only)
        // - Text blocks: 4px (compact but readable)
        // - Other items: 8px (standard spacing)
        let spacing = SPACING_ITEM;
        if (item.type === 'section') {
            spacing = 0;
        } else if (item.type === 'text') {
            spacing = 4;
        }
        
        currentY += height + spacing;
    }
    
    return layout;
}


// ═══ ui/components/header.js ═══

// ═══════════════════════════════════════════════════════════════
//   WINDOW HEADER
// ═══════════════════════════════════════════════════════════════


/**
 * Get header button bounds (eye, maximize, minimize, close)
 */
function getHeaderButtonBounds(window, index) {
    // 4 buttons now: eye(0), maximize(1), minimize(2), close(3)
    const x = window.x + window.width - SIZE_BUTTON * (4 - index) 
        - SPACING_BUTTON * (4 - index) - window.padding;
    const y = window.y + (HEIGHT_HEADER - SIZE_BUTTON) / 2;
    
    return { x, y, width: SIZE_BUTTON, height: SIZE_BUTTON };
}

/**
 * Draw window header with title and buttons
 */
function drawHeader(ctx, window, STYLES) {
    // Header background
    ctx.fillStyle = STYLES.panel.headerBgColor;
    ctx.fillRect(window.x, window.y, window.width, HEIGHT_HEADER);
    
    // Title (always same color, no drag highlight)
    ctx.fillStyle = STYLES.colors.panel;
    ctx.font = STYLES.fonts.mainBold;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.title, window.x + window.padding, window.y + HEIGHT_HEADER / 2);
    
    // Buttons
    drawHeaderButtons(ctx, window, STYLES);
}

/**
 * Draw header buttons (eye, maximize, minimize, close)
 */
function drawHeaderButtons(ctx, window, STYLES) {
    // Eye button (transparent toggle) - index 0
    const eyeBtn = getHeaderButtonBounds(window, 0);
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
    
    const eyeX = eyeBtn.x + eyeBtn.width / 2;
    const eyeY = eyeBtn.y + eyeBtn.height / 2;
    
    if (window.transparent) {
        // Closed eye (line)
        ctx.beginPath();
        ctx.moveTo(eyeX - RADIUS_EYE, eyeY);
        ctx.lineTo(eyeX + RADIUS_EYE, eyeY);
        ctx.stroke();
    } else {
        // Open eye (ellipse + dot)
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, RADIUS_EYE, RADIUS_EYE * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Maximize button - index 1 (square icon)
    const maxBtn = getHeaderButtonBounds(window, 1);
    ctx.strokeRect(maxBtn.x, maxBtn.y, maxBtn.width, maxBtn.height);
    
    if (window.fullscreen) {
        // Fullscreen: two overlapping squares (restore icon)
        ctx.strokeRect(maxBtn.x + 5, maxBtn.y + 5, 8, 8);
        ctx.strokeRect(maxBtn.x + 7, maxBtn.y + 3, 8, 8);
    } else {
        // Normal: single square (maximize icon)
        ctx.strokeRect(maxBtn.x + 4, maxBtn.y + 4, maxBtn.width - 8, maxBtn.height - 8);
    }
    
    // Minimize button - index 2
    const minBtn = getHeaderButtonBounds(window, 2);
    ctx.strokeRect(minBtn.x, minBtn.y, minBtn.width, minBtn.height);
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(minBtn.x + 4, minBtn.y + minBtn.height / 2 - 1, minBtn.width - 8, 2);
    
    // Close button - index 3
    const closeBtn = getHeaderButtonBounds(window, 3);
    ctx.strokeRect(closeBtn.x, closeBtn.y, closeBtn.width, closeBtn.height);
    const cx = closeBtn.x + closeBtn.width / 2;
    const cy = closeBtn.y + closeBtn.height / 2;
    const size = 6;
    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.stroke();
}

/**
 * Draw minimized header (just title bar)
 */
function drawMinimizedHeader(ctx, window, STYLES) {
    drawHeader(ctx, window, STYLES);
}


// ═══ ui/components/scrollbar.js ═══

// ═══════════════════════════════════════════════════════════════
//   SCROLLBAR COMPONENT
// ═══════════════════════════════════════════════════════════════


/**
 * Compute scrollbar geometry
 */
function computeScrollbar(window) {
    if (window.contentHeight <= window.height) {
        return null; // No scrollbar needed
    }
    
    const contentAreaHeight = window.height - window.headerHeight;
    
    // Track bounds
    const trackX = window.x + window.width - WIDTH_SCROLLBAR - 2;
    const trackY = window.y + window.headerHeight + 2;
    const trackHeight = contentAreaHeight - 4;
    
    // Thumb bounds
    const thumbHeight = Math.max(MIN_THUMB_HEIGHT, 
        (window.height / window.contentHeight) * trackHeight);
    const maxScroll = window.contentHeight - window.height;
    const thumbY = trackY + (window.scrollOffset / maxScroll) * (trackHeight - thumbHeight);
    
    return {
        track: { x: trackX, y: trackY, width: WIDTH_SCROLLBAR, height: trackHeight },
        thumb: { x: trackX, y: thumbY, width: WIDTH_SCROLLBAR, height: thumbHeight }
    };
}

/**
 * Check if mouse hits scrollbar thumb
 */
function hitScrollbarThumb(window, mouseX, mouseY) {
    const scroll = computeScrollbar(window);
    if (!scroll) return false;
    
    const { thumb } = scroll;
    return rectHit(mouseX, mouseY, thumb.x, thumb.y, thumb.width, thumb.height);
}

/**
 * Check if mouse hits scrollbar track
 */
function hitScrollbarTrack(window, mouseX, mouseY) {
    const scroll = computeScrollbar(window);
    if (!scroll) return false;
    
    const { track } = scroll;
    return rectHit(mouseX, mouseY, track.x, track.y, track.width, track.height);
}

/**
 * Draw scrollbar
 */
function drawScrollbar(ctx, window, STYLES) {
    const scroll = computeScrollbar(window);
    if (!scroll) return;
    
    const { track, thumb } = scroll;
    
    // Track
    ctx.fillStyle = STYLES.colors.scrollbarTrack;
    ctx.fillRect(track.x, track.y, track.width, track.height);
    
    // Thumb
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(thumb.x, thumb.y, thumb.width, thumb.height);
}


// ═══ ui/components/UIItem.js ═══

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


// ═══ ui/components/ToggleItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   TOGGLE ITEM
// ═══════════════════════════════════════════════════════════════


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


// ═══ ui/components/ButtonItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   BUTTON ITEM
// ═══════════════════════════════════════════════════════════════


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


// ═══ ui/components/SliderItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   SLIDER ITEM
// ═══════════════════════════════════════════════════════════════


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
        ctx.strokeStyle = STYLES.colors.sliderBorder;
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


// ═══ ui/components/SectionItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   SECTION ITEM
// ═══════════════════════════════════════════════════════════════


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


// ═══ ui/components/TextItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   TEXT ITEM
// ═══════════════════════════════════════════════════════════════


/**
 * TextItem - Static or dynamic text display (supports multiline + auto word wrap)
 */
class TextItem extends UIItem {
    constructor(text, color = '#00ff88') {
        super('text');
        this.text = text;
        this.color = color;
        this.wrappedLines = null; // Cache for wrapped lines
        this.lastWidth = 0; // Track window width changes
    }

    /**
     * Resolve text content (handle function or string) - DRY helper
     * @returns {string} Resolved text
     */
    _resolveText() {
        return typeof this.text === 'function' ? this.text() : this.text;
    }

    /**
     * Word wrap text to fit within available width
     * @param {string} text - Text to wrap
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} maxWidth - Maximum line width in pixels
     * @returns {string[]} Array of wrapped lines
     */
    wrapText(text, ctx, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                // Line is too long, push current line and start new one
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        // Push last line
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    getHeight(window) {
        // Get text content (resolve function if needed)
        const textContent = this._resolveText();
        
        // Calculate available width for text
        const maxWidth = window.width - window.padding * 2;
        
        // Count lines (considering word wrap)
        let totalLines = 0;
        const paragraphs = textContent.split('\n');
        
        // Need ctx for measureText - use temporary measure or estimate
        // For height calculation, we'll estimate based on max width
        // Average word length ~5 chars, average width ~30px per word
        for (const paragraph of paragraphs) {
            if (paragraph.length === 0) {
                totalLines += 1; // Empty line
            } else {
                // Rough estimate: 7 chars per word * 6px per char = 42px per word + space
                const estimatedCharsPerLine = Math.floor(maxWidth / 7);
                const estimatedLines = Math.ceil(paragraph.length / estimatedCharsPerLine);
                totalLines += Math.max(1, estimatedLines);
            }
        }
        
        // 14px per line + 4px bottom padding for spacing
        return (totalLines * 14) + 4;
    }

    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || window.STYLES;
        ctx.fillStyle = this.color;
        ctx.font = STYLES.fonts.main;
        
        // Get text content (resolve function if needed)
        const textContent = this._resolveText();
        
        // Calculate available width for text
        const maxWidth = window.width - window.padding * 2;
        
        // Cache wrapped lines if window width unchanged AND text is static
        // For dynamic text (functions), always recalculate
        const isDynamicText = typeof this.text === 'function';
        const needsRecalculation = isDynamicText || !this.wrappedLines || this.lastWidth !== maxWidth;
        
        if (needsRecalculation) {
            const paragraphs = textContent.split('\n');
            this.wrappedLines = [];
            
            for (const paragraph of paragraphs) {
                if (paragraph.length === 0) {
                    this.wrappedLines.push(''); // Preserve empty lines
                } else {
                    const wrapped = this.wrapText(paragraph, ctx, maxWidth);
                    this.wrappedLines.push(...wrapped);
                }
            }
            
            this.lastWidth = maxWidth;
        }
        
        // Draw each wrapped line
        for (let i = 0; i < this.wrappedLines.length; i++) {
            ctx.fillText(this.wrappedLines[i], x, y + 12 + (i * 14));
        }
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Text doesn't interact
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextItem };
}


// ═══ ui/components/SimulationViewItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   SIMULATION VIEW ITEM
// ═══════════════════════════════════════════════════════════════


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


// ═══ ui/components/MatrixItem.js ═══

// ═══════════════════════════════════════════════════════════════
//   MATRIX ITEM - Interactive Value Matrix
// ═══════════════════════════════════════════════════════════════


/**
 * MatrixItem - Interactive matrix with editable values
 * 
 * Features:
 * - Click cells to edit values
 * - Color coding: red (negative), blue (0), green (positive)
 * - Intensity based on absolute value
 * - Visual value display in each cell
 */
class MatrixItem extends UIItem {
    constructor(rows, cols, getValue, setValue, minValue = -1, maxValue = 1, label = 'Matrix') {
        super('matrix');
        this.rows = rows;
        this.cols = cols;
        this.getValue = getValue;  // (row, col) => value
        this.setValue = setValue;  // (row, col, value) => void
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.label = label;
        
        // UI properties
        this.cellSize = 32;
        this.labelWidth = 40;
        this.headerHeight = 40;
        
        // Interaction state
        this.selectedCell = null; // { row, col }
        this.editingCell = null;
        this.editValue = '';
        
        // Button properties
        this.buttonSize = 18;
        this.valueStep = 0.1;
    }
    
    getHeight(window) {
        return this.headerHeight + this.rows * this.cellSize + 30;
    }
    
    getColorForValue(value) {
        if (value === 0) {
            return { r: 0, g: 100, b: 255, alpha: 0.7 };
        }
        
        if (value > 0) {
            const intensity = Math.min(value / this.maxValue, 1);
            const green = Math.floor(150 + intensity * 105);
            return { r: 0, g: green, b: 50, alpha: 0.6 + intensity * 0.3 };
        } else {
            const intensity = Math.min(Math.abs(value) / Math.abs(this.minValue), 1);
            const red = Math.floor(150 + intensity * 105);
            return { r: red, g: 0, b: 0, alpha: 0.6 + intensity * 0.3 };
        }
    }
    
    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || {};
        
        // Title
        ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(this.label, x, y + 14);
        
        const matrixX = x + this.labelWidth;
        const matrixY = y + this.headerHeight;
        
        // Column labels
        if (this.cols <= 10) {
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
            
            for (let col = 0; col < this.cols; col++) {
                const labelX = matrixX + col * this.cellSize + this.cellSize / 2;
                const labelY = matrixY - 10;
                ctx.fillText(col.toString(), labelX, labelY);
            }
        }
        
        // Row labels
        if (this.rows <= 10) {
            ctx.font = '12px Courier New';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
            
            for (let row = 0; row < this.rows; row++) {
                const labelX = matrixX - 8;
                const labelY = matrixY + row * this.cellSize + this.cellSize / 2;
                ctx.fillText(row.toString(), labelX, labelY);
            }
        }
        
        // Matrix cells
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellX = matrixX + col * this.cellSize;
                const cellY = matrixY + row * this.cellSize;
                const value = this.getValue(row, col);
                
                const isSelected = this.selectedCell && 
                                  this.selectedCell.row === row && 
                                  this.selectedCell.col === col;
                
                const isEditing = this.editingCell && 
                                 this.editingCell.row === row && 
                                 this.editingCell.col === col;
                
                // Background
                const color = this.getColorForValue(value);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.alpha})`;
                ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Border
                if (isSelected || isEditing) {
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = STYLES.colors?.matrixCell || 'rgba(0, 255, 136, 0.2)';
                    ctx.lineWidth = 1;
                }
                ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // Value
                ctx.fillStyle = '#ffffff';
                const displayValue = isEditing ? this.editValue : value.toFixed(1);
                ctx.fillText(displayValue, cellX + this.cellSize / 2, cellY + this.cellSize / 2);
            }
        }
        
        // Plus/Minus buttons for selected cell
        if (this.selectedCell) {
            const row = this.selectedCell.row;
            const col = this.selectedCell.col;
            const cellX = matrixX + col * this.cellSize;
            const cellY = matrixY + row * this.cellSize;
            
            // Plus button (above)
            const btnUpX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnUpY = cellY - this.buttonSize - 4;
            
            ctx.fillStyle = 'rgba(0, 200, 0, 0.8)';
            ctx.fillRect(btnUpX, btnUpY, this.buttonSize, this.buttonSize);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 1;
            ctx.strokeRect(btnUpX, btnUpY, this.buttonSize, this.buttonSize);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', btnUpX + this.buttonSize / 2, btnUpY + this.buttonSize / 2);
            
            // Minus button (below)
            const btnDownX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnDownY = cellY + this.cellSize + 4;
            
            ctx.fillStyle = 'rgba(200, 0, 0, 0.8)';
            ctx.fillRect(btnDownX, btnDownY, this.buttonSize, this.buttonSize);
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 1;
            ctx.strokeRect(btnDownX, btnDownY, this.buttonSize, this.buttonSize);
            
            ctx.fillStyle = '#ffffff';
            ctx.fillText('-', btnDownX + this.buttonSize / 2, btnDownY + this.buttonSize / 2);
        }
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        super.update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y);
        
        const matrixX = x + this.labelWidth;
        const matrixY = y + this.headerHeight;
        
        // Check buttons first (work even during editing)
        if (this.selectedCell && mouseClicked) {
            const row = this.selectedCell.row;
            const col = this.selectedCell.col;
            const cellX = matrixX + col * this.cellSize;
            const cellY = matrixY + row * this.cellSize;
            
            // Plus button
            const btnUpX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnUpY = cellY - this.buttonSize - 4;
            
            if (mouseX >= btnUpX && mouseX <= btnUpX + this.buttonSize &&
                mouseY >= btnUpY && mouseY <= btnUpY + this.buttonSize) {
                // Cancel editing if active, then adjust value
                this.editingCell = null;
                this.editValue = '';
                const currentValue = this.getValue(row, col);
                const newValue = Math.min(this.maxValue, currentValue + this.valueStep);
                this.setValue(row, col, newValue);
                return;
            }
            
            // Minus button
            const btnDownX = cellX + this.cellSize / 2 - this.buttonSize / 2;
            const btnDownY = cellY + this.cellSize + 4;
            
            if (mouseX >= btnDownX && mouseX <= btnDownX + this.buttonSize &&
                mouseY >= btnDownY && mouseY <= btnDownY + this.buttonSize) {
                // Cancel editing if active, then adjust value
                this.editingCell = null;
                this.editValue = '';
                const currentValue = this.getValue(row, col);
                const newValue = Math.max(this.minValue, currentValue - this.valueStep);
                this.setValue(row, col, newValue);
                return;
            }
        }
        
        // Check matrix cells
        if (mouseX >= matrixX && mouseX <= matrixX + this.cols * this.cellSize &&
            mouseY >= matrixY && mouseY <= matrixY + this.rows * this.cellSize) {
            
            const col = Math.floor((mouseX - matrixX) / this.cellSize);
            const row = Math.floor((mouseY - matrixY) / this.cellSize);
            
            if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
                // Check if clicking the same cell that is already selected
                const sameCell = this.selectedCell && 
                                this.selectedCell.row === row && 
                                this.selectedCell.col === col;
                
                this.selectedCell = { row, col };
                
                if (mouseClicked && sameCell) {
                    // Second click on same cell - start or stop editing
                    if (this.editingCell && 
                        this.editingCell.row === row && 
                        this.editingCell.col === col) {
                        // Submit edit
                        const newValue = parseFloat(this.editValue);
                        if (!isNaN(newValue)) {
                            const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, newValue));
                            this.setValue(row, col, clampedValue);
                        }
                        this.editingCell = null;
                        this.editValue = '';
                    } else {
                        // Start editing
                        this.editingCell = { row, col };
                        this.editValue = this.getValue(row, col).toString();
                    }
                }
            }
        } else {
            if (!mouseDown) {
                this.selectedCell = null;
            }
            
            if (mouseClicked && this.editingCell) {
                this.editingCell = null;
                this.editValue = '';
            }
        }
    }
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatrixItem };
}


// ═══ ui/Styles.js ═══

// ═══════════════════════════════════════════════════════════════
//   UI STYLES
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Complete styling system for Canvas UI

const STYLES = {
    fonts: {
        main: '12px Courier New',           // Normal text
        mainBold: 'bold 12px Courier New',  // Titles, buttons
        small: '12px Courier New'           // Sections (lowercase text)
    },
    colors: {
        panel: '#00FF88',          // Green (buttons, frames, default text)
        text: '#00FF88',           // Green text (default)
        stats: '#00F5FF',          // Cyan text (statistics)
        sectionDim: 'rgba(0, 255, 136, 0.5)',
        scrollbarTrack: 'rgba(0, 0, 0, 0.3)',
        sliderTrack: 'rgba(0, 0, 0, 0.3)',
        sliderFill: '#00FF88',
        
        // Buttons & Controls
        buttonBg: 'rgba(0, 255, 136, 0.15)',         // Button background
        sliderBorder: 'rgba(0, 255, 136, 0.3)',      // Slider track border
        
        // Matrix
        matrixCell: 'rgba(0, 255, 136, 0.2)',        // Matrix cell border
        
        // Taskbar & Menu
        taskbarBg: 'rgba(0, 0, 0, 0.9)',             // Taskbar background
        menuBg: 'rgba(0, 0, 0, 0.95)',               // Menu background
        menuItemHud: 'rgba(0, 245, 255, 0.20)',      // HUD window in menu (cyan) - OPT-B: increased from 0.15
        menuItemMin: 'rgba(0, 255, 136, 0.15)',      // Minimized window in menu (green)
        menuItemNormal: 'rgba(0, 255, 136, 0.05)',   // Normal window in menu
        taskbarButtonBg: 'rgba(0, 255, 136, 0.2)',   // Taskbar button background
        startButtonBg: 'rgba(0, 255, 136, 0.1)',     // Start button background
        
        // Simulation Modes
        fullscreenBg: 'rgba(255, 68, 68, 0.2)',      // Red - HUD mode for simulations
        
        // Window Modes
        windowFullscreen: 'rgba(255, 255, 0, 0.2)'   // Yellow - fullscreen windows
    },
    spacing: {
        padding: 10,
        itemSpacing: 8,
        headerHeight: 26,
        buttonSize: 20,
        buttonSpacing: 4,
        lineHeight: 18,
        scrollbarWidth: 8
    },
    panel: {
        bgColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: '#00FF88',
        borderWidth: 2,
        headerBgColor: 'rgba(0, 255, 136, 0.2)'
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STYLES;
}

// ═══ ui/WindowManager.js ═══

// ═══════════════════════════════════════════════════════════════
//   WINDOW MANAGER
// ═══════════════════════════════════════════════════════════════
// Simplified version extracted from Petrie Dish v5.1-C2
// Manages multiple windows, z-index, and rendering

class WindowManager {
    constructor() {
        this.windows = [];
        this.activeWindow = null;
    }
    
    add(window) {
        this.windows.push(window);
        window.zIndex = this.windows.length;
    }
    
    remove(window) {
        const index = this.windows.indexOf(window);
        if (index > -1) {
            this.windows.splice(index, 1);
        }
    }
    
    bringToFront(window) {
        const index = this.windows.indexOf(window);
        if (index > -1) {
            this.windows.splice(index, 1);
            this.windows.push(window);
            
            // Update z-indices
            this.windows.forEach((w, i) => {
                w.zIndex = i;
            });
        }
    }
    
    draw(ctx, STYLES) {
        // OPT: Draw only visible/transparent windows (skip invisible)
        for (let window of this.windows) {
            // Skip completely invisible windows (not transparent, not visible)
            if (!window.visible && !window.transparent) continue;
            
            window.draw(ctx, STYLES);
        }
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked) {
        // OPT: Early exit if no interaction needed
        const hasInteraction = mouseDown || mouseClicked;
        
        // Find top window under mouse (only if mouse is down or clicked)
        let topWindow = null;
        if (hasInteraction) {
            for (let i = this.windows.length - 1; i >= 0; i--) {
                const window = this.windows[i];
                // Check if visible (or transparent) and not minimized
                const isInteractive = (window.visible || window.transparent) && !window.minimized;
                if (window.containsPoint(mouseX, mouseY) && isInteractive) {
                    topWindow = window;
                    break;
                }
            }
        }
        
        // Update windows (OPT: skip invisible & minimized)
        for (let window of this.windows) {
            // OPT: Skip completely invisible/minimized windows (no dynamic text to update)
            if (!window.visible && !window.transparent && window.minimized) continue;
            
            if (window === topWindow) {
                // Top window gets real mouse coordinates and state
                window.update(mouseX, mouseY, mouseDown, mouseClicked);
            } else {
                // CRITICAL: Other windows MUST get mouseDown=false
                // Otherwise sliders/items keep dragging state!
                window.update(-1, -1, false, false);
            }
        }
    }
    
    handleMouseDown(x, y) {
        // Check from top to bottom (reverse order)
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const window = this.windows[i];
            
            // Skip invisible (unless transparent) or minimized windows
            if ((!window.visible && !window.transparent) || window.minimized) {
                continue;
            }
            
            // Check if click is within window
            if (window.containsPoint(x, y)) {
                // Try to start drag (header, scrollbar, etc.)
                const handled = window.startDrag(x, y);
                
                // If not handled (e.g., clicked outside header/scrollbar), don't block
                if (!handled) {
                    continue; // Try next window
                }
                
                // Set as active window regardless (for handleClick in handleMouseUp)
                this.activeWindow = window;
                this.bringToFront(window);
                
                // OPT: Conditional logging (disable in production for performance)
                // console.log('🎯 Window clicked:', window.title, 'z-index:', window.zIndex);
                return true;
            }
        }
        return false;
    }
    
    handleMouseMove(x, y) {
        if (this.activeWindow) {
            // Call drag() if ANY dragging is active (window, scrollbar, resize)
            if (this.activeWindow.isDragging || this.activeWindow.isDraggingThumb || this.activeWindow.isResizing) {
                this.activeWindow.drag(x, y);
            }
        }
    }
    
    handleMouseUp(x, y) {
        if (this.activeWindow) {
            this.activeWindow.stopDrag();
            this.activeWindow = null;
        }
    }
    
    handleWheel(x, y, deltaY) {
        // Find window under mouse
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const window = this.windows[i];
            if (window.containsPoint(x, y)) {
                window.handleScroll(deltaY);
                return true;
            }
        }
        return false;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WindowManager;
}


// ═══ ui/Taskbar.js ═══

// ═══════════════════════════════════════════════════════════════
//   TASKBAR (Windows-style)
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Windows-style taskbar with menu and window management


class Taskbar {
    constructor(simulationManager = null) {
        // Mode system
        this.simulationManager = simulationManager;
        
        this.buttonHeight = 32;
        this.verticalPadding = PADDING_TASKBAR_VERTICAL;
        this.height = this.buttonHeight + this.verticalPadding * 2;
        this.menuOpen = false;
        this.menuWidth = 200;
        this.menuItemHeight = 36;
        this.buttonWidth = 100;
        this.buttonSpacing = 4;
        this.startButtonWidth = 80;
        this.buttonPadding = PADDING_BUTTON_HORIZONTAL;
        
        // Menu items - names from windows
        this.menuItems = [];
        
        // OPT-11: Button position cache + canvas size tracking + window tracking
        this.cachedPositions = [];
        this.cachedCount = 0;
        this.cachedWindowKey = ''; // Track which windows are in taskbar
        this.cachedCanvasWidth = 0;
        this.cachedCanvasHeight = 0;
    }
    
    // Calculate dynamic button width based on text
    getButtonWidth(text, ctx, measureTextCached) {
        ctx.font = '12px Courier New';
        const textWidth = measureTextCached ? 
            measureTextCached(ctx, text, '12px Courier New') :
            ctx.measureText(text).width;
        return textWidth + this.buttonPadding * 2;
    }
    
    getMenuHeight() {
        // Dynamic menu height based on items
        let totalHeight = PADDING_MENU * 2;
        for (let i = 0; i < this.menuItems.length; i++) {
            const item = this.menuItems[i];
            if (item.type === 'section') {
                totalHeight += HEIGHT_MENU_SECTION;
            } else if (item.type === 'window') {
                totalHeight += this.menuItemHeight;
            }
        }
        return totalHeight;
    }

    addSection(title) {
        // Add section header to menu
        this.menuItems.push({            type: 'section',
            title: title
        });
    }
    
    addWindowItem(title, window, section = null, simId = null) {
        // Add window to menu with custom display title
        const windowItem = {
            type: 'window',
            title: title,
            windowTitle: window.title,
            window: window,
            simId: simId,  // NEW: simulation ID for mode coloring
            isOpen: true
        };
        
        if (section) {
            // Find section and insert after it
            const sectionIndex = this.menuItems.findIndex(item => 
                item.type === 'section' && item.title === section
            );
            if (sectionIndex >= 0) {
                // Insert right after section
                this.menuItems.splice(sectionIndex + 1, 0, windowItem);
                return;
            }
        }
        
        // Default: add at end
        this.menuItems.push(windowItem);
    }    
    removeWindowItem(window) {
        // Remove window from taskbar menu
        const index = this.menuItems.findIndex(item => 
            item.type === 'window' && item.window === window
        );
        if (index > -1) {
            this.menuItems.splice(index, 1);
        }
    }

    /**
     * Restore window to normal state (unified logic)
     * Used by both menu clicks and taskbar button clicks
     * 
     * @param {Object} item - Menu item with window reference
     * @param {WindowManager} windowManager - Window manager instance
     */
    restoreWindow(item, windowManager) {
        // Regular window restore logic
        if (item.window.fullscreen) {
            // Restore from fullscreen
            item.window.toggleFullscreen();
        } else {
            // Restore from minimized/transparent/hidden
            item.window.visible = true;
            item.window.minimized = false;
            item.window.transparent = false;
        }
        
        // Always bring to front and ensure in window manager
        if (windowManager) {
            if (!windowManager.windows.includes(item.window)) {
                windowManager.add(item.window);
            }
            windowManager.bringToFront(item.window);
        }
        
        item.isOpen = true;
    }


    getStartButtonBounds(canvasHeight) {
        return {
            x: this.verticalPadding,
            y: canvasHeight - this.height + this.verticalPadding,
            width: this.startButtonWidth,
            height: this.buttonHeight
        };
    }

    getMenuBounds(canvasHeight) {
        const menuHeight = this.getMenuHeight();
        return {
            x: this.verticalPadding,
            y: canvasHeight - this.height - menuHeight,
            width: this.menuWidth,
            height: menuHeight
        };
    }

    getTaskbarButtonBounds(index, ctx, taskbarWindows, measureTextCached) {
        // OPT-11: Cache positions + invalidate on canvas resize OR window change
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Create cache key from window titles (detects window changes)
        const windowKey = taskbarWindows.map(item => item.title).join('|');
        
        // Invalidate cache if window list OR canvas size changed
        if (this.cachedWindowKey !== windowKey ||
            this.cachedCanvasWidth !== canvasWidth ||
            this.cachedCanvasHeight !== canvasHeight) {
            
            this.cachedPositions = [];
            let x = this.startButtonWidth + 8;
            const y = canvasHeight - this.height + this.verticalPadding;
            
            for (let i = 0; i < taskbarWindows.length; i++) {
                const item = taskbarWindows[i];
                const width = this.getButtonWidth(item.title, ctx, measureTextCached);
                
                this.cachedPositions.push({                    x: x,
                    y: y,
                    width: width,
                    height: this.buttonHeight
                });
                
                x += width + this.buttonSpacing;
            }
            
            // Update cache state
            this.cachedWindowKey = windowKey;
            this.cachedCount = taskbarWindows.length;
            this.cachedCanvasWidth = canvasWidth;
            this.cachedCanvasHeight = canvasHeight;
        }
        
        return this.cachedPositions[index];
    }


    handleClick(mouseX, mouseY, ctx, windowManager, measureTextCached) {
        const canvasHeight = ctx.canvas.height;
        
        // Check start button
        const startBtn = this.getStartButtonBounds(canvasHeight);
        if (mouseX >= startBtn.x && mouseX <= startBtn.x + startBtn.width &&
            mouseY >= startBtn.y && mouseY <= startBtn.y + startBtn.height) {
            this.menuOpen = !this.menuOpen;
            return true;
        }

        // Check menu items if open
        if (this.menuOpen) {
            const menu = this.getMenuBounds(canvasHeight);
            const padding = 8;
            let currentY = menu.y + padding;
            
            for (let i = 0; i < this.menuItems.length; i++) {
                const item = this.menuItems[i];
                
                if (item.type === 'section') {
                    currentY += 24;
                    continue;
                } else if (item.type === 'window') {
                    const itemHeight = this.menuItemHeight;
                    
                    if (mouseX >= menu.x && mouseX <= menu.x + menu.width &&
                        mouseY >= currentY && mouseY <= currentY + itemHeight) {
                        
                        // OPT-B: Use unified restore function
                        this.restoreWindow(item, windowManager);
                        
                        this.menuOpen = false;
                        return true;
                    }
                    
                    currentY += itemHeight;
                }
            }
        }

        // Check taskbar buttons (simulation windows OR minimized/transparent regular windows)
        const taskbarWindows = this.menuItems.filter(item => {
            if (item.type !== 'window') return false;
            
            // Show windows if fullscreen, minimized, OR transparent (HUD)
            if (item.window.fullscreen) return true;
            if (item.window.minimized && !item.window.visible) return true;
            if (item.window.transparent) return true; // HUD mode - show on taskbar
            return false;
        });
        
        for (let i = 0; i < taskbarWindows.length; i++) {
            const btn = this.getTaskbarButtonBounds(i, ctx, taskbarWindows, measureTextCached);
            
            if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                
                // OPT-B: Use unified restore function
                const item = taskbarWindows[i];
                this.restoreWindow(item, windowManager);
                
                return true;
            }
        }
        // If menu is open, any click closes it
        if (this.menuOpen) {
            this.menuOpen = false;
            return true;
        }
        
        // Block clicks on entire taskbar area
        const taskbarY = canvasHeight - this.height;
        if (mouseY >= taskbarY) {
            return true;
        }

        return false;
    }


    draw(ctx, STYLES, measureTextCached) {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Taskbar background
        ctx.fillStyle = STYLES.colors.taskbarBg;
        ctx.fillRect(0, canvasHeight - this.height, canvasWidth, this.height);
        
        // Taskbar border
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight - this.height);
        ctx.lineTo(canvasWidth, canvasHeight - this.height);
        ctx.stroke();

        // Start button
        const startBtn = this.getStartButtonBounds(canvasHeight);
        
        ctx.fillStyle = STYLES.colors.startButtonBg;
        ctx.fillRect(startBtn.x, startBtn.y, startBtn.width, startBtn.height);
        
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.strokeRect(startBtn.x, startBtn.y, startBtn.width, startBtn.height);
        
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MENU', startBtn.x + startBtn.width / 2, startBtn.y + startBtn.height / 2);

        // Menu (if open)
        if (this.menuOpen) {
            const menu = this.getMenuBounds(canvasHeight);
            
            // Menu background
            ctx.fillStyle = STYLES.colors.menuBg;
            ctx.fillRect(menu.x, menu.y, menu.width, menu.height);
            
            // Menu border
            ctx.strokeStyle = STYLES.colors.panel;
            ctx.lineWidth = 2;
            ctx.strokeRect(menu.x, menu.y, menu.width, menu.height);
            
            // Menu items
            let currentY = menu.y + PADDING_MENU;            
            for (let i = 0; i < this.menuItems.length; i++) {
                const item = this.menuItems[i];
                
                if (item.type === 'section') {
                    // Section header (centered like in windows)
                    const sectionHeight = HEIGHT_MENU_SECTION;
                    const sectionY = currentY + sectionHeight / 2;
                    
                    ctx.strokeStyle = STYLES.colors.sectionDim;
                    ctx.fillStyle = STYLES.colors.sectionDim;
                    ctx.font = STYLES.fonts.small;
                    ctx.lineWidth = 1;
                    
                    // Measure title for centering
                    const titleWidth = ctx.measureText(item.title).width;
                    const totalWidth = menu.width - 16; // 8px padding each side
                    const lineLength = (totalWidth - titleWidth - 8) / 2; // 8px spacing around title
                    
                    // Left line
                    ctx.beginPath();
                    ctx.moveTo(menu.x + 8, sectionY);
                    ctx.lineTo(menu.x + 8 + lineLength, sectionY);
                    ctx.stroke();
                    
                    // Title (centered, lowercase like in windows)
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const titleX = menu.x + 8 + lineLength + 4;
                    ctx.fillText(item.title, titleX, sectionY); // No toUpperCase()
                                        
                    // Right line
                    ctx.beginPath();
                    ctx.moveTo(titleX + titleWidth + 4, sectionY);
                    ctx.lineTo(menu.x + menu.width - 8, sectionY);
                    ctx.stroke();
                    
                    currentY += sectionHeight;
                } else if (item.type === 'window') {
                    // Window item
                    const itemHeight = this.menuItemHeight;
                    
                    // Color based on window state only
                    let bgColor;
                    
                    const isFullscreen = item.window.fullscreen;
                    const isTransparent = item.window.transparent; // HUD mode (visible or not)
                    const isMinimized = item.window.minimized && !item.window.visible;
                    
                    if (isFullscreen) {
                        bgColor = STYLES.colors.windowFullscreen; // Yellow
                    } else if (isTransparent) {
                        bgColor = STYLES.colors.menuItemHud;      // Cyan (HUD)
                    } else if (isMinimized) {
                        bgColor = STYLES.colors.menuItemMin;      // Green
                    } else {
                        bgColor = STYLES.colors.menuItemNormal;   // Normal
                    }
                    
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(menu.x + 4, currentY + SPACING_MENU_ITEM, menu.width - 8, itemHeight - SPACING_MENU_ITEM * 2);
                    
                    // Item text
                    ctx.fillStyle = STYLES.colors.panel;
                    ctx.font = STYLES.fonts.mainBold;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.title.toUpperCase(), menu.x + 12, currentY + itemHeight / 2);
                    
                    currentY += itemHeight;
                }
            }
        }

        // Taskbar buttons (simulation windows OR minimized/transparent/fullscreen regular windows)
        const taskbarWindows = this.menuItems.filter(item => {
            if (item.type !== 'window') return false;
            
            // Show windows if fullscreen, minimized, OR transparent (HUD)
            if (item.window.fullscreen) return true;
            if (item.window.minimized && !item.window.visible) return true;
            if (item.window.transparent) return true; // HUD mode - show on taskbar
            return false;
        });
        
        for (let i = 0; i < taskbarWindows.length; i++) {
            const btn = this.getTaskbarButtonBounds(i, ctx, taskbarWindows, measureTextCached);
            const item = taskbarWindows[i];
            
            // MODE SYSTEM: Button colors based on simulation mode or window state
            let borderColor, textColor, bgColor;
            
            // ALWAYS use green for border and text on taskbar buttons
            borderColor = STYLES.colors.panel;   // Green border (always!)
            textColor = STYLES.colors.panel;     // Green text (always!)
            
            // Background color based on window state only
            const isFullscreen = item.window.fullscreen;
            const isTransparent = item.window.transparent;
            const isMinimized = item.window.minimized;
            
            if (isFullscreen) {
                bgColor = STYLES.colors.windowFullscreen; // Yellow
            } else if (isTransparent) {
                bgColor = STYLES.colors.menuItemHud;      // Cyan (HUD)
            } else if (isMinimized) {
                bgColor = STYLES.colors.menuItemMin;      // Green
            } else {
                bgColor = STYLES.colors.taskbarButtonBg;  // Default
            }
            
            // Button background
            ctx.fillStyle = bgColor;
            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
            
            // Button border
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
            
            // Button text
            ctx.fillStyle = textColor;
            ctx.font = STYLES.fonts.mainBold;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.title.toUpperCase(), btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Taskbar;
}

// ═══ ui/EventRouter.js ═══

// ═══════════════════════════════════════════════════════════════
//   EVENT ROUTER
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Centralized event handling for UI

/**
 * EventRouter - Centralized event handling for UI
 * Manages mouse, keyboard, and wheel events
 * Coordinates between windows, taskbar, and camera
 */
class EventRouter {
    constructor(canvas, camera, windowManager, taskbar, statsWindow = null) {
        this.canvas = canvas;
        this.camera = camera;
        this.windowManager = windowManager;
        this.taskbar = taskbar;
        this.statsWindow = statsWindow;
        
        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        this.mouseClicked = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.clickedWindow = null;
        
        // Panning state (for camera)
        this.isPanning = false;
        this.panStarted = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panThreshold = 5;
        
        this.attachListeners();
    }
    
    attachListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    }
    
    handleMouseDown(e) {
        this.mouseDown = true;
        this.mouseClicked = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        // Check taskbar FIRST (highest priority)
        if (this.taskbar) {
            const ctx = this.canvas.getContext('2d');
            if (this.taskbar.handleClick(e.clientX, e.clientY, ctx, this.windowManager)) {
                e.preventDefault();
                this.clickedWindow = null;
                this.isPanning = false;
                this.mouseClicked = false;
                return;
            }
        }

        // WindowManager handles all windows
        if (this.windowManager.handleMouseDown(e.clientX, e.clientY)) {
            this.clickedWindow = this.windowManager.activeWindow;
            e.preventDefault();
            this.isPanning = false;
        } else {
            // Start camera panning
            this.clickedWindow = null;
            this.isPanning = true;
            this.panStarted = false;
            this.panStartX = e.clientX;
            this.panStartY = e.clientY;
        }
    }
    
    handleMouseUp(e) {
        if (this.windowManager) {
            this.windowManager.handleMouseUp(e.clientX, e.clientY);
        }
        
        this.clickedWindow = null;
        this.mouseDown = false;
        this.mouseClicked = false;
        this.isPanning = false;
        this.panStarted = false;
    }
    
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        // OPT: Early exit when nothing to do (no hover needed!)
        // Skip processing if not dragging and no active window
        if (!this.mouseDown && !this.windowManager.activeWindow && !this.isPanning) {
            return;
        }

        if (this.windowManager && this.windowManager.activeWindow) {
            this.windowManager.handleMouseMove(e.clientX, e.clientY);
        } else if (this.isPanning && this.camera) {
            // Check threshold before starting actual pan
            if (!this.panStarted) {
                const dx = e.clientX - this.panStartX;
                const dy = e.clientY - this.panStartY;
                // OPT: Compare squared distances (avoid Math.sqrt)
                const distSq = dx * dx + dy * dy;
                
                if (distSq >= this.panThreshold * this.panThreshold) {
                    this.panStarted = true;
                    this.lastMouseX = e.clientX;
                    this.lastMouseY = e.clientY;
                }
            } else {
                // Already panning
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                if (this.camera.pan) {
                    this.camera.pan(dx, dy);
                }
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        }
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        // Check windows for scrolling
        if (this.windowManager && this.windowManager.handleWheel(e.clientX, e.clientY, e.deltaY)) {
            return;
        }
        
        // Otherwise, zoom camera (if available)
        if (this.camera && this.camera.setZoom) {
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = (this.camera.targetZoom || this.camera.zoom) * factor;
            this.camera.setZoom(newZoom, e.clientX, e.clientY);
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventRouter;
}


// ═══ ui/BaseWindow.js ═══

// ═══════════════════════════════════════════════════════════════
//   BASE WINDOW (REFACTORED)
// ═══════════════════════════════════════════════════════════════
// Modular architecture with ui/core/ and ui/components/

// Core imports


// Item classes (separate files)


// Component imports (for header/scrollbar only)


/**
 * BaseWindow - Draggable window with UI controls
 * 
 * Features:
 * - Header buttons: Close (X), Minimize (_), Eye (👁)
 * - Buttons, Toggles, Sliders, Text, Sections
 * - Dragging
 * - Scrolling with scrollbar
 * - Minimize/maximize
 * - Transparency toggle
 */
class BaseWindow {
    constructor(x, y, title, type = 'panel') {
        this.x = x;
        this.y = y;
        this.title = title;
        this.type = type;
        this.width = 300;
        this.height = 200;
        
        // State
        this.visible = false;
        this.minimized = false;
        this.transparent = false;
        this.fullscreen = false;        // NEW: fullscreen mode (maximize)
        this.zIndex = 0;
        
        // Fullscreen restore data
        this.restoreX = x;
        this.restoreY = y;
        this.restoreWidth = 300;
        this.restoreHeight = 200;
        
        // Dragging
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragThreshold = 5;
        this.dragMoved = false;
        
        // Resizing
        this.isResizing = false;
        this.minWidth = 200;
        this.minHeight = 150;
        this.resizeHandleSize = 12;
        this.manuallyResized = false; // Flag to prevent auto-resize
        
        // Scrollbar
        this.scrollOffset = 0;
        this.isDraggingThumb = false;
        this.thumbDragOffset = 0;
        
        // Layout (use constants)
        this.padding = CONST.SPACING_PADDING;
        this.itemSpacing = CONST.SPACING_ITEM;
        this.headerHeight = CONST.HEIGHT_HEADER;
        
        // Content
        this.items = [];
        this.contentHeight = 0;
        this.layoutDirty = true;
        
        // OPT-1: Layout cache (30-50% performance gain!)
        this.layoutCache = null;
        
        // Hooks for simulation windows
        this.onMinimize = null;            // Called when minimize button clicked
        this.onToggleTransparent = null;   // Called when eye button clicked
        this.onClose = null;               // Called when close button clicked (already existed)
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   ADD ITEMS
    // ═══════════════════════════════════════════════════════════════
    
    addButton(label, callback) {
        this.items.push(new ButtonItem(label, callback));
        this.layoutDirty = true;
    }
    
    addToggle(label, getValue, setValue) {
        this.items.push(new ToggleItem(label, getValue, setValue));
        this.layoutDirty = true;
    }
    
    addSlider(label, getValue, setValue, min, max, step = 0.01) {
        this.items.push(new SliderItem(label, getValue, setValue, min, max, step));
        this.layoutDirty = true;
    }
    
    /**
     * Add text with automatic color based on last section type
     * @param {string|function} text - Text or function returning text
     * @param {string|null} color - Color (null = auto from section)
     */
    addText(text, color = null) {
        // Auto color: if null, use last section's type
        if (color === null) {
            const lastSection = this.getLastSection();
            if (lastSection && lastSection.sectionType === 'statistics') {
                color = '#00F5FF'; // Auto cyan for statistics sections
            } else {
                color = '#00ff88'; // Default green
            }
        }
        this.items.push(new TextItem(text, color));
        this.layoutDirty = true;
    }
    
    /**
     * Add section separator (unified API)
     * @param {string} title - Section title
     * @param {string} type - 'standard' (green) or 'statistics' (cyan)
     */
    addSection(title, type = 'standard') {
        this.items.push(new SectionItem(title, type));
        this.layoutDirty = true;
    }
    
    /**
     * Add simulation view - displays simulation canvas content
     * @param {HTMLCanvasElement} simCanvas - Simulation canvas to display
     * @param {number} height - Height of the view in pixels
     */
    addSimulationView(simCanvas, height = 200) {
        const item = new SimulationViewItem(simCanvas, height);
        this.items.push(item);
        this.layoutDirty = true;
    }

    
    /**
     * Get last section item (for auto color detection)
     * @returns {SectionItem|null}
     */
    getLastSection() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].type === 'section') {
                return this.items[i];
            }
        }
        return null;
    }
    
    /**
     * Add interactive matrix - editable value grid
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @param {function} getValue - (row, col) => value
     * @param {function} setValue - (row, col, value) => void
     * @param {number} minValue - Minimum allowed value
     * @param {number} maxValue - Maximum allowed value
     * @param {string} label - Matrix label
     */
    addMatrix(rows, cols, getValue, setValue, minValue = -1, maxValue = 1, label = 'Matrix') {
        this.items.push(new MatrixItem(rows, cols, getValue, setValue, minValue, maxValue, label));
        this.layoutDirty = true;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   HIT TESTING
    // ═══════════════════════════════════════════════════════════════
    
    containsPoint(x, y) {
        return rectHit(x, y, this.x, this.y, this.width, this.height);
    }
    
    containsHeader(x, y) {
        return rectHit(x, y, this.x, this.y, this.width, this.headerHeight);
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   LAYOUT & SIZE
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * OPT-1: Get cached layout (30-50% performance gain!)
     * Recomputes only when layoutDirty = true
     * For windows with dynamic text, always recompute to get fresh values
     */
    getLayout() {
        // Check if window has dynamic text items (functions)
        const hasDynamicText = this.items.some(item => 
            item.type === 'text' && typeof item.text === 'function'
        );
        
        // For dynamic text windows, always recompute layout
        if (hasDynamicText || this.layoutDirty || !this.layoutCache) {
            this.layoutCache = computeLayout(this.items, this);
        }
        return this.layoutCache;
    }
    
    calculateSize(ctx) {
        if (!this.layoutDirty) return;
        
        // Skip auto-resize if user manually resized the window
        if (this.manuallyResized) {
            // Only recalculate contentHeight for scrollbar
            const layout = this.getLayout();
            this.contentHeight = this.headerHeight + this.padding;
            if (layout.length > 0) {
                const lastItem = layout[layout.length - 1];
                this.contentHeight = lastItem.y + lastItem.height + this.padding;
            }
            
            const maxScroll = Math.max(0, this.contentHeight - this.height);
            this.scrollOffset = clamp(this.scrollOffset, 0, maxScroll);
            return;
        }
        
        // Title width
        ctx.font = '12px Courier New'; // STYLES.fonts.main equivalent
        const titleWidth = measureTextCached(ctx, this.title, ctx.font);
        let maxWidth = titleWidth + this.headerHeight + CONST.SIZE_BUTTON * 3 + CONST.SPACING_BUTTON * 4;
        
        // Calculate width from items
        for (const item of this.items) {
            if (item.type === 'toggle') {
                const textWidth = measureTextCached(ctx, item.label, ctx.font);
                // Checkbox (16px) + spacing (12px) + text + window padding
                maxWidth = Math.max(maxWidth, 16 + 12 + textWidth + this.padding * 2);
            } else if (item.type === 'button') {
                ctx.font = 'bold 12px Courier New';
                const buttonTextWidth = measureTextCached(ctx, item.label, ctx.font);
                maxWidth = Math.max(maxWidth, buttonTextWidth + 32 + this.padding * 2);
                ctx.font = '12px Courier New';
            } else if (item.type === 'slider') {
                // Slider: label + value display (both left and right aligned)
                const labelWidth = measureTextCached(ctx, item.label, ctx.font);
                const valueWidth = measureTextCached(ctx, '00.00', ctx.font); // Max value width
                maxWidth = Math.max(maxWidth, labelWidth + valueWidth + 40 + this.padding * 2);
            } else if (item.type === 'text') {
                // Text: skip width calculation (word wrap handles this)
                // Minimum width based on average line length
                maxWidth = Math.max(maxWidth, 300 + this.padding * 2);
            } else if (item.type === 'section') {
                // Section: title + decorative lines
                const sectionWidth = measureTextCached(ctx, item.title, ctx.font);
                maxWidth = Math.max(maxWidth, sectionWidth + 80 + this.padding * 2);
            }
        }
        
        // Calculate content height using cached layout
        const layout = this.getLayout();
        this.contentHeight = this.headerHeight + this.padding;
        if (layout.length > 0) {
            const lastItem = layout[layout.length - 1];
            this.contentHeight = lastItem.y + lastItem.height + this.padding;
        }
        
        // Set final size
        if (this.minimized) {
            this.width = maxWidth;
            this.height = this.headerHeight;
        } else {
            this.width = maxWidth;
            const maxHeight = Math.floor(window.innerHeight * 0.5);
            this.height = Math.min(this.contentHeight, maxHeight);
            
            // Add scrollbar width if needed
            if (this.contentHeight > this.height) {
                this.width += CONST.WIDTH_SCROLLBAR + 4;
            }
            
            // Clamp scroll offset
            const maxScroll = Math.max(0, this.contentHeight - this.height);
            this.scrollOffset = clamp(this.scrollOffset, 0, maxScroll);
        }
        
        this.layoutDirty = false;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   DRAGGING & RESIZING
    // ═══════════════════════════════════════════════════════════════
    
    getResizeHandleBounds() {
        return {
            x: this.x + this.width - this.resizeHandleSize,
            y: this.y + this.height - this.resizeHandleSize,
            width: this.resizeHandleSize,
            height: this.resizeHandleSize
        };
    }
    
    startDrag(mouseX, mouseY) {
        // Check resize handle first (skip in transparent or fullscreen mode)
        if (!this.transparent && !this.fullscreen) {
            const resizeHandle = this.getResizeHandleBounds();
            if (rectHit(mouseX, mouseY, resizeHandle.x, resizeHandle.y, resizeHandle.width, resizeHandle.height)) {
                this.isResizing = true;
                return true;
            }
        }
        
        // Check scrollbar first
        if (hitScrollbarThumb(this, mouseX, mouseY)) {
            this.isDraggingThumb = true;
            const scroll = computeScrollbar(this);
            if (scroll) {
                this.thumbDragOffset = mouseY - scroll.thumb.y;
            }
            return true; // Handled
        }
        
        if (hitScrollbarTrack(this, mouseX, mouseY)) {
            // Click on track - jump to position
            const scroll = computeScrollbar(this);
            if (scroll) {
                const clickRatio = (mouseY - scroll.track.y) / scroll.track.height;
                const maxScroll = this.contentHeight - this.height;
                this.scrollOffset = clamp(clickRatio * maxScroll, 0, maxScroll);
            }
            return true; // Handled
        }
        
        // Check header buttons (skip in transparent mode - header not visible)
        if (!this.transparent && this.containsHeader(mouseX, mouseY)) {
            for (let i = 0; i < 4; i++) { // 4 buttons now: eye, maximize, minimize, close
                const btn = getHeaderButtonBounds(this, i);
                if (rectHit(mouseX, mouseY, btn.x, btn.y, btn.width, btn.height)) {
                    if (i === 0) {
                        // Transparent button - toggle HUD mode
                        if (this.onToggleTransparent) {
                            // Custom logic for simulations
                            this.onToggleTransparent();
                        } else {
                            // Default logic for normal windows - just toggle transparent
                            // DON'T set visible=false! Window stays in same place
                            this.transparent = !this.transparent;
                        }
                    }
                    if (i === 1) {
                        // Maximize button - toggle fullscreen
                        this.toggleFullscreen();
                    }
                    if (i === 2) { 
                        // Minimize button
                        if (this.onMinimize) {
                            // Custom logic for simulations (e.g., go to fullscreen)
                            this.onMinimize();
                        } else {
                            // Default logic for normal windows
                            this.minimized = true;
                            this.visible = false;
                            this.layoutDirty = true;
                        }
                    }
                    if (i === 3) {
                        // Close button
                        this.visible = false;
                        if (this.onClose && typeof this.onClose === 'function') {
                            this.onClose();
                        }
                    }
                    return true; // Button clicked - handled
                }
            }
            
            // Start window drag
            this.isDragging = true;
            this.dragOffsetX = mouseX - this.x;
            this.dragOffsetY = mouseY - this.y;
            this.dragStartX = mouseX;
            this.dragStartY = mouseY;
            this.dragMoved = false;
            return true; // Drag started
        }
        
        return false; // Not in header, not handled
    }
    
    drag(mouseX, mouseY) {
        if (this.isResizing) {
            // Resize window
            const newWidth = mouseX - this.x;
            const newHeight = mouseY - this.y;
            this.width = Math.max(this.minWidth, newWidth);
            this.height = Math.max(this.minHeight, newHeight);
            this.layoutDirty = true;
            this.manuallyResized = true; // Mark as manually resized
        } else if (this.isDraggingThumb) {
            const scroll = computeScrollbar(this);
            if (scroll) {
                const newThumbY = mouseY - this.thumbDragOffset;
                const maxThumbY = scroll.track.y + scroll.track.height - scroll.thumb.height;
                const clampedThumbY = clamp(newThumbY, scroll.track.y, maxThumbY);
                const scrollRatio = (clampedThumbY - scroll.track.y) / (scroll.track.height - scroll.thumb.height);
                const maxScroll = this.contentHeight - this.height;
                this.scrollOffset = clamp(scrollRatio * maxScroll, 0, maxScroll);
            }
        } else if (this.isDragging) {
            const dx = mouseX - this.dragStartX;
            const dy = mouseY - this.dragStartY;
            if (dx * dx + dy * dy > this.dragThreshold * this.dragThreshold) {
                this.dragMoved = true;
            }
            if (this.dragMoved) {
                this.x = mouseX - this.dragOffsetX;
                this.y = mouseY - this.dragOffsetY;
            }
        }
    }
    
    stopDrag() {
        this.isDragging = false;
        this.isDraggingThumb = false;
        this.isResizing = false;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   FULLSCREEN MODE
    // ═══════════════════════════════════════════════════════════════
    
    toggleFullscreen() {
        if (this.fullscreen) {
            // Restore from fullscreen
            this.x = this.restoreX;
            this.y = this.restoreY;
            this.width = this.restoreWidth;
            this.height = this.restoreHeight;
            this.fullscreen = false;
            this.layoutDirty = true;
        } else {
            // Save current size/position
            this.restoreX = this.x;
            this.restoreY = this.y;
            this.restoreWidth = this.width;
            this.restoreHeight = this.height;
            
            // Go fullscreen - use window dimensions
            this.x = 0;
            this.y = 0;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.fullscreen = true;
            this.layoutDirty = true;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   MOUSE INTERACTION
    // ═══════════════════════════════════════════════════════════════
    
    handleScroll(deltaY) {
        if (this.contentHeight <= this.height) return false;
        
        const scrollSpeed = 30;
        this.scrollOffset += deltaY > 0 ? scrollSpeed : -scrollSpeed;
        const maxScroll = Math.max(0, this.contentHeight - this.height);
        this.scrollOffset = clamp(this.scrollOffset, 0, maxScroll);
        return true;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //   DRAWING
    // ═══════════════════════════════════════════════════════════════
    
    draw(ctx, STYLES) {
        // Don't draw if invisible (unless transparent or fullscreen)
        if (!this.visible && !this.transparent && !this.fullscreen) return;
        
        this.calculateSize(ctx);
        
        if (this.minimized) {
            drawMinimizedHeader(ctx, this, STYLES);
            return;
        }
        
        // Window background (skip in transparent or fullscreen mode)
        if (!this.transparent && !this.fullscreen) {
            ctx.fillStyle = STYLES.panel.bgColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = this.isDragging ? STYLES.colors.panelHover : STYLES.panel.borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        // Header (skip in transparent or fullscreen mode - NO HEADER at all!)
        if (!this.transparent && !this.fullscreen) {
            drawHeader(ctx, this, STYLES);
        }
        
        // Content (with clipping)
        const contentX = this.x;
        const contentY = (this.transparent || this.fullscreen) ? this.y : (this.y + this.headerHeight);
        const contentWidth = this.width;
        const contentHeight = (this.transparent || this.fullscreen) ? this.height : (this.height - this.headerHeight);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(contentX, contentY, contentWidth, contentHeight);
        ctx.clip();
        
        const layout = this.getLayout();
        for (const entry of layout) {
            const { item, y } = entry;
            const adjustedY = y - this.scrollOffset;
            
            // CRITICAL: Convert to absolute screen position for culling
            const absoluteY = this.y + adjustedY;
            
            // Cull items outside view (using absolute coordinates)
            if (absoluteY + entry.height < contentY || absoluteY > contentY + contentHeight) continue;
            
            // Pass STYLES to item and call its draw method
            item.STYLES = STYLES;
            // Use absolute position for drawing
            item.draw(ctx, this, this.x + this.padding, absoluteY);
        }
        
        ctx.restore();
        
        // Scrollbar (skip in transparent or fullscreen mode)
        if (!this.transparent && !this.fullscreen) {
            drawScrollbar(ctx, this, STYLES);
        }
        
        // Resize handle (skip in transparent or fullscreen mode)
        if (!this.transparent && !this.fullscreen) {
            const handle = this.getResizeHandleBounds();
            ctx.fillStyle = STYLES.colors?.panel || '#00ff88';
            ctx.beginPath();
            ctx.moveTo(handle.x + handle.width, handle.y);
            ctx.lineTo(handle.x + handle.width, handle.y + handle.height);
            ctx.lineTo(handle.x, handle.y + handle.height);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked) {
        // Skip update if invisible (unless transparent mode) or minimized
        if ((!this.visible && !this.transparent) || this.minimized) return;

        // Check if mouse is in content area
        const contentTop = this.transparent ? this.y : (this.y + this.headerHeight);
        const contentBottom = this.y + this.height;
        const mouseInContentArea = mouseY >= contentTop && mouseY <= contentBottom &&
                                  mouseX >= this.x && mouseX <= this.x + this.width;

        const layout = this.getLayout();
        
        // Update each item using their own update() methods
        for (const entry of layout) {
            const { item, y } = entry;
            const adjustedY = y - this.scrollOffset;
            const itemX = this.x + this.padding;
            
            // CRITICAL: Convert to absolute screen position
            const absoluteY = this.y + adjustedY;
            
            // Check if item is in visible area (using absolute coordinates)
            const itemHeight = item.getHeight ? item.getHeight(this) : 20;
            const itemTop = absoluteY;
            const itemBottom = absoluteY + itemHeight;
            const isInVisibleArea = itemBottom > contentTop && itemTop < contentBottom;
            
            // BUGFIX: Always call update() to handle drag state properly
            // Items need mouseDown=false to stop dragging even when mouse leaves area
            if (isInVisibleArea && mouseInContentArea) {
                // Visible and mouse in area: normal update
                item.STYLES = this.STYLES;
                item.update(mouseX, mouseY, mouseDown, mouseClicked, this, itemX, absoluteY);
            } else {
                // Not visible or mouse outside: pass mouseDown to stop any dragging
                item.STYLES = this.STYLES;
                item.update(-1, -1, mouseDown, false, this, itemX, absoluteY);
                
                // Reset hover state
                if (item.hovered !== undefined) {
                    item.hovered = false;
                }
            }
        }
    }
}




    // ═══════════════════════════════════════════════════════════════
    //   EXPORT TO GLOBAL
    // ═══════════════════════════════════════════════════════════════
    
    global.UI = {
        // Core
        CONST: typeof CONST !== 'undefined' ? CONST : {},
        rectHit: typeof rectHit !== 'undefined' ? rectHit : null,
        circleHit: typeof circleHit !== 'undefined' ? circleHit : null,
        clamp: typeof clamp !== 'undefined' ? clamp : null,
        measureTextCached: typeof measureTextCached !== 'undefined' ? measureTextCached : null,
        clearTextCache: typeof clearTextCache !== 'undefined' ? clearTextCache : null,
        
        // Main classes
        STYLES: typeof STYLES !== 'undefined' ? STYLES : {},
        BaseWindow: typeof BaseWindow !== 'undefined' ? BaseWindow : null,
        WindowManager: typeof WindowManager !== 'undefined' ? WindowManager : null,
        Taskbar: typeof Taskbar !== 'undefined' ? Taskbar : null,
        EventRouter: typeof EventRouter !== 'undefined' ? EventRouter : null
    };
    
    console.log('✅ UI Library v2.0.0 loaded (modular)!');
    console.log('📦 Modules: core (4) + components (7) + main (5)');
    console.log('🎯 Ready: new UI.BaseWindow(x, y, title)');

})(typeof window !== 'undefined' ? window : global);
