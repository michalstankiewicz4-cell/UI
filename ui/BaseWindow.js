// ═══════════════════════════════════════════════════════════════
//   BASE WINDOW (REFACTORED)
// ═══════════════════════════════════════════════════════════════
// Modular architecture with ui/core/ and ui/components/

// Core imports
import { rectHit, clamp } from './core/geometry.js';
import { measureTextCached } from './core/text-cache.js';
import { computeLayout, getItemHeight } from './core/layout.js';
import * as CONST from './core/constants.js';

// Item classes (separate files)
import { ToggleItem } from './components/ToggleItem.js';
import { ButtonItem } from './components/ButtonItem.js';
import { SliderItem } from './components/SliderItem.js';
import { SectionItem } from './components/SectionItem.js';
import { TextItem } from './components/TextItem.js';

// Component imports (for header/scrollbar only)
import { drawHeader, drawHeaderButtons, drawMinimizedHeader, getHeaderButtonBounds } from './components/header.js';
import { computeScrollbar, drawScrollbar, hitScrollbarThumb, hitScrollbarTrack } from './components/scrollbar.js';

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
                
                ctx.strokeStyle = STYLES.colors.matrixCell;
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX, cellY, item.cellSize, item.cellSize);
            }
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

export default BaseWindow;
