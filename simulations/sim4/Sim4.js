// ═══════════════════════════════════════════════════════════════
//   SIMULATION 4 - Grid/Cellular Automata Example
// ═══════════════════════════════════════════════════════════════
// Template for grid-based simulations
// Can be Game of Life, falling sand, cellular automata, etc.

class Simulation4 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Grid settings
        this.cellSize = 5;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
        
        // Simulation state
        this.grid = [];
        this.nextGrid = [];
        this.density = 0.3;
        this.updateSpeed = 5; // frames per update
        this.frameCounter = 0;
        this.paused = false;
        
        // Stats
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create random grid
        this.grid = [];
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = Math.random() < this.density ? 1 : 0;
            }
        }
        
        // Clone for next state
        this.nextGrid = this.grid.map(row => [...row]);
    }
    
    update() {
        if (this.paused) return;
        
        this.frameCounter++;
        if (this.frameCounter % this.updateSpeed !== 0) return;
        
        // Simple cellular automata rules (example: Game of Life)
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const neighbors = this.countNeighbors(x, y);
                
                if (this.grid[y][x] === 1) {
                    // Alive cell
                    this.nextGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    // Dead cell
                    this.nextGrid[y][x] = (neighbors === 3) ? 1 : 0;
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        // Update FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    
    countNeighbors(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = (x + dx + this.cols) % this.cols;
                const ny = (y + dy + this.rows) % this.rows;
                
                count += this.grid[ny][nx];
            }
        }
        return count;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.fillStyle = '#00FF88';
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize - 1,
                        this.cellSize - 1
                    );
                }
            }
        }
    }
    
    // ═════════════════════════════════════════════════
    //  CONTROLS (called from UI)
    // ═════════════════════════════════════════════════
    
    setDensity(density) {
        this.density = density;
        this.init();
    }
    
    setUpdateSpeed(speed) {
        this.updateSpeed = speed;
    }
    
    setPaused(paused) {
        this.paused = paused;
    }
    
    reset() {
        this.init();
    }
    
    // ═════════════════════════════════════════════════
    //  GETTERS (for UI stats)
    // ═════════════════════════════════════════════════
    
    get aliveCells() {
        let count = 0;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) count++;
            }
        }
        return count;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Simulation4;
}
