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
    
    addWindowItem(title, window) {
        // Add window to menu with custom display title
        this.menuItems.push({
            type: 'window',
            title: title,
            windowTitle: window.title,
            window: window,
            isOpen: true
        });
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
                        item.window.visible = true;
                        item.window.minimized = false;
                        item.isOpen = true;
                        if (windowManager) {
                            windowManager.bringToFront(item.window);
                        }
                        
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
                    // Section header
                    const sectionHeight = 24;
                    
                    ctx.fillStyle = STYLES.colors.sectionDim || 'rgba(0, 255, 136, 0.5)';
                    ctx.font = STYLES.fonts.small;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`━━━ ${item.title} ━━━`, menu.x + menu.width / 2, currentY + sectionHeight / 2);
                    
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

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Taskbar;
}
