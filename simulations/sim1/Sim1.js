// SIMULATION 1 - 2D Canvas Particles with Color Interactions
// Particles of different colors interact with forces defined in interaction matrix

class Simulation1 {
    // Metadata for auto-generating UI window
    static metadata = {
        name: 'SIM1 PARTICLES',
        description: '2D particle color interaction simulation',
        controls: [
            { type: 'slider', label: 'Speed', param: 'speed', min: 0.1, max: 5.0, step: 0.1 },
            { type: 'slider', label: 'Particle Count', param: 'particleCount', min: 10, max: 200, step: 10 },
            { type: 'slider', label: 'Force Multiplier', param: 'forceMultiplier', min: 0.0, max: 2.0, step: 0.1 }
        ],
        stats: ['fps', 'activeParticles']
    }
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Particle types (colors)
        this.particleTypes = [
            { name: 'Red', color: '#ff4444' },
            { name: 'Green', color: '#44ff44' },
            { name: 'Blue', color: '#4444ff' }
        ];
        
        // Interaction matrix (3x3): [source_type][target_type] = force
        // Negative = repulsion, Positive = attraction, 0 = neutral
        this.interactionMatrix = [
            [-0.5, 0.3, 0.1],  // Red vs [Red, Green, Blue]
            [0.3, -0.5, 0.2],  // Green vs [Red, Green, Blue]
            [0.1, 0.2, -0.5]   // Blue vs [Red, Green, Blue]
        ];
        
        // Simulation state
        this.particles = [];
        this.particleCount = 50;
        this.speed = 1.0;
        this.forceMultiplier = 1.0;
        this.paused = false;
        this.interactionRadius = 100; // Distance for particle interactions
        
        // Stats
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        // Initialize
        this.init();
    }
    
    init() {
        // Create initial particles with types
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            const type = Math.floor(Math.random() * this.particleTypes.length);
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                type: type,
                size: 6,
                color: this.particleTypes[type].color
            });
        }
    }
    
    update() {
        if (this.paused) return;
        
        // Calculate forces between particles
        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];
            let fx = 0, fy = 0;
            
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                
                const p2 = this.particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);
                
                if (dist > 0 && dist < this.interactionRadius) {
                    // Get interaction force from matrix
                    const force = this.interactionMatrix[p1.type][p2.type];
                    
                    // Force decreases with distance
                    const strength = (force * this.forceMultiplier) / (distSq * 0.01);
                    
                    // Add force component
                    fx += (dx / dist) * strength;
                    fy += (dy / dist) * strength;
                }
            }
            
            // Apply forces to velocity
            p1.vx += fx * 0.1;
            p1.vy += fy * 0.1;
            
            // Damping
            p1.vx *= 0.99;
            p1.vy *= 0.99;
        }
        
        // Update positions
        for (let p of this.particles) {
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;
            
            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // Keep in bounds
            p.x = Math.max(0, Math.min(this.canvas.width, p.x));
            p.y = Math.max(0, Math.min(this.canvas.height, p.y));
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
    
    // CONTROLS (called from UI via DataBridge)
    
    setParticleCount(count) {
        this.particleCount = count;
        this.init();
    }
    
    setSpeed(speed) {
        this.speed = speed;
    }
    
    setForceMultiplier(value) {
        this.forceMultiplier = value;
    }
    
    setPaused(paused) {
        this.paused = paused;
    }
    
    reset() {
        this.init();
    }
    
    // Interaction matrix control
    getInteractionForce(sourceType, targetType) {
        return this.interactionMatrix[sourceType][targetType];
    }
    
    setInteractionForce(sourceType, targetType, value) {
        this.interactionMatrix[sourceType][targetType] = value;
    }
    
    // GETTERS (for UI stats via DataBridge)
    
    get activeParticles() {
        return this.particles.length;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Simulation1;
}
