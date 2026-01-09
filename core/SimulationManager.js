// ═══════════════════════════════════════════════════════════════
//   SIMULATION MANAGER - Central Simulation Controller
// ═══════════════════════════════════════════════════════════════
// Manages all simulations in the system
// Handles lifecycle, events, and data flow

/**
 * SimulationManager - Central controller for all simulations
 * 
 * Features:
 * - Dynamic add/remove simulations
 * - Lifecycle management (update, render, pause)
 * - Event-driven communication
 * - Data binding (parameters & stats)
 * - Cross-simulation linking
 * 
 * Architecture:
 *   main.js → SimulationManager → [Sim1, Sim2, Sim3, Sim4]
 *                ↓
 *            EventBus ← → DataBridge
 *                ↓
 *           UI System
 */
class SimulationManager {
    constructor(eventBus, dataBridge) {
        this.eventBus = eventBus;
        this.dataBridge = dataBridge;
        
        // Active simulations: { simId: { instance, canvas, metadata } }
        this.simulations = {};
        
        // Simulation classes registry: { simId: SimClass }
        this.registry = {};
        
        // Global state
        this.isPaused = false;
    }
    
    // ═════════════════════════════════════════════════
    //  REGISTRATION
    // ═════════════════════════════════════════════════
    
    /**
     * Register a simulation class (makes it available for dynamic loading)
     * @param {string} simId - Simulation ID (e.g., 'sim1')
     * @param {function} importFn - Function that imports the simulation class
     * @param {Object} metadata - Optional metadata
     */
    register(simId, importFn, metadata = {}) {
        this.registry[simId] = {
            importFn,
            metadata: {
                name: metadata.name || simId,
                description: metadata.description || '',
                type: metadata.type || '2D',
                ...metadata
            }
        };
        
        this.eventBus.emit('simulation:registered', { simId, metadata });
    }
    
    /**
     * Get all registered simulation IDs
     * @returns {string[]} Array of simulation IDs
     */
    getRegisteredSimulations() {
        return Object.keys(this.registry);
    }
    
    /**
     * Get metadata for a registered simulation
     * @param {string} simId - Simulation ID
     * @returns {Object} Metadata or null
     */
    getMetadata(simId) {
        return this.registry[simId]?.metadata || null;
    }
    
    // ═════════════════════════════════════════════════
    //  LIFECYCLE - ADD/REMOVE
    // ═════════════════════════════════════════════════
    
    /**
     * Add a simulation instance
     * @param {string} simId - Simulation ID
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Promise<boolean>} Success
     */
    async addSimulation(simId, canvas) {
        // Check if already exists
        if (this.simulations[simId]) {
            console.warn(`Simulation ${simId} already exists`);
            return false;
        }
        
        // Check if registered
        if (!this.registry[simId]) {
            console.error(`Simulation ${simId} not registered`);
            return false;
        }
        
        try {
            // Dynamic import
            const module = await this.registry[simId].importFn();
            const SimClass = module.default || module;
            
            // Create instance
            const instance = new SimClass(canvas);
            
            // Store
            this.simulations[simId] = {
                instance,
                canvas,
                metadata: this.registry[simId].metadata,
                addedAt: performance.now()
            };
            
            // Bind data (parameters & stats)
            this._bindSimulationData(simId, instance);
            
            // Emit event
            this.eventBus.emit('simulation:added', { 
                simId, 
                metadata: this.registry[simId].metadata 
            });
            
            console.log(`✅ Simulation ${simId} added`);
            return true;
            
        } catch (error) {
            console.error(`Failed to add simulation ${simId}:`, error);
            return false;
        }
    }
    
    /**
     * Remove a simulation
     * @param {string} simId - Simulation ID
     * @returns {boolean} Success
     */
    removeSimulation(simId) {
        if (!this.simulations[simId]) {
            console.warn(`Simulation ${simId} not found`);
            return false;
        }
        
        // Unbind data
        this.dataBridge.unbindSimulation(simId);
        
        // Remove
        delete this.simulations[simId];
        
        // Emit event
        this.eventBus.emit('simulation:removed', { simId });
        
        console.log(`🗑️ Simulation ${simId} removed`);
        return true;
    }
    
    /**
     * Remove all simulations
     */
    removeAll() {
        const simIds = Object.keys(this.simulations);
        for (let simId of simIds) {
            this.removeSimulation(simId);
        }
    }
    
    // ═════════════════════════════════════════════════
    //  DATA BINDING
    // ═════════════════════════════════════════════════
    
