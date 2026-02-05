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
