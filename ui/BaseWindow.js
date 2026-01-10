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
    
    addSlider(label, getValue, setValue, min, max, step = 0.01) {
        this.items.push({ 
            type: 'slider', 
            label, 
            getValue, 
            setValue, 
            min, 
            max, 
            step,
            dragging: false
        });
        this.markDirty();
    }
    
    addToggle(label, getValue, setValue) {
        this.items.push({ 
            type: 'toggle', 
            label, 
            getValue, 
            setValue 
        });
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
    //  SLIDER INTERACTION
    // ═════════════════════════════════════════════════
    
    checkSliderClick(mouseX, mouseY) {
        if (!this.visible || this.minimized) return false;
        
        const startY = this.transparent ? 
            (this.y + this.padding) : 
            (this.y + this.headerHeight + this.padding - this.scrollOffset);
        
        let y = startY;
        
        for (let item of this.items) {
            if (item.type === 'slider') {
                const sliderHeight = 40;
                const trackY = y + 20;
                const trackHeight = 6;
                const width = this.width - this.padding * 2;
                
                // Check if clicked on slider track area
                if (mouseY >= trackY && mouseY <= trackY + trackHeight &&
                    mouseX >= this.x + this.padding && 
                    mouseX <= this.x + this.padding + width) {
                    // Start dragging this slider
                    item.dragging = true;
                    // Set value immediately
                    const relativeX = mouseX - (this.x + this.padding);
                    const normalized = Math.max(0, Math.min(1, relativeX / width));
                    const newValue = item.min + normalized * (item.max - item.min);
                    const steppedValue = Math.round(newValue / item.step) * item.step;
                    const clampedValue = Math.max(item.min, Math.min(item.max, steppedValue));
                    item.setValue(clampedValue);
                    return true;
                }
                y += sliderHeight + this.itemSpacing;
            } else if (item.type === 'button') {
                y += 20 + this.itemSpacing;
            } else if (item.type === 'toggle') {
                y += 20 + this.itemSpacing;
            } else if (item.type === 'text') {
                const height = item._cachedHeight || 14;
                y += height + this.itemSpacing;
            } else if (item.type === 'section') {
                y += 20 + this.itemSpacing;
            }
        }
        
        return false;
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
        
        // Check if clicked on slider FIRST (before scrollbar)
        const sliderResult = this.checkSliderClick(mouseX, mouseY);
        if (sliderResult) {
            return true; // Slider drag started
        }
        
        // Check scrollbar thumb SECOND
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
        // Handle slider dragging FIRST
        for (let item of this.items) {
            if (item.type === 'slider' && item.dragging) {
                const width = this.width - this.padding * 2;
                const relativeX = mouseX - (this.x + this.padding);
                const normalized = Math.max(0, Math.min(1, relativeX / width));
                const newValue = item.min + normalized * (item.max - item.min);
                const steppedValue = Math.round(newValue / item.step) * item.step;
                const clampedValue = Math.max(item.min, Math.min(item.max, steppedValue));
                item.setValue(clampedValue);
                return; // Don't drag window while dragging slider
            }
        }
        
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
        
        // Stop all slider dragging
        for (let item of this.items) {
            if (item.type === 'slider') {
                item.dragging = false;
            }
        }
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
            } else if (item.type === 'toggle') {
                const toggleHeight = 20;
                // Check if clicked on toggle
                if (mouseY >= y && mouseY <= y + toggleHeight &&
                    mouseX >= this.x + this.padding && 
                    mouseX <= this.x + this.width - this.padding) {
                    // Toggle value
                    item.setValue(!item.getValue());
                    return true;
                }
                y += toggleHeight + this.itemSpacing;
            } else if (item.type === 'slider') {
                const sliderHeight = 40;
                // Slider handled by drag() - just skip height
                y += sliderHeight + this.itemSpacing;
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
            } else if (item.type === 'slider') {
                this.drawSlider(ctx, STYLES, item, y);
                y += 40 + this.itemSpacing;
                this.contentHeight += 40 + this.itemSpacing;
            } else if (item.type === 'toggle') {
                this.drawToggle(ctx, STYLES, item, y);
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
            } else if (item.type === 'slider') {
                this.drawSlider(ctx, STYLES, item, y);
                y += 40 + this.itemSpacing;
                this.contentHeight += 40 + this.itemSpacing;
            } else if (item.type === 'toggle') {
                this.drawToggle(ctx, STYLES, item, y);
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
        ctx.font = STYLES.fonts.small;  // Use small font for sections
        
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
    
    drawSlider(ctx, STYLES, item, y) {
        const value = item.getValue();
        const width = this.width - this.padding * 2;
        const trackHeight = 6;
        const thumbSize = 16;
        
        // Label (left) + Value (right)
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.main;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(item.label, this.x + this.padding, y);
        
        // Value display
        const valueText = value.toFixed(2);
        ctx.textAlign = 'right';
        ctx.fillText(valueText, this.x + this.padding + width, y);
        
        // Track
        const trackY = y + 20;
        ctx.fillStyle = STYLES.colors.sliderTrack || 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + this.padding, trackY, width, trackHeight);
        
        // Fill (green progress bar)
        const range = item.max - item.min;
        const normalizedValue = (value - item.min) / range;
        const fillWidth = normalizedValue * width;
        ctx.fillStyle = STYLES.colors.sliderFill || STYLES.colors.panel;
        ctx.fillRect(this.x + this.padding, trackY, fillWidth, trackHeight);
        
        // Thumb (circle)
        const thumbX = this.x + this.padding + normalizedValue * width;
        ctx.fillStyle = STYLES.colors.panel;
        ctx.beginPath();
        ctx.arc(thumbX, trackY + trackHeight / 2, thumbSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // RESET alignment and baseline!
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    drawToggle(ctx, STYLES, item, y) {
        const value = item.getValue();
        const checkboxSize = 16;
        const checkboxX = this.x + this.padding;
        const checkboxY = y + 2;
        
        // Checkbox border
        ctx.strokeStyle = STYLES.colors.panel;
        ctx.lineWidth = 2;
        ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);
        
        // Fill if ON
        if (value) {
            ctx.fillStyle = STYLES.colors.panel;
            ctx.fillRect(checkboxX + 3, checkboxY + 3, checkboxSize - 6, checkboxSize - 6);
        }
        
        // Label
        ctx.fillStyle = STYLES.colors.panel;
        ctx.font = STYLES.fonts.main;
        ctx.textBaseline = 'alphabetic'; // SET baseline explicitly!
        ctx.fillText(item.label, checkboxX + checkboxSize + 8, checkboxY + 12);
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

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseWindow;
}
