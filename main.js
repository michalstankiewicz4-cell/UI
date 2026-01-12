// STANDALONE VERSION - No ES6 modules (works with file://)
// Uses global variables from included scripts

console.log('=== UI SYSTEM v2.2 - STANDALONE ===');

// Core system (globals from scripts)
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
const taskbar = new UI.Taskbar();
taskbar.addSection('symulacje');
taskbar.addSection('system');

const eventRouter = new UI.EventRouter(canvases.ui, null, windowManager, taskbar, null);

// ═════════════════════════════════════════════════
//  DEMO WINDOW - COMPLETE FEATURE SHOWCASE
// ═════════════════════════════════════════════════
const demoWindow = new UI.BaseWindow(50, 50, 'UI DEMO - ALL FEATURES');
demoWindow.width = 400;
demoWindow.height = 550;

// Demo variables
let speedValue = 1.5;
let volumeValue = 0.75;
let gridEnabled = true;
let autoSave = false;

// Section: WINDOW FEATURES (zielony)
demoWindow.addSection('window features');
demoWindow.addText(`Close = X button in header
Minimize = _ button → taskbar
HUD = ○ button → transparent
Move window = Drag header
Pasek przewijania = Scroll content`);

// Section: PRZEŁĄCZNIKI (zielony)
demoWindow.addSection('przełączniki');
demoWindow.addButton('NEW WINDOW', () => {
    console.log('🆕 Creating new window...');
    const newWin = new UI.BaseWindow(
        Math.random() * 400 + 100, 
        Math.random() * 300 + 100, 
        `Window ${Date.now() % 1000}`
    );
    newWin.width = 300;
    newWin.height = 220;
    newWin.addSection('info', 'statistics');
    newWin.addText('Dynamically created window!');
    newWin.addText(() => `Time: ${new Date().toLocaleTimeString('pl-PL')}`);
    newWin.addSection('controls');
    newWin.addButton('CLOSE ME', () => {
        windowManager.remove(newWin);
        taskbar.removeWindowItem(newWin);
    });
    windowManager.add(newWin);
    taskbar.addWindowItem(newWin.title, newWin, 'symulacje');
    console.log('✅ New window created!');
});

demoWindow.addButton('TEST ALERT', () => {
    console.log('🔔 Alert button clicked!');
    alert(`Button works!

Speed: ${speedValue.toFixed(2)}
Volume: ${volumeValue.toFixed(2)}
Grid: ${gridEnabled}
Auto Save: ${autoSave}`);
});

demoWindow.addSlider('Speed Control', 
    () => speedValue, 
    (v) => { 
        speedValue = v; 
        console.log(`Speed: ${v.toFixed(2)}`); 
    }, 
    0.1, 5.0, 0.05
);

demoWindow.addSlider('Volume Control', 
    () => volumeValue, 
    (v) => { 
        volumeValue = v; 
        console.log(`Volume: ${v.toFixed(2)}`); 
    }, 
    0.0, 1.0, 0.01
);

demoWindow.addToggle('Show Grid', 
    () => gridEnabled, 
    (v) => { 
        gridEnabled = v; 
        console.log(`Grid: ${v}`); 
    }
);

demoWindow.addToggle('Auto Save', 
    () => autoSave, 
    (v) => { 
        autoSave = v; 
        console.log(`Auto Save: ${v}`); 
    }
);

// Section: STANDARD TEXT CONTENT (zielony)
demoWindow.addSection('standard text content');
demoWindow.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');

// Section: STATIST. TEXT CONTENT (cyjan) - Data i czas
demoWindow.addSection('statist. text content', 'statistics');
demoWindow.addText(() => {
    const now = new Date();
    return `Aktualna data: ${now.toLocaleDateString('pl-PL')}
Aktualny czas: ${now.toLocaleTimeString('pl-PL')}`;
});

// Section: STATIST. TEXT CONTENT (cyjan) - Blok statystyk
demoWindow.addSection('statist. text content', 'statistics');
demoWindow.addText(() => {
    const fps = Math.round(performance.now() / 1000) % 60 + 30;
    const memory = (Math.random() * 50 + 50).toFixed(1);
    const windows = windowManager.windows.length;
    const items = taskbar.menuItems.length;
    return `System FPS: ${fps}
Memory Usage: ${memory} MB
Active Windows: ${windows}
Taskbar Items: ${items}
Speed Setting: ${speedValue.toFixed(2)}x
Volume: ${(volumeValue * 100).toFixed(0)}%`;
});

windowManager.add(demoWindow);
taskbar.addWindowItem(demoWindow.title, demoWindow, 'system');

demoWindow.onClose = () => {
    demoWindow.visible = false;
    windowManager.remove(demoWindow);
};

console.log('✅ Demo window created');

// ═════════════════════════════════════════════════
//  RENDER LOOP
// ═════════════════════════════════════════════════
function render() {
    const ctx = canvases.ui.getContext('2d');
    ctx.clearRect(0, 0, canvases.ui.width, canvases.ui.height);
    
    windowManager.update(eventRouter.mouseX, eventRouter.mouseY, eventRouter.mouseDown, eventRouter.mouseClicked);
    
    if (eventRouter.mouseClicked) {
        eventRouter.mouseClicked = false;
    }
    
    windowManager.windows.forEach(w => w.layoutDirty = true);
    windowManager.draw(ctx, UI.STYLES);
    
    ctx.save();
    taskbar.draw(ctx, UI.STYLES, UI.measureTextCached);
    ctx.restore();
    
    requestAnimationFrame(render);
}

render();
console.log('✅ READY - Open index.html to see demo!');
