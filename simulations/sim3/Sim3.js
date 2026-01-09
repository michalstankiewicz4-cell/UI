// ═══════════════════════════════════════════════════════════════
//   SIMULATION 3 - Physics Example
// ═══════════════════════════════════════════════════════════════
// Template for physics-based simulation
// Can include gravity, collisions, forces, etc.

class Simulation3 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Simulation state
        this.balls = [];
        this.ballCount = 30;
        this.gravity = 0.5;
        this.bounce = 0.8;
        this.paused = false;
        
        // Stats
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create bouncing balls
        for (let i = 0; i < this.ballCount; i++) {
            this.balls.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.5,
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * -5,
                radius: Math.random() * 10 + 5,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }
    
    update() {
        if (this.paused) return;
        
        // Physics update
        for (let ball of this.balls) {
            // Apply gravity
            ball.vy += this.gravity;
            
            // Update position
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Bounce off walls
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.canvas.width) {
                ball.vx *= -this.bounce;
                ball.x = Math.max(ball.radius, Math.min(this.canvas.width - ball.radius, ball.x));
            }
            
            if (ball.y + ball.radius > this.canvas.height) {
                ball.vy *= -this.bounce;
                ball.y = this.canvas.height - ball.radius;
            }
            
            // Top boundary
            if (ball.y - ball.radius < 0) {
                ball.vy *= -this.bounce;
                ball.y = ball.radius;
            }
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
        
        // Draw balls
        for (let ball of this.balls) {
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // ═════════════════════════════════════════════════
    //  CONTROLS (called from UI)
    // ═════════════════════════════════════════════════
    
    setBallCount(count) {
        this.ballCount = count;
        this.balls = [];
        this.init();
    }
    
    setGravity(gravity) {
        this.gravity = gravity;
    }
    
    setPaused(paused) {
        this.paused = paused;
    }
    
    reset() {
        this.balls = [];
        this.init();
    }
    
    // ═════════════════════════════════════════════════
    //  GETTERS (for UI stats)
    // ═════════════════════════════════════════════════
    
    get activeBalls() {
        return this.balls.length;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Simulation3;
}
