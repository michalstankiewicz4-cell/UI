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
        
        // MODES SYSTEM: { simId: 'fullscreen' | 'window' | 'hud' | 'minimized' }
        this.modes = {};
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
            
            // Set default mode: window (visible)
            this.setMode(simId, 'window');
            
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
        const metadata = this.registry[simId]?.metadata;
        
        // AUTO-BIND parameters from metadata controls
        if (metadata && metadata.controls) {
            for (const control of metadata.controls) {
                if (control.type === 'slider' || control.type === 'toggle') {
                    // Find setter method (e.g., 'speed' → 'setSpeed')
                    const setterName = 'set' + control.param.charAt(0).toUpperCase() + control.param.slice(1);
                    
                    if (typeof instance[setterName] === 'function') {
                        this.dataBridge.bindParameter(simId, control.param, 
                            (value) => instance[setterName](value)
                        );
                        console.log(`✅ Bound parameter: ${simId}.${control.param} → ${setterName}()`);
                    } else {
                        console.warn(`⚠️ Setter ${setterName} not found for param ${control.param}`);
                    }
                }
            }
        }
        
        // AUTO-BIND stats from metadata
        if (metadata && metadata.stats) {
            for (const statName of metadata.stats) {
                // Check for ES6 getter (in prototype chain)
                const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), statName);
                
                if (descriptor && descriptor.get) {
                    // ES6 getter (get activeParticles() { ... })
                    this.dataBridge.bindStat(simId, statName, () => instance[statName]);
                    console.log(`✅ Bound stat: ${simId}.${statName} (ES6 getter)`);
                } else if (typeof instance[statName] === 'function') {
                    // Method (getFps() { ... })
                    this.dataBridge.bindStat(simId, statName, () => instance[statName]());
                    console.log(`✅ Bound stat: ${simId}.${statName} (method)`);
                } else if (instance.hasOwnProperty(statName)) {
                    // Property (this.fps = ...)
                    this.dataBridge.bindStat(simId, statName, () => instance[statName]);
                    console.log(`✅ Bound stat: ${simId}.${statName} (property)`);
                } else {
                    console.warn(`⚠️ Stat ${statName} not found on instance`);
                }
            }
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
    
    // ═════════════════════════════════════════════════
    //  MODES SYSTEM (fullscreen / window / hud / minimized)
    // ═════════════════════════════════════════════════
    
    /**
     * Get current mode of a simulation
     * @param {string} simId - Simulation ID
     * @returns {string} Mode ('window' | 'hud' | 'minimized')
     */
    getMode(simId) {
        return this.modes[simId] || 'window';
    }
    
    /**
     * Set mode of a simulation
     * @param {string} simId - Simulation ID
     * @param {string} mode - Mode ('window' | 'hud' | 'minimized')
     */
    setMode(simId, mode) {
        if (!this.simulations[simId]) {
            console.warn(`Cannot set mode for non-existent simulation: ${simId}`);
            return;
        }
        
        const oldMode = this.modes[simId];
        this.modes[simId] = mode;
        
        console.log(`🎨 ${simId} mode: ${oldMode || 'fullscreen'} → ${mode}`);
        
        // Emit event
        this.eventBus.emit('simulation:mode-changed', { simId, mode, oldMode });
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulationManager;
}
