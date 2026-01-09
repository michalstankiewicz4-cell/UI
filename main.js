// ═══════════════════════════════════════════════════════════════
//   MAIN - ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════
// Entry point for multi-simulation system with dynamic UI
// Implements: Simulation → UI architecture with Dynamic approach

console.log('=== MULTI-SIMULATION SYSTEM v2.0 ===');
console.log('Architecture: Simulation → UI (Dynamic)');

// ═════════════════════════════════════════════════
//  1. CANVAS SETUP
// ═════════════════════════════════════════════════

const canvases = {
    sim1: document.getElementById('canvas-sim1'),
    sim2: document.getElementById('canvas-sim2'),
    sim3: document.getElementById('canvas-sim3'),
    sim4: document.getElementById('canvas-sim4'),
    ui: document.getElementById('canvas-ui')
};

// Resize all canvases
const resizeCanvases = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    for (let key in canvases) {
        if (canvases[key]) {
            canvases[key].width = w;
            canvases[key].height = h;
        }
    }
};

resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// ═════════════════════════════════════════════════
//  2. SIMULATION INSTANCES (initially empty - Dynamic approach!)
// ═════════════════════════════════════════════════

const simulations = {};

// Dynamic loading example (uncomment to auto-load):
/*
import Sim1 from './simulations/sim1/Sim1.js';
simulations.sim1 = new Sim1(canvases.sim1);
*/

// ═════════════════════════════════════════════════
//  3. UI SYSTEM SETUP
// ═════════════════════════════════════════════════

// UI system (uses bundled dist/ui.js)
const windowManager = new UI.WindowManager();
const taskbar = new UI.Taskbar();
taskbar.addSection('simulations');

const eventRouter = new UI.EventRouter(
    canvases.ui,
    null, // no camera
    windowManager,
    taskbar,
    null  // no stats window
);

console.log('✅ UI system initialized');

// ═════════════════════════════════════════════════
//  4. CREATE MASTER CONTROLS (Dynamic approach!)
// ═════════════════════════════════════════════════

// Master control window for adding/removing simulations dynamically
const masterWindow = new UI.BaseWindow(50, 50, 'Master Controls');
masterWindow.width = 320;
masterWindow.height = 380;

masterWindow.addSection('dynamic controls');
masterWindow.addText('Add simulations at runtime!', '#00F5FF');
masterWindow.addText('No restart needed.', '#00FF88');
masterWindow.addText(' ');

// Button: Add Sim1
masterWindow.addButton('Add Sim1 (Particles)', async () => {
    if (simulations.sim1) {
        alert('Sim1 already running!');
        return;
    }
    
    const { default: Sim1 } = await import('./simulations/sim1/Sim1.js');
    simulations.sim1 = new Sim1(canvases.sim1);
    
    // Create UI window
    const sim1Window = new UI.BaseWindow(50, 450, 'Sim1: Particles');
    sim1Window.width = 280;
    sim1Window.height = 200;
    sim1Window.addSection('stats');
    sim1Window.addText(() => `FPS: ${simulations.sim1.fps}`);
    sim1Window.addText(() => `Particles: ${simulations.sim1.activeParticles}`);
    sim1Window.addButton('Pause', () => {
        simulations.sim1.setPaused(!simulations.sim1.paused);
    });
    sim1Window.addButton('Reset', () => simulations.sim1.reset());
    
    sim1Window.onClose = () => {
        windowManager.remove(sim1Window);
        taskbar.removeWindowItem(sim1Window);
        delete simulations.sim1;
    };
    
    windowManager.add(sim1Window);
    taskbar.addWindowItem('Sim1', sim1Window);
    
    console.log('✅ Sim1 added!');
});

// Button: Add Sim2
masterWindow.addButton('Add Sim2 (3D Cubes)', async () => {
    if (simulations.sim2) {
        alert('Sim2 already running!');
        return;
    }
    
    const { default: Sim2 } = await import('./simulations/sim2/Sim2.js');
    simulations.sim2 = new Sim2(canvases.sim2);
    
    const sim2Window = new UI.BaseWindow(350, 450, 'Sim2: 3D Cubes');
    sim2Window.width = 280;
    sim2Window.height = 200;
    sim2Window.addSection('stats');
    sim2Window.addText(() => `FPS: ${simulations.sim2.fps}`);
    sim2Window.addText(() => `Cubes: ${simulations.sim2.activeCubes}`);
    sim2Window.addButton('Pause', () => {
        simulations.sim2.setPaused(!simulations.sim2.paused);
    });
    sim2Window.addButton('Reset', () => simulations.sim2.reset());
    
    sim2Window.onClose = () => {
        windowManager.remove(sim2Window);
        taskbar.removeWindowItem(sim2Window);
        delete simulations.sim2;
    };
    
    windowManager.add(sim2Window);
    taskbar.addWindowItem('Sim2', sim2Window);
    
    console.log('✅ Sim2 added!');
});

