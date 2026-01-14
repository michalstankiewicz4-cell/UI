// UI SYSTEM v2.3 - Integrated Simulations
// Works with file:// protocol (no ES6 modules)

console.log('=== UI SYSTEM v2.3 - INTEGRATED SIMULATIONS ===');

// Core system
const eventBus = new EventBus();
const dataBridge = new DataBridge(eventBus);
const simulationManager = new SimulationManager(eventBus, dataBridge);

// Canvas setup
const canvases = {
    sim1: document.getElementById('canvas-sim1'),
    sim2: document.getElementById('canvas-sim2'),
    sim3: document.getElementById('canvas-sim3'),
    sim4: document.getElementById('canvas-sim4'),
    ui: document.getElementById('canvas-ui')
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

// UI system
const windowManager = new UI.WindowManager();
const taskbar = new UI.Taskbar(simulationManager); // Pass SimulationManager
taskbar.addSection('symulacje');
taskbar.addSection('system');

const eventRouter = new UI.EventRouter(canvases.ui, null, windowManager, taskbar, null);

// ═══════════════════════════════════════════════════════════════
//   MODE SYSTEM LISTENER - Canvas Visibility Control
// ═══════════════════════════════════════════════════════════════

eventBus.on('simulation:mode-changed', ({ simId, mode }) => {
    console.log(`🎨 Mode changed: ${simId} → ${mode}`);
    
    const canvas = canvases[simId];
    if (!canvas) return;
    
    if (mode === 'hud') {
        // Canvas fullscreen (red on taskbar)
        canvas.style.display = 'block';
        canvas.style.zIndex = '1';
    }
    else if (mode === 'window') {
        // Canvas background, window visible
        canvas.style.display = 'block';
        canvas.style.zIndex = '0';
    }
    else if (mode === 'minimized') {
        // Everything hidden (green on taskbar)
        canvas.style.display = 'none';
    }
});

// Register Simulation 1 (with async wrapper for compatibility)
simulationManager.register('sim1', 
    () => Promise.resolve(Simulation1), 
    Simulation1.metadata
);


// SIMULATION CONTROLS WINDOW
const controlsWindow = new UI.BaseWindow(50, 50, 'SIMULATION CONTROLS');

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
    
    // MODE SYSTEM: Default mode is 'window' (visible)
    canvases.sim1.style.display = 'block';
    canvases.sim1.style.zIndex = '0';
    
    const sim1Window = SimulationWindowFactory.create('sim1', simulationManager, dataBridge);
    if (sim1Window) {
        sim1Window.visible = true; // Start visible (window mode)
        windowManager.add(sim1Window);
        taskbar.addWindowItem(sim1Window.title, sim1Window, 'symulacje', 'sim1'); // Pass simId
        sim1Window.onClose = () => { sim1Window.visible = false; };
    }
    
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
    if (sim1Window) {
        windowManager.remove(sim1Window);
        taskbar.removeWindowItem(sim1Window);
    }
    
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

windowManager.add(controlsWindow);
taskbar.addWindowItem(controlsWindow.title, controlsWindow, 'system');
controlsWindow.onClose = () => { controlsWindow.visible = false; };

console.log('✅ Controls window created');

// UI DEMO WINDOW
const uiDemoWindow = new UI.BaseWindow(400, 50, 'UI DEMO - ALL FEATURES');

let speedValue = 1.5;
let volumeValue = 0.75;
let gridEnabled = true;
let autoSave = false;

uiDemoWindow.addSection('window features');
uiDemoWindow.addText(`Close = X button
Minimize = _ → taskbar
HUD = ○ → transparent
Drag header to move
Scroll content`);

uiDemoWindow.addSection('controls');

uiDemoWindow.addButton('NEW WINDOW', () => {
    const newWin = new UI.BaseWindow(
        Math.random() * 400 + 100, 
        Math.random() * 300 + 100, 
        `Window ${Date.now() % 1000}`
    );
    newWin.visible = true;
    newWin.addSection('info', 'statistics');
    newWin.addText('Dynamically created!');
    newWin.addText(() => `Time: ${new Date().toLocaleTimeString('pl-PL')}`);
    newWin.addSection('controls');
    newWin.addButton('CLOSE ME', () => {
        windowManager.remove(newWin);
        taskbar.removeWindowItem(newWin);
    });
    windowManager.add(newWin);
    windowManager.bringToFront(newWin);
    taskbar.addWindowItem(newWin.title, newWin, 'system');
    newWin.onClose = () => { newWin.visible = false; };
});

uiDemoWindow.addButton('TEST ALERT', () => {
    alert(`Controls work!\n\nSpeed: ${speedValue.toFixed(2)}\nVolume: ${volumeValue.toFixed(2)}\nGrid: ${gridEnabled}\nAuto Save: ${autoSave}`);
});

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

windowManager.add(uiDemoWindow);
taskbar.addWindowItem(uiDemoWindow.title, uiDemoWindow, 'system');
uiDemoWindow.onClose = () => { uiDemoWindow.visible = false; };

console.log('✅ UI Demo window created');

// RENDER LOOP
function render() {
    simulationManager.updateAll();
    simulationManager.renderAll();
    
    const ctx = canvases.ui.getContext('2d');
    ctx.clearRect(0, 0, canvases.ui.width, canvases.ui.height);
    
    windowManager.update(eventRouter.mouseX, eventRouter.mouseY, eventRouter.mouseDown, eventRouter.mouseClicked);
    if (eventRouter.mouseClicked) eventRouter.mouseClicked = false;
    
    windowManager.windows.forEach(w => w.layoutDirty = true);
    windowManager.draw(ctx, UI.STYLES);
    
    ctx.save();
    taskbar.draw(ctx, UI.STYLES, UI.measureTextCached);
    ctx.restore();
    
    requestAnimationFrame(render);
}

render();
console.log('✅ READY!');
