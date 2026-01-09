// ═══════════════════════════════════════════════════════════════
//   SIMULATION 2 - 3D-style Example
// ═══════════════════════════════════════════════════════════════
// Template for 3D or pseudo-3D simulation
// Can use Three.js, WebGL, or 2D projection

class Simulation2 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Simulation state
        this.cubes = [];
        this.cubeCount = 20;
        this.rotationSpeed = 0.02;
        this.paused = false;
        
        // Camera
        this.cameraZ = 500;
        
        // Stats
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create cubes in 3D space
        for (let i = 0; i < this.cubeCount; i++) {
            this.cubes.push({
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                z: (Math.random() - 0.5) * 400,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                size: Math.random() * 30 + 20,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }
    
    update() {
        if (this.paused) return;
        
        // Rotate cubes
        for (let cube of this.cubes) {
            cube.rotY += this.rotationSpeed;
            cube.rotX += this.rotationSpeed * 0.5;
        }
        
        // Update FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(20, 20, 40, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sort cubes by z-depth
        const sorted = [...this.cubes].sort((a, b) => b.z - a.z);
        
        // Draw cubes with perspective
        for (let cube of sorted) {
            const scale = this.cameraZ / (this.cameraZ + cube.z);
            const x = cube.x * scale + this.canvas.width / 2;
            const y = cube.y * scale + this.canvas.height / 2;
            const size = cube.size * scale;
            
            this.ctx.fillStyle = cube.color;
            this.ctx.globalAlpha = scale;
            this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
            this.ctx.globalAlpha = 1.0;
        }
    }
    
    // ═════════════════════════════════════════════════
    //  CONTROLS (called from UI)
    // ═════════════════════════════════════════════════
    
    setCubeCount(count) {
        this.cubeCount = count;
        this.cubes = [];
        this.init();
    }
    
    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }
    
    setPaused(paused) {
        this.paused = paused;
    }
    
    reset() {
        this.cubes = [];
        this.init();
    }
    
    // ═════════════════════════════════════════════════
    //  GETTERS (for UI stats)
    // ═════════════════════════════════════════════════
    
    get activeCubes() {
        return this.cubes.length;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Simulation2;
}
