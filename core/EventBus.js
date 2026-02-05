// ═══════════════════════════════════════════════════════════════
//   EVENT BUS - Centralized Event System
// ═══════════════════════════════════════════════════════════════
// Handles all communication between simulations, UI, and managers
// Implements pub-sub pattern for loose coupling

/**
 * EventBus - Centralized event system for the entire application
 * 
 * Features:
 * - Subscribe to events with callbacks
 * - Emit events with data
 * - Unsubscribe from events
 * - Wildcard event patterns
 * - Event history (optional debugging)
 * 
 * Usage:
 *   eventBus.on('simulation:added', (data) => { ... });
 *   eventBus.emit('simulation:added', { id: 'sim1' });
 */
class EventBus {
    constructor() {
        // Event listeners: { eventName: [callback1, callback2, ...] }
        this.listeners = {};
    }
    
    // ═════════════════════════════════════════════════
    //  SUBSCRIBE TO EVENTS
    // ═════════════════════════════════════════════════
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Event name (e.g., 'simulation:added')
     * @param {function} callback - Function to call when event is emitted
     * @returns {function} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        
        this.listeners[eventName].push(callback);
        
        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }
    
    /**
     * Subscribe to an event (one-time only)
     * @param {string} eventName - Event name
     * @param {function} callback - Function to call once
     * @returns {function} Unsubscribe function
     */
    once(eventName, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(eventName, wrapper);
        };
        
        return this.on(eventName, wrapper);
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event name
     * @param {function} callback - Callback to remove
     */
    off(eventName, callback) {
        if (!this.listeners[eventName]) return;
        
        const index = this.listeners[eventName].indexOf(callback);
        if (index > -1) {
            this.listeners[eventName].splice(index, 1);
        }
        
        // Clean up empty listener arrays
        if (this.listeners[eventName].length === 0) {
            delete this.listeners[eventName];
        }
    }
    
    // ═════════════════════════════════════════════════
    //  EMIT EVENTS
    // ═════════════════════════════════════════════════
    
    /**
     * Emit an event to all subscribers
     * @param {string} eventName - Event name
     * @param {*} data - Data to pass to callbacks
     */
    emit(eventName, data) {

        // Call all listeners for this event
        if (this.listeners[eventName]) {
            for (let callback of this.listeners[eventName]) {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`EventBus error in ${eventName}:`, error);
                }
            }
        }
        
        // Wildcard listeners (e.g., 'simulation:*')
        const wildcardPattern = eventName.split(':')[0] + ':*';
        if (this.listeners[wildcardPattern]) {
            for (let callback of this.listeners[wildcardPattern]) {
                try {
                    callback({ event: eventName, data });
                } catch (error) {
                    console.error(`EventBus wildcard error in ${eventName}:`, error);
                }
            }
        }
    }
    
    // ═════════════════════════════════════════════════
    //  UTILITIES
    // ═════════════════════════════════════════════════
    
    /**
     * Remove all listeners (cleanup)
     */
    clear() {
        this.listeners = {};
        this.history = [];
    }
    
    /**
     * Get all registered event names
     * @returns {string[]} Array of event names
     */
    getEventNames() {
        return Object.keys(this.listeners);
    }
    
    /**
     * Get number of listeners for an event
     * @param {string} eventName - Event name
     * @returns {number} Number of listeners
     */
    getListenerCount(eventName) {
        return this.listeners[eventName] ? this.listeners[eventName].length : 0;
    }
    
    /**
     * Enable event history recording (for debugging)
     * @param {boolean} enabled - Enable/disable
     */
    setHistoryRecording(enabled) {
        this.recordHistory = enabled;
    }
    
    /**
     * Get event history
     * @returns {Array} Event history
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * Clear event history
     */
    clearHistory() {
        this.history = [];
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}
