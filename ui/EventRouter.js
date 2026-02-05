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
