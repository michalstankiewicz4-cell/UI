// ═══════════════════════════════════════════════════════════════
//   UI CONFIGURATION - CROSS-SIMULATION SYNC
// ═══════════════════════════════════════════════════════════════
// Handles linking between multiple simulations
// Implements callbacks for simulation interdependencies

/**
 * Create sync/link window for cross-simulation interactions
 * @param {Object} ui - UI system instance
 * @param {Object} simulations - Map of simulation instances
 * @returns {Object} Sync window instance
 */
export function createSyncControls(ui, simulations) {
    const syncWindow = new UI.BaseWindow(50, 600, 'Sync Controls');
    syncWindow.width = 380;
    syncWindow.height = 280;
    
    syncWindow.addSection('combined stats');
    
    // Total FPS across all simulations
    syncWindow.addText(() => {
        let totalFps = 0;
        if (simulations.sim1) totalFps += simulations.sim1.fps;
        if (simulations.sim2) totalFps += simulations.sim2.fps;
        if (simulations.sim3) totalFps += simulations.sim3.fps;
        if (simulations.sim4) totalFps += simulations.sim4.fps;
        return `Total FPS: ${totalFps}`;
    });
    
    // Individual FPS
    syncWindow.addText(() => {
        const fps = [];
        if (simulations.sim1) fps.push(`S1:${simulations.sim1.fps}`);
        if (simulations.sim2) fps.push(`S2:${simulations.sim2.fps}`);
        if (simulations.sim3) fps.push(`S3:${simulations.sim3.fps}`);
        if (simulations.sim4) fps.push(`S4:${simulations.sim4.fps}`);
        return fps.length > 0 ? fps.join(' | ') : 'No sims active';
    });
    
    syncWindow.addText(() => {
        const active = Object.keys(simulations).length;
        return `Active Sims: ${active}`;
    });
    
    syncWindow.addSection('linking');
    
    // Example: Link Sim1 particles to Sim3 balls
    syncWindow.addButton('Link: S1 → S3', () => {
        if (!simulations.sim1 || !simulations.sim3) {
            alert('Both Sim1 and Sim3 must be active!');
            return;
        }
        
        // When a particle in Sim1 hits the edge, add a ball to Sim3
        // (This is just an example - customize as needed)
        alert('Linking Sim1 → Sim3: Not yet implemented!');
        console.log('TODO: Implement sim1 → sim3 callback');
    });
    
    // Example: Sync Sim2 rotation with Sim4 update speed
    syncWindow.addButton('Sync: S2 ↔ S4', () => {
        if (!simulations.sim2 || !simulations.sim4) {
            alert('Both Sim2 and Sim4 must be active!');
            return;
        }
        
        // Sync rotation speed with cellular automata update speed
        alert('Syncing Sim2 ↔ Sim4: Not yet implemented!');
        console.log('TODO: Implement sim2 ↔ sim4 sync');
    });
    
    syncWindow.addSection('global controls');
    
    // Pause all simulations
    syncWindow.addButton('Pause All', () => {
        if (simulations.sim1) simulations.sim1.setPaused(true);
        if (simulations.sim2) simulations.sim2.setPaused(true);
        if (simulations.sim3) simulations.sim3.setPaused(true);
        if (simulations.sim4) simulations.sim4.setPaused(true);
        console.log('⏸️ All simulations paused');
    });
    
    // Resume all simulations
    syncWindow.addButton('Resume All', () => {
        if (simulations.sim1) simulations.sim1.setPaused(false);
        if (simulations.sim2) simulations.sim2.setPaused(false);
        if (simulations.sim3) simulations.sim3.setPaused(false);
        if (simulations.sim4) simulations.sim4.setPaused(false);
        console.log('▶️ All simulations resumed');
    });
    
    // Reset all simulations
    syncWindow.addButton('Reset All', () => {
        if (simulations.sim1) simulations.sim1.reset();
        if (simulations.sim2) simulations.sim2.reset();
        if (simulations.sim3) simulations.sim3.reset();
        if (simulations.sim4) simulations.sim4.reset();
        console.log('🔄 All simulations reset');
    });
    
    ui.windowManager.add(syncWindow);
    ui.taskbar.addWindowItem('Sync', syncWindow);
    
    syncWindow.onClose = () => {
        ui.windowManager.remove(syncWindow);
        ui.taskbar.removeWindowItem(syncWindow);
    };
    
    return syncWindow;
}

/**
 * Example: Setup custom callbacks between simulations
 * Uncomment and modify as needed for your specific use case
 */
export function setupCustomCallbacks(simulations) {
    // Example: When a particle dies in Sim1, add a ball to Sim3
    /*
    if (simulations.sim1 && simulations.sim3) {
        simulations.sim1.onParticleDie = () => {
            simulations.sim3.balls.push({
                x: Math.random() * simulations.sim3.canvas.width,
                y: 0,
                vx: 0,
                vy: 0,
                radius: 5,
                color: '#FF0088'
            });
        };
    }
    */
    
    // Example: Sync Sim2 rotation with Sim4 density
    /*
    if (simulations.sim2 && simulations.sim4) {
        setInterval(() => {
            const avgRotation = simulations.sim2.cubes.reduce((sum, c) => sum + c.rotY, 0) / simulations.sim2.cubes.length;
            const normalizedSpeed = Math.abs(avgRotation) / Math.PI;
            simulations.sim4.setUpdateSpeed(Math.floor(normalizedSpeed * 20) + 1);
        }, 100);
    }
    */
    
    console.log('Custom callbacks setup (if any)');
}
