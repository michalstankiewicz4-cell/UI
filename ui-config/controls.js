// ═══════════════════════════════════════════════════════════════
//   UI CONFIGURATION - DYNAMIC CONTROLS
// ═══════════════════════════════════════════════════════════════
// Handles dynamic addition/removal of simulations
// Implements "Dynamic approach" for runtime simulation management

/**
 * Create master control window for adding/removing simulations
 * @param {Object} ui - UI system instance
 * @param {Object} simulations - Map of simulation instances
 * @param {Object} canvases - Map of canvas elements
 * @returns {Object} Control window instance
 */
export function createMasterControls(ui, simulations, canvases) {
    const controlWindow = new UI.BaseWindow(50, 300, 'Master Controls');
    controlWindow.width = 280;
    controlWindow.height = 280;
    
    controlWindow.addSection('add simulations');
    
    // Add Simulation 1
    controlWindow.addButton('Add Sim1 (Particles)', () => {
        if (!simulations.sim1) {
            // Dynamically import and create simulation
            import('../simulations/sim1/Sim1.js').then(module => {
                simulations.sim1 = new module.default(canvases.sim1);
                
                // Create UI window for this simulation
                import('./windows.js').then(windowsModule => {
                    windowsModule.createWindows(ui, { sim1: simulations.sim1 });
                });
                
                console.log('✅ Sim1 added!');
            });
        } else {
            alert('Sim1 already running!');
        }
    });
    
    // Add Simulation 2
    controlWindow.addButton('Add Sim2 (3D Cubes)', () => {
        if (!simulations.sim2) {
            import('../simulations/sim2/Sim2.js').then(module => {
                simulations.sim2 = new module.default(canvases.sim2);
                
                import('./windows.js').then(windowsModule => {
                    windowsModule.createWindows(ui, { sim2: simulations.sim2 });
                });
                
                console.log('✅ Sim2 added!');
            });
        } else {
            alert('Sim2 already running!');
        }
    });
    
    // Add Simulation 3
    controlWindow.addButton('Add Sim3 (Physics)', () => {
        if (!simulations.sim3) {
            import('../simulations/sim3/Sim3.js').then(module => {
                simulations.sim3 = new module.default(canvases.sim3);
                
                import('./windows.js').then(windowsModule => {
                    windowsModule.createWindows(ui, { sim3: simulations.sim3 });
                });
                
                console.log('✅ Sim3 added!');
            });
        } else {
            alert('Sim3 already running!');
        }
    });
    
    // Add Simulation 4
    controlWindow.addButton('Add Sim4 (Automata)', () => {
        if (!simulations.sim4) {
            import('../simulations/sim4/Sim4.js').then(module => {
                simulations.sim4 = new module.default(canvases.sim4);
                
                import('./windows.js').then(windowsModule => {
                    windowsModule.createWindows(ui, { sim4: simulations.sim4 });
                });
                
                console.log('✅ Sim4 added!');
            });
        } else {
            alert('Sim4 already running!');
        }
    });
    
    controlWindow.addSection('remove simulations');
    
    controlWindow.addButton('Remove All', () => {
        // Remove all simulations
        for (let key in simulations) {
            delete simulations[key];
        }
        
        // Clear all windows except this one
        const windows = [...ui.windowManager.windows];
        for (let window of windows) {
            if (window !== controlWindow) {
                ui.windowManager.remove(window);
                ui.taskbar.removeWindowItem(window);
            }
        }
        
        console.log('🗑️ All simulations removed!');
    });
    
    ui.windowManager.add(controlWindow);
    ui.taskbar.addWindowItem('Master', controlWindow);
    
    controlWindow.onClose = () => {
        ui.windowManager.remove(controlWindow);
        ui.taskbar.removeWindowItem(controlWindow);
    };
    
    return controlWindow;
}
