# UI System - Canvas-based Windows & Multi-Simulation Architecture

**Status:** ✅ v2.1 Production Ready (2026-01-10)  
**GitHub:** https://github.com/michalstankiewicz4-cell/UI

Modular window system for Canvas API with centralized simulation management.

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

## 📦 Project Structure

```
UI/
├── core/                   # Central architecture
│   ├── SimulationManager.js    # Controller (360 lines)
│   ├── EventBus.js             # Pub-sub events (192 lines)
│   └── DataBridge.js           # Data flow (224 lines)
│
├── ui/                     # UI library source
│   ├── BaseWindow.js           # Windows (737 lines)
│   ├── WindowManager.js        # Manager (105 lines)
│   ├── Taskbar.js              # Taskbar (342 lines)
│   ├── EventRouter.js          # Events (144 lines)
│   └── Styles.js               # Styling (49 lines)
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
├── themes/                 # Custom themes (future)
├── utils/                  # TextCache optimization
├── dist/ui.js              # Built bundle (1505 lines)
├── main.js                 # Main orchestrator (185 lines)
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
- ✅ Header buttons (Close, Minimize, HUD mode)
- ✅ Scrollbar with thumb dragging
- ✅ Z-index management
- ✅ Content: buttons, text, sections

### Taskbar
- ✅ Windows-style menu (Start → Simulations, System)
- ✅ Window buttons (minimize/restore)
- ✅ Dynamic width calculation

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
Output: `dist/ui.js` (1505 lines, ~56KB)

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

### Completed (v2.1)
- ✅ Core architecture (SimulationManager, EventBus, DataBridge)
- ✅ FAZA C1: Header buttons (X, _, ○)
- ✅ FAZA C2: Scrollbar with thumb dragging
- ✅ Event-driven communication
- ✅ Data binding UI ↔ Sims
- ✅ HUD mode (transparent overlay)
- ✅ Text styling (green/cyan, word wrap, centered sections)
- ✅ Menu sections (symulacje/system)
- ✅ File structure simplified (no /src/)

### Next Steps
- 🔜 FAZA C3: Sliders + Toggles (~2-3h)
- 🔜 Import/Export presets
- 🔜 Custom themes

---

## 📈 Statistics

- **Bundle:** 1505 lines (56KB)
- **Core:** 776 lines
- **UI Library:** 1377 lines (source)
- **Total codebase:** ~7500 lines
- **Commits:** 90+
- **Performance:** ~1% core overhead

---

## 📚 File & Folder Reference

### Root Files

| File | Purpose |
|------|---------|
| **index.html** | Main entry point - open this to run the app |
| **main.js** | Orchestrator - creates windows, manages UI/simulations |
| **README.md** | This file - project documentation |
| **build.ps1** | Build script (Windows) - creates dist/ui.js bundle |
| **build.sh** | Build script (Linux/Mac) - same as build.ps1 |

### /core/ - Central Architecture

| File | Purpose | Lines |
|------|---------|-------|
| **SimulationManager.js** | Manages all simulations - add, remove, pause, update, render | 360 |
| **EventBus.js** | Pub-sub event system - loose coupling between components | 192 |
| **DataBridge.js** | Bidirectional data flow - UI parameters ↔ Simulation stats | 224 |
| **index.js** | Exports core modules | ~10 |

### /ui/ - UI Library Source

| File | Purpose | Lines |
|------|---------|-------|
| **BaseWindow.js** | Main window class - dragging, scrollbar, buttons, HUD mode | 737 |
| **WindowManager.js** | Multi-window manager - z-index, focus, rendering | 105 |
| **Taskbar.js** | Windows-style taskbar - menu, window buttons | 342 |
| **EventRouter.js** | Routes mouse/keyboard events to correct windows | 144 |
| **Styles.js** | Style definitions - colors, fonts, spacing | 49 |
| **index.js** | Exports UI modules | ~10 |

### /utils/ - Utilities

| File | Purpose | Lines |
|------|---------|-------|
| **TextCache.js** | Caches text measurements for performance (2-5× speedup) | 65 |

### /simulations/ - Placeholder Simulations

| Folder | Description | Lines |
|--------|-------------|-------|
| **sim1/** | 2D Particles - example simulation | 114 |
| **sim2/** | 3D Cubes - example simulation | 123 |
| **sim3/** | Physics Balls - example simulation | 132 |
| **sim4/** | Cellular Automata - example simulation | 158 |

Each contains: `Sim*.js` (code), `README.md` (description)

### /ui-config/ - Configuration Layer

| File | Purpose | Lines |
|------|---------|-------|
| **windows.js** | Creates UI windows (Master Controls, Stats) | 146 |
| **controls.js** | Dynamic window controls and callbacks | 121 |
| **sync.js** | Cross-simulation synchronization via EventBus | 200 |

### /dist/ - Built Bundle

| File | Purpose | Lines |
|------|---------|-------|
| **ui.js** | Complete UI library in single file (all /ui/ modules) | 1505 |

### /data/ - Import/Export (Future)

| Folder | Purpose |
|--------|---------|
| **presets/** | Ready-to-use UI configurations and simulations (empty, planned) |
| **exports/** | User-exported data (empty, planned) |
| **README.md** | Documentation for import/export system |

### /docs/ - Documentation

| File | Purpose | Lines |
|------|---------|-------|
| **TODO.md** | Project roadmap and next steps | 98 |
| **CACHE_FIX.md** | Instructions for browser cache issues | 49 |
| **GITHUB_SETUP.md** | GitHub setup instructions | 35 |

### /themes/ - Custom Themes (Future)

Empty folder reserved for custom color schemes and styling (planned feature).

---

## ⚖️ License

Extracted from Petrie Dish v5.1-C2.  
Use according to original project license.

---

**Last Updated:** 2026-01-10  
**Version:** v2.1