// Button: Add Sim3
masterWindow.addButton('Add Sim3 (Physics)', async () => {
    if (simulations.sim3) {
        alert('Sim3 already running!');
        return;
    }
    
    const { default: Sim3 } = await import('./simulations/sim3/Sim3.js');
    simulations.sim3 = new Sim3(canvases.sim3);
    
    const sim3Window = new UI.BaseWindow(650, 450, 'Sim3: Physics');
    sim3Window.width = 280;
    sim3Window.height = 200;
    sim3Window.addSection('stats');
    sim3Window.addText(() => `FPS: ${simulations.sim3.fps}`);
    sim3Window.addText(() => `Balls: ${simulations.sim3.activeBalls}`);
    sim3Window.addButton('Pause', () => {
        simulations.sim3.setPaused(!simulations.sim3.paused);
    });
    sim3Window.addButton('Reset', () => simulations.sim3.reset());
    
    sim3Window.onClose = () => {
        windowManager.remove(sim3Window);
        taskbar.removeWindowItem(sim3Window);
        delete simulations.sim3;
    };
    
    windowManager.add(sim3Window);
    taskbar.addWindowItem('Sim3', sim3Window);
    
    console.log('✅ Sim3 added!');
});

// Button: Add Sim4
masterWindow.addButton('Add Sim4 (Automata)', async () => {
    if (simulations.sim4) {
        alert('Sim4 already running!');
        return;
    }
    
    const { default: Sim4 } = await import('./simulations/sim4/Sim4.js');
    simulations.sim4 = new Sim4(canvases.sim4);
    
    const sim4Window = new UI.BaseWindow(950, 450, 'Sim4: Automata');
    sim4Window.width = 280;
    sim4Window.height = 200;
    sim4Window.addSection('stats');
    sim4Window.addText(() => `FPS: ${simulations.sim4.fps}`);
    sim4Window.addText(() => `Alive: ${simulations.sim4.aliveCells}`);
    sim4Window.addButton('Pause', () => {
        simulations.sim4.setPaused(!simulations.sim4.paused);
    });
    sim4Window.addButton('Reset', () => simulations.sim4.reset());
    
    sim4Window.onClose = () => {
        windowManager.remove(sim4Window);
        taskbar.removeWindowItem(sim4Window);
        delete simulations.sim4;
    };
    
    windowManager.add(sim4Window);
    taskbar.addWindowItem('Sim4', sim4Window);
    
    console.log('✅ Sim4 added!');
});

masterWindow.addSection('global');
masterWindow.addButton('Remove All Sims', () => {
    const windows = [...windowManager.windows];
    for (let win of windows) {
        if (win !== masterWindow) {
            windowManager.remove(win);
            taskbar.removeWindowItem(win);
        }
    }
    
    for (let key in simulations) {
        delete simulations[key];
    }
    
    console.log('🗑️ All simulations removed!');
});

windowManager.add(masterWindow);
taskbar.addWindowItem('Master', masterWindow);

masterWindow.onClose = () => {
    windowManager.remove(masterWindow);
    taskbar.removeWindowItem(masterWindow);
};

console.log('✅ Master controls created');

// ═════════════════════════════════════════════════
//  5. RENDER LOOP
// ═════════════════════════════════════════════════

function render() {
    // Update & render all active simulations
    if (simulations.sim1) {
        simulations.sim1.update();
        simulations.sim1.render();
    }
    
    if (simulations.sim2) {
        simulations.sim2.update();
        simulations.sim2.render();
    }
    
    if (simulations.sim3) {
        simulations.sim3.update();
        simulations.sim3.render();
    }
    
    if (simulations.sim4) {
        simulations.sim4.update();
        simulations.sim4.render();
    }
    
    // UI overlay (renders only when isDirty)
    const ctx = canvases.ui.getContext('2d');
    ctx.clearRect(0, 0, canvases.ui.width, canvases.ui.height);
    
    windowManager.windows.forEach(w => w.isDirty = true);
    windowManager.draw(ctx, UI.STYLES);
    
    ctx.save();
    taskbar.draw(ctx, UI.STYLES, UI.measureTextCached);
    ctx.restore();
    
    requestAnimationFrame(render);
}

render();

console.log('=== SYSTEM READY! ===');
console.log('Click "Add Sim1/2/3/4" to dynamically add simulations!');