    /**
     * Bind simulation parameters and stats to DataBridge
     * @private
     */
    _bindSimulationData(simId, instance) {
        // Common parameters (if methods exist)
        if (typeof instance.setPaused === 'function') {
            this.dataBridge.bindParameter(simId, 'paused', 
                (value) => instance.setPaused(value));
        }
        
        if (typeof instance.reset === 'function') {
            this.dataBridge.bindParameter(simId, 'reset', 
                () => instance.reset());
        }
        
        // Sim-specific parameters (add as needed)
        if (typeof instance.setSpeed === 'function') {
            this.dataBridge.bindParameter(simId, 'speed', 
                (value) => instance.setSpeed(value));
        }
        
        if (typeof instance.setGravity === 'function') {
            this.dataBridge.bindParameter(simId, 'gravity', 
                (value) => instance.setGravity(value));
        }
        
        // Common stats
        if (instance.hasOwnProperty('fps') || typeof instance.fps !== 'undefined') {
            this.dataBridge.bindStat(simId, 'fps', () => instance.fps);
        }
        
        // Emit event
        this.eventBus.emit('simulation:data-bound', { simId });
    }
    
    // ═════════════════════════════════════════════════
    //  LIFECYCLE - UPDATE/RENDER
    // ═════════════════════════════════════════════════
    
    /**
     * Update all active simulations
     */
    updateAll() {
        if (this.isPaused) return;
        
        for (let simId in this.simulations) {
            const sim = this.simulations[simId].instance;
            if (typeof sim.update === 'function') {
                try {
                    sim.update();
                } catch (error) {
                    console.error(`Error updating ${simId}:`, error);
                }
            }
        }
    }
    
    /**
     * Render all active simulations
     */
    renderAll() {
        for (let simId in this.simulations) {
            const sim = this.simulations[simId].instance;
            if (typeof sim.render === 'function') {
                try {
                    sim.render();
                } catch (error) {
                    console.error(`Error rendering ${simId}:`, error);
                }
            }
        }
    }
    
    /**
     * Update and render a specific simulation
     * @param {string} simId - Simulation ID
     */
    updateAndRender(simId) {
        if (!this.simulations[simId]) return;
        
        const sim = this.simulations[simId].instance;
        
        if (!this.isPaused && typeof sim.update === 'function') {
            sim.update();
        }
        
        if (typeof sim.render === 'function') {
            sim.render();
        }
    }
    
    // ═════════════════════════════════════════════════
    //  GLOBAL CONTROLS
    // ═════════════════════════════════════════════════
    
    /**
     * Pause all simulations
     */
    pauseAll() {
        this.isPaused = true;
        
        for (let simId in this.simulations) {
            const sim = this.simulations[simId].instance;
            if (typeof sim.setPaused === 'function') {
                sim.setPaused(true);
            }
        }
        
        this.eventBus.emit('simulation:paused-all');
    }
    
    /**
     * Resume all simulations
     */
    resumeAll() {
        this.isPaused = false;
        
        for (let simId in this.simulations) {
            const sim = this.simulations[simId].instance;
            if (typeof sim.setPaused === 'function') {
                sim.setPaused(false);
            }
        }
        
        this.eventBus.emit('simulation:resumed-all');
    }
    
    /**
     * Reset all simulations
     */
    resetAll() {
        for (let simId in this.simulations) {
            const sim = this.simulations[simId].instance;
            if (typeof sim.reset === 'function') {
                sim.reset();
            }
        }
        
        this.eventBus.emit('simulation:reset-all');
    }
    
    // ═════════════════════════════════════════════════
    //  GETTERS
    // ═════════════════════════════════════════════════
    
    /**
     * Get a simulation instance
     * @param {string} simId - Simulation ID
     * @returns {Object} Simulation instance or null
     */
    getSimulation(simId) {
        return this.simulations[simId]?.instance || null;
    }
    
    /**
     * Get all active simulation IDs
     * @returns {string[]} Array of simulation IDs
     */
    getActiveSimulations() {
        return Object.keys(this.simulations);
    }
    
    /**
     * Check if a simulation is active
     * @param {string} simId - Simulation ID
     * @returns {boolean} Is active
     */
    isActive(simId) {
        return !!this.simulations[simId];
    }
    
    /**
     * Get count of active simulations
     * @returns {number} Count
     */
    getActiveCount() {
        return Object.keys(this.simulations).length;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulationManager;
}
