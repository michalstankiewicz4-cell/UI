// SimulationWindowFactory - Auto-generates UI windows from simulation metadata
// Works with file:// protocol (no ES6 modules, pure global scope)

class SimulationWindowFactory {
    
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
        const window = new UI.BaseWindow(100, 100, windowTitle);
        
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
        
        // Common buttons (Pause, Reset)
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
        
        // STATISTICS section
        if (metadata.stats && metadata.stats.length > 0) {
            window.addSection('statistics', 'statistics');
            
            window.addText(() => {
                const lines = [];
                for (const statName of metadata.stats) {
                    const value = dataBridge.getStat(simId, statName);
                    if (value !== undefined) {
                        const label = statName.charAt(0).toUpperCase() + statName.slice(1);
                        lines.push(`${label}: ${value}`);
                    }
                }
                return lines.join('\n');
            });
        }
        
        console.log(`✅ Window created for ${simId}`);
        return window;
    }
}

// Export for use in global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulationWindowFactory;
}
