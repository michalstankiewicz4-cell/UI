// ═══════════════════════════════════════════════════════════════
//   TASKBAR (Windows-style)
// ═══════════════════════════════════════════════════════════════
// Extracted from Petrie Dish v5.1-C2
// Windows-style taskbar with menu and window management

import { PADDING_MENU, SPACING_MENU_ITEM, HEIGHT_MENU_SECTION, PADDING_TASKBAR_VERTICAL, PADDING_BUTTON_HORIZONTAL } from './core/constants.js';

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