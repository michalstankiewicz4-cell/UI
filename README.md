# UI System - Canvas-based Windows & Multi-Simulation Architecture

**Status:** ✅ v2.3 Production Ready + Interactive HUD (2026-01-12)  
**GitHub:** https://github.com/michalstankiewicz4-cell/UI

Modular window system for Canvas API with centralized simulation management, high-performance optimizations, and interactive HUD mode.

---

## 🚀 Quick Start

### Standalone (single file)
```html
<script src="dist/ui.js"></script>
<script>
    const manager = new UI.WindowManager();
    const window = new UI.BaseWindow(50, 50, 'Hello');
    window.addText('Hello World!');
    window.addButton('Click', () => alert('Works!'));
    manager.add(window);
    
    function render() {
        manager.draw(ctx, UI.STYLES);
        requestAnimationFrame(render);
    }
</script>
```

### Full System
```bash
# Just open index.html
# No server needed - works with file:// protocol
```

---

## ⚡ Performance (v2.3 NEW!)

**Major optimizations + features (2026-01-12):**
- **Interactive HUD Mode** - Transparent windows with full interactivity
- **+25-50% FPS improvement** (layout cache)
- **-15-25% CPU usage** (early exits, cache hits)
- Component width fixes + click-through fixes
- All tests passing

See [docs/ROADMAP.md](docs/ROADMAP.md) for full optimization details.

---

## 📦 Project Structure

```
UI/
├── core/                   # Central architecture
│   ├── SimulationManager.js    # Controller (360 lines)
│   ├── EventBus.js             # Pub-sub events (192 lines)
│   └── DataBridge.js           # Data flow (224 lines)
│
├── ui/                     # UI library source
│   ├── BaseWindow.js           # Windows (~445 lines)
│   ├── WindowManager.js        # Manager (~126 lines)
│   ├── Taskbar.js              # Taskbar (~126 lines)
│   ├── EventRouter.js          # Events (~144 lines)
│   ├── Styles.js               # Styling (~49 lines)
│   ├── core/                   # Core utilities
│   │   ├── constants.js        # Constants & config
│   │   ├── geometry.js         # Hit testing
│   │   ├── layout.js           # Layout engine
│   │   └── text-cache.js       # Text measurement cache
│   └── components/             # UI components
│       ├── ButtonItem.js       # Button control
│       ├── SliderItem.js       # Slider control
│       ├── ToggleItem.js       # Toggle control
│       ├── SectionItem.js      # Section divider
│       ├── TextItem.js         # Text display
│       ├── header.js           # Window header
│       └── scrollbar.js        # Scrollbar
│
├── simulations/            # 4 placeholder sims
│   ├── sim1/                   # 2D Particles
│   ├── sim2/                   # 3D Cubes
│   ├── sim3/                   # Physics
│   └── sim4/                   # Automata
│
├── ui-config/              # Configuration layer
│   ├── windows.js              # Window setup
│   ├── controls.js             # Dynamic controls
│   └── sync.js                 # Cross-sim sync
│
├── data/                   # Import/Export (future)
│   ├── presets/                # Ready configs
│   └── exports/                # User data
│
├── docs/                   # Documentation
│   ├── TODO.md                 # Project roadmap
│   ├── ROADMAP.md              # Optimization roadmap (NEW!)
│   ├── CACHE_FIX.md            # Cache troubleshooting
│   └── GITHUB_SETUP.md         # GitHub setup
│
├── themes/                 # Custom themes (future)
├── dist/ui.js              # Built bundle (1972 lines)
├── main.js                 # Main orchestrator
├── index.html              # Entry point
└── build.ps1/sh            # Build scripts
```

---

## 🏗️ Core Architecture

### SimulationManager
Central controller for all simulations:
```javascript
// Register & add simulations
simulationManager.register('sim1', () => import('./sim1.js'));
await simulationManager.addSimulation('sim1', canvas);

// Global controls
simulationManager.pauseAll();
simulationManager.updateAll();
simulationManager.renderAll();
```

### EventBus
Pub-sub communication:
```javascript
// Subscribe
eventBus.on('simulation:added', (data) => {
    console.log('New sim:', data.simId);
});

// Emit
eventBus.emit('simulation:added', { simId: 'sim1' });
```

### DataBridge
UI ↔ Simulation data flow:
```javascript
// Parameter: UI → Sim
dataBridge.bindParameter('sim1', 'speed', (v) => sim.setSpeed(v));
dataBridge.setParameter('sim1', 'speed', 2.5);

// Stat: Sim → UI
dataBridge.bindStat('sim1', 'fps', () => sim.fps);
const fps = dataBridge.getStat('sim1', 'fps');
```

---

## 🎨 UI Features

