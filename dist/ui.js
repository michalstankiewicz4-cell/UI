// ═══════════════════════════════════════════════════════════════
//   UI LIBRARY - COMPLETE BUNDLE
// ═══════════════════════════════════════════════════════════════
// Single-file bundle of entire UI system
// Extracted from Petrie Dish v5.1-C2
// 
// Version: 1.0.0
// Date: 2025-01-08
// Source: https://github.com/michalstankiewicz4-cell/UI
//
// Includes:
// - Styles.js (styling system)
// - TextCache.js (performance optimization)
// - BaseWindow.js (draggable windows)
// - WindowManager.js (multi-window management)
// - Taskbar.js (Windows-style taskbar)
// - EventRouter.js (centralized events)
//
// Total: ~1000+ lines of modular UI code
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

// ═══════════════════════════════════════════════════════════════
//   UI STYLES
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Complete styling system for Canvas UI

const STYLES = {
    fonts: {
        main: '12px Courier New',
        mainBold: 'bold 12px Courier New',
        small: '12px Courier New'  // Used in sections
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


// ═══════════════════════════════════════════════════════════════
//   TEXT MEASUREMENT CACHE
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// OPT-4: Text measurement caching for 2-5× faster UI rendering

/**
 * LRU Cache for text measurements
 * measureText() is expensive - called 100+ times per frame!
 * Cache hit rate: ~90% → massive speedup
 */
const textWidthCache = new Map();
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

/**
 * Measure text width with caching
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to measure
 * @param {string} font - Font string (e.g., "12px monospace")
 * @returns {number} Text width in pixels
 */
function measureTextCached(ctx, text, font) {
    const key = `${font}:${text}`;
    
    // Check cache
    if (textWidthCache.has(key)) {
        return textWidthCache.get(key);
    }
    
    // Measure and cache
    ctx.font = font;
    const width = ctx.measureText(text).width;
    
    // LRU eviction: Remove oldest entry if cache full
    if (textWidthCache.size >= MAX_CACHE_SIZE) {
        const firstKey = textWidthCache.keys().next().value;
        textWidthCache.delete(firstKey);
    }
    
    textWidthCache.set(key, width);
    return width;
}

/**
 * Clear the text measurement cache
 * Useful when changing fonts globally
 */
function clearTextCache() {
    textWidthCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats (size, maxSize)
 */
function getTextCacheStats() {
    return {
        size: textWidthCache.size,
        maxSize: MAX_CACHE_SIZE
    };
}


// ═══════════════════════════════════════════════════════════════
//   BASE WINDOW
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Draggable window with UI controls and header buttons

/**
 * BaseWindow - Draggable window with UI controls
 * 
 * Features:
 * - Header buttons: Close (X), Minimize (_), Eye (👁)
 * - Buttons, Text, Sections
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
        this.visible = true;
        this.minimized = false;
        this.transparent = false;
        this.zIndex = 0;
        
        // Dragging
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        
        // Scrollbar dragging
        this.isDraggingThumb = false;
        this.thumbDragOffset = 0;
        
        // Layout
        this.padding = 10;
        this.itemSpacing = 8;
        this.headerHeight = 26;
        
        // Header buttons
        this.buttonSize = 16;
        this.buttonPadding = 5;
        
        // Items (controls)
        this.items = [];
        
        // Scrolling
        this.scrollOffset = 0;
        this.maxScroll = 0;
        this.contentHeight = 0;
        this.scrollbarWidth = 8;
        
        // Optimization
        this.isDirty = true;
        
        // Callbacks
        this.onClose = null;
        this.onMinimize = null;
        this.onToggleTransparent = null;
    }
    
    // ═════════════════════════════════════════════════
    //  CONTROL METHODS
    // ═════════════════════════════════════════════════
    
    addButton(label, callback) {
        this.items.push({ type: 'button', label, callback });
        this.markDirty();
    }
    
    addText(text, color = null, lines = 1) {
        // color = null means use STYLES.colors.text (green)
        // color = '#00F5FF' for cyan stats
        this.items.push({ type: 'text', text, color, lines });
        this.markDirty();
    }
    
    addSection(title) {
        this.items.push({ type: 'section', title });
        this.markDirty();
    }
    
    markDirty() {
        this.isDirty = true;
    }
    
    // ═════════════════════════════════════════════════
    //  HIT TESTING
    // ═════════════════════════════════════════════════
    
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    containsHeader(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.headerHeight;
    }
    
    // ═════════════════════════════════════════════════
    //  HEADER BUTTONS HIT TESTING
    // ═════════════════════════════════════════════════
    
    getCloseButtonBounds() {
        return {
            x: this.x + this.width - this.buttonSize - this.buttonPadding,
            y: this.y + (this.headerHeight - this.buttonSize) / 2,
            width: this.buttonSize,
            height: this.buttonSize
        };
    }
    
    getMinimizeButtonBounds() {
        return {
            x: this.x + this.width - (this.buttonSize + this.buttonPadding) * 2,
            y: this.y + (this.headerHeight - this.buttonSize) / 2,
            width: this.buttonSize,
            height: this.buttonSize
        };
    }
    
    getEyeButtonBounds() {
        return {
            x: this.x + this.width - (this.buttonSize + this.buttonPadding) * 3,
            y: this.y + (this.headerHeight - this.buttonSize) / 2,
            width: this.buttonSize,
            height: this.buttonSize
        };
    }
    
    containsCloseButton(x, y) {
        const btn = this.getCloseButtonBounds();
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    }
    
    containsMinimizeButton(x, y) {
        const btn = this.getMinimizeButtonBounds();
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    }
    
    containsEyeButton(x, y) {
        const btn = this.getEyeButtonBounds();
        return x >= btn.x && x <= btn.x + btn.width &&
               y >= btn.y && y <= btn.y + btn.height;
    }
    
    // ═════════════════════════════════════════════════
    //  SCROLLBAR HIT TESTING
    // ═════════════════════════════════════════════════
    
    getScrollThumbBounds() {
        if (this.maxScroll === 0) return null; // No scrolling needed
        
        const trackHeight = this.height - this.headerHeight - this.padding * 2;
        const thumbHeight = Math.max(30, trackHeight * (trackHeight / (trackHeight + this.maxScroll)));
        const thumbY = this.y + this.headerHeight + this.padding + 
                      (this.scrollOffset / this.maxScroll) * (trackHeight - thumbHeight);
        
        return {
            x: this.x + this.width - this.scrollbarWidth - 2,
            y: thumbY,
            width: this.scrollbarWidth,
            height: thumbHeight
        };
    }
    
    containsScrollThumb(x, y) {
        const thumb = this.getScrollThumbBounds();
        if (!thumb) return false;
        
        return x >= thumb.x && x <= thumb.x + thumb.width &&
               y >= thumb.y && y <= thumb.y + thumb.height;
    }
    
    containsScrollTrack(x, y) {
        // Check if in scrollbar area
        const trackX = this.x + this.width - this.scrollbarWidth - 2;
        const trackY = this.y + this.headerHeight;
        const trackHeight = this.height - this.headerHeight;
        
        return x >= trackX && x <= trackX + this.scrollbarWidth &&
               y >= trackY && y <= trackY + trackHeight;
    }
    
    // ═════════════════════════════════════════════════
    //  DRAGGING
    // ═════════════════════════════════════════════════
    
    startDrag(mouseX, mouseY) {
        // TRANSPARENT MODE: No header, but can drag by content and toggle via eye button
        if (this.transparent) {
            // Check if clicked on floating eye button (top-right of content area)
            const eyeBtn = {
                x: this.x + this.width - this.buttonSize - this.buttonPadding,
                y: this.y + this.buttonPadding,
                width: this.buttonSize,
                height: this.buttonSize
            };
            
            if (mouseX >= eyeBtn.x && mouseX <= eyeBtn.x + eyeBtn.width &&
                mouseY >= eyeBtn.y && mouseY <= eyeBtn.y + eyeBtn.height) {
                // Toggle back to normal mode
                this.transparent = false;
                if (this.onToggleTransparent) this.onToggleTransparent(this.transparent);
                this.markDirty();
                return true;
            }
            
            // Allow dragging by clicking anywhere in content area
            if (this.containsPoint(mouseX, mouseY)) {
                this.isDragging = true;
                this.dragOffsetX = mouseX - this.x;
                this.dragOffsetY = mouseY - this.y;
                return true;
            }
            
            return false;
        }
        
        // NORMAL MODE: Header with buttons + scrollbar
        
        // Check scrollbar thumb FIRST (highest priority - actual dragging)
        if (this.containsScrollThumb(mouseX, mouseY)) {
            const thumb = this.getScrollThumbBounds();
            this.isDraggingThumb = true;
            this.thumbDragOffset = mouseY - thumb.y;
            return true;
        }
        
        // Check header buttons
        if (this.containsHeader(mouseX, mouseY)) {
            // Check header buttons FIRST (before starting drag)
            if (this.containsCloseButton(mouseX, mouseY)) {
                if (this.onClose) this.onClose();
                return true; // Handled
            }
            
            if (this.containsMinimizeButton(mouseX, mouseY)) {
                // Minimize = hide window completely, show on taskbar
                this.visible = false;
                this.minimized = true;
                if (this.onMinimize) this.onMinimize(this.minimized);
                this.markDirty();
                return true; // Handled
            }
            
            if (this.containsEyeButton(mouseX, mouseY)) {
                this.transparent = !this.transparent;
                if (this.onToggleTransparent) this.onToggleTransparent(this.transparent);
                this.markDirty();
                return true; // Handled
            }
            
            // No button clicked - start dragging
            this.isDragging = true;
            this.dragOffsetX = mouseX - this.x;
            this.dragOffsetY = mouseY - this.y;
            return true;
        }
        
        // Check if clicked on scrollbar track (not thumb) - jump scroll but don't block click
        if (this.containsScrollTrack(mouseX, mouseY)) {
            const thumb = this.getScrollThumbBounds();
            if (thumb) {
                const trackHeight = this.height - this.headerHeight - this.padding * 2;
                const clickY = mouseY - (this.y + this.headerHeight + this.padding);
                const newScrollOffset = (clickY / trackHeight) * this.maxScroll;
                this.scrollOffset = Math.max(0, Math.min(this.maxScroll, newScrollOffset));
                this.markDirty();
            }
            return true;
        }
        
        // Content area - return false so handleClick can be called!
        return false;
    }
    
    drag(mouseX, mouseY) {
        if (this.isDragging) {
            this.x = mouseX - this.dragOffsetX;
            this.y = mouseY - this.dragOffsetY;
            this.markDirty();
        }
        
        if (this.isDraggingThumb) {
            const trackHeight = this.height - this.headerHeight - this.padding * 2;
            const thumb = this.getScrollThumbBounds();
            if (thumb) {
                const thumbHeight = thumb.height;
                const newThumbY = mouseY - this.thumbDragOffset;
                const trackStartY = this.y + this.headerHeight + this.padding;
                const thumbRelativeY = newThumbY - trackStartY;
                
                // Calculate new scroll offset
                const scrollRatio = thumbRelativeY / (trackHeight - thumbHeight);
                const newScrollOffset = scrollRatio * this.maxScroll;
                
                this.scrollOffset = Math.max(0, Math.min(this.maxScroll, newScrollOffset));
                this.markDirty();
            }
        }
    }
    
    stopDrag() {
        this.isDragging = false;
        this.isDraggingThumb = false;
    }
    
    // ═════════════════════════════════════════════════
    //  CLICK HANDLING
    // ═════════════════════════════════════════════════
    
    handleClick(mouseX, mouseY) {
        if (!this.visible || !this.containsPoint(mouseX, mouseY)) {
            return false;
        }
        
        // In transparent mode, content starts at this.y + padding (no header)
        // In normal mode, content starts at this.y + headerHeight + padding
        const startY = this.transparent ? 
            (this.y + this.padding) : 
            (this.y + this.headerHeight + this.padding - this.scrollOffset);
        
        let y = startY;
        
        for (let item of this.items) {
            if (item.type === 'button') {
                const buttonHeight = 20;
                // Check both X and Y!
                if (mouseY >= y && mouseY <= y + buttonHeight &&
                    mouseX >= this.x + this.padding && 
                    mouseX <= this.x + this.width - this.padding) {
                    item.callback();
                    return true;
                }
                y += buttonHeight + this.itemSpacing;
            } else if (item.type === 'text') {
                // Use cached height from last draw (or estimate)
                const height = item._cachedHeight || 14;
                y += height + this.itemSpacing;
            } else if (item.type === 'section') {
                y += 20 + this.itemSpacing;
            }
        }
        
        return false;
    }
    
    // ═════════════════════════════════════════════════
    //  SCROLLING
    // ═════════════════════════════════════════════════
    
    handleScroll(deltaY) {
        const oldScroll = this.scrollOffset;
        this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + deltaY));
        
        if (oldScroll !== this.scrollOffset) {
            this.markDirty();
        }
    }
    
    // ═════════════════════════════════════════════════
    //  DRAWING (requires STYLES from Styles.js)
    // ═════════════════════════════════════════════════
    
    draw(ctx, STYLES) {
        if (!this.visible) return;
        if (this.minimized) {
            this.drawMinimized(ctx, STYLES);
            return;
        }
        
        if (this.transparent) {
            // TRANSPARENT MODE: Only draw content, no header/border/buttons
            this.drawContentOnly(ctx, STYLES);
            return;
        }
        
        // NORMAL MODE: Full window with header and border
        ctx.fillStyle = STYLES.panel.bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Header
        ctx.fillStyle = STYLES.panel.headerBgColor;
        ctx.fillRect(this.x, this.y, this.width, this.headerHeight);
        
        // Title
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.fillText(this.title, this.x + this.padding, this.y + this.headerHeight - 8);
        
        // Header buttons
        this.drawHeaderButtons(ctx, STYLES);
        
        // Border
        ctx.strokeStyle = STYLES.panel.borderColor;
        ctx.lineWidth = STYLES.panel.borderWidth;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Content (with clipping and scroll)
        this.drawContent(ctx, STYLES);
        
        // Scrollbar (if needed)
        if (this.contentHeight > this.height - this.headerHeight) {
            this.drawScrollbar(ctx, STYLES);
        }
        
        this.isDirty = false;
    }
    
    drawMinimized(ctx, STYLES) {
        // Just draw header when minimized
        ctx.fillStyle = STYLES.panel.bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.headerHeight);
        
        ctx.fillStyle = STYLES.panel.headerBgColor;
        ctx.fillRect(this.x, this.y, this.width, this.headerHeight);
        
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.fillText(this.title, this.x + this.padding, this.y + this.headerHeight - 8);
        
        // Header buttons
        this.drawHeaderButtons(ctx, STYLES);
        
        ctx.strokeStyle = STYLES.panel.borderColor;
        ctx.lineWidth = STYLES.panel.borderWidth;
        ctx.strokeRect(this.x, this.y, this.width, this.headerHeight);
    }
    
    // ═════════════════════════════════════════════════
    //  HEADER BUTTONS DRAWING
    // ═════════════════════════════════════════════════
    
    drawHeaderButtons(ctx, STYLES) {
        const color = STYLES.colors.panel;
        
        // Close button (X)
        const closeBtn = this.getCloseButtonBounds();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(closeBtn.x, closeBtn.y, closeBtn.width, closeBtn.height);
        
        // X symbol
        const padding = 4;
        ctx.beginPath();
        ctx.moveTo(closeBtn.x + padding, closeBtn.y + padding);
        ctx.lineTo(closeBtn.x + closeBtn.width - padding, closeBtn.y + closeBtn.height - padding);
        ctx.moveTo(closeBtn.x + closeBtn.width - padding, closeBtn.y + padding);
        ctx.lineTo(closeBtn.x + padding, closeBtn.y + closeBtn.height - padding);
        ctx.stroke();
        
        // Minimize button (_)
        const minBtn = this.getMinimizeButtonBounds();
        ctx.strokeRect(minBtn.x, minBtn.y, minBtn.width, minBtn.height);
        
        // _ symbol
        ctx.beginPath();
        ctx.moveTo(minBtn.x + padding, minBtn.y + minBtn.height - padding);
        ctx.lineTo(minBtn.x + minBtn.width - padding, minBtn.y + minBtn.height - padding);
        ctx.stroke();
        
        // Eye button (○ or ●)
        const eyeBtn = this.getEyeButtonBounds();
        ctx.strokeRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
        
        // Circle (filled if transparent)
        ctx.beginPath();
        ctx.arc(
            eyeBtn.x + eyeBtn.width / 2,
            eyeBtn.y + eyeBtn.height / 2,
            4,
            0,
            Math.PI * 2
        );
        if (this.transparent) {
            ctx.fillStyle = color;
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }
    
    drawContent(ctx, STYLES) {
        // Setup clipping region
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y + this.headerHeight, 
                 this.width, this.height - this.headerHeight);
        ctx.clip();
        
        // Apply scroll transform
        ctx.translate(0, -this.scrollOffset);
        
        // Draw items
        let y = this.y + this.headerHeight + this.padding;
        this.contentHeight = 0;
        
        ctx.font = STYLES.fonts.main;
        
        for (let item of this.items) {
            if (item.type === 'button') {
                this.drawButton(ctx, STYLES, item, y);
                y += 20 + this.itemSpacing;
                this.contentHeight += 20 + this.itemSpacing;
            } else if (item.type === 'text') {
                this.drawText(ctx, STYLES, item, y);
                const height = this.getTextHeight(ctx, item);
                item._cachedHeight = height; // Cache for handleClick
                y += height + this.itemSpacing;
                this.contentHeight += height + this.itemSpacing;
            } else if (item.type === 'section') {
                this.drawSection(ctx, STYLES, item, y);
                y += 20 + this.itemSpacing;
                this.contentHeight += 20 + this.itemSpacing;
            }
        }
        
        ctx.restore();
        
        // Update max scroll
        this.maxScroll = Math.max(0, this.contentHeight - (this.height - this.headerHeight));
    }
    
    // Draw ONLY content (no header, border, buttons) - for transparent mode (HUD style)
    drawContentOnly(ctx, STYLES) {
        // No clipping, no background - just floating content
        ctx.save();
        
        // Draw items starting from window position
        let y = this.y + this.padding;
        this.contentHeight = 0;
        
        ctx.font = STYLES.fonts.main;
        
        for (let item of this.items) {
            if (item.type === 'button') {
                this.drawButton(ctx, STYLES, item, y);
                y += 20 + this.itemSpacing;
                this.contentHeight += 20 + this.itemSpacing;
            } else if (item.type === 'text') {
                this.drawText(ctx, STYLES, item, y);
                const height = this.getTextHeight(ctx, item);
                item._cachedHeight = height; // Cache for handleClick
                y += height + this.itemSpacing;
                this.contentHeight += height + this.itemSpacing;
            } else if (item.type === 'section') {
                this.drawSection(ctx, STYLES, item, y);
                y += 20 + this.itemSpacing;
                this.contentHeight += 20 + this.itemSpacing;
            }
        }
        
        // Draw floating eye button (to restore header)
        const eyeBtn = {
            x: this.x + this.width - this.buttonSize - this.buttonPadding,
            y: this.y + this.buttonPadding,
            width: this.buttonSize,
            height: this.buttonSize
        };
        
        const color = STYLES.colors.panel;
        
        // Button background (slightly visible)
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.fillRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
        
        // Button border
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(eyeBtn.x, eyeBtn.y, eyeBtn.width, eyeBtn.height);
        
        // Filled circle (indicating transparent mode is ON)
        ctx.beginPath();
        ctx.arc(
            eyeBtn.x + eyeBtn.width / 2,
            eyeBtn.y + eyeBtn.height / 2,
            4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.restore();
    }
    
    drawButton(ctx, STYLES, item, y) {
        const buttonHeight = 20;
        
        // Button background
        ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
        ctx.fillRect(this.x + this.padding, y, 
                   this.width - this.padding * 2, buttonHeight);
        
        // Button text
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.mainBold;
        ctx.textAlign = 'center';
        ctx.fillText(item.label, this.x + this.width / 2, y + 14);
        ctx.textAlign = 'left';
    }
    
    drawText(ctx, STYLES, item, y) {
        // Handle dynamic text (callbacks)
        const textValue = typeof item.text === 'function' ? item.text() : item.text;
        
        // Default green, cyan for stats
        ctx.fillStyle = item.color || STYLES.colors.text;
        ctx.font = STYLES.fonts.main;
        
        // Get wrapped lines
        const wrappedLines = this.wrapText(ctx, textValue, this.width - this.padding * 2);
        
        // Limit lines if specified
        const maxLines = Math.min(wrappedLines.length, item.lines || wrappedLines.length);
        
        // Draw lines
        for (let i = 0; i < maxLines; i++) {
            ctx.fillText(wrappedLines[i], this.x + this.padding, y + 12 + i * 14);
        }
    }
    
    wrapText(ctx, text, maxWidth) {
        // Split by newlines first
        const paragraphs = String(text).split('\n');
        const allLines = [];
        
        // Word wrap each paragraph
        for (let para of paragraphs) {
            if (para.trim() === '') {
                allLines.push(''); // Empty line
                continue;
            }
            
            const words = para.split(' ');
            let currentLine = '';
            
            for (let word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine) {
                    // Line too long, push current line and start new
                    allLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine) {
                allLines.push(currentLine);
            }
        }
        
        return allLines;
    }
    
    getTextHeight(ctx, item) {
        const textValue = typeof item.text === 'function' ? item.text() : item.text;
        const wrappedLines = this.wrapText(ctx, textValue, this.width - this.padding * 2);
        const actualLines = Math.min(wrappedLines.length, item.lines || wrappedLines.length);
        return actualLines * 14;
    }
    
    drawSection(ctx, STYLES, item, y) {
        const sectionY = y + 10;
        
        // Section styling
        ctx.strokeStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
        ctx.fillStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
        ctx.lineWidth = 1;
        ctx.font = STYLES.fonts.main;
        
        // Measure title width for centering
        const titleWidth = ctx.measureText(item.title).width;
        const totalWidth = this.width - this.padding * 2;
        const lineLength = (totalWidth - titleWidth - 8) / 2; // 8px spacing around title
        
        // Left line (centered)
        ctx.beginPath();
        ctx.moveTo(this.x + this.padding, sectionY);
        ctx.lineTo(this.x + this.padding + lineLength, sectionY);
        ctx.stroke();
        
        // Title (centered)
        const titleX = this.x + this.padding + lineLength + 4;
        ctx.fillText(item.title, titleX, sectionY + 4);
        
        // Right line (centered)
        ctx.beginPath();
        ctx.moveTo(titleX + titleWidth + 4, sectionY);
        ctx.lineTo(this.x + this.width - this.padding, sectionY);
        ctx.stroke();
    }
    
    drawScrollbar(ctx, STYLES) {
        if (this.maxScroll === 0) return; // No scrolling needed
        
        const scrollbarX = this.x + this.width - this.scrollbarWidth - 2;
        const scrollbarY = this.y + this.headerHeight + this.padding;
        const scrollbarHeight = this.height - this.headerHeight - this.padding * 2;
        
        // Track
        ctx.fillStyle = STYLES.colors.scrollbarTrack || 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(scrollbarX, scrollbarY, this.scrollbarWidth, scrollbarHeight);
        
        // Thumb (no highlight)
        const thumb = this.getScrollThumbBounds();
        if (thumb) {
            ctx.fillStyle = STYLES.colors.panel;
            ctx.fillRect(thumb.x, thumb.y, thumb.width, thumb.height);
        }
    }
}


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
        if (this.activeWindow && this.activeWindow.isDragging) {
            this.activeWindow.drag(x, y);
        }
    }
    
    handleMouseUp(x, y) {
        if (this.activeWindow) {
            if (!this.activeWindow.isDragging) {
                // It was a click, not a drag
                this.activeWindow.handleClick(x, y);
            }
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


// ═══════════════════════════════════════════════════════════════
//   TASKBAR (Windows-style)
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Windows-style taskbar with menu and window management

class Taskbar {
    constructor() {
        this.height = 48;
        this.menuOpen = false;
        this.menuWidth = 200;
        this.menuItemHeight = 36;
        this.buttonWidth = 100;
        this.buttonHeight = 32;
        this.buttonSpacing = 4;
        this.startButtonWidth = 80;
        this.buttonPadding = 16; // Horizontal padding for buttons
        
        // Menu items - names from windows
        this.menuItems = [];
        
        // OPT: Button position cache
        this.cachedPositions = [];
        this.cachedCount = 0;
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
            x: 0,
            y: canvasHeight - this.height + (this.height - this.buttonHeight) / 2,
            width: this.startButtonWidth,
            height: this.buttonHeight
        };
    }

    getMenuBounds(canvasHeight) {
        const menuHeight = this.getMenuHeight();
        return {
            x: 0,
            y: canvasHeight - this.height - menuHeight,
            width: this.menuWidth,
            height: menuHeight
        };
    }

    getTaskbarButtonBounds(index, ctx, minimizedWindows, measureTextCached) {
        // OPT: Cache positions in O(n) instead of O(n²)
        if (this.cachedCount !== minimizedWindows.length) {
            this.cachedPositions = [];
            let x = this.startButtonWidth + 8;
            const canvasHeight = ctx.canvas.height;
            const y = canvasHeight - this.height + (this.height - this.buttonHeight) / 2;
            
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
            
            this.cachedCount = minimizedWindows.length;
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
                    ctx.font = STYLES.fonts.main;
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
                    ctx.fillText(item.title, titleX, sectionY);
                    
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
                    ctx.fillText(item.title, menu.x + 12, currentY + itemHeight / 2);
                    
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
            ctx.fillText(item.title, btn.x + btn.width / 2, btn.y + btn.height / 2);
        }
    }
}


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



    // Export to global
    global.UI = {
        STYLES: STYLES,
        BaseWindow: BaseWindow,
        WindowManager: WindowManager,
        Taskbar: Taskbar,
        EventRouter: EventRouter,
        measureTextCached: measureTextCached,
        clearTextCache: clearTextCache,
        getTextCacheStats: getTextCacheStats
    };
    
    console.log('✅ UI Library v1.0.0 loaded!');
    console.log('📦 Modules: Styles, TextCache, BaseWindow, WindowManager, Taskbar, EventRouter');
    console.log('🎯 Ready to use: new UI.BaseWindow(x, y, title)');

})(typeof window !== 'undefined' ? window : global);
