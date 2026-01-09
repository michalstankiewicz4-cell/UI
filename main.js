// ═══════════════════════════════════════════════════════════════
//   MAIN - ORCHESTRATOR (v2.1 - Core Architecture)
// ═══════════════════════════════════════════════════════════════
// Entry point for multi-simulation system with centralized management
// Architecture: main.js → SimulationManager → [Simulations]
//                              ↓
//                    EventBus ↔ DataBridge
//                              ↓
//                         UI System

console.log('=== MULTI-SIMULATION SYSTEM v2.1 ===');
console.log('Architecture: Core-based (SimulationManager + EventBus)');

// ═════════════════════════════════════════════════
//  1. IMPORT CORE MODULES
// ═════════════════════════════════════════════════

import EventBus from './core/EventBus.js';
import DataBridge from './core/DataBridge.js';
import SimulationManager from './core/SimulationManager.js';

// ═════════════════════════════════════════════════
//  2. CANVAS SETUP
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
//  3. CORE SYSTEM INITIALIZATION
// ═════════════════════════════════════════════════

const eventBus = new EventBus();
const dataBridge = new DataBridge(eventBus);
const simulationManager = new SimulationManager(eventBus, dataBridge);

console.log('✅ Core system initialized');

// ═════════════════════════════════════════════════
//  4. REGISTER SIMULATIONS
// ═════════════════════════════════════════════════

simulationManager.register('sim1', 
    () => import('./simulations/sim1/Sim1.js'),
    {
        name: '2D Particles',
        description: 'Bouncing particles with colors',
        type: '2D'
    }
);

simulationManager.register('sim2',
    () => import('./simulations/sim2/Sim2.js'),
    {
        name: '3D Cubes',
        description: 'Rotating cubes with perspective',
        type: '3D'
    }
);

simulationManager.register('sim3',
    () => import('./simulations/sim3/Sim3.js'),
    {
        name: 'Physics',
        description: 'Bouncing balls with gravity',
        type: '2D Physics'
    }
);

simulationManager.register('sim4',
    () => import('./simulations/sim4/Sim4.js'),
    {
        name: 'Cellular Automata',
        description: 'Game of Life style simulation',
        type: 'Grid'
    }
);

console.log('✅ Simulations registered:', simulationManager.getRegisteredSimulations());

// ═════════════════════════════════════════════════
//  5. UI SYSTEM SETUP
// ═════════════════════════════════════════════════

const windowManager = new UI.WindowManager();
const taskbar = new UI.Taskbar();
taskbar.addSection('simulations');

const eventRouter = new UI.EventRouter(
    canvases.ui,
    null,
    windowManager,
    taskbar,
    null
);

console.log('✅ UI system initialized');

// ═════════════════════════════════════════════════
//  6. MASTER CONTROL WINDOW
// ═════════════════════════════════════════════════

const masterWindow = new UI.BaseWindow(50, 50, 'Master Controls');
masterWindow.width = 320;
masterWindow.height = 450;

masterWindow.addSection('dynamic controls');
masterWindow.addText('Add simulations at runtime!', '#00F5FF');
masterWindow.addText('Event-driven architecture.', '#00FF88');
masterWindow.addText(' ');

// Helper: Create UI window for simulation
function createSimWindow(simId, x, y) {
    const metadata = simulationManager.getMetadata(simId);
    const sim = simulationManager.getSimulation(simId);
    
    const simWindow = new UI.BaseWindow(x, y, metadata.name);
    simWindow.width = 280;
    simWindow.height = 200;
    
    simWindow.addSection('stats');
    simWindow.addText(() => `FPS: ${dataBridge.getStat(simId, 'fps') || 0}`);
    
    // Sim-specific stats
    if (simId === 'sim1') {
        simWindow.addText(() => `Particles: ${sim?.activeParticles || 0}`);
    } else if (simId === 'sim2') {
        simWindow.addText(() => `Cubes: ${sim?.activeCubes || 0}`);
    } else if (simId === 'sim3') {
        simWindow.addText(() => `Balls: ${sim?.activeBalls || 0}`);
    } else if (simId === 'sim4') {
        simWindow.addText(() => `Alive: ${sim?.aliveCells || 0}`);
    }
    
    simWindow.addButton('Pause', () => {
        const currentPaused = dataBridge.getParameter(simId, 'paused') || false;
        dataBridge.setParameter(simId, 'paused', !currentPaused);
    });
    
    simWindow.addButton('Reset', () => {
        dataBridge.setParameter(simId, 'reset', true);
    });
    
    simWindow.onClose = () => {
        windowManager.remove(simWindow);
        taskbar.removeWindowItem(simWindow);
        simulationManager.removeSimulation(simId);
    };
    
    windowManager.add(simWindow);
    taskbar.addWindowItem(metadata.name, simWindow);
    
    return simWindow;
}

