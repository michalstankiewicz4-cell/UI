// ═══════════════════════════════════════════════════════════════
//   SIMULATION WINDOW FACTORY DOM - CSS/DOM Edition
// ═══════════════════════════════════════════════════════════════

class SimulationWindowFactoryDOM {
    
    static create(simId, simulationManager, dataBridge) {
        const sim = simulationManager.getSimulation(simId);
        if (!sim) {
            console.error(`Cannot create window: simulation ${simId} not found`);
            return null;
        }
        
        const metadata = simulationManager.getMetadata(simId);
        if (!metadata) {
            console.error(`Cannot create window: no metadata for ${simId}`);
            return null;
        }
        
        const windowTitle = metadata.name || simId.toUpperCase();
        const window = new BaseWindowDOM(100, 100, windowTitle);
        
        // ═══════════════════════════════════════════════════════════════
        //   MODE SYSTEM - Simulation Window Hooks
        // ═══════════════════════════════════════════════════════════════
        
        // Minimize → minimized mode
        window.onMinimize = () => {
            window.visible = false;
            window.minimized = true;
            simulationManager.eventBus.emit('simulation:mode-changed', { simId, mode: 'minimized' });
        };
        
        // Eye button → toggle transparent
        window.onToggleTransparent = () => {
            window.transparent = !window.transparent;
        };
        
        // Close → minimized mode
        window.onClose = () => {
            window.visible = false;
            window.minimized = false;
            simulationManager.eventBus.emit('simulation:mode-changed', { simId, mode: 'minimized' });
        };
        
        // ═══════════════════════════════════════════════════════════════
        
        // CONTROLS section
        if (metadata.controls && metadata.controls.length > 0) {
            window.addSection('controls');
            
            for (const control of metadata.controls) {
                if (control.type === 'slider') {
                    window.addSlider(
                        control.label,
                        () => dataBridge.getParameter(simId, control.param) || control.min,
                        (value) => dataBridge.setParameter(simId, control.param, value),
                        control.min,
                        control.max,
                        control.step || 0.1
                    );
                } else if (control.type === 'button') {
                    window.addButton(control.label, () => {
                        if (control.action && typeof sim[control.action] === 'function') {
                            sim[control.action]();
                        }
                    });
                } else if (control.type === 'toggle') {
                    window.addToggle(
                        control.label,
                        () => dataBridge.getParameter(simId, control.param) || false,
                        (value) => dataBridge.setParameter(simId, control.param, value)
                    );
                }
            }
        }
        
        // Common buttons
        if (typeof sim.setPaused === 'function') {
            window.addButton('PAUSE/RESUME', () => {
                sim.setPaused(!sim.paused);
            });
        }
        
        if (typeof sim.reset === 'function') {
            window.addButton('RESET', () => {
                sim.reset();
            });
        }
        
        // INTERACTION MATRIX (sim1 only)
        if (simId === 'sim1' && typeof sim.getInteractionForce === 'function') {
            window.addSection('color interactions');
            
            window.addText('Red / Green / Blue\n-1.0 = repel, +1.0 = attract');
            
            // Matrix: 3 colors x 3 colors
            window.addMatrix(
                3, 3,
                (row, col) => sim.getInteractionForce(row, col),
                (row, col, value) => sim.setInteractionForce(row, col, value),
                -1, 1,
                'Force Matrix'
            );
        }
        
        // STATISTICS section
        if (metadata.statistics && metadata.statistics.length > 0) {
            window.addSection('statistics', 'statistics');
            
            for (const stat of metadata.statistics) {
                window.addText(() => {
                    const value = dataBridge.getStatistic(simId, stat.key);
                    return stat.format ? stat.format(value) : `${stat.label}: ${value}`;
                }, '#00F5FF');
            }
        }
        
        return window;
    }
}
