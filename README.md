# UI - Canvas Window System

> Lightweight, draggable window system for HTML5 Canvas applications

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)

## 🎯 Overview

A complete UI system extracted from [Petrie Dish](https://github.com/michalstankiewicz4-cell/Claude) project, providing:

- **Draggable Windows** - Smooth drag & drop with snap-to-grid
- **Window Management** - Z-index, focus, minimize, transparency
- **Taskbar System** - Windows-style menu and window items
- **UI Controls** - Buttons, sliders, toggles, text, sections
- **Event Routing** - Centralized mouse/keyboard handling
- **Performance** - Text caching, dirty flags, optimized rendering
- **Customizable** - Easy styling with color schemes

Perfect for:
- Data visualization apps
- WebGPU/WebGL applications
- Canvas-based tools
- Interactive simulations
- Developer tools

## ✨ Features

### Window System
- ✅ Drag and drop windows
- ✅ Resize (optional)
- ✅ Minimize/maximize
- ✅ Transparency toggle
- ✅ Close button
- ✅ Auto-scroll for long content
- ✅ Z-index management

### UI Controls
- ✅ Buttons (click actions)
- ✅ Sliders (value input)
- ✅ Toggles (boolean)
- ✅ Text (multi-line, colored)
- ✅ Sections (headers)
- ✅ Matrix (2D grid)

### Taskbar
- ✅ Menu sections
- ✅ Window items (show/hide)
- ✅ Hover effects
- ✅ Dropdown behavior

### Performance
- ✅ Text measurement caching
- ✅ Dirty flag system (only redraw when needed)
- ✅ Efficient event routing
- ✅ Optimized scrolling

## 🚀 Quick Start

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>UI Demo</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    <script src="dist/ui.js"></script>
    <script>
        // Setup canvas
        const canvas = document.getElementById('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        // Create window manager
        const windowManager = new WindowManager();

        // Create a window
        const myWindow = new BaseWindow(100, 100, 'Hello UI!');
        
        // Add controls
        let counter = 0;
        myWindow.addButton('Click Me!', () => {
            counter++;
            console.log(`Clicked ${counter} times!`);
        });
        
        let volume = 50;
        myWindow.addSlider('Volume', () => volume, (v) => { volume = v; }, 0, 100, 1);
        
        let enabled = true;
        myWindow.addToggle('Enabled', () => enabled, (v) => { enabled = v; });
        
        // Add to manager
        windowManager.add(myWindow);

        // Create taskbar
        const taskbar = new Taskbar();
        taskbar.addSection('windows');
        taskbar.addWindowItem('My Window', myWindow);

        // Setup event routing
        const router = new EventRouter(canvas, null, windowManager, taskbar, null);

        // Render loop
        function render() {
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw UI
            windowManager.draw(ctx);
            taskbar.draw(ctx);
            
            requestAnimationFrame(render);
        }
        render();
    </script>
</body>
</html>
```

## 📦 Installation

### Option 1: Single File (Easiest)
```html
<script src="dist/ui.js"></script>
```

### Option 2: ES Modules
```javascript
import { BaseWindow, WindowManager, Taskbar } from './src/ui/index.js';
```

### Option 3: NPM (Future)
```bash
npm install @yourname/canvas-ui
```

## 📖 Documentation

### BaseWindow

Create draggable windows with controls:

```javascript
const window = new BaseWindow(x, y, title, type = 'panel');

// Add controls
window.addButton(label, callback);
window.addSlider(label, getValue, setValue, min, max, step);
window.addToggle(label, getValue, setValue);
window.addText(text, color, maxLines);
window.addSection(title);

// Properties
window.visible = true;  // Show/hide
window.minimized = false;  // Minimize/maximize
window.transparent = false;  // Toggle transparency
window.zIndex = 0;  // Drawing order
```

### WindowManager

Manage multiple windows:

```javascript
const manager = new WindowManager();

manager.add(window);  // Add window
manager.remove(window);  // Remove window
manager.bringToFront(window);  // Focus window
manager.draw(ctx);  // Draw all windows
manager.update();  // Update (if needed)
```

### Taskbar

Windows-style taskbar:

```javascript
const taskbar = new Taskbar();

taskbar.addSection('section-name');
taskbar.addWindowItem('Window Title', windowInstance);
taskbar.draw(ctx);
taskbar.handleClick(x, y);
```

### EventRouter

Centralized event handling:

```javascript
const router = new EventRouter(canvas, camera, windowManager, taskbar, statsWindow);

// Automatically handles:
// - Mouse click/drag
// - Scroll wheel
// - Camera pan (optional)
// - Window dragging
// - Button clicks
// - Slider dragging
```

## 🎨 Customization

### Styling

Edit `src/ui/Styles.js`:

```javascript
const STYLES = {
    colors: {
        background: '#2a2a2a',
        header: '#333333',
        text: '#ffffff',
        button: '#444444',
        buttonHover: '#555555',
        // ... more colors
    },
    fonts: {
        main: '14px "Courier New", monospace',
        mainBold: 'bold 14px "Courier New", monospace',
        // ... more fonts
    },
    spacing: {
        padding: 10,
        itemSpacing: 8,
        // ... more spacing
    }
};
```

### Color Schemes

Pre-built themes (future):
- Dark (default)
- Light
- Blue
- Green
- Custom

## 🔧 Advanced Usage

### Camera Integration

```javascript
const camera = {
    x: 0,
    y: 0,
    zoom: 1,
    update() { /* ... */ }
};

const router = new EventRouter(canvas, camera, windowManager, taskbar, statsWindow);
// Now panning with middle mouse works!
```

### Custom Controls

Create your own UI items:

```javascript
class CustomItem extends UIItem {
    constructor(label) {
        super('custom');
        this.label = label;
    }
    
    getHeight(window) {
        return 30;
    }
    
    draw(ctx, window, x, y, width) {
        // Custom drawing code
    }
    
    handleClick(window, x, y, width) {
        // Custom click handling
        return false;
    }
}

window.items.push(new CustomItem('My Control'));
```

## 📊 Performance

- **Text Caching**: Measurements cached for ~10× speedup
- **Dirty Flags**: Windows only recalculate when changed
- **Efficient Events**: Single event router for all windows
- **Optimized Drawing**: Z-index sorting, clipping

**Tested with:**
- 10+ windows: 60 FPS
- 100+ controls: 60 FPS
- 1000+ draw calls: 45+ FPS

## 🤝 Contributing

This is extracted from an active project. Contributions welcome!

1. Fork the repo
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📜 License

MIT License - see LICENSE file

## 🎓 Credits

Extracted from **Petrie Dish** - WebGPU Particle Physics Simulator
Created by Michał Stankiewicz (@michalstankiewicz4-cell)

## 🔗 Links

- **Source Project**: [Petrie Dish](https://github.com/michalstankiewicz4-cell/Claude)
- **Issues**: [GitHub Issues](https://github.com/michalstankiewicz4-cell/UI/issues)
- **Docs**: [Full Documentation](docs/)

---

**Made with ❤️ for Canvas developers**
