// ═══════════════════════════════════════════════════════════════
//   UI CONFIGURATION - WINDOWS
// ═══════════════════════════════════════════════════════════════
// Creates and configures all UI windows for simulations
// This file wires UI controls to simulation methods

/**
 * Create UI windows for all active simulations
 * @param {Object} ui - UI system instance
 * @param {Object} simulations - Map of simulation instances
 * @returns {Object} Map of created windows
 */
export function createWindows(ui, simulations) {
    const windows = {};
    
    // ═════════════════════════════════════════════════
    //  SIMULATION 1 - 2D Particles
    // ═════════════════════════════════════════════════
    
    if (simulations.sim1) {
        const sim1Window = new UI.BaseWindow(50, 50, 'Sim1: Particles');
        sim1Window.width = 280;
        sim1Window.height = 220;
        
        sim1Window.addSection('controls');
        sim1Window.addText('Particle Count: 50'); // TODO: slider
        sim1Window.addText('Speed: 1.0'); // TODO: slider
        sim1Window.addButton('Pause', () => {
            simulations.sim1.setPaused(!simulations.sim1.paused);
        });
        sim1Window.addButton('Reset', () => simulations.sim1.reset());
        
        sim1Window.addSection('stats');
        sim1Window.addText(() => `FPS: ${simulations.sim1.fps}`);
        sim1Window.addText(() => `Particles: ${simulations.sim1.activeParticles}`);
        
        ui.windowManager.add(sim1Window);
        ui.taskbar.addWindowItem('Sim1', sim1Window);
        
        sim1Window.onClose = () => {
            ui.windowManager.remove(sim1Window);
            ui.taskbar.removeWindowItem(sim1Window);
        };
        
        windows.sim1 = sim1Window;
    }
    
    // ═════════════════════════════════════════════════
    //  SIMULATION 2 - 3D Cubes
    // ═════════════════════════════════════════════════
    
    if (simulations.sim2) {
        const sim2Window = new UI.BaseWindow(350, 50, 'Sim2: 3D Cubes');
        sim2Window.width = 280;
        sim2Window.height = 220;
        
        sim2Window.addSection('controls');
        sim2Window.addText('Cube Count: 20'); // TODO: slider
        sim2Window.addText('Rotation: 0.02'); // TODO: slider
        sim2Window.addButton('Pause', () => {
            simulations.sim2.setPaused(!simulations.sim2.paused);
        });
        sim2Window.addButton('Reset', () => simulations.sim2.reset());
        
        sim2Window.addSection('stats');
        sim2Window.addText(() => `FPS: ${simulations.sim2.fps}`);
        sim2Window.addText(() => `Cubes: ${simulations.sim2.activeCubes}`);
        
        ui.windowManager.add(sim2Window);
        ui.taskbar.addWindowItem('Sim2', sim2Window);
        
        sim2Window.onClose = () => {
            ui.windowManager.remove(sim2Window);
            ui.taskbar.removeWindowItem(sim2Window);
        };
        
        windows.sim2 = sim2Window;
    }
    
    // ═════════════════════════════════════════════════
    //  SIMULATION 3 - Physics Balls
    // ═════════════════════════════════════════════════
    
    if (simulations.sim3) {
        const sim3Window = new UI.BaseWindow(650, 50, 'Sim3: Physics');
        sim3Window.width = 280;
        sim3Window.height = 220;
        
        sim3Window.addSection('controls');
        sim3Window.addText('Ball Count: 30'); // TODO: slider
        sim3Window.addText('Gravity: 0.5'); // TODO: slider
        sim3Window.addButton('Pause', () => {
            simulations.sim3.setPaused(!simulations.sim3.paused);
        });
        sim3Window.addButton('Reset', () => simulations.sim3.reset());
        
        sim3Window.addSection('stats');
        sim3Window.addText(() => `FPS: ${simulations.sim3.fps}`);
        sim3Window.addText(() => `Balls: ${simulations.sim3.activeBalls}`);
        
        ui.windowManager.add(sim3Window);
        ui.taskbar.addWindowItem('Sim3', sim3Window);
        
        sim3Window.onClose = () => {
            ui.windowManager.remove(sim3Window);
            ui.taskbar.removeWindowItem(sim3Window);
        };
        
        windows.sim3 = sim3Window;
    }
    
    // ═════════════════════════════════════════════════
    //  SIMULATION 4 - Cellular Automata
    // ═════════════════════════════════════════════════
    
    if (simulations.sim4) {
        const sim4Window = new UI.BaseWindow(950, 50, 'Sim4: Automata');
        sim4Window.width = 280;
        sim4Window.height = 220;
        
        sim4Window.addSection('controls');
        sim4Window.addText('Density: 0.3'); // TODO: slider
        sim4Window.addText('Update Speed: 5'); // TODO: slider
        sim4Window.addButton('Pause', () => {
            simulations.sim4.setPaused(!simulations.sim4.paused);
        });
        sim4Window.addButton('Reset', () => simulations.sim4.reset());
        
        sim4Window.addSection('stats');
        sim4Window.addText(() => `FPS: ${simulations.sim4.fps}`);
        sim4Window.addText(() => `Alive: ${simulations.sim4.aliveCells}`);
        
        ui.windowManager.add(sim4Window);
        ui.taskbar.addWindowItem('Sim4', sim4Window);
        
        sim4Window.onClose = () => {
            ui.windowManager.remove(sim4Window);
            ui.taskbar.removeWindowItem(sim4Window);
        };
        
        windows.sim4 = sim4Window;
    }
    
    return windows;
}
