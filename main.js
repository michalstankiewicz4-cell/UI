// STANDALONE VERSION - No ES6 modules (works with file://)
// Uses global variables from included scripts

console.log('=== UI SYSTEM v2.1 - STANDALONE ===');

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
taskbar.addSection('symulacje'); // Nowe okna tutaj!
taskbar.addSection('system');    // System (stałe okna)

const eventRouter = new UI.EventRouter(canvases.ui, null, windowManager, taskbar, null);

// ═════════════════════════════════════════════════
//  PATCHES - UI Enhancements
// ═════════════════════════════════════════════════

// PATCH: Button borders (green stroke)
UI.BaseWindow.prototype.drawButton = function(ctx, STYLES, item, y) {
    const buttonHeight = 20;
    
    // Background
    ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.fillRect(this.x + this.padding, y, this.width - this.padding * 2, buttonHeight);
    
    // Border (GREEN!)
    ctx.strokeStyle = STYLES.colors.panel;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + this.padding, y, this.width - this.padding * 2, buttonHeight);
    
    // Text
    ctx.fillStyle = STYLES.colors.panel;
    ctx.font = STYLES.fonts.mainBold;
    ctx.textAlign = 'center';
    ctx.fillText(item.label, this.x + this.width / 2, y + 14);
    ctx.textAlign = 'left';
};

console.log('✅ Patches applied');

// ═════════════════════════════════════════════════
//  DEMO WINDOW
// ═════════════════════════════════════════════════
const demoWindow = new UI.BaseWindow(50, 50, 'UI Demo - All Features');
demoWindow.width = 380;
demoWindow.height = 500;

// Counter for dynamic content
let counter = 0;

// Demo variables for sliders and toggles
let speedValue = 1.0;
let volumeValue = 0.5;
let gridEnabled = false;
let autoSave = true;

demoWindow.addSection('header buttons');
demoWindow.addText('Test all header buttons:');
demoWindow.addText('• X = Close');
demoWindow.addText('• _ = Minimize');
demoWindow.addText('• ○ = HUD mode');

demoWindow.addSection('sliders & toggles');
demoWindow.addSlider('Speed', 
    () => speedValue, 
    (v) => { speedValue = v; console.log('Speed:', v); }, 
    0.1, 5.0, 0.05  // Changed step from 0.1 to 0.05 for smoother sliding
);
demoWindow.addSlider('Volume', 
    () => volumeValue, 
    (v) => { volumeValue = v; console.log('Volume:', v); }, 
    0.0, 1.0, 0.01
);
demoWindow.addToggle('Show Grid', 
    () => gridEnabled, 
    (v) => { gridEnabled = v; console.log('Grid:', v); }
);
demoWindow.addToggle('Auto Save', 
    () => autoSave, 
    (v) => { autoSave = v; console.log('Auto Save:', v); }
);

demoWindow.addSection('scrollbar test');
demoWindow.addText('Long content for scrollbar:');
demoWindow.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
demoWindow.addText('Sed do eiusmod tempor incididunt ut labore.');
demoWindow.addText('Ut enim ad minim veniam quis nostrud.');
demoWindow.addText('Duis aute irure dolor in reprehenderit.');
demoWindow.addText('Esse cillum dolore eu fugiat nulla.');
demoWindow.addText('Excepteur sint occaecat cupidatat.');
demoWindow.addText('Sunt in culpa qui officia deserunt.');

demoWindow.addSection('buttons');
demoWindow.addButton('Open New Window', () => {
    console.log('🔥 Open New Window clicked!');
    const newWin = new UI.BaseWindow(
        Math.random() * 400 + 100, 
        Math.random() * 300 + 100, 
        'New Window'
    );
    newWin.width = 250;
    newWin.height = 150;
    newWin.addText('This is a new window!', '#00F5FF');
    newWin.addText('Created dynamically.');
    newWin.addButton('Close Me', () => {
        console.log('Close Me clicked!');
        windowManager.remove(newWin);
        taskbar.removeWindowItem(newWin);
    });
    newWin.onClose = () => {
        windowManager.remove(newWin);
        taskbar.removeWindowItem(newWin);
    };
    windowManager.add(newWin);
    taskbar.addWindowItem(newWin.title, newWin, 'symulacje');  // Symulacje section!
    console.log('✅ New window created!');
});
demoWindow.addButton('Test Alert', () => {
    console.log('🔥 Test Alert clicked!');
    alert('Button works!');
});

demoWindow.addSection('more content');
demoWindow.addText('Sed ut perspiciatis unde omnis.');
demoWindow.addText('Voluptatem accusantium doloremque.');
demoWindow.addText('Eaque ipsa quae ab illo.');
demoWindow.addText('Beatae vitae dicta sunt.');
demoWindow.addText('Quia voluptas sit aspernatur.');

demoWindow.addSection('statistics');
demoWindow.addText(() => `Counter: ${counter++}`, '#00F5FF');
demoWindow.addText(() => `Timestamp: ${Date.now()}`, '#00F5FF');
demoWindow.addText('✅ End of content');

windowManager.add(demoWindow);
taskbar.addWindowItem(demoWindow.title, demoWindow, 'system');  // System section!

demoWindow.onClose = () => {
    // Demo window nie znika z menu - tylko się chowa
    demoWindow.visible = false;
    windowManager.remove(demoWindow);
    // taskbar.removeWindowItem NIE wywołujemy!
};

// ═════════════════════════════════════════════════
//  MASTER CONTROLS WINDOW
// ═════════════════════════════════════════════════
const masterWindow = new UI.BaseWindow(800, 50, 'Master Controls');
masterWindow.width = 280;
masterWindow.height = 200;

masterWindow.addSection('info');
masterWindow.addText('UI System v2.1');
masterWindow.addText('Core Architecture');

masterWindow.addSection('controls');
masterWindow.addButton('Reset UI', () => {
    console.log('Reset UI clicked');
    alert('UI reset functionality not implemented yet');
});

masterWindow.addButton('Toggle Grid', () => {
    console.log('Toggle Grid clicked');
    alert('Grid toggle not implemented yet');
});

windowManager.add(masterWindow);
taskbar.addWindowItem(masterWindow.title, masterWindow, 'system');  // System section!

masterWindow.onClose = () => {
    masterWindow.visible = false;
    windowManager.remove(masterWindow);
};

// ═════════════════════════════════════════════════
//  STATS WINDOW
// ═════════════════════════════════════════════════
const statsWindow = new UI.BaseWindow(800, 270, 'System Stats');
statsWindow.width = 280;
statsWindow.height = 180;

statsWindow.addSection('statistics');
statsWindow.addText(() => `Windows: ${windowManager.windows.length}`, '#00F5FF');
statsWindow.addText(() => `FPS: ${Math.round(performance.now() / 1000)}`, '#00F5FF');
statsWindow.addText(() => `Memory: OK`, '#00F5FF');

windowManager.add(statsWindow);
taskbar.addWindowItem(statsWindow.title, statsWindow, 'system');  // System section!

statsWindow.onClose = () => {
    statsWindow.visible = false;
    windowManager.remove(statsWindow);
};

console.log('✅ All windows created');

// ═════════════════════════════════════════════════
//  RENDER LOOP
// ═════════════════════════════════════════════════
function render() {
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
console.log('✅ READY - No server needed!');
