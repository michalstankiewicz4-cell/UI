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
taskbar.addSection('start'); // Menu Start FIRST!
taskbar.addSection('simulations');

const eventRouter = new UI.EventRouter(canvases.ui, null, windowManager, taskbar, null);

// ═════════════════════════════════════════════════
//  PATCHES - UI Enhancements
// ═════════════════════════════════════════════════

// PATCH 1: Button borders (green stroke)
const originalDrawButton = UI.BaseWindow.prototype.drawButton;
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

// PATCH 2: handleClick (button detection)
const originalHandleClick = UI.BaseWindow.prototype.handleClick;
UI.BaseWindow.prototype.handleClick = function(mouseX, mouseY) {
    if (!this.visible || !this.containsPoint(mouseX, mouseY)) return false;
    
    const startY = this.transparent ? 
        (this.y + this.padding) : 
        (this.y + this.headerHeight + this.padding - this.scrollOffset);
    
    let y = startY;
    
    for (let item of this.items) {
        if (item.type === 'button') {
            const buttonHeight = 20;
            if (mouseY >= y && mouseY <= y + buttonHeight &&
                mouseX >= this.x + this.padding && 
                mouseX <= this.x + this.width - this.padding) {
                item.callback();
                return true;
            }
            y += buttonHeight + this.itemSpacing;
        } else if (item.type === 'text') {
            y += (item.lines || 1) * 14 + this.itemSpacing;
        } else if (item.type === 'section') {
            y += 20 + this.itemSpacing;
        }
    }
    
    return false;
};

console.log('✅ Patches applied');

// ═════════════════════════════════════════════════
//  DEMO WINDOW
// ═════════════════════════════════════════════════
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
