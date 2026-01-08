# UI - Canvas Window System

> Lightweight, draggable window system for HTML5 Canvas applications

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![Bundle](https://img.shields.io/badge/bundle-ready-success.svg)](dist/ui.js)

## 🎯 Overview

A complete UI system extracted from [Petrie Dish](https://github.com/michalstankiewicz4-cell/Claude) project, providing:

- **Draggable Windows** - Smooth drag & drop interface
- **Window Management** - Z-index, focus, minimize
- **Taskbar System** - Windows-style menu and window items
- **UI Controls** - Buttons, text, sections (more in BaseWindow)
- **Event Routing** - Centralized mouse/keyboard handling
- **Performance** - Text caching, dirty flags, optimized rendering
- **Single-File Bundle** - Complete system in one file (~1047 lines, ~40KB)

Perfect for:
- Data visualization apps
- WebGPU/WebGL applications
- Canvas-based tools
- Interactive simulations
- Developer tools

## ✨ Features

### Window System
- ✅ Drag and drop windows
- ✅ Minimize/maximize
- ✅ Z-index management
- ✅ Auto-scroll for long content
- ✅ Scrollbar support

### UI Controls
- ✅ Buttons (click actions)
- ✅ Text (multi-line, colored)
- ✅ Sections (dividers)
- ✅ Easy to extend

### Taskbar
- ✅ Menu sections
- ✅ Window items (show/hide)
- ✅ Dynamic button sizing
- ✅ Position caching (optimized)

### Performance
- ✅ Text measurement caching (2-5× faster)
- ✅ Dirty flag system (only redraw when needed)
- ✅ Efficient event routing
- ✅ Optimized scrolling

## 🚀 Quick Start

### Option 1: Use the Bundle (Recommended)

```html
<!DOCTYPE html>
<html>
<head>
    <title>UI Bundle Demo</title>
    <style>
        body { margin: 0; overflow: hidden; background: #1a1a1a; }
        canvas { display: block; }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    
    <!-- Load the bundle -->
    <script src="dist/ui.js"></script>
    
    <script>
        // Setup canvas
        const canvas = document.getElementById('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        // Create window manager
        const windowManager = new UI.WindowManager();

        // Create a window
        const myWindow = new UI.BaseWindow(100, 100, 'Hello UI!');
        
        // Add controls
        let counter = 0;
        myWindow.addButton('Click Me!', () => {
            counter++;
            alert(`Clicked ${counter} times!`);
        });
        
        myWindow.addText('This is some text!', '#00FF88');
        myWindow.addSection('Settings');
        myWindow.addText('More content here...');
        
        // Add to manager
        windowManager.add(myWindow);
        
        // Create taskbar (optional)
        const taskbar = new UI.Taskbar();
        taskbar.addSection('Windows');
        taskbar.addWindowItem('My Window', myWindow);
        
        // Create event router
        const eventRouter = new UI.EventRouter(
            canvas,
            null, // camera (optional)
            windowManager,
            taskbar,
            null  // stats window (optional)
        );
        
        // Render loop
        function render() {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            windowManager.draw(ctx, UI.STYLES);
            taskbar.draw(ctx, UI.STYLES, UI.measureTextCached);
            
            requestAnimationFrame(render);
        }
        
        render();
    </script>
</body>
</html>
```

### Option 2: Use Modular Imports

```javascript
// Import individual modules
import STYLES from './src/ui/Styles.js';
import BaseWindow from './src/ui/BaseWindow.js';
import WindowManager from './src/ui/WindowManager.js';
import Taskbar from './src/ui/Taskbar.js';
import EventRouter from './src/ui/EventRouter.js';
import { measureTextCached } from './src/utils/TextCache.js';

// Use as normal
const manager = new WindowManager();
const window = new BaseWindow(100, 100, 'Hello!');
manager.add(window);
```

## 📦 Installation

### Download Bundle
```bash
# Clone the repo
git clone https://github.com/michalstankiewicz4-cell/UI.git

# Use the pre-built bundle
cp UI/dist/ui.js your-project/
```

### Build from Source
```bash
# Clone the repo
git clone https://github.com/michalstankiewicz4-cell/UI.git
cd UI

# Build the bundle
powershell -ExecutionPolicy Bypass -File build.ps1
# or on Unix/Mac:
bash build.sh

# Output: dist/ui.js
```

## 📖 API Reference

### UI.BaseWindow

```javascript
const window = new UI.BaseWindow(x, y, title, type);

// Add controls
window.addButton(label, callback);
window.addText(text, color, lines);
window.addSection(title);

// Properties
window.visible = true/false;
window.minimized = true/false;
window.x, window.y;
window.width, window.height;

// Methods
window.markDirty();  // Request redraw
window.draw(ctx, STYLES);
window.handleClick(mouseX, mouseY);
window.handleScroll(deltaY);
```

### UI.WindowManager

```javascript
const manager = new UI.WindowManager();

// Add/remove windows
manager.add(window);
manager.remove(window);
manager.bringToFront(window);

// Event handling
manager.handleMouseDown(x, y);
manager.handleMouseMove(x, y);
manager.handleMouseUp(x, y);
manager.handleWheel(x, y, deltaY);

// Rendering
manager.draw(ctx, STYLES);
```

### UI.Taskbar

```javascript
const taskbar = new UI.Taskbar();

// Add items
taskbar.addSection(title);
taskbar.addWindowItem(title, window);

// Event handling
taskbar.handleClick(mouseX, mouseY, ctx, windowManager);

// Rendering
taskbar.draw(ctx, STYLES, measureTextCached);
```

### UI.EventRouter

```javascript
const router = new UI.EventRouter(
    canvas,
    camera,         // optional
    windowManager,
    taskbar,
    statsWindow     // optional
);

// Automatically handles all mouse/keyboard events
// Priority: Taskbar → Windows → Camera
```

## 🎨 Styling

Customize colors and fonts by modifying `UI.STYLES`:

```javascript
UI.STYLES.colors.panel = '#FF0000';  // Change panel color
UI.STYLES.fonts.main = '14px Arial'; // Change font
```

## 📁 Project Structure

```
UI/
├── dist/
│   └── ui.js              # Complete bundle (1047 lines)
├── src/
│   ├── ui/
│   │   ├── Styles.js      # Styling system
│   │   ├── BaseWindow.js  # Window class
│   │   ├── WindowManager.js
│   │   ├── Taskbar.js
│   │   ├── EventRouter.js
│   │   └── index.js       # Module exports
│   └── utils/
│       └── TextCache.js   # Performance optimization
├── examples/
│   ├── basic-example.html
│   ├── optimized-example.html
│   ├── full-system.html
│   └── bundle-demo.html   # Bundle usage demo
├── build.ps1              # Windows build script
├── build.sh               # Unix build script
└── README.md
```

## 🔥 Examples

See `examples/` folder:
- **basic-example.html** - Minimal setup
- **optimized-example.html** - Performance optimizations (50× speedup!)
- **bundle-demo.html** - Complete bundle demo
- **full-system.html** - Info about the system

## 🚀 Performance

### Built-in Optimizations:
- **Text caching** - 2-5× faster text rendering
- **Dirty flags** - Only redraw when needed (10× idle performance)
- **Position caching** - O(n) instead of O(n²) for taskbar buttons

### Optional (see optimized-example.html):
- **Text Bitmap Cache** - 10× faster text rendering
- **Layered Canvas** - 5× smoother dragging
- **Canvas Transform Scroll** - 3× faster scrolling
- **Dirty Rectangles** - 10× better idle performance
- **Total: ~50× speedup!**

## 📊 Bundle Size

- **Unminified**: ~40KB (1047 lines)
- **Dependencies**: Zero
- **Browser Support**: All modern browsers (IE11+ with transpilation)

## 🤝 Contributing

This is extracted from Petrie Dish project. For improvements:
1. Fork the repo
2. Make changes
3. Test with examples
4. Submit PR

## 📄 License

MIT License - See LICENSE file

## 🔗 Links

- **GitHub**: https://github.com/michalstankiewicz4-cell/UI
- **Source Project**: [Petrie Dish](https://github.com/michalstankiewicz4-cell/Claude)
- **Bundle**: [dist/ui.js](dist/ui.js)

## 💡 Tips

- Always call `markDirty()` after changing window content
- Use `measureTextCached()` for text measurements (faster!)
- Taskbar height is `48px` - account for it in your layout
- Windows can be minimized by clicking header buttons (if implemented)
- EventRouter handles all input priority automatically

## 🎉 Credits

Extracted from **Petrie Dish v5.1-C2** project  
Created with love for Canvas-based applications ❤️