### Windows
- ✅ Draggable with mouse
- ✅ Header buttons (Close, Minimize, **HUD mode** 👁️)
- ✅ **Interactive transparent overlay** (HUD mode)
- ✅ Scrollbar with thumb dragging
- ✅ Z-index management
- ✅ Interactive controls: Buttons, Sliders, Toggles
- ✅ Content: Text, Sections
- ✅ Layout cache (performance optimized)
- ✅ Component width fixes + proper hitboxes

### Controls (FAZA C3)
```javascript
// Button
window.addButton('SPAWN 1000', () => spawnParticles(1000));

// Slider
window.addSlider('Force', () => FORCE, (v) => FORCE = v, 0.5, 10, 0.1);

// Toggle
window.addToggle('Grid', () => showGrid, (v) => showGrid = v);

// Section
window.addSection('physics');

// Text
window.addText('Lorem ipsum...', '#00ff88');
```

### Taskbar
- ✅ Windows-style menu (Start → Simulations, System)
- ✅ Window buttons (minimize/restore)
- ✅ Dynamic width calculation
- ✅ Resize-aware positioning

### Styling
- ✅ Colors: #00FF88 (green), #00F5FF (cyan stats)
- ✅ Font: Courier New 12px
- ✅ Sections: centered dividers
- ✅ Word wrap for long text

---

## 🔧 Development

### Build Bundle
```bash
# Windows
.\build.ps1

# Linux/Mac
./build.sh
```
Output: `dist/ui.js` (1972 lines, ~71KB)

### Add New Simulation
1. Create `simulations/mysim/MySim.js`
2. Register in `main.js`:
   ```javascript
   simulationManager.register('mysim',
       () => import('./simulations/mysim/MySim.js'),
       { name: 'My Sim' }
   );
   ```
3. Add UI button
4. Done!

---

## 📊 Current Status

### Completed (v2.3 - 2026-01-12)
- ✅ **Interactive HUD Mode** - Transparent windows with full button/slider functionality
- ✅ **Component Width Fixes** - Proper hitboxes (Button 100px, Slider 200px, Toggle dynamic)
- ✅ **Click-Through Prevention** - Buttons no longer pass clicks to windows behind
- ✅ **UI Polish** - Menu spacing, taskbar colors (cyan=HUD, green=minimized), header improvements
- ✅ **Performance Optimization** (+25-50% FPS, -15-25% CPU)
  - Layout cache (OPT-1)
  - Text measurement cache (OPT-6)
  - EventRouter early exit (OPT-7)
  - Taskbar resize bugfix (OPT-11)
  - Slider drag state fix (critical)
- ✅ Core architecture (SimulationManager, EventBus, DataBridge)
- ✅ FAZA C1: Header buttons (X, _, 👁️)
- ✅ FAZA C2: Scrollbar with thumb dragging
- ✅ FAZA C3: Sliders, Toggles, Buttons
- ✅ Event-driven communication
- ✅ Data binding UI ↔ Sims
- ✅ **HUD mode (interactive transparent overlay)**
- ✅ Text styling (green/cyan, word wrap, sections)
- ✅ Menu sections (symulacje/system)
- ✅ Modular component architecture

### Next Steps (see [docs/TODO.md](docs/TODO.md))
- 🔜 **FAZA D1:** Simulation Window Factory (2-4h) ⭐ PRIORITY
- 🔜 Remaining optimizations (Package A: 45 min, +7-15%)
- 🔜 FAZA C4: Advanced sliders (range, vertical)
- 🔜 Import/Export presets
- 🔜 Custom themes

---

## 📈 Statistics

- **Bundle:** 1972 lines (~82.65 KB)
- **Performance:** +25-50% FPS vs v2.1
- **Core:** 776 lines
- **UI Library:** ~1500 lines (source)
- **Components:** 8 modular files
- **Total codebase:** ~9200 lines
- **Commits:** 111+

---

## 📚 Documentation

- **[docs/TODO.md](docs/TODO.md)** - Project roadmap and priorities
- **[docs/ROADMAP.md](docs/ROADMAP.md)** - Performance optimization details
- **[docs/FILE_STRUCTURE.md](docs/FILE_STRUCTURE.md)** - Complete file reference
- **[docs/CACHE_FIX.md](docs/CACHE_FIX.md)** - Browser cache troubleshooting

---

## 🎯 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| **index.html** | Entry point | - |
| **main.js** | Orchestrator | ~241 |
| **dist/ui.js** | Complete bundle | 2248 |
| **ui/BaseWindow.js** | Main window class | ~475 |
| **ui/WindowManager.js** | Window manager | ~133 |
| **ui/Taskbar.js** | Taskbar | ~400 |
| **core/SimulationManager.js** | Sim controller | 360 |

---

## ⚖️ License

Extracted from Petrie Dish v5.1-C2.  
Use according to original project license.

---

**Last Updated:** 2026-01-12  
**Version:** v2.3 (Interactive HUD + Polish)
