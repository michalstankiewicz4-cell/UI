// ═══════════════════════════════════════════════════════════════
//   UI SYSTEM v3.1 - MODERN CSS/DOM EDITION
// ═══════════════════════════════════════════════════════════════

console.log('=== UI SYSTEM v3.1 - MODERN CSS/DOM EDITION ===');

// Core system
const eventBus = new EventBus();
const dataBridge = new DataBridge(eventBus);
const simulationManager = new SimulationManager(eventBus, dataBridge);

// ═══════════════════════════════════════════════════════════════
//   WINDOW HELPERS (DRY pattern)
// ═══════════════════════════════════════════════════════════════

/**
 * Register window (add to manager, taskbar, set visible)
 */
function registerWindow(window, section = 'system', simId = null) {
    window.visible = true;
    windowManager.add(window);
    taskbar.addWindowItem(window.title, window, section, simId);
    window.onClose = () => { 
        window.visible = false;
        taskbar.update();
    };
    window.show();
    return window;
}

/**
 * Unregister window (remove from manager and taskbar)
 */
function unregisterWindow(window) {
    windowManager.remove(window);
    taskbar.removeWindowItem(window);
}

// Canvas setup (for simulations only)
const canvases = {
    sim1: document.getElementById('canvas-sim1'),
    sim2: document.getElementById('canvas-sim2'),
    sim3: document.getElementById('canvas-sim3'),
    sim4: document.getElementById('canvas-sim4')
};

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

// UI system - DOM version
const windowManager = new WindowManagerDOM();
const taskbar = new TaskbarDOM(simulationManager);
window.windowManager = windowManager;  // Make accessible globally
taskbar.addSection('symulacje');
taskbar.addSection('system');

// ═══════════════════════════════════════════════════════════════
//   MODE SYSTEM LISTENER - Canvas Visibility Control
// ═══════════════════════════════════════════════════════════════

eventBus.on('simulation:mode-changed', ({ simId, mode }) => {
    console.log(`🎨 Mode changed: ${simId} → ${mode}`);
    
    const canvas = canvases[simId];
    if (!canvas) return;
    
    if (mode === 'hud') {
        // Canvas fullscreen
        canvas.style.display = 'block';
        canvas.style.zIndex = '1';
    }
    else if (mode === 'window') {
        // Canvas background, window visible
        canvas.style.display = 'block';
        canvas.style.zIndex = '0';
    }
    else if (mode === 'minimized') {
        // Everything hidden
        canvas.style.display = 'none';
    }
});

// Register Simulation 1
simulationManager.register('sim1', 
    () => Promise.resolve(Simulation1), 
    Simulation1.metadata
);


// SIMULATION CONTROLS WINDOW
const controlsWindow = new BaseWindowDOM(50, 50, 'SIMULATION CONTROLS');

controlsWindow.addSection('simulation management');

controlsWindow.addButton('ADD SIM1', async () => {
    if (simulationManager.isActive('sim1')) {
        alert('Sim1 already running!');
        return;
    }
    
    console.log('🚀 Adding Sim1...');
    const success = await simulationManager.addSimulation('sim1', canvases.sim1);
    if (!success) {
        alert('Failed to add Sim1!');
        return;
    }
    
    // Hide background canvas
    canvases.sim1.style.display = 'none';
    canvases.sim1.style.zIndex = '0';
    
    const sim1Window = SimulationWindowFactoryDOM.create('sim1', simulationManager, dataBridge);
    if (sim1Window) {
        registerWindow(sim1Window, 'symulacje', 'sim1');
    }
    
    // Create simulation view window
    const sim1ViewWindow = new BaseWindowDOM(750, 50, 'SIM1 VIEW');
    sim1ViewWindow.addSection('simulation display');
    sim1ViewWindow.addSimulationView(canvases.sim1, 200);
    registerWindow(sim1ViewWindow, 'symulacje');
    
    console.log('✅ Sim1 added successfully!');
});

controlsWindow.addButton('REMOVE SIM1', () => {
    if (!simulationManager.isActive('sim1')) {
        alert('Sim1 is not running!');
        return;
    }
    
    simulationManager.removeSimulation('sim1');
    canvases.sim1.style.display = 'none';
    
    const sim1Window = windowManager.windows.find(w => w.title === 'SIM1 PARTICLES');
    if (sim1Window) unregisterWindow(sim1Window);
    
    const sim1ViewWindow = windowManager.windows.find(w => w.title === 'SIM1 VIEW');
    if (sim1ViewWindow) unregisterWindow(sim1ViewWindow);
    
    console.log('✅ Sim1 removed');
});

