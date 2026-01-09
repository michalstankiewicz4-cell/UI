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
    
    addText(text, color = '#00F5FF', lines = 1) {
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
        
        // NORMAL MODE: Header with buttons
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
        return false;
    }
    
    drag(mouseX, mouseY) {
        if (this.isDragging) {
            this.x = mouseX - this.dragOffsetX;
            this.y = mouseY - this.dragOffsetY;
            this.markDirty();
        }
    }
    
    stopDrag() {
        this.isDragging = false;
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
                if (mouseY >= y && mouseY <= y + buttonHeight) {
                    item.callback();
                    return true;
                }
                y += buttonHeight + this.itemSpacing;
            } else if (item.type === 'text') {
                y += (item.lines || 1) * 14 + this.itemSpacing;
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
        const bgColor = this.type === 'stats' ? STYLES.stats.bgColor : STYLES.panel.bgColor;
        const borderColor = this.type === 'stats' ? 
            STYLES.stats.borderColor : STYLES.panel.borderColor;
        
        if (bgColor !== 'transparent') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
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
        if (borderColor !== 'transparent') {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = STYLES.panel.borderWidth;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
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
                const height = (item.lines || 1) * 14;
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
                const height = (item.lines || 1) * 14;
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
        const lines = item.text.split('\n');
        const maxLines = Math.min(lines.length, item.lines || 1);
        
        ctx.fillStyle = item.color || STYLES.colors.text || '#00F5FF';
        ctx.font = STYLES.fonts.main;
        
        for (let i = 0; i < maxLines; i++) {
            ctx.fillText(lines[i], this.x + this.padding, y + 12 + i * 14);
        }
    }
    
    drawSection(ctx, STYLES, item, y) {
        const sectionY = y + 10;
        
        // Section lines
        ctx.strokeStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
        ctx.lineWidth = 1;
        
        // Left line
        ctx.beginPath();
        ctx.moveTo(this.x + this.padding, sectionY);
        ctx.lineTo(this.x + 30, sectionY);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
        ctx.font = STYLES.fonts.main;
        const titleWidth = ctx.measureText(item.title).width;
        ctx.fillText(item.title, this.x + 35, sectionY + 4);
        
        // Right line
        ctx.beginPath();
        ctx.moveTo(this.x + 40 + titleWidth, sectionY);
        ctx.lineTo(this.x + this.width - this.padding, sectionY);
        ctx.stroke();
    }
    
    drawScrollbar(ctx, STYLES) {
        const scrollbarX = this.x + this.width - this.scrollbarWidth - 2;
        const scrollbarY = this.y + this.headerHeight + 2;
        const scrollbarHeight = this.height - this.headerHeight - 4;
        
        // Track
        ctx.fillStyle = STYLES.colors.scrollbarTrack || 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(scrollbarX, scrollbarY, this.scrollbarWidth, scrollbarHeight);
        
        // Thumb
        const thumbHeight = Math.max(20, (this.height - this.headerHeight) / this.contentHeight * scrollbarHeight);
        const thumbY = scrollbarY + (this.scrollOffset / this.maxScroll) * (scrollbarHeight - thumbHeight);
        
        ctx.fillStyle = STYLES.colors.panel;
        ctx.fillRect(scrollbarX, thumbY, this.scrollbarWidth, thumbHeight);
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseWindow;
}
