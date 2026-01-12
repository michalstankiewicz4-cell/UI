// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   UI LIBRARY - COMPLETE BUNDLE (MODULAR)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Single-file bundle of entire UI system
// Extracted from Petrie Dish v5.1-C2
// 
// Version: 2.0.0 (Modular Architecture)
// Date: 2026-01-12
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
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

(function(global) {
    'use strict';


// â•â•â• ui/core/geometry.js â•â•â•

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
 * Check if point is inside circle
 */
function circleHit(x, y, cx, cy, radius) {
    const dx = x - cx;
    const dy = y - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Inverse linear interpolation (get t from value)
 */
function unlerp(a, b, value) {
    return (value - a) / (b - a);
}


// â•â•â• ui/core/text-cache.js â•â•â•

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


// â•â•â• ui/core/constants.js â•â•â•

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
    SIZE_TOGGLE_CHECKBOX
};


// â•â•â• ui/core/layout.js â•â•â•

// ═══════════════════════════════════════════════════════════════
//   LAYOUT ENGINE
// ═══════════════════════════════════════════════════════════════
// Compute positions and heights for all UI elements


/**
 * Get height for a single item
 */
function getItemHeight(item) {
    switch (item.type) {
        case 'button': return HEIGHT_BUTTON;
        case 'slider': return HEIGHT_SLIDER;
        case 'toggle': return HEIGHT_TOGGLE;
        case 'section': return HEIGHT_SECTION;
        case 'text': {
            const lines = item.lines || 1;
            return lines * HEIGHT_TEXT_LINE;
        }
        case 'matrix': {
            // Matrix: 16×16 cells + labels + title
            return 16 * item.cellSize + item.labelWidth + 30;
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
        const height = getItemHeight(item);
        
        layout.push({
            type: item.type,
            y: currentY,
            height: height,
            item: item
        });
        
        currentY += height + SPACING_ITEM;
    }
    
    return layout;
}


// â•â•â• ui/components/header.js â•â•â•

// ═══════════════════════════════════════════════════════════════
//   WINDOW HEADER
// ═══════════════════════════════════════════════════════════════


/**
 * Get header button bounds (close, minimize, eye)
 */
function getHeaderButtonBounds(window, index) {
    const x = window.x + window.width - SIZE_BUTTON * (3 - index) 
        - SPACING_BUTTON * (3 - index) - window.padding;
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
    
    // Title
    ctx.fillStyle = window.isDragging ? STYLES.colors.panelHover : STYLES.colors.panel;
    ctx.font = STYLES.fonts.mainBold;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.title, window.x + window.padding, window.y + HEIGHT_HEADER / 2);
    
    // Buttons
    drawHeaderButtons(ctx, window, STYLES);
}

/**
 * Draw header buttons (eye, minimize, close)
 */
function drawHeaderButtons(ctx, window, STYLES) {
    // Eye button (transparent toggle) - index 0
    const eyeBtn = getHeaderButtonBounds(window, 0);
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
    
    const eyeX = eyeBtn.x + eyeBtn.width / 2;
    const eyeY = eyeBtn.y + eyeBtn.height / 2;
    const eyeRadius = 4;
    
    if (window.transparent) {
        // Closed eye (line)
        ctx.beginPath();
        ctx.moveTo(eyeX - eyeRadius, eyeY);
        ctx.lineTo(eyeX + eyeRadius, eyeY);
        ctx.stroke();
    } else {
        // Open eye (ellipse + dot)
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, eyeRadius, eyeRadius * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Minimize button - index 1
    const minBtn = getHeaderButtonBounds(window, 1);
    ctx.strokeRect(minBtn.x, minBtn.y, minBtn.width, minBtn.height);
    ctx.fillStyle = STYLES.colors.panel;
    ctx.fillRect(minBtn.x + 4, minBtn.y + minBtn.height / 2 - 1, minBtn.width - 8, 2);
    
    // Close button - index 2
    const closeBtn = getHeaderButtonBounds(window, 2);
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


// â•â•â• ui/components/scrollbar.js â•â•â•

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


// â•â•â• ui/components/UIItem.js â•â•â•

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
        // Update hover state
        const width = window.width - window.padding * 2;
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


// â•â•â• ui/components/ToggleItem.js â•â•â•

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
        
        // Label
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.main;
        ctx.fillText(this.label, checkboxX + checkboxSize + 8, checkboxY + 12);
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


// â•â•â• ui/components/ButtonItem.js â•â•â•

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

    draw(ctx, window, x, y) {
        const width = window.width - window.padding * 2;
        const height = this.getHeight(window);
        const STYLES = this.STYLES || window.STYLES;
        
        // Button background
        ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Button text (centered)
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.textAlign = 'center';
        ctx.fillText(this.label, x + width / 2, y + height / 2 + 4);
        ctx.textAlign = 'left'; // Reset
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


// â•â•â• ui/components/SliderItem.js â•â•â•

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


// â•â•â• ui/components/SectionItem.js â•â•â•

// ═══════════════════════════════════════════════════════════════
//   SECTION ITEM
// ═══════════════════════════════════════════════════════════════


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


// â•â•â• ui/components/TextItem.js â•â•â•

// ═══════════════════════════════════════════════════════════════
//   TEXT ITEM
// ═══════════════════════════════════════════════════════════════


/**
 * TextItem - Static text display
 */
class TextItem extends UIItem {
    constructor(text, color = '#00ff88') {
        super('text');
        this.text = text;
        this.color = color;
    }

    getHeight(window) {
        return 18; // Line height
    }

    draw(ctx, window, x, y) {
        const STYLES = this.STYLES || window.STYLES;
        ctx.fillStyle = this.color;
        ctx.font = STYLES.fonts.main;
        ctx.fillText(this.text, x, y + 14);
    }

    update(mouseX, mouseY, mouseDown, mouseClicked, window, x, y) {
        // Text doesn't interact
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextItem };
}


// â•â•â• ui/Styles.js â•â•â•

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
        sliderFill: '#00FF88'
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


// â•â•â• ui/WindowManager.js â•â•â•

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
        // Draw windows in z-index order
        for (let window of this.windows) {
            window.draw(ctx, STYLES);
        }
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked) {
        // Find top window under mouse
        let topWindow = null;
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const window = this.windows[i];
            if (window.containsPoint(mouseX, mouseY) && window.visible && !window.minimized) {
                topWindow = window;
                break;
            }
        }
        
        // Update all windows
        for (let window of this.windows) {
            if (window === topWindow) {
                // Top window gets real mouse coordinates
                window.update(mouseX, mouseY, mouseDown, mouseClicked);
            } else {
                // Other windows get dummy coordinates (no interaction)
                window.update(-1, -1, mouseDown, false);
            }
        }
    }
    
    handleMouseDown(x, y) {
        // Check from top to bottom (reverse order)
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const window = this.windows[i];
            
            // Check if click is within window
            if (window.containsPoint(x, y)) {
                // Try to start drag (header, scrollbar, etc.)
                window.startDrag(x, y);
                
                // Set as active window regardless (for handleClick in handleMouseUp)
                this.activeWindow = window;
                this.bringToFront(window);
                return true;
            }
        }
        return false;
    }
    
    handleMouseMove(x, y) {
        if (this.activeWindow) {
            // Call drag() if ANY dragging is active (window, scrollbar)
            if (this.activeWindow.isDragging || this.activeWindow.isDraggingThumb) {
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


// â•â•â• ui/Taskbar.js â•â•â•

// ═══════════════════════════════════════════════════════════════
//   TASKBAR (Windows-style)
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Windows-style taskbar with menu and window management

class Taskbar {
    constructor() {
        this.buttonHeight = 32;
        this.verticalPadding = 4; // Small padding above/below button
        this.height = this.buttonHeight + this.verticalPadding * 2; // 32 + 8 = 40
        this.menuOpen = false;
        this.menuWidth = 200;
        this.menuItemHeight = 36;
        this.buttonWidth = 100;
        this.buttonSpacing = 4;
        this.startButtonWidth = 80;
        this.buttonPadding = 16; // Horizontal padding for buttons
        
        // Menu items - names from windows
        this.menuItems = [];
        
        // OPT-11: Button position cache + canvas size tracking
        this.cachedPositions = [];
        this.cachedCount = 0;
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
        let totalHeight = 16; // padding (8px top + 8px bottom)
        for (let i = 0; i < this.menuItems.length; i++) {
            const item = this.menuItems[i];
            if (item.type === 'section') {
                totalHeight += 24; // Section height
            } else if (item.type === 'window') {
                totalHeight += this.menuItemHeight;
            }
        }
        return totalHeight;
    }

    addSection(title) {
        // Add section header to menu
        this.menuItems.push({
            type: 'section',
            title: title
        });
    }
    
    addWindowItem(title, window, section = null) {
        // Add window to menu with custom display title
        const windowItem = {
            type: 'window',
            title: title,
            windowTitle: window.title,
            window: window,
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

    getTaskbarButtonBounds(index, ctx, minimizedWindows, measureTextCached) {
        // OPT-11: Cache positions + invalidate on canvas resize
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        
        // Invalidate cache if window count OR canvas size changed
        if (this.cachedCount !== minimizedWindows.length ||
            this.cachedCanvasWidth !== canvasWidth ||
            this.cachedCanvasHeight !== canvasHeight) {
            
            this.cachedPositions = [];
            let x = this.startButtonWidth + 8;
            const y = canvasHeight - this.height + this.verticalPadding;
            
            for (let i = 0; i < minimizedWindows.length; i++) {
                const item = minimizedWindows[i];
                const width = this.getButtonWidth(item.title, ctx, measureTextCached);
                
                this.cachedPositions.push({
                    x: x,
                    y: y,
                    width: width,
                    height: this.buttonHeight
                });
                
                x += width + this.buttonSpacing;
            }
            
            // Update cache state
            this.cachedCount = minimizedWindows.length;
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
                        
                        // Toggle window visibility
                        if (!item.window.visible) {
                            // Window was closed - add it back to manager
                            item.window.visible = true;
                            item.window.minimized = false;
                            if (windowManager) {
                                // Check if window is in manager
                                if (!windowManager.windows.includes(item.window)) {
                                    windowManager.add(item.window);
                                }
                                windowManager.bringToFront(item.window);
                            }
                        } else {
                            // Window is open - just bring to front
                            if (windowManager) {
                                windowManager.bringToFront(item.window);
                            }
                        }
                        item.isOpen = true;
                        
                        this.menuOpen = false;
                        return true;
                    }
                    
                    currentY += itemHeight;
                }
            }
        }

        // Check taskbar buttons (minimized windows)
        const minimizedWindows = this.menuItems.filter(item => 
            item.type === 'window' && item.window.minimized && !item.window.visible
        );
        
        for (let i = 0; i < minimizedWindows.length; i++) {
            const btn = this.getTaskbarButtonBounds(i, ctx, minimizedWindows, measureTextCached);
            
            if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                
                // Restore window
                minimizedWindows[i].window.visible = true;
                minimizedWindows[i].window.minimized = false;
                if (windowManager) {
                    // Check if window is in manager
                    if (!windowManager.windows.includes(minimizedWindows[i].window)) {
                        windowManager.add(minimizedWindows[i].window);
                    }
                    windowManager.bringToFront(minimizedWindows[i].window);
                }
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, canvasHeight - this.height, canvasWidth, this.height);
        
        // Taskbar border
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight - this.height);
        ctx.lineTo(canvasWidth, canvasHeight - this.height);
        ctx.stroke();

        // Start button
        const startBtn = this.getStartButtonBounds(canvasHeight);
        
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fillRect(menu.x, menu.y, menu.width, menu.height);
            
            // Menu border
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(menu.x, menu.y, menu.width, menu.height);
            
            // Menu items
            const padding = 8;
            let currentY = menu.y + padding;
            
            for (let i = 0; i < this.menuItems.length; i++) {
                const item = this.menuItems[i];
                
                if (item.type === 'section') {
                    // Section header (centered like in windows)
                    const sectionHeight = 24;
                    const sectionY = currentY + sectionHeight / 2;
                    
                    ctx.strokeStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
                    ctx.fillStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
                    ctx.font = STYLES.fonts.small;  // Use small font for sections
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
                    
                    // Title (centered)
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    const titleX = menu.x + 8 + lineLength + 4;
                    ctx.fillText(item.title.toUpperCase(), titleX, sectionY);
                    
                    // Right line
                    ctx.beginPath();
                    ctx.moveTo(titleX + titleWidth + 4, sectionY);
                    ctx.lineTo(menu.x + menu.width - 8, sectionY);
                    ctx.stroke();
                    
                    currentY += sectionHeight;
                } else if (item.type === 'window') {
                    // Window item
                    const itemHeight = this.menuItemHeight;
                    
                    // Item background
                    ctx.fillStyle = 'rgba(0, 255, 136, 0.05)';
                    ctx.fillRect(menu.x + 4, currentY + 2, menu.width - 8, itemHeight - 4);
                    
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

        // Taskbar buttons (minimized windows)
        const minimizedWindows = this.menuItems.filter(item => 
            item.type === 'window' && item.window.minimized && !item.window.visible
        );
        
        for (let i = 0; i < minimizedWindows.length; i++) {
            const btn = this.getTaskbarButtonBounds(i, ctx, minimizedWindows, measureTextCached);
            const item = minimizedWindows[i];
            
            // Button background
            ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
            ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
            
            // Button border
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
            
            // Button text
            ctx.fillStyle = '#00ff88';
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


// â•â•â• ui/EventRouter.js â•â•â•

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


// â•â•â• ui/BaseWindow.js â•â•â•

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
        this.zIndex = 0;
        
        // Dragging
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragThreshold = 5;
        this.dragMoved = false;
        
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
    
    addText(text, color = '#00ff88', lines = null) {
        this.items.push(new TextItem(text, color));
        this.layoutDirty = true;
    }
    
    addSection(title) {
        this.items.push(new SectionItem(title));
        this.layoutDirty = true;
    }
    
    addMatrix(getMatrix, setMatrix, colorNames) {
        this.items.push({
            type: 'matrix',
            getMatrix: getMatrix,
            setMatrix: setMatrix,
            colorNames: colorNames,
            cellSize: 18,
            labelWidth: 30
        });
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
     */
    getLayout() {
        if (this.layoutDirty || !this.layoutCache) {
            this.layoutCache = computeLayout(this.items, this);
        }
        return this.layoutCache;
    }
    
    calculateSize(ctx) {
        if (!this.layoutDirty) return;
        
        // Title width
        ctx.font = '12px Courier New'; // STYLES.fonts.main equivalent
        const titleWidth = measureTextCached(ctx, this.title, ctx.font);
        let maxWidth = titleWidth + this.headerHeight + CONST.SIZE_BUTTON * 3 + CONST.SPACING_BUTTON * 4;
        
        // Calculate width from items
        for (const item of this.items) {
            if (item.type === 'toggle') {
                const textWidth = measureTextCached(ctx, item.label, ctx.font);
                maxWidth = Math.max(maxWidth, textWidth + 30 + this.padding * 2);
            } else if (item.type === 'button') {
                ctx.font = 'bold 12px Courier New';
                const buttonTextWidth = measureTextCached(ctx, item.label, ctx.font);
                maxWidth = Math.max(maxWidth, buttonTextWidth + 32 + this.padding * 2);
                ctx.font = '12px Courier New';
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
    //   DRAGGING
    // ═══════════════════════════════════════════════════════════════
    
    startDrag(mouseX, mouseY) {
        // Check scrollbar first
        if (hitScrollbarThumb(this, mouseX, mouseY)) {
            this.isDraggingThumb = true;
            const scroll = computeScrollbar(this);
            if (scroll) {
                this.thumbDragOffset = mouseY - scroll.thumb.y;
            }
            return;
        }
        
        if (hitScrollbarTrack(this, mouseX, mouseY)) {
            // Click on track - jump to position
            const scroll = computeScrollbar(this);
            if (scroll) {
                const clickRatio = (mouseY - scroll.track.y) / scroll.track.height;
                const maxScroll = this.contentHeight - this.height;
                this.scrollOffset = clamp(clickRatio * maxScroll, 0, maxScroll);
            }
            return;
        }
        
        // Check header buttons
        if (this.containsHeader(mouseX, mouseY)) {
            for (let i = 0; i < 3; i++) {
                const btn = getHeaderButtonBounds(this, i);
                if (rectHit(mouseX, mouseY, btn.x, btn.y, btn.width, btn.height)) {
                    if (i === 0) this.transparent = !this.transparent;
                    if (i === 1) this.minimized = !this.minimized; this.layoutDirty = true;
                    if (i === 2) this.visible = false;
                    return;
                }
            }
            
            // Start window drag
            this.isDragging = true;
            this.dragOffsetX = mouseX - this.x;
            this.dragOffsetY = mouseY - this.y;
            this.dragStartX = mouseX;
            this.dragStartY = mouseY;
            this.dragMoved = false;
        }
    }
    
    drag(mouseX, mouseY) {
        if (this.isDraggingThumb) {
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
        if (!this.visible) return;
        
        this.calculateSize(ctx);
        
        if (this.minimized) {
            drawMinimizedHeader(ctx, this, STYLES);
            return;
        }
        
        // Window background
        if (!this.transparent) {
            ctx.fillStyle = STYLES.panel.bgColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = this.isDragging ? STYLES.colors.panelHover : STYLES.panel.borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        // Header
        drawHeader(ctx, this, STYLES);
        
        // Content (with clipping)
        const contentX = this.x;
        const contentY = this.y + this.headerHeight;
        const contentWidth = this.width;
        const contentHeight = this.height - this.headerHeight;
        
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
        
        // Scrollbar
        drawScrollbar(ctx, this, STYLES);
    }
    
    // Matrix drawing (kept inline - too complex for component)
    drawMatrix(ctx, item, y, STYLES) {
        const matrix = item.getMatrix();
        
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('INTERACTION MATRIX', this.x + this.padding, y + 12);
        
        const matrixStartY = y + 25;
        const matrixX = this.x + item.labelWidth;
        const matrixY = matrixStartY + 15;
        
        ctx.font = '9px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Column labels
        for (let col = 0; col < 16; col++) {
            const labelX = matrixX + col * item.cellSize + item.cellSize / 2;
            const labelY = matrixY - 10;
            ctx.fillStyle = STYLES.colors.panel;
            ctx.fillText(item.colorNames[col].substring(0, 2), labelX, labelY);
        }
        
        // Rows
        for (let row = 0; row < 16; row++) {
            const labelX = this.x + item.labelWidth - 5;
            const labelY = matrixY + row * item.cellSize + item.cellSize / 2;
            ctx.fillStyle = STYLES.colors.panel;
            ctx.textAlign = 'right';
            ctx.fillText(item.colorNames[row].substring(0, 2), labelX, labelY);
            ctx.textAlign = 'center';
            
            for (let col = 0; col < 16; col++) {
                const cellX = matrixX + col * item.cellSize;
                const cellY = matrixY + row * item.cellSize;
                const value = matrix[row][col];
                
                const normalized = (value + 2) / 4;
                let r, g, b;
                if (normalized < 0.5) {
                    r = 255; g = Math.floor(normalized * 2 * 255); b = 0;
                } else {
                    r = Math.floor((1 - (normalized - 0.5) * 2) * 255); g = 255; b = 0;
                }
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
                ctx.fillRect(cellX, cellY, item.cellSize, item.cellSize);
                
                ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX, cellY, item.cellSize, item.cellSize);
            }
        }
    }
    
    update(mouseX, mouseY, mouseDown, mouseClicked) {
        if (!this.visible || this.minimized) return;

        // Check if mouse is in content area
        const contentTop = this.y + this.headerHeight;
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
            
            // Only update if visible and mouse in content area
            if (isInVisibleArea && mouseInContentArea) {
                // Pass STYLES to item for drawing
                item.STYLES = this.STYLES;
                // Use absolute position
                item.update(mouseX, mouseY, mouseDown, mouseClicked, this, itemX, absoluteY);
            } else {
                // Reset hover if not visible
                if (item.hovered !== undefined) {
                    item.hovered = false;
                }
            }
        }
    }
}




    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    //   EXPORT TO GLOBAL
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
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
    
    console.log('âś… UI Library v2.0.0 loaded (modular)!');
    console.log('đź“¦ Modules: core (4) + components (7) + main (5)');
    console.log('đźŽŻ Ready: new UI.BaseWindow(x, y, title)');

})(typeof window !== 'undefined' ? window : global);