// Add Sim1 button
masterWindow.addButton('Add Sim1 (Particles)', async () => {
    if (simulationManager.isActive('sim1')) {
        alert('Sim1 already running!');
        return;
    }
    
    const success = await simulationManager.addSimulation('sim1', canvases.sim1);
    if (success) {
        createSimWindow('sim1', 50, 450);
        console.log('✅ Sim1 added via SimulationManager');
    }
});

// Add Sim2 button
masterWindow.addButton('Add Sim2 (3D Cubes)', async () => {
    if (simulationManager.isActive('sim2')) {
        alert('Sim2 already running!');
        return;
    }
    
    const success = await simulationManager.addSimulation('sim2', canvases.sim2);
    if (success) {
        createSimWindow('sim2', 350, 450);
        console.log('✅ Sim2 added via SimulationManager');
    }
});

// Add Sim3 button
masterWindow.addButton('Add Sim3 (Physics)', async () => {
    if (simulationManager.isActive('sim3')) {
        alert('Sim3 already running!');
        return;
    }
    
    const success = await simulationManager.addSimulation('sim3', canvases.sim3);
    if (success) {
        createSimWindow('sim3', 650, 450);
        console.log('✅ Sim3 added via SimulationManager');
    }
});

// Add Sim4 button
masterWindow.addButton('Add Sim4 (Automata)', async () => {
    if (simulationManager.isActive('sim4')) {
        alert('Sim4 already running!');
        return;
    }
    
    const success = await simulationManager.addSimulation('sim4', canvases.sim4);
    if (success) {
        createSimWindow('sim4', 950, 450);
        console.log('✅ Sim4 added via SimulationManager');
    }
});

masterWindow.addSection('global');

masterWindow.addButton('Pause All', () => {
    simulationManager.pauseAll();
    console.log('⏸️ All simulations paused');
});

masterWindow.addButton('Resume All', () => {
    simulationManager.resumeAll();
    console.log('▶️ All simulations resumed');
});

masterWindow.addButton('Reset All', () => {
    simulationManager.resetAll();
    console.log('🔄 All simulations reset');
});

masterWindow.addButton('Remove All Sims', () => {
    const windows = [...windowManager.windows];
    for (let win of windows) {
        if (win !== masterWindow && win !== statsWindow) {
            windowManager.remove(win);
            taskbar.removeWindowItem(win);
        }
    }
    
    simulationManager.removeAll();
    console.log('🗑️ All simulations removed!');
});

windowManager.add(masterWindow);
taskbar.addWindowItem('Master', masterWindow);

masterWindow.onClose = () => {
    windowManager.remove(masterWindow);
    taskbar.removeWindowItem(masterWindow);
};

// ═════════════════════════════════════════════════
//  7. DEMO WINDOW - Full UI Feature Showcase
// ═════════════════════════════════════════════════

const demoWindow = new UI.BaseWindow(400, 50, 'UI Demo - All Features');
demoWindow.width = 380;
demoWindow.height = 500;

demoWindow.addSection('header buttons');
demoWindow.addText('Test all header buttons:', '#00F5FF');
demoWindow.addText('• X = Close window', '#00FF88');
demoWindow.addText('• _ = Minimize to taskbar', '#00FF88');
demoWindow.addText('• ○ = HUD mode (floating)', '#00FF88');
demoWindow.addText(' ');

