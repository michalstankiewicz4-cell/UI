// ═══════════════════════════════════════════════════════════════
//   DATA BRIDGE - UI ↔ Simulation Data Flow
// ═══════════════════════════════════════════════════════════════
// Handles bidirectional data flow between UI and simulations
// Parameters from UI → Simulations
// Stats from Simulations → UI

/**
 * DataBridge - Manages data flow between UI and simulations
 * 
 * Features:
 * - Parameter binding (UI controls → Simulation setters)
 * - Stat binding (Simulation getters → UI display)
 * - Validation & constraints
 * - Change notifications via EventBus
 * 
 * Usage:
 *   dataBridge.bindParameter('sim1', 'speed', (value) => sim.setSpeed(value));
 *   dataBridge.bindStat('sim1', 'fps', () => sim.fps);
 */
class DataBridge {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        // Parameter bindings: { simId: { paramName: setter } }
        this.parameterBindings = {};
        
        // Stat bindings: { simId: { statName: getter } }
        this.statBindings = {};
        
        // Validators: { simId: { paramName: validatorFn } }
        this.validators = {};
        
        // Current values cache
        this.parameterValues = {};
        this.statValues = {};
    }
    
    // ═════════════════════════════════════════════════
    //  PARAMETER BINDING (UI → Simulation)
    // ═════════════════════════════════════════════════
    
    /**
     * Bind a parameter from UI to simulation
     * @param {string} simId - Simulation ID
     * @param {string} paramName - Parameter name (e.g., 'speed')
     * @param {function} setter - Function to set the parameter
     * @param {function} validator - Optional validator function
     */
    bindParameter(simId, paramName, setter, validator = null) {
        if (!this.parameterBindings[simId]) {
            this.parameterBindings[simId] = {};
        }
        
        this.parameterBindings[simId][paramName] = setter;
        
        // Store validator if provided
        if (validator) {
            if (!this.validators[simId]) {
                this.validators[simId] = {};
            }
            this.validators[simId][paramName] = validator;
        }
    }
    
    /**
     * Set a parameter value
     * @param {string} simId - Simulation ID
     * @param {string} paramName - Parameter name
     * @param {*} value - Value to set
     * @returns {boolean} Success
     */
    setParameter(simId, paramName, value) {
        // Check if binding exists
        if (!this.parameterBindings[simId] || 
            !this.parameterBindings[simId][paramName]) {
            console.warn(`No parameter binding: ${simId}.${paramName}`);
            return false;
        }
        
        // Validate if validator exists
        if (this.validators[simId] && this.validators[simId][paramName]) {
            const validator = this.validators[simId][paramName];
            const validationResult = validator(value);
            
            if (!validationResult.valid) {
                console.warn(`Validation failed for ${simId}.${paramName}:`, 
                           validationResult.error);
                return false;
            }
            
            // Use validated value (may be coerced)
            value = validationResult.value !== undefined ? 
                   validationResult.value : value;
        }
        
        // Call setter
        try {
            this.parameterBindings[simId][paramName](value);
            
            // Cache value
            if (!this.parameterValues[simId]) {
                this.parameterValues[simId] = {};
            }
            this.parameterValues[simId][paramName] = value;
            
            // Emit event
            this.eventBus.emit('parameter:changed', {
                simId,
                paramName,
                value
            });
            
            return true;
        } catch (error) {
            console.error(`Error setting ${simId}.${paramName}:`, error);
            return false;
        }
    }
    
    /**
     * Get current parameter value
     * @param {string} simId - Simulation ID
     * @param {string} paramName - Parameter name
     * @returns {*} Current value or undefined
     */
    getParameter(simId, paramName) {
        return this.parameterValues[simId]?.[paramName];
    }
    
    // ═════════════════════════════════════════════════
    //  STAT BINDING (Simulation → UI)
    // ═════════════════════════════════════════════════
    
    /**
     * Bind a stat from simulation to UI
     * @param {string} simId - Simulation ID
     * @param {string} statName - Stat name (e.g., 'fps')
     * @param {function} getter - Function to get the stat value
     */
    bindStat(simId, statName, getter) {
        if (!this.statBindings[simId]) {
            this.statBindings[simId] = {};
        }
        
        this.statBindings[simId][statName] = getter;
    }
    
    /**
     * Get a stat value
     * @param {string} simId - Simulation ID
     * @param {string} statName - Stat name
     * @returns {*} Stat value or undefined
     */
    getStat(simId, statName) {
        if (!this.statBindings[simId] || 
            !this.statBindings[simId][statName]) {
            return undefined;
        }
        
        try {
            const value = this.statBindings[simId][statName]();
            
            // Cache value
            if (!this.statValues[simId]) {
                this.statValues[simId] = {};
            }
            this.statValues[simId][statName] = value;
            
            return value;
        } catch (error) {
            console.error(`Error getting ${simId}.${statName}:`, error);
            return undefined;
        }
    }
    
    /**
     * Get all stats for a simulation
     * @param {string} simId - Simulation ID
     * @returns {Object} Object with all stats
     */
    getAllStats(simId) {
        if (!this.statBindings[simId]) return {};
        
        const stats = {};
        for (let statName in this.statBindings[simId]) {
            stats[statName] = this.getStat(simId, statName);
        }
        return stats;
    }
    
    // ═════════════════════════════════════════════════
    //  CLEANUP
    // ═════════════════════════════════════════════════
    
    /**
     * Remove all bindings for a simulation
     * @param {string} simId - Simulation ID
     */
    unbindSimulation(simId) {
        delete this.parameterBindings[simId];
        delete this.statBindings[simId];
        delete this.validators[simId];
        delete this.parameterValues[simId];
        delete this.statValues[simId];
    }
    
    /**
     * Clear all bindings
     */
    clear() {
        this.parameterBindings = {};
        this.statBindings = {};
        this.validators = {};
        this.parameterValues = {};
        this.statValues = {};
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataBridge;
}
