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
taskbar.addSection('simulations');

const eventRouter = new UI.EventRouter(canvases.ui, null, windowManager, taskbar, null);

// DEMO WINDOW
const demoWindow = new UI.BaseWindow(50, 50, 'UI Demo - All Features');
demoWindow.width = 380;
demoWindow.height = 500;

demoWindow.addSection('header buttons');
demoWindow.addText('Test all header buttons:', '#00F5FF');
demoWindow.addText('• X = Close', '#00FF88');
demoWindow.addText('• _ = Minimize', '#00FF88');
demoWindow.addText('• ○ = HUD mode', '#00FF88');
demoWindow.addText(' ');

demoWindow.addSection('scrollbar test');
demoWindow.addText('Long content for scrollbar:', '#00F5FF');
demoWindow.addText('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
demoWindow.addText('Sed do eiusmod tempor incididunt ut labore.');
demoWindow.addText('Ut enim ad minim veniam quis nostrud.');
demoWindow.addText('Duis aute irure dolor in reprehenderit.');
demoWindow.addText('Esse cillum dolore eu fugiat nulla.');
demoWindow.addText('Excepteur sint occaecat cupidatat.');
demoWindow.addText('Sunt in culpa qui officia deserunt.');
demoWindow.addText(' ');

demoWindow.addSection('buttons');
demoWindow.addButton('Test Button 1', () => alert('Works!'));
demoWindow.addButton('Test Button 2', () => console.log('Clicked!'));
demoWindow.addText(' ');

demoWindow.addSection('more content');
demoWindow.addText('Sed ut perspiciatis unde omnis.');
demoWindow.addText('Voluptatem accusantium doloremque.');
demoWindow.addText('Eaque ipsa quae ab illo.');
demoWindow.addText('Beatae vitae dicta sunt.');
demoWindow.addText('Quia voluptas sit aspernatur.');
demoWindow.addText(' ');

demoWindow.addSection('dynamic');
let counter = 0;
demoWindow.addText(() => `Counter: ${counter++}`, '#00F5FF');
demoWindow.addText(' ');
demoWindow.addText('✅ End of content', '#00FF88');

windowManager.add(demoWindow);
taskbar.addWindowItem('Demo', demoWindow);
demoWindow.onClose = () => {
    windowManager.remove(demoWindow);
    taskbar.removeWindowItem(demoWindow);
};

// RENDER LOOP
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
