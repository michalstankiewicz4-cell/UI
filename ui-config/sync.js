// ═══════════════════════════════════════════════════════════════
//   UI CONFIGURATION - CROSS-SIMULATION SYNC (v2.1)
// ═══════════════════════════════════════════════════════════════
// Uses Core architecture (EventBus, DataBridge, SimulationManager)
// Handles linking between multiple simulations via event-driven approach

/**
 * Create sync/link window for cross-simulation interactions
 * @param {Object} ui - UI system (windowManager, taskbar)
 * @param {SimulationManager} simulationManager - Simulation manager
 * @param {EventBus} eventBus - Event bus
 * @param {DataBridge} dataBridge - Data bridge
 * @returns {Object} Sync window instance
 */
export function createSyncControls(ui, simulationManager, eventBus, dataBridge) {
    const syncWindow = new UI.BaseWindow(50, 700, 'Sync Controls');
    syncWindow.width = 380;
    syncWindow.height = 320;
    
    syncWindow.addSection('combined stats');
    
    // Total FPS across all simulations (via DataBridge)
    syncWindow.addText(() => {
        let totalFps = 0;
        const activeIds = simulationManager.getActiveSimulations();
        
        for (let simId of activeIds) {
            const fps = dataBridge.getStat(simId, 'fps');
            if (fps !== undefined) totalFps += fps;
        }
        
        return `Total FPS: ${totalFps}`;
    });
    
    // Individual FPS (via DataBridge)
    syncWindow.addText(() => {
        const activeIds = simulationManager.getActiveSimulations();
        const fps = activeIds.map(id => {
            const fpsVal = dataBridge.getStat(id, 'fps') || 0;
            return `${id}:${fpsVal}`;
        });
        
        return fps.length > 0 ? fps.join(' | ') : 'No sims active';
    });
    
    // Active count (via SimulationManager)
    syncWindow.addText(() => {
        const count = simulationManager.getActiveCount();
        return `Active Sims: ${count}`;
    });
    
    syncWindow.addSection('event-driven linking');
    
    // Example: Link Sim1 → Sim3 via EventBus
    let sim1ToSim3Linked = false;
    let sim1Listener = null;
    
    syncWindow.addButton('Toggle: S1 → S3', () => {
        if (!sim1ToSim3Linked) {
            // Setup link
            if (!simulationManager.isActive('sim1') || !simulationManager.isActive('sim3')) {
                alert('Both Sim1 and Sim3 must be active!');
                return;
            }
            
            // Listen for Sim1 events and affect Sim3
            sim1Listener = eventBus.on('simulation:sim1:event', (data) => {
                // Example: When Sim1 emits event, add ball to Sim3
                const sim3 = simulationManager.getSimulation('sim3');
                if (sim3 && sim3.balls) {
                    sim3.balls.push({
                        x: Math.random() * sim3.canvas.width,
                        y: 0,
                        vx: 0,
                        vy: 0,
                        radius: 5,
                        color: '#FF0088'
                    });
                }
            });
            
            sim1ToSim3Linked = true;
            console.log('✅ Linked Sim1 → Sim3');
            alert('Linked! (Note: Sims need to emit events)');
        } else {
            // Remove link
            if (sim1Listener) {
                sim1Listener(); // Unsubscribe
                sim1Listener = null;
            }
            sim1ToSim3Linked = false;
            console.log('❌ Unlinked Sim1 → Sim3');
            alert('Unlinked!');
        }
    });
    
    // Example: Sync Sim2 rotation with Sim4 update speed
    let sim2ToSim4Synced = false;
    let syncInterval = null;
    
    syncWindow.addButton('Toggle: S2 ↔ S4 Sync', () => {
        if (!sim2ToSim4Synced) {
            if (!simulationManager.isActive('sim2') || !simulationManager.isActive('sim4')) {
                alert('Both Sim2 and Sim4 must be active!');
                return;
            }
            
            // Sync every 100ms
            syncInterval = setInterval(() => {
                const sim2 = simulationManager.getSimulation('sim2');
                const sim4 = simulationManager.getSimulation('sim4');
                
                if (sim2 && sim4 && sim2.cubes && sim2.cubes.length > 0) {
                    // Calculate average rotation
                    const avgRot = sim2.cubes.reduce((sum, c) => sum + c.rotY, 0) / sim2.cubes.length;
                    const normalizedSpeed = Math.abs(avgRot) / Math.PI;
                    const newUpdateSpeed = Math.floor(normalizedSpeed * 20) + 1;
                    
                    // Set via DataBridge
                    dataBridge.setParameter('sim4', 'updateSpeed', newUpdateSpeed);
                }
            }, 100);
            
            sim2ToSim4Synced = true;
            console.log('✅ Synced Sim2 ↔ Sim4');
            alert('Synced! Sim2 rotation affects Sim4 speed.');
        } else {
            if (syncInterval) {
                clearInterval(syncInterval);
                syncInterval = null;
            }
            sim2ToSim4Synced = false;
            console.log('❌ Unsynced Sim2 ↔ Sim4');
            alert('Unsynced!');
        }
    });
    
    syncWindow.addSection('global controls');
    
    // Pause all (via SimulationManager)
    syncWindow.addButton('Pause All', () => {
        simulationManager.pauseAll();
        console.log('⏸️ All simulations paused via Manager');
    });
    
    // Resume all (via SimulationManager)
    syncWindow.addButton('Resume All', () => {
        simulationManager.resumeAll();
        console.log('▶️ All simulations resumed via Manager');
    });
    
    // Reset all (via SimulationManager)
    syncWindow.addButton('Reset All', () => {
        simulationManager.resetAll();
        console.log('🔄 All simulations reset via Manager');
    });
    
    // Add to UI
    ui.windowManager.add(syncWindow);
    ui.taskbar.addWindowItem('Sync', syncWindow);
    
    syncWindow.onClose = () => {
        // Cleanup
        if (sim1Listener) sim1Listener();
        if (syncInterval) clearInterval(syncInterval);
        
        ui.windowManager.remove(syncWindow);
        ui.taskbar.removeWindowItem(syncWindow);
    };
    
    return syncWindow;
}

/**
 * Setup event listeners for demonstration
 * Shows how to use EventBus for cross-simulation communication
 */
export function setupEventListeners(eventBus, simulationManager) {
    // Listen to all simulation events (wildcard)
    eventBus.on('simulation:*', ({ event, data }) => {
        console.log(`📢 Simulation Event: ${event}`, data);
    });
    
    // Listen to parameter changes
    eventBus.on('parameter:changed', (data) => {
        console.log(`🎚️ Parameter Changed: ${data.simId}.${data.paramName} = ${data.value}`);
    });
    
    // Listen to simulation lifecycle
    eventBus.on('simulation:added', (data) => {
        console.log(`➕ Simulation Added: ${data.simId}`);
    });
    
    eventBus.on('simulation:removed', (data) => {
        console.log(`➖ Simulation Removed: ${data.simId}`);
    });
    
    console.log('✅ Event listeners setup for cross-simulation communication');
}