controlsWindow.addSection('global controls');

controlsWindow.addButton('PAUSE ALL', () => {
    simulationManager.pauseAll();
    console.log('⏸️ All paused');
});

controlsWindow.addButton('RESUME ALL', () => {
    simulationManager.resumeAll();
    console.log('▶️ All resumed');
});

controlsWindow.addButton('RESET ALL', () => {
    simulationManager.resetAll();
    console.log('🔄 All reset');
});

controlsWindow.addSection('statistics', 'statistics');
controlsWindow.addText(() => {
    const activeCount = simulationManager.getActiveCount();
    const activeSims = simulationManager.getActiveSimulations();
    const simList = activeSims.length > 0 ? activeSims.join(', ') : 'None';
    return `Active Sims: ${activeCount}\nRunning: ${simList}`;
});

registerWindow(controlsWindow, 'system');

console.log('✅ Controls window created');

// UI DEMO WINDOW
const uiDemoWindow = new BaseWindowDOM(400, 50, 'UI DEMO - ALL FEATURES');

uiDemoWindow.addSection('window features');
uiDemoWindow.addText(`Close = X button
Minimize = _ → taskbar
HUD = ○ → transparent
Drag header to move
Scroll content`);

uiDemoWindow.addSection('controls');

uiDemoWindow.addButton('NEW WINDOW', () => {
    const newWin = new BaseWindowDOM(
        Math.random() * 400 + 100, 
        Math.random() * 300 + 100, 
        `Window ${Date.now() % 1000}`
    );
    newWin.addSection('info', 'statistics');
    newWin.addText('Dynamically created!');
    newWin.addText(() => `Time: ${new Date().toLocaleTimeString('pl-PL')}`);
    newWin.addSection('controls');
    newWin.addButton('CLOSE ME', () => {
        unregisterWindow(newWin);
    });
    registerWindow(newWin, 'system');
    windowManager.bringToFront(newWin);
});

let speedValue = 1.0;
let volumeValue = 0.5;
let gridEnabled = false;
let autoSave = true;

uiDemoWindow.addSlider('Speed', () => speedValue, (v) => { speedValue = v; }, 0.1, 5.0, 0.05);
uiDemoWindow.addSlider('Volume', () => volumeValue, (v) => { volumeValue = v; }, 0.0, 1.0, 0.01);
uiDemoWindow.addToggle('Grid', () => gridEnabled, (v) => { gridEnabled = v; });
uiDemoWindow.addToggle('Auto Save', () => autoSave, (v) => { autoSave = v; });

uiDemoWindow.addSection('text content');
uiDemoWindow.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.');

uiDemoWindow.addSection('dynamic stats', 'statistics');
uiDemoWindow.addText(() => {
    const now = new Date();
    return `Date: ${now.toLocaleDateString('pl-PL')}\nTime: ${now.toLocaleTimeString('pl-PL')}`;
});

uiDemoWindow.addSection('system stats', 'statistics');
uiDemoWindow.addText(() => {
    const fps = Math.round(performance.now() / 1000) % 60 + 30;
    const memory = (Math.random() * 50 + 50).toFixed(1);
    return `FPS: ${fps}\nMemory: ${memory} MB\nWindows: ${windowManager.windows.length}\nSpeed: ${speedValue.toFixed(2)}x\nVolume: ${(volumeValue * 100).toFixed(0)}%`;
});

// Matrix demo
uiDemoWindow.addSection('interactive matrix');
const demoMatrix = [
    [0.5, -0.3, 0.0],
    [-0.2, 0.8, 0.4],
    [0.6, -0.5, 0.9]
];

uiDemoWindow.addMatrix(
    3, 3,
    (row, col) => demoMatrix[row][col],
    (row, col, value) => { demoMatrix[row][col] = value; },
    -1.0,
    1.0,
    'Values 3x3'
);

registerWindow(uiDemoWindow, 'system');

console.log('✅ UI Demo window created');

// Handle window clicks
document.addEventListener('mousedown', (e) => {
    windowManager.handleMouseDown(e.clientX, e.clientY);
});

// UPDATE LOOP
function update() {
    simulationManager.updateAll();
    simulationManager.renderAll();
    
    windowManager.update();
    taskbar.update();
    
    requestAnimationFrame(update);
}

update();
console.log('✅ READY!');
