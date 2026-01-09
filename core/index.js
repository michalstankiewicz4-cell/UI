// ═══════════════════════════════════════════════════════════════
//   CORE - Module Exports
// ═══════════════════════════════════════════════════════════════
// Central export point for all core modules

import EventBus from './EventBus.js';
import DataBridge from './DataBridge.js';
import SimulationManager from './SimulationManager.js';

export {
    EventBus,
    DataBridge,
    SimulationManager
};

// Default export (for convenience)
export default {
    EventBus,
    DataBridge,
    SimulationManager
};
