// ═══════════════════════════════════════════════════════════════
//   SIMULATION 1 - 2D Canvas Example
// ═══════════════════════════════════════════════════════════════
// Template for 2D canvas-based simulation
// Replace this with your actual simulation logic

class Simulation1 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Simulation state
        this.particles = [];
        this.particleCount = 50;
        this.speed = 1.0;
        this.paused = false;
        
        // Stats
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create initial particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }
    
    update() {
        if (this.paused) return;
        
        // Update particles
        for (let p of this.particles) {
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;
            
            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // ═════════════════════════════════════════════════
    //  CONTROLS (called from UI)
    // ═════════════════════════════════════════════════
    
    setParticleCount(count) {
        this.particleCount = count;
        this.particles = [];
        this.init();
    }
    
    setSpeed(speed) {
        this.speed = speed;
    }
    
    setPaused(paused) {
        this.paused = paused;
    }
    
    reset() {
        this.particles = [];
        this.init();
    }
    
    // ═════════════════════════════════════════════════
    //  GETTERS (for UI stats)
    // ═════════════════════════════════════════════════
    
    get activeParticles() {
        return this.particles.length;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Simulation1;
}