demoWindow.addSection('scrollbar test');
demoWindow.addText('Long content for scrollbar:', '#00F5FF');
demoWindow.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
demoWindow.addText('Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
demoWindow.addText('Ut enim ad minim veniam, quis nostrud exercitation ullamco.');
demoWindow.addText('Laboris nisi ut aliquip ex ea commodo consequat.');
demoWindow.addText('Duis aute irure dolor in reprehenderit in voluptate velit.');
demoWindow.addText('Esse cillum dolore eu fugiat nulla pariatur.');
demoWindow.addText('Excepteur sint occaecat cupidatat non proident.');
demoWindow.addText('Sunt in culpa qui officia deserunt mollit anim id est laborum.');
demoWindow.addText(' ');

demoWindow.addSection('buttons');
demoWindow.addButton('Test Button 1', () => {
    alert('Button 1 clicked!');
});
demoWindow.addButton('Test Button 2', () => {
    console.log('Button 2 clicked!');
    alert('Check console!');
});
demoWindow.addText(' ');

demoWindow.addSection('more content');
demoWindow.addText('Sed ut perspiciatis unde omnis iste natus error sit.');
demoWindow.addText('Voluptatem accusantium doloremque laudantium totam rem aperiam.');
demoWindow.addText('Eaque ipsa quae ab illo inventore veritatis et quasi architecto.');
demoWindow.addText('Beatae vitae dicta sunt explicabo nemo enim ipsam voluptatem.');
demoWindow.addText('Quia voluptas sit aspernatur aut odit aut fugit.');
demoWindow.addText('Sed quia consequuntur magni dolores eos qui ratione voluptatem.');
demoWindow.addText(' ');

demoWindow.addSection('dynamic content');
let counter = 0;
demoWindow.addText(() => {
    counter++;
    return `Dynamic counter: ${counter}`;
}, '#00F5FF');
demoWindow.addText(() => {
    return `Timestamp: ${Date.now()}`;
}, '#00FF88');
demoWindow.addText(' ');

demoWindow.addSection('final section');
demoWindow.addText('At vero eos et accusamus et iusto odio dignissimos.');
demoWindow.addText('Ducimus qui blanditiis praesentium voluptatum deleniti atque.');
demoWindow.addText('Corrupti quos dolores et quas molestias excepturi sint.');
demoWindow.addText('Occaecati cupiditate non provident similique sunt in culpa.');
demoWindow.addText(' ');
demoWindow.addText('✅ End of content', '#00FF88');

windowManager.add(demoWindow);
taskbar.addWindowItem('Demo', demoWindow);

demoWindow.onClose = () => {
    windowManager.remove(demoWindow);
    taskbar.removeWindowItem(demoWindow);
};

console.log('✅ Demo window created with full content');

// ═════════════════════════════════════════════════
//  8. COMBINED STATS WINDOW
// ═════════════════════════════════════════════════

const statsWindow = new UI.BaseWindow(50, 520, 'System Stats');
statsWindow.width = 320;
statsWindow.height = 180;

statsWindow.addSection('global stats');
statsWindow.addText(() => {
    const active = simulationManager.getActiveCount();
    return `Active Sims: ${active}`;
});

statsWindow.addText(() => {
    let totalFps = 0;
    const sims = simulationManager.getActiveSimulations();
    for (let simId of sims) {
        totalFps += dataBridge.getStat(simId, 'fps') || 0;
    }
    return `Total FPS: ${totalFps}`;
});

statsWindow.addText(() => {
    const sims = simulationManager.getActiveSimulations();
    const fps = sims.map(id => `${id}:${dataBridge.getStat(id, 'fps') || 0}`);
    return fps.length > 0 ? fps.join(' | ') : 'No sims active';
});

windowManager.add(statsWindow);
taskbar.addWindowItem('Stats', statsWindow);

statsWindow.onClose = () => {
    windowManager.remove(statsWindow);
    taskbar.removeWindowItem(statsWindow);
};

console.log('✅ Master controls created');

// ═════════════════════════════════════════════════
//  8. EVENT LISTENERS (EventBus examples)
// ═════════════════════════════════════════════════

eventBus.on('simulation:added', (data) => {
    console.log(`📢 Event: Simulation added - ${data.simId}`);
});

eventBus.on('simulation:removed', (data) => {
    console.log(`📢 Event: Simulation removed - ${data.simId}`);
});

eventBus.on('parameter:changed', (data) => {
    console.log(`📢 Event: Parameter changed - ${data.simId}.${data.paramName} = ${data.value}`);
});

// ═════════════════════════════════════════════════
//  9. RENDER LOOP
// ═════════════════════════════════════════════════

function render() {
    // Update & render all simulations via SimulationManager
    simulationManager.updateAll();
    simulationManager.renderAll();
    
    // UI overlay
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
console.log('Architecture: Core-based with SimulationManager + EventBus');
console.log('Click "Add Sim1/2/3/4" to dynamically add simulations!');
