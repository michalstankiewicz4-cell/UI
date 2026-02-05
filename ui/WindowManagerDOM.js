// ═══════════════════════════════════════════════════════════════
//   WINDOW MANAGER DOM - CSS/DOM Edition
// ═══════════════════════════════════════════════════════════════

class WindowManagerDOM {
    constructor() {
        this.windows = [];
        this.container = document.getElementById('ui-container');
        this.nextZIndex = 1000;
        
        // Global mouse handlers
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());
    }
    
    add(window) {
        if (!this.windows.includes(window)) {
            this.windows.push(window);
            this.container.appendChild(window.element);
            window.setZIndex(this.nextZIndex++);
        }
    }
    
    remove(window) {
        const index = this.windows.indexOf(window);
        if (index !== -1) {
            this.windows.splice(index, 1);
            if (window.element && window.element.parentNode) {
                window.element.parentNode.removeChild(window.element);
            }
        }
    }
    
    bringToFront(window) {
        window.setZIndex(this.nextZIndex++);
        
        // Reorder windows array
        const index = this.windows.indexOf(window);
        if (index !== -1) {
            this.windows.splice(index, 1);
            this.windows.push(window);
        }
    }
    
    handleMouseMove(e) {
        for (const window of this.windows) {
            window.handleMouseMove(e);
        }
    }
    
    handleMouseUp() {
        for (const window of this.windows) {
            window.handleMouseUp();
        }
    }
    
    handleMouseDown(x, y) {
        // Check windows from top to bottom
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const window = this.windows[i];
            if (!window.visible || window.minimized) continue;
            
            const rect = window.element.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                this.bringToFront(window);
                return true;
            }
        }
        return false;
    }
    
    update() {
        // Update all windows
        for (const window of this.windows) {
            if (window.visible && !window.minimized) {
                window.update();
            }
        }
    }
}
